import { describe, expect, it } from "vitest";
import { finishLogin, finishRegistration, opaqueIds, opaqueServerForTests as S, startLogin, startRegistration } from "../src/opaque/index.js";
import { toHex } from "../src/util/bytes.js";

const ids = opaqueIds("  Alice@Example.com ", "https://openvireo.example");

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
    const sk = await S.userAuth(srv.sec, r.authU);
    return { ok: !!sk, keysMatch: !!sk && toHex(r.sessionKey) === toHex(sk) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

describe("OPAQUE (WASM-only roundtrip with the module's own test server)", () => {
  it("normalizes ids", () => {
    expect(ids).toEqual({ idU: "alice@example.com", idS: "openvireo.example" });
    expect(opaqueIds("a@b.c", "accounts.openvireo.com").idS).toBe("accounts.openvireo.com");
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
  it("rejects a forged authU", async () => {
    const rec = await register("pw");
    const { ke1, state } = await startLogin("pw");
    const srv = await S.credentialResponse(ke1, rec, ids);
    const r = await finishLogin(state, srv.ke2, ids);
    r.authU[0] = r.authU[0]! ^ 1;
    expect(await S.userAuth(srv.sec, r.authU)).toBeNull();
  });
  it("fails when the client and server disagree on the ids or the context", async () => {
    const rec = await register("pw");
    const { ke1, state } = await startLogin("pw");
    const srv = await S.credentialResponse(ke1, rec, ids);
    await expect(finishLogin(state, srv.ke2, { ...ids, idS: "evil.example" })).rejects.toMatchObject({ code: "opaque_failed" });
    const l2 = await startLogin("pw");
    const srv2 = await S.credentialResponse(l2.ke1, rec, ids);
    await expect(finishLogin(l2.state, srv2.ke2, ids, "other-context")).rejects.toMatchObject({ code: "opaque_failed" });
  });
  it("rejects malformed messages with opaque_failed", async () => {
    const { state } = await startLogin("pw");
    await expect(finishLogin(state, new Uint8Array(10), ids)).rejects.toMatchObject({ code: "opaque_failed" });
    await expect(startLogin("")).rejects.toMatchObject({ code: "opaque_failed" });
  });
  it("wipes the client state after finishing", async () => {
    const rec = await register("pw");
    const { ke1, state } = await startLogin("pw");
    const srv = await S.credentialResponse(ke1, rec, ids);
    await finishLogin(state, srv.ke2, ids);
    expect(state.sec.every((b) => b === 0)).toBe(true);
  });
});

describe("the OPAQUE module", () => {
  it("uses a fresh login nonce and key share every time", async () => {
    const a = await startLogin("pw");
    const b = await startLogin("pw");
    // KE1 = blinded element (32) ‖ client nonce (32) ‖ client key share (32)
    expect(Buffer.from(a.ke1.subarray(32, 96)).equals(Buffer.from(b.ke1.subarray(32, 96)))).toBe(false);
  });
});
