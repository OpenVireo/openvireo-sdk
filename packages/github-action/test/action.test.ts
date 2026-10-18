import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type World, makeWorld } from "../../sdk/test/helpers/world.js";
import { collect, run } from "../src/action.js";
import { fileCommand } from "../src/core.js";

let w: World;
let dir: string;
beforeAll(async () => {
  w = await makeWorld();
  dir = await mkdtemp(join(tmpdir(), "kpx-action-"));
});
afterAll(() => rm(dir, { recursive: true, force: true }));

/** Parses NAME<<delim … delim blocks back into pairs. */
function parseFileCommands(text: string): [string, string][] {
  const out: [string, string][] = [];
  const re = /^([^<\n]+)<<(ghadelimiter_[0-9a-f]+)\n([\s\S]*?)\n\2\n/gm;
  for (const m of text.matchAll(re)) out.push([m[1]!, m[3]!]);
  return out;
}

async function action(env: Record<string, string>) {
  const n = Math.random().toString(36).slice(2);
  const GITHUB_ENV = join(dir, `env-${n}`);
  const GITHUB_OUTPUT = join(dir, `out-${n}`);
  await writeFile(GITHUB_ENV, "");
  await writeFile(GITHUB_OUTPUT, "");
  let stdout = "";
  const code = await run({ env: { GITHUB_ENV, GITHUB_OUTPUT, ...env }, stdout: (s) => (stdout += s) }, { fetch: w.fetch });
  return { code, stdout, env: parseFileCommands(await readFile(GITHUB_ENV, "utf8")), outputs: parseFileCommands(await readFile(GITHUB_OUTPUT, "utf8")) };
}

describe("GitHub Action", () => {
  it("loads env references and secrets lines, masking every value before exporting it", async () => {
    const r = await action({
      "INPUT_SERVICE-ACCOUNT-TOKEN": w.readToken,
      INPUT_SECRETS: "# comment\nDB_PASSWORD = kpx://Team%20Infra/Deploy/Database/password\nNOTES=kpx://Team%20Infra/Deploy/Database/notes\n",
      GH_TOKEN: "kpx://Team%20Infra/GitHub/password",
      DSN: "postgres://app:{{ kpx://Team%20Infra/Deploy/Database/password }}@db/app",
      UNRELATED: "plain",
    });
    expect(r.code).toBe(0);
    expect(Object.fromEntries(r.env)).toEqual({ GH_TOKEN: "s3cret", DSN: "postgres://app:pg-pa$$word@db/app", DB_PASSWORD: "pg-pa$$word", NOTES: "multi\nline" });
    expect(r.outputs).toEqual([["loaded", "GH_TOKEN,DSN,DB_PASSWORD,NOTES"]]);
    const masks = r.stdout.split("\n").filter((l) => l.startsWith("::add-mask::")).map((l) => l.slice(12));
    expect(masks).toEqual(expect.arrayContaining([w.readToken, "s3cret", "pg-pa$$word", "postgres://app:pg-pa$$word@db/app", "multi%0Aline", "multi", "line"]));
    // the only lines that carry a value are the add-mask commands
    for (const line of r.stdout.split("\n").filter((l) => !l.startsWith("::add-mask::"))) expect(line).not.toMatch(/s3cret|pg-pa/);
    expect(r.stdout).toMatch(/Loaded 4 secrets into the environment: GH_TOKEN, DSN, DB_PASSWORD, NOTES\n$/);
  });

  it("sets outputs instead with export-env: false, and reads KPX_SERVICE_ACCOUNT_TOKEN", async () => {
    const r = await action({ KPX_SERVICE_ACCOUNT_TOKEN: w.readToken, "INPUT_EXPORT-ENV": "false", USER_NAME: "kpx://Team%20Infra/GitHub/username" });
    expect([r.code, r.env, r.outputs]).toEqual([0, [], [["USER_NAME", "ci"], ["loaded", "USER_NAME"]]]);
  });

  it("fails with a workflow error and no partial export", async () => {
    const missing = await action({ "INPUT_SERVICE-ACCOUNT-TOKEN": w.readToken, A: "kpx://Team%20Infra/GitHub/password", B: "kpx://Team%20Infra/Nope/password" });
    expect([missing.code, missing.env]).toEqual([1, []]);
    expect(missing.stdout).toContain('::error::kpx: entry "Nope" not found');
    expect((await action({ A: "kpx://x/y/z" })).stdout).toContain("::error::kpx: no service account token");
    expect((await action({ "INPUT_SERVICE-ACCOUNT-TOKEN": "kpx_sa_garbage", A: "kpx://x/y/z" })).stdout).toMatch(/::error::kpx: .*token/i);
    expect((await action({ "INPUT_SERVICE-ACCOUNT-TOKEN": w.readToken, INPUT_SECRETS: "not a line" })).stdout).toContain("expected NAME=kpx://");
    expect((await action({ "INPUT_SERVICE-ACCOUNT-TOKEN": w.readToken, "INPUT_EXPORT-ENV": "maybe" })).stdout).toContain('must be true or false');
  });

  it("ignores its own inputs and reserved variables when collecting", () => {
    const env = { INPUT_SECRETS: "X=kpx://a/b/c", KPX_SERVICE_ACCOUNT_TOKEN: "kpx://a/b/c", PATH: "kpx://a/b/c", Y: "kpx://a/b/d" };
    expect(collect({ env, stdout: () => {} })).toEqual([["Y", "kpx://a/b/d"], ["X", "kpx://a/b/c"]]);
    expect(() => collect({ env: { INPUT_SECRETS: "PATH=kpx://a/b/c" }, stdout: () => {} })).toThrow(/can't be set/);
  });

  it("writes multi-line safe file commands", () => {
    const cmd = fileCommand("K", "a\nghadelimiter_x\nb");
    expect(parseFileCommands(cmd)).toEqual([["K", "a\nghadelimiter_x\nb"]]);
  });
});

describe("dist/index.mjs (the committed bundle GitHub runs)", () => {
  it("loads in plain Node and reports errors as workflow commands", async () => {
    const { spawnSync } = await import("node:child_process");
    const bundle = new URL("../dist/index.mjs", import.meta.url).pathname;
    const r = spawnSync(process.execPath, [bundle], { env: { PATH: process.env.PATH }, encoding: "utf8" });
    expect([r.status, r.stdout]).toEqual([1, "::error::kpx: no service account token: set the service-account-token input or KPX_SERVICE_ACCOUNT_TOKEN\n"]);
  });
});
