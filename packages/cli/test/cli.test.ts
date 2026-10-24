import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ServiceAccount } from "@openvireo/sdk";
import { type World, editBetweenGetAndPut, makeWorld } from "../../sdk/test/helpers/world.js";
import { MASK, main } from "../src/index.js";

let w: World;
let dir: string;

beforeAll(async () => {
  w = await makeWorld();
  dir = await mkdtemp(join(tmpdir(), "kpx-cli-"));
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

async function kpx(argv: string[], p: { env?: Record<string, string | undefined>; stdin?: string; prompt?: (q: string) => string } = {}) {
  const out: Uint8Array[] = [];
  const err: Uint8Array[] = [];
  const enc = new TextEncoder();
  const sink = (list: Uint8Array[]) => ({ write: (c: string | Uint8Array) => list.push(typeof c === "string" ? enc.encode(c) : c) });
  const code = await main(argv, {
    env: { PATH: process.env.PATH, KPX_CONFIG_DIR: join(dir, "config"), ...p.env },
    stdout: sink(out),
    stderr: sink(err),
    stdin: async () => p.stdin ?? "",
    prompt: p.prompt && (async (q) => p.prompt!(q)),
    fetch: w.fetch,
  });
  const text = (l: Uint8Array[]) => Buffer.concat(l).toString("utf8");
  return { code, stdout: text(out), stderr: text(err) };
}
const asReader = () => ({ KPX_SERVICE_ACCOUNT_TOKEN: w.readToken });
const asWriter = () => ({ KPX_SERVICE_ACCOUNT_TOKEN: w.writeToken });
const puts = () => w.sync.calls.filter((c) => c.method === "PUT").length;

describe("kpx read / inject", () => {
  it("reads a field by vault name or id, entry title or UUID, with a group path", async () => {
    expect(await kpx(["read", "kpx://Team%20Infra/GitHub/password"], { env: asReader() })).toEqual({ code: 0, stdout: "s3cret\n", stderr: "" });
    expect((await kpx(["read", "-n", `kpx://${w.vaultId}/Deploy/Database/username`], { env: asReader() })).stdout).toBe("app");
    const id = JSON.parse((await kpx(["item", "get", "kpx://Team%20Infra/GitHub", "--json"], { env: asReader() })).stdout).id;
    expect((await kpx(["read", `kpx://Team%20Infra/${id}/url`], { env: asReader() })).stdout).toBe("https://github.com\n");
    const file = join(dir, "secret.txt");
    await kpx(["read", "kpx://Team%20Infra/GitHub/password", "-o", file], { env: asReader() });
    expect([await readFile(file, "utf8"), (await stat(file)).mode & 0o777]).toEqual(["s3cret", 0o600]);
  });

  it("fails cleanly on bad references and missing data", async () => {
    const cases: [string, RegExp][] = [
      ["kpx://Team%20Infra/GitHub", /expected kpx:\/\/<vault>\/<entry>\/<field>/],
      ["https://x/y/z", /not a kpx:\/\/ reference/],
      ["kpx://Team%20Infra/Nope/password", /entry "Nope" not found/],
      ["kpx://Team%20Infra/GitHub/nope", /field "nope" not found/],
      ["kpx://Private/Bank/password", /vault "Private" not found or not shared/],
    ];
    for (const [ref, msg] of cases) {
      const r = await kpx(["read", ref], { env: asReader() });
      expect([r.code, r.stdout]).toEqual([1, ""]);
      expect(r.stderr).toMatch(msg);
      expect(r.stderr).not.toMatch(/\n\s+at /); // no stack trace
    }
    expect((await kpx(["read"], { env: asReader() })).code).toBe(2);
    const noCreds = await kpx(["read", "kpx://a/b/c"]);
    expect([noCreds.code, noCreds.stderr]).toEqual([1, "kpx: not signed in: set KPX_SERVICE_ACCOUNT_TOKEN or run `kpx login`\n"]);
  });

  it("injects bare and braced references from stdin or a file", async () => {
    const tpl = "user: kpx://Team%20Infra/Deploy/Database/username\ndsn: postgres://app:{{ kpx://Team%20Infra/Deploy/Database/password }}@db/app\n";
    expect((await kpx(["inject"], { env: asReader(), stdin: tpl })).stdout).toBe("user: app\ndsn: postgres://app:pg-pa$$word@db/app\n");
    const inFile = join(dir, "config.tpl");
    const outFile = join(dir, "config.yml");
    await writeFile(inFile, tpl);
    expect((await kpx(["inject", "-i", inFile, "-o", outFile], { env: asReader() })).code).toBe(0);
    expect((await readFile(outFile, "utf8")).split("\n")[0]).toBe("user: app");
    expect((await stat(outFile)).mode & 0o777).toBe(0o600);
  });
});

describe("kpx run", () => {
  const node = process.execPath;
  const script = (js: string) => ["--", node, "-e", js];

  it("resolves references from --env-file and the environment and masks them in the output", async () => {
    const envFile = join(dir, ".env.tpl");
    await writeFile(envFile, 'DB_PASSWORD="kpx://Team%20Infra/Deploy/Database/password"\nDB_USER=kpx://Team%20Infra/Deploy/Database/username\nPLAIN=hello\n');
    const r = await kpx(
      ["run", "--env-file", envFile, ...script(`
        const p = process.env.DB_PASSWORD;
        process.stdout.write("pw=" + p + "\\n");
        // split across two writes
        process.stdout.write("half=" + p.slice(0, 4)); setTimeout(() => { process.stdout.write(p.slice(4) + "\\n");
        console.error("stderr " + process.env.GH + " user=" + process.env.DB_USER + " plain=" + process.env.PLAIN);
        console.log("token-in-env=" + (process.env.KPX_SERVICE_ACCOUNT_TOKEN ?? "none") + " len=" + p.length);
        process.exit(3); }, 20);
      `)],
      { env: { ...asReader(), GH: "kpx://Team%20Infra/GitHub/password" } },
    );
    expect(r.code).toBe(3);
    expect(r.stdout).toBe(`pw=${MASK}\nhalf=${MASK}\ntoken-in-env=none len=11\n`);
    expect(r.stderr).toBe(`stderr ${MASK} user=${MASK} plain=hello\n`);
    expect(r.stdout + r.stderr).not.toMatch(/s3cret|pg-pa/);
  });

  it("passes output through with --no-masking, and needs no credentials without references", async () => {
    const r = await kpx(["run", "--no-masking", ...script("console.log(process.env.X)")], { env: { ...asReader(), X: "kpx://Team%20Infra/GitHub/password" } });
    expect([r.code]).toEqual([0]); // inherited stdio: the child wrote to the real terminal
    const plain = await kpx(["run", ...script("console.log('ok ' + process.env.Y)")], { env: { Y: "y" } });
    expect([plain.code, plain.stdout]).toEqual([0, "ok y\n"]);
    expect((await kpx(["run"], { env: asReader() })).code).toBe(2);
    const missing = await kpx(["run", "--", "/nonexistent/cmd"], { env: {} });
    expect([missing.code, missing.stderr]).toEqual([1, expect.stringMatching(/ENOENT/)]);
  });
});

describe("kpx item / rotate (writes)", () => {
  it("rejects writes with a read-only grant before uploading anything", async () => {
    const before = puts();
    for (const argv of [
      ["rotate", "kpx://Team%20Infra/GitHub/password", "--generate"],
      ["item", "edit", "kpx://Team%20Infra/GitHub", "username=x"],
      ["item", "create", "kpx://Team%20Infra/New", "password=x"],
    ]) {
      const r = await kpx(argv, { env: asReader() });
      expect([r.code, r.stderr]).toEqual([1, 'kpx: this service account can only read vault "Team Infra"\n']);
    }
    expect(puts()).toBe(before);
  });

  it("creates, edits and reads whole items", async () => {
    const created = await kpx(["item", "create", "kpx://Team%20Infra/Apps/Stripe", "username=billing", "url=https://stripe.com", "api_key=sk_live_1", "--generate", "--length", "20", "--charset", "letters,digits", "--json"], { env: asWriter() });
    expect(created.code).toBe(0);
    expect(created.stderr).toMatch(/^Created Apps\/Stripe \([0-9a-f]{32}\)\n$/);
    const item = JSON.parse(created.stdout);
    expect([item.fields.UserName, item.fields.api_key, item.protected.sort()]).toEqual(["billing", undefined, ["Password", "api_key"]]);
    const pw = (await kpx(["read", "kpx://Team%20Infra/Apps/Stripe/password"], { env: asReader() })).stdout.trim();
    expect(pw).toMatch(/^[A-Za-z0-9]{20}$/);

    expect((await kpx(["item", "create", "kpx://Team%20Infra/Apps/Stripe", "x=y"], { env: asWriter() })).stderr).toMatch(/already exists/);
    expect((await kpx(["item", "edit", "kpx://Team%20Infra/Apps/Nope", "x=y"], { env: asWriter() })).stderr).toMatch(/not found/);
    expect((await kpx(["item", "edit", "kpx://Team%20Infra/Apps/Stripe"], { env: asWriter() })).code).toBe(2);
    expect((await kpx(["item", "edit", "kpx://Team%20Infra/Apps/Stripe", "noequals"], { env: asWriter() })).code).toBe(2);

    const edited = await kpx(["item", "edit", "kpx://Team%20Infra/Apps/Stripe", "username=billing2", "--stdin-field", "api_key"], { env: asWriter(), stdin: "sk_live_2\n" });
    expect(edited.code).toBe(0);
    const shown = await kpx(["item", "get", "kpx://Team%20Infra/Apps/Stripe"], { env: asReader() });
    expect(shown.stdout).toContain("  UserName: billing2\n");
    expect(shown.stdout).toContain("  api_key: <concealed>\n");
    expect((await kpx(["item", "get", "kpx://Team%20Infra/Apps/Stripe", "--reveal"], { env: asReader() })).stdout).toContain("  api_key: sk_live_2\n");
    const list = (await kpx(["item", "list", "Team Infra"], { env: asReader() })).stdout;
    expect(list).toMatch(/^[0-9a-f]{32} {2}Apps\/Stripe$/m);
    expect(list).not.toContain("sk_live");
  });

  it("rotates a field with a generated value or one from stdin", async () => {
    const r = await kpx(["rotate", "kpx://Team%20Infra/Deploy/Database/password", "--generate", "--print"], { env: asWriter() });
    expect([r.code, r.stderr]).toEqual([0, "Rotated kpx://Team%20Infra/Deploy/Database/password\n"]);
    const value = r.stdout.trim();
    expect(value).toHaveLength(32);
    const sa = await ServiceAccount.fromToken(w.readToken, { fetch: w.fetch });
    expect(await sa.read("kpx://Team%20Infra/Deploy/Database/password")).toBe(value);
    sa.close();
    expect((await kpx(["rotate", "kpx://Team%20Infra/Deploy/Database/password", "--stdin"], { env: asWriter(), stdin: "from-stdin\n" })).stdout).toBe("");
    expect((await kpx(["read", "kpx://Team%20Infra/Deploy/Database/password"], { env: asReader() })).stdout).toBe("from-stdin\n");
    expect((await kpx(["rotate", "kpx://Team%20Infra/Deploy/Database/password"], { env: asWriter() })).code).toBe(2);
    expect((await kpx(["rotate", "kpx://Team%20Infra/Deploy/Database/password", "--stdin"], { env: asWriter(), stdin: "" })).code).toBe(2);
  });

  it("merges and retries when another client uploads during the write (412)", async () => {
    const race = await editBetweenGetAndPut(w, "GitHub", { Notes: "edited on another device" }, { skipGets: 1 });
    const before = puts();
    const r = await kpx(["rotate", "kpx://Team%20Infra/GitHub/password", "--stdin"], { env: asWriter(), stdin: "rotated-in-race" });
    w.sync.afterGet = null;
    expect([r.code, race.fired, puts() - before]).toEqual([0, true, 2]);
    expect((await kpx(["read", "kpx://Team%20Infra/GitHub/password"], { env: asReader() })).stdout).toBe("rotated-in-race\n");
    expect((await kpx(["read", "kpx://Team%20Infra/GitHub/notes"], { env: asReader() })).stdout).toBe("edited on another device\n");
  });
});

describe("kpx vault / whoami / login", () => {
  it("lists vaults and shows the principal", async () => {
    expect((await kpx(["vault", "list"], { env: asReader() })).stdout).toBe(`${w.vaultId}  read    Team Infra\n`);
    const who = (await kpx(["whoami"], { env: asWriter() })).stdout;
    expect(who).toMatch(/^kind: service-account\nprincipal: sa:[0-9a-f-]{36}\nissuer: https:\/\/auth\.example\n$/);
  });

  it("works with a human login (session file, Secret Key once, password per command)", async () => {
    const env = { KPX_ISSUER: "https://auth.example" };
    const asked: string[] = [];
    const prompt = (q: string) => {
      asked.push(q);
      return q.startsWith("Email") ? "alice@example.com" : q.startsWith("Master") ? w.password : q.startsWith("Secret Key") ? w.secretKey : "";
    };
    const r = await kpx(["login"], { env, prompt });
    expect([r.code, r.stderr]).toEqual([0, "Signed in to https://auth.example as alice@example.com\n"]);
    expect(asked).toEqual(["Email: ", "Master password: ", "Secret Key (K1-…): "]);
    const session = join(dir, "config", "session.json");
    expect((await stat(session)).mode & 0o777).toBe(0o600);
    expect(await readFile(session, "utf8")).not.toContain(w.password);

    // later commands: the trusted Secret Key is stored, only the password is needed
    expect((await kpx(["read", "kpx://Team%20Infra/GitHub/username"], { env: { KPX_PASSWORD: w.password } })).stdout).toBe("ci\n");
    asked.length = 0;
    expect((await kpx(["vault", "list"], { prompt })).stdout).toContain("manage  Private");
    expect(asked).toEqual(["Master password for alice@example.com: "]);
    expect((await kpx(["read", "kpx://Private/Bank/password"], { env: { KPX_PASSWORD: "wrong" } })).stderr).toBe("kpx: wrong password or Secret Key\n");
    expect((await kpx(["read", "kpx://a/b/c"], {})).stderr).toMatch(/no terminal/);

    const rot = await kpx(["rotate", "kpx://Private/Bank/password", "--stdin"], { env: { KPX_PASSWORD: w.password }, stdin: "by-human" });
    expect(rot.code).toBe(0);
    expect((await kpx(["read", "kpx://Private/Bank/password"], { env: { KPX_PASSWORD: w.password } })).stdout).toBe("by-human\n");
    expect((await kpx(["whoami"])).stdout).toMatch(/^kind: user\nprincipal: user:.+\nemail: alice@example.com\n/);
    // the SA token takes precedence over the saved session
    expect((await kpx(["vault", "list"], { env: asReader() })).stdout).not.toContain("Private");

    expect((await kpx(["logout"])).stderr).toBe("Signed out\n");
    expect((await kpx(["read", "kpx://a/b/c"], { env: { KPX_PASSWORD: w.password } })).stderr).toMatch(/not signed in/);
  });

  it("prints usage and versions", async () => {
    expect((await kpx(["help"])).stdout).toContain("kpx run [--env-file .env.tpl]");
    expect((await kpx([])).code).toBe(2);
    expect((await kpx(["version"])).stdout).toBe("kpx 0.1.0\n");
    expect((await kpx(["frobnicate"])).stderr).toBe('kpx: unknown command "frobnicate" (see kpx help)\n');
    const tok = await kpx(["connect", "token", "--name", "ci"]);
    expect(tok.stdout).toMatch(/^kpx_ct_/);
  });
});
