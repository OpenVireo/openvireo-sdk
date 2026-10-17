/**
 * Runs the compiled single binary (dist/kpx, from `npm run build:binary`) against the SDK's in-memory
 * auth and sync servers served over real HTTP on 127.0.0.1: SA read/run/rotate, a read-only rejection,
 * and a human login (OPAQUE inside the binary).  Usage: bun scripts/smoke.ts [path/to/kpx]
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSaToken, parseSaToken } from "../../sdk/src/index.js";
import { CONFIG } from "../../sdk/test/helpers/auth-server.js";
import { makeWorld } from "../../sdk/test/helpers/world.js";

const bin = process.argv[2] ?? new URL("../dist/kpx", import.meta.url).pathname;
const w = await makeWorld();

const server = createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const path = req.url ?? "/";
  if (path === "/.well-known/kpx-configuration") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ...CONFIG, issuer: base, api: `${base}/api/v1`, sync: `${base}/sync/api/v1` }));
  }
  const target = path.startsWith("/sync/") ? `https://sync.example${path.slice(5)}` : `https://auth.example${path}`;
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers[k] = v;
  const r = await w.fetch(target, { method: req.method, headers, body: chunks.length ? new Uint8Array(Buffer.concat(chunks)) : undefined });
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const addr = server.address();
const base = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`;
const local = (token: string) => {
  const t = parseSaToken(token);
  return buildSaToken({ url: base, saId: t.saId, secret: t.secret, kek: t.kek });
};
const config = mkdtempSync(join(tmpdir(), "kpx-smoke-"));

let failed = 0;
async function run(args: string[], env: Record<string, string>, input = "") {
  return new Promise<{ code: number; out: string; err: string }>((resolve) => {
    const p = spawn(bin, args, { env: { PATH: process.env.PATH ?? "", KPX_CONFIG_DIR: config, ...env } });
    let out = "";
    let err = "";
    p.stdout.on("data", (c) => (out += c));
    p.stderr.on("data", (c) => (err += c));
    p.stdin.end(input);
    p.on("close", (code) => resolve({ code: code ?? -1, out, err }));
  });
}
function check(name: string, ok: boolean, detail: unknown) {
  if (ok) console.log(`ok   ${name}`);
  else {
    failed++;
    console.log(`FAIL ${name}: ${JSON.stringify(detail)}`);
  }
}

const reader = { KPX_SERVICE_ACCOUNT_TOKEN: local(w.readToken) };
const writer = { KPX_SERVICE_ACCOUNT_TOKEN: local(w.writeToken) };
try {
  let r = await run(["read", "kpx://Team%20Infra/GitHub/password"], reader);
  check("read with a service account", r.code === 0 && r.out === "s3cret\n", r);
  r = await run(["run", "--", "sh", "-c", 'echo "pw=$PW"'], { ...reader, PW: "kpx://Team%20Infra/Deploy/Database/password" });
  check("run masks the secret", r.code === 0 && r.out === "pw=<concealed by kpx>\n", r);
  r = await run(["rotate", "kpx://Team%20Infra/GitHub/password", "--generate"], reader);
  check("read-only grant fails cleanly", r.code === 1 && r.err === 'kpx: this service account can only read vault "Team Infra"\n', r);
  r = await run(["rotate", "kpx://Team%20Infra/GitHub/password", "--generate", "--print"], writer);
  const rotated = r.out.trim();
  check("rotate with a write grant", r.code === 0 && rotated.length === 32, r);
  r = await run(["read", "kpx://Team%20Infra/GitHub/password"], reader);
  check("rotated value is on the server", r.out === rotated + "\n", r);
  // kpx connect from the same binary
  const connect = spawn(bin, ["connect"], { env: { PATH: process.env.PATH ?? "", ...reader, KPX_CONNECT_TOKEN: "kpx_ct_smoke", KPX_CONNECT_PORT: "0" } });
  const url = await new Promise<string>((resolve, reject) => {
    let err = "";
    connect.stderr.on("data", (c) => {
      err += c;
      const m = /listening on (http:\/\/\S+)/.exec(err);
      if (m) resolve(m[1]!);
    });
    connect.on("close", () => reject(new Error(err)));
  });
  const res = await fetch(`${url}/v1/vaults/Team%20Infra/items/Deploy/Database?field=username`, { headers: { Authorization: "Bearer kpx_ct_smoke" } });
  const body = await res.json();
  check("kpx connect serves an item field", res.status === 200 && body.value === "app", body);
  const denied = await fetch(`${url}/v1/vaults`, { headers: { Authorization: "Bearer wrong" } });
  check("kpx connect rejects unknown tokens", denied.status === 401, denied.status);
  connect.kill("SIGTERM");
  r = await run(["login", "--email", "alice@example.com", "--secret-key", w.secretKey], { KPX_ISSUER: base, KPX_PASSWORD: w.password });
  check("human login (OPAQUE in the binary)", r.code === 0 && r.err.startsWith("Signed in"), r);
  r = await run(["read", "kpx://Private/Bank/password"], { KPX_PASSWORD: w.password });
  check("read with the saved session", r.code === 0 && r.out === "nope\n", r);
} finally {
  server.close();
  rmSync(config, { recursive: true, force: true });
}
console.log(failed ? `${failed} failed` : "binary smoke ok");
process.exit(failed ? 1 : 0);
