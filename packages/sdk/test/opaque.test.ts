import { describe, expect, it } from "vitest";
import { OpaqueClientState, finishLogin, finishRegistration, opaqueIds, opaqueServerForTests as S, startLogin, startRegistration } from "../src/opaque/index.js";
import { toHex } from "../src/util/bytes.js";

const ids = opaqueIds("  Alice@Example.com ", "https://kpx.example");

async function register(password: string) {
  const { request, state } = await startRegistration(password);
  const { sec, response } = await S.registrationResponse(request);
  const { record } = await finishRegistration(state, response, ids);
  return S.storeRecord(sec, record);
}

async function login(rec: Uint8Array, password: string) {
  const { ke1, state } = await startLogin(password);
  const srv = await S.credentialResponse(ke1, rec, ids);
  try {
    const r = await finishLogin(state, srv.ke2, ids);
    return { ok: await S.userAuth(srv.sec, r.authU), keysMatch: toHex(r.sessionKey) === toHex(srv.sessionKey) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

describe("OPAQUE (WASM-only roundtrip with the library's own server functions)", () => {
  it("normalizes ids", () => {
    expect(ids).toEqual({ idU: "alice@example.com", idS: "kpx.example" });
    expect(opaqueIds("a@b.c", "accounts.keepassxc.org").idS).toBe("accounts.keepassxc.org");
  });
  it("registers and logs in", async () => {
    const rec = await register("correct horse battery staple");
    expect(await login(rec, "correct horse battery staple")).toEqual({ ok: true, keysMatch: true });
  });
  it("fails with a wrong password", async () => {
    const rec = await register("correct horse battery staple");
    const r = await login(rec, "correct horse battery stapler");
    expect(r.ok).toBe(false);
    expect((r as { error: { code: string } }).error.code).toBe("opaque_failed");
  });
  it("uses the full UTF-8 password (non-ASCII), NFKC-normalized", async () => {
    const rec = await register("Ünïcödé pässwörd ﬁ");
    expect((await login(rec, "Ünïcödé pässwörd fi")).ok).toBe(true); // ﬁ → fi under NFKC
    expect((await login(rec, "Ünïcödé pässwörd ﬁ!")).ok).toBe(false);
  });
  it("documents the stock wrapper bug: it ignores the tail of a non-ASCII password", async () => {
    // Register "éé" + "xx" through the stock wrapper: len("ééxx") = 4 code units but 6 UTF-8 bytes, so only
    // the first 4 bytes ("éé") are used, and "ééyy" logs in too.
    const { sec: uSec, M } = await S.stockRegistrationRequest("ééxx");
    const { sec, response } = await S.registrationResponse(M);
    const { record } = await finishRegistration(new OpaqueClientState(uSec), response, ids);
    const rec = await S.storeRecord(sec, record);
    const req = await S.stockCredentialRequest("ééyy");
    const srv = await S.credentialResponse(req.pub, rec, ids);
    const r = await finishLogin(new OpaqueClientState(req.sec), srv.ke2, ids);
    expect(await S.userAuth(srv.sec, r.authU)).toBe(true);
    // the SDK's byte-correct path does not accept that
    expect((await login(rec, "ééyy")).ok).toBe(false);
  });

});

describe("the vendored libopaque build", () => {
  it("is a release build: its login nonce and key share are random", async () => {
    const { opaqueBuildInfo } = await import("../src/opaque/index.js");
    expect((await opaqueBuildInfo()).deterministic).toBe(false);
    const a = await startLogin("pw");
    const b = await startLogin("pw");
    // KE1 = blinded element (32) ‖ client nonce (32) ‖ client key share (32)
    expect(Buffer.from(a.ke1.subarray(32, 96)).equals(Buffer.from(b.ke1.subarray(32, 96)))).toBe(false);
  });
});
