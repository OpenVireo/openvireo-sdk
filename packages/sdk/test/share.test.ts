import { describe, expect, it } from "vitest";
import {
  AAD,
  decryptSharePayload,
  decryptShareRef,
  encryptSharePayload,
  encryptShareRef,
  fromB64u,
  fromHex,
  padShare,
  parseShareLink,
  shareAuth,
  shareAuthHash,
  shareContentKey,
  shareKeyFromHash,
  shareLink,
  sharePasscodeKey,
  shareRefKey,
  toHex,
  unpadShare,
  utf8,
} from "../src/crypto/index.js";
import { entryTotpUri, itemSharePayload, parseTotpUri, shareableFields, textSharePayload, totpCode } from "../src/share/index.js";
import type { Item } from "../src/vault/items.js";
import { Account, getShareInfo, openShare } from "../src/index.js";
import { CONFIG, FakeAuthServer, ISSUER } from "./helpers/auth-server.js";
import { FakeSyncServer } from "./helpers/sync-server.js";
import { V } from "./vectors.js";

const API = ISSUER + "/api/v1";

describe("share link crypto (SPEC §22 vectors)", () => {
  for (const c of V.share.cases) {
    it(`case ${c.id}`, async () => {
      const key = fromB64u(c.key);
      let p: Uint8Array | undefined;
      if (c.passcode) {
        p = await sharePasscodeKey(c.passcode, c.kdf, { allowWeak: true });
        expect(toHex(p)).toBe(c.passcode_key_hex);
        const auth = shareAuth(p);
        expect(auth).toEqual(fromB64u(c.auth));
        expect(toHex(shareAuthHash(auth))).toBe(c.auth_sha256_hex);
      }
      expect(toHex(shareContentKey(key, p))).toBe(c.content_key_hex);
      expect(toHex(padShare(utf8(c.payload)))).toBe(c.padded_hex);
      expect(AAD.share(c.id)).toBe(c.aad);
      const payload = JSON.parse(c.payload);
      expect(toHex(encryptSharePayload(key, c.id, payload, p, fromHex(c.nonce_hex)))).toBe(toHex(fromB64u(c.ct)));
      expect(decryptSharePayload(key, c.id, fromB64u(c.ct), p)).toEqual(payload);
      // the AAD binds it to its id
      expect(() => decryptSharePayload(key, c.id.replace(/^./, c.id[0] === "A" ? "B" : "A"), fromB64u(c.ct), p)).toThrow();
      // the link round-trips
      const parsed = parseShareLink(c.link);
      expect([parsed.base, parsed.id]).toEqual(["https://share.openvireo.example", c.id]);
      expect(parsed.key).toEqual(key);
      expect(shareLink("https://share.openvireo.example/", c.id, key)).toBe(c.link);
    });
  }

  it("needs the passcode", async () => {
    const c = V.share.cases.find((x: any) => x.passcode);
    expect(() => decryptSharePayload(fromB64u(c.key), c.id, fromB64u(c.ct))).toThrow();
  });

  it("owner reference", () => {
    const r = V.share.ref;
    const sk = fromHex(r.owner_enc_sk_hex);
    expect(toHex(shareRefKey(sk))).toBe(r.ref_key_hex);
    expect(encryptShareRef(sk, r.share_id, JSON.parse(r.plaintext), fromHex(r.nonce_hex))).toBe(r.ref);
    expect(decryptShareRef(sk, r.share_id, r.ref)).toEqual(JSON.parse(r.plaintext));
  });

  it("padding", () => {
    for (const n of [0, 1, 510, 511, 512, 1000]) {
      const padded = padShare(new Uint8Array(n).fill(7));
      expect(padded.length % 512).toBe(0);
      expect(padded.length).toBeGreaterThan(n);
      expect(unpadShare(padded)).toEqual(new Uint8Array(n).fill(7));
    }
    expect(() => unpadShare(new Uint8Array(512))).toThrow();
    expect(() => unpadShare(new Uint8Array([1, 2, 0]))).toThrow();
  });

  it("refuses incomplete links", () => {
    expect(() => parseShareLink("https://share.example/AAAAAAAAAAAAAAAAAAAAAA")).toThrow(/complete/);
    expect(() => parseShareLink("https://share.example/AAAAAAAAAAAAAAAAAAAAAA#short")).toThrow();
    expect(() => shareKeyFromHash("#")).toThrow();
    expect(shareKeyFromHash("#" + "A".repeat(43))).toHaveLength(32);
  });
});

