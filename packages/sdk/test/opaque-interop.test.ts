/**
 * The opaque-ke WASM client (this SDK) against the libopaque C core through its Python binding, as used by
 * Flask; the C client is what Qt uses.
 * Runs only when the binding is available:
 *   OPENVIREO_OPAQUE_PYTHON=<python with pysodium>  OPENVIREO_OPAQUE_PYBINDING=<libopaque/python>  LIBOPAQUE=<libopaque.dylib>
 * (see openvireo/docs/plans/accounts/opaque-spike/README.md for the build).
 */
import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Readable, Writable } from "node:stream";
import { existsSync } from "node:fs";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { finishLogin, finishRegistration, opaqueIds, startLogin, startRegistration } from "../src/opaque/index.js";
import { fromHex, toHex, utf8 } from "../src/util/bytes.js";

const py = process.env.OPENVIREO_OPAQUE_PYTHON;
const binding = process.env.OPENVIREO_OPAQUE_PYBINDING;
const enabled = !!(py && binding && process.env.LIBOPAQUE && existsSync(py) && existsSync(binding));

describe.skipIf(!enabled)("OPAQUE interop: opaque-ke WASM client ↔ libopaque C core (Python binding)", () => {
  let proc: ChildProcessByStdio<Writable, Readable, null>;
  let lines: AsyncIterableIterator<string>;
  const ids = opaqueIds("alice@example.com", "openvireo.example");
  const call = async (m: Record<string, unknown>) => {
    proc.stdin.write(JSON.stringify({ ...m, ...ids }) + "\n");
    const r = JSON.parse((await lines.next()).value as string);
    if (r.error) throw new Error(r.error);
    return r;
  };

  beforeAll(() => {
    proc = spawn(py!, ["-I", fileURLToPath(new URL("./interop/opaque_server.py", import.meta.url)), binding!], {
      stdio: ["pipe", "pipe", "inherit"],
    });
    lines = readline.createInterface({ input: proc.stdout })[Symbol.asyncIterator]();
  });
  afterAll(() => proc?.kill());

  async function wasmRegister(pw: string) {
    const { request, state } = await startRegistration(pw);
    const { pub } = await call({ op: "reg", M: toHex(request) });
    const { record } = await finishRegistration(state, fromHex(pub), ids);
    await call({ op: "store", rec: toHex(record) });
  }
  async function wasmLogin(pw: string) {
    const { ke1, state } = await startLogin(pw);
    const { resp, sk } = await call({ op: "login", pub: toHex(ke1) });
    let r;
    try {
      r = await finishLogin(state, fromHex(resp), ids);
    } catch {
      return false;
    }
    const { ok } = await call({ op: "auth", authU: toHex(r.authU) });
    return ok && toHex(r.sessionKey) === sk;
  }
  const nfkc = (pw: string) => toHex(utf8(pw.normalize("NFKC")));

  for (const pw of ["correct horse battery staple", "Ünïcödé pässwörd ﬁ"]) {
    it(`WASM register + WASM login: ${pw}`, async () => {
      await wasmRegister(pw);
      expect(await wasmLogin(pw)).toBe(true);
      expect(await wasmLogin(pw + "x")).toBe(false);
    });
    it(`WASM register → C client login (same bytes as Qt): ${pw}`, async () => {
      await wasmRegister(pw);
      expect((await call({ op: "c_login", pw: nfkc(pw) })).ok).toBe(true);
    });
    it(`C client register → WASM login: ${pw}`, async () => {
      await call({ op: "c_register", pw: nfkc(pw) });
      expect(await wasmLogin(pw)).toBe(true);
    });
  }
});