describe("TOTP", () => {
  // RFC 6238 appendix B
  const seed = (s: string, n: number) => {
    const bytes = utf8(s.repeat(Math.ceil(n / s.length)).slice(0, n));
    const B = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    for (const b of bytes) bits += b.toString(2).padStart(8, "0");
    let out = "";
    for (let i = 0; i < bits.length; i += 5) out += B[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
    return out;
  };
  const cases: [string, string, number, number, string][] = [
    ["SHA1", seed("12345678901234567890", 20), 59, 8, "94287082"],
    ["SHA256", seed("12345678901234567890", 32), 59, 8, "46119246"],
    ["SHA512", seed("1234567890", 64), 59, 8, "90693936"],
    ["SHA1", seed("12345678901234567890", 20), 1111111109, 8, "07081804"],
    ["SHA1", seed("12345678901234567890", 20), 20000000000, 8, "65353130"],
  ];
  for (const [alg, secret, t, digits, code] of cases) {
    it(`${alg} at ${t}`, () => {
      const params = parseTotpUri(`otpauth://totp/x?secret=${secret}&algorithm=${alg}&digits=${digits}`);
      expect(totpCode(params, t * 1000)).toEqual({ code, remaining: 30 - (t % 30) });
    });
  }

  it("reads KeePass TOTP fields", () => {
    expect(entryTotpUri({ otp: "otpauth://totp/a?secret=JBSWY3DPEHPK3PXP" })).toBe("otpauth://totp/a?secret=JBSWY3DPEHPK3PXP");
    const legacy = entryTotpUri({ "TOTP Seed": "JBSW Y3DP", "TOTP Settings": "60;8" }, "Bank")!;
    expect(parseTotpUri(legacy)).toMatchObject({ period: 60, digits: 8 });
    expect(parseTotpUri(entryTotpUri({ "TOTP Seed": "JBSWY3DP", "TOTP Settings": "30;S" })!)).toMatchObject({ steam: true, digits: 5 });
    expect(entryTotpUri({ Title: "x" })).toBeNull();
    expect(() => parseTotpUri("https://example.com")).toThrow();
  });
});

describe("item payloads", () => {
  const item: Item = {
    id: "0123456789abcdef0123456789abcdef",
    title: "Office Wi-Fi",
    group: [],
    fields: { Title: "Office Wi-Fi", UserName: "guest", Password: "pw", URL: "https://x", Notes: "", PIN: "1234", otp: "otpauth://totp/a?secret=JBSWY3DP" },
    protected: ["Password", "PIN"],
    tags: [],
  };

  it("lists what can be shared, in order", () => {
    expect(shareableFields(item).map((f) => [f.name, f.field.k, !!f.field.protected])).toEqual([
      ["UserName", "username", false],
      ["Password", "password", true],
      ["URL", "url", false],
      ["otp", "totp", true],
      ["PIN", "custom", true],
    ]);
  });

  it("builds payloads", () => {
    expect(itemSharePayload(item, ["Password", "PIN"], "Sam")).toEqual({
      v: 1,
      kind: "entry",
      title: "Office Wi-Fi",
      shared_by: "Sam",
      fields: [
        { k: "password", label: "Password", value: "pw", protected: true },
        { k: "custom", label: "PIN", value: "1234", protected: true },
      ],
    });
    expect(textSharePayload("hi").fields).toEqual([{ k: "text", label: "Text", value: "hi" }]);
  });
});

describe("share links end to end", () => {
  function servers() {
    const auth = new FakeAuthServer();
    const sync = new FakeSyncServer();
    auth.onToken = (t) => sync.tokens.add(t);
    const fetch = (url: string, init?: RequestInit) => (new URL(url).host === "sync.example" ? sync.fetch(url, init) : auth.fetch(url, init));
    return { auth, fetch };
  }

  it("create → open without an account → list → revoke", async () => {
    const { auth, fetch } = servers();
    const alice = await Account.connect({ issuer: ISSUER, fetch, device: { name: "web", platform: "web" } });
    await alice.register({ email: "alice@example.com", password: "pw", kdf: { m: 19456, t: 2 } });
    const vault = await alice.createVault("Home");
    const payload = { v: 1 as const, kind: "entry" as const, title: "Wi-Fi", fields: [{ k: "password", label: "Password", value: "hunter2", protected: true }] };
    const share = await alice.createShare(payload, { expiresIn: 86400, maxOpens: 2, vaultId: vault.id, entryId: "ab".repeat(16) });
    expect(share.url).toMatch(new RegExp(`^https://share\\.example/${share.id}#[A-Za-z0-9_-]{43}$`));
    // the key never reaches the server
    const key = share.url.split("#")[1]!;
    expect(JSON.stringify(auth.calls)).not.toContain(key);
    expect(JSON.stringify(auth.calls)).not.toContain("hunter2");

    expect(await getShareInfo(API, share.id, { fetch })).toMatchObject({ opensLeft: 2, kdf: null });
    const opened = await openShare(API, share.url, { http: { fetch } });
    expect(opened).toEqual({ payload, opensLeft: 1 });

    const [listed] = await alice.listShares();
    expect(listed).toMatchObject({ id: share.id, vaultId: vault.id, opens: 1, status: "active", ref: { vault: vault.id, entry: "ab".repeat(16), title: "Wi-Fi" } });

    await alice.revokeShare(share.id);
    await expect(openShare(API, share.url, { http: { fetch } })).rejects.toMatchObject({ code: "not_found" });
    expect((await alice.listShares())[0]).toMatchObject({ status: "ended", endReason: "revoked" });
  });

  it("passcode", async () => {
    const { fetch } = servers();
    const alice = await Account.connect({ issuer: ISSUER, fetch, device: { name: "web", platform: "web" } });
    await alice.register({ email: "alice@example.com", password: "pw", kdf: { m: 19456, t: 2 } });
    const share = await alice.createShare(textSharePayload("the code is 1234"), { expiresIn: 3600, passcode: "tiger lily" });
    expect((await alice.listShares())[0]!.passcode).toBe(true);

    await expect(openShare(API, share.url, { http: { fetch } })).rejects.toMatchObject({ code: "passcode_required" });
    await expect(openShare(API, share.url, { passcode: "wrong", http: { fetch } })).rejects.toMatchObject({ code: "invalid_passcode", details: { attemptsLeft: 4 } });
    const opened = await openShare(API, share.url, { passcode: "tiger lily", http: { fetch } });
    expect(opened.payload.fields[0]!.value).toBe("the code is 1234");
  });

  it("falls back to the web app's /s", async () => {
    const { fetch } = servers();
    const { share: _share, ...config } = CONFIG;
    const acct = await Account.connect({ issuer: ISSUER, fetch, device: { name: "web", platform: "web" }, config: { ...config, web: "https://app.example/" } });
    expect(acct.shareBase).toBe("https://app.example/s");
  });
});
