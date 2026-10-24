import { describe, expect, it } from "vitest";
import {
  AAD,
  buildSaToken,
  decodeJwt,
  decryptVaultName,
  deriveAuk,
  encryptVaultName,
  fingerprint,
  formatSecretKey,
  fromB64u,
  fromHex,
  b64u,
  generateKeyset,
  generateSecretKey,
  isOpenVireoError,
  checkKdfParams,
  keysetFromSecrets,
  nobleArgon2,
  parseSaToken,
  parseSecretKey,
  passwordBytes,
  publicKeysToJson,
  refreshTokenHash,
  saSecretHash,
  saSecretPrefix,
  seal,
  sealDerivedKey,
  setArgon2Impl,
  stretchPassword,
  toHex,
  trustedPublicKeys,
  unseal,
  unsealSaMaster,
  unsealVaultKey,
  unwrap,
  unwrapKeyset,
  unwrapSaMaster,
  utf8,
  vaultNameKey,
  verifyJwt,
  verifyPublicKeys,
  wrap,
  wrapKeyset,
  wrapSaMaster,
  newSaSecret,
} from "../src/crypto/index.js";
import { OpenVireoError } from "../src/errors.js";
import { V } from "./vectors.js";

describe("§1 base64url", () => {
  it("decodes padded and unpadded input", () => {
    expect(toHex(fromB64u("AQI"))).toBe("0102");
    expect(toHex(fromB64u("AQI="))).toBe("0102");
    expect(b64u(new Uint8Array([0xfb, 0xff]))).toBe("-_8");
  });
});

describe("§2 Secret Key", () => {
  for (const v of V.secret_key) {
    it(`formats and parses ${v.display}`, () => {
      expect(formatSecretKey(fromHex(v.raw_hex))).toBe(v.display);
      expect(toHex(parseSecretKey(v.display))).toBe(v.raw_hex);
    });
  }
  it("parses sloppy input (case, spaces, O/I/L)", () => {
    const v = V.secret_key[0];
    const sloppy = " k1 " + v.display.slice(3).toLowerCase().replace(/-/g, " ").replace(/0/g, "o").replace(/1/g, "l");
    expect(toHex(parseSecretKey(sloppy))).toBe(v.raw_hex);
  });
  it("rejects bad prefix, length and padding bits", () => {
    expect(() => parseSecretKey("K2-000000-00000-00000-00000-00000")).toThrow(OpenVireoError);
    expect(() => parseSecretKey("K1-000000-00000-00000-00000-0000")).toThrow(OpenVireoError);
    expect(() => parseSecretKey("K1-ZZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ")).toThrow(/padding/);
    expect(() => parseSecretKey("K1-UUUUUU-00000-00000-00000-00000")).toThrow(/invalid character/);
  });
  it("roundtrips random keys", () => {
    for (let i = 0; i < 20; i++) {
      const raw = generateSecretKey();
      expect(toHex(parseSecretKey(formatSecretKey(raw)))).toBe(toHex(raw));
    }
  });
});

describe("§3 AUK", () => {
  for (const [i, v] of (V.auk as any[]).entries()) {
    it(`vector ${i} (m=${v.kdf.m}, ${v.password})`, async () => {
      expect(toHex(passwordBytes(v.password))).toBe(v.password_nfkc_hex);
      expect(toHex(await stretchPassword(v.password, v.kdf, { allowWeak: true }))).toBe(v.argon2id_hex);
      expect(toHex(await deriveAuk(v.password, v.kdf, fromHex(v.secret_key_hex), { allowWeak: true }))).toBe(v.auk_hex);
    });
  }
  it("the noble fallback gives the same result", async () => {
    const v = V.auk[1];
    setArgon2Impl(nobleArgon2);
    try {
      expect(toHex(await deriveAuk(v.password, v.kdf, fromHex(v.secret_key_hex), { allowWeak: true }))).toBe(v.auk_hex);
    } finally {
      setArgon2Impl(null);
    }
  });
  it("refuses weak KDF parameters", async () => {
    const v = V.auk[0];
    await expect(deriveAuk(v.password, v.kdf, fromHex(v.secret_key_hex))).rejects.toThrow(/minimum/);
    expect(() => checkKdfParams({ ...v.kdf, m: 19456, t: 1 })).toThrow(OpenVireoError);
    expect(() => checkKdfParams({ ...v.kdf, m: 19456, t: 2 })).not.toThrow();
  });
});

describe("§4/§5 keysets", () => {
  const k = V.keyset;
  it("public keys, signature and fingerprint", () => {
    const ks = keysetFromSecrets(fromHex(k.enc_sk_hex), fromHex(k.sign_seed_hex));
    expect(publicKeysToJson(ks)).toEqual({ enc_pk: k.public.enc_pk, sign_pk: k.public.sign_pk, sig: k.public.sig });
    expect(fingerprint(ks)).toBe(k.public.fingerprint);
    expect(verifyPublicKeys(ks)).toBe(true);
  });
  it("wraps byte for byte and unwraps", () => {
    const ks = keysetFromSecrets(fromHex(k.enc_sk_hex), fromHex(k.sign_seed_hex));
    const w = wrapKeyset(fromHex(k.auk_hex), ks, fromHex(k.nonce_hex));
    expect(w.wrapped).toBe(k.wrapped);
    const plain = unwrap(fromHex(k.auk_hex), fromB64u(k.wrapped), k.aad);
    expect(toHex(plain)).toBe(k.enc_sk_hex + k.sign_seed_hex);
    const back = unwrapKeyset(fromHex(k.auk_hex), { ...k.public, wrapped: k.wrapped });
    expect(toHex(back.encSk)).toBe(k.enc_sk_hex);
    expect(toHex(back.signSeed)).toBe(k.sign_seed_hex);
  });
  it("rejects a keyset whose public keys were swapped", () => {
    const bob = V.public_keys[0];
    expect(() =>
      unwrapKeyset(fromHex(k.auk_hex), { enc_pk: bob.enc_pk, sign_pk: bob.sign_pk, sig: bob.sig, wrapped: k.wrapped }),
    ).toThrow(/don't match/);
  });
  it("rejects a wrong AUK and an unknown version", () => {
    const wrong = fromHex(k.auk_hex);
    wrong[0]! ^= 1;
    expect(() => unwrap(wrong, fromB64u(k.wrapped), k.aad)).toThrow(expect.objectContaining({ code: "decryption_failed" }));
    const blob = fromB64u(k.wrapped);
    blob[0] = 2;
    expect(() => unwrap(fromHex(k.auk_hex), blob, k.aad)).toThrow(expect.objectContaining({ code: "unsupported_version" }));
  });
  for (const p of V.public_keys) {
    it(`public keys of ${p.principal}`, () => {
      const ks = keysetFromSecrets(fromHex(p.enc_sk_hex), fromHex(p.sign_seed_hex));
      expect(publicKeysToJson(ks)).toEqual({ enc_pk: p.enc_pk, sign_pk: p.sign_pk, sig: p.sig });
      expect(fingerprint(ks)).toBe(p.fingerprint);
      expect(() => trustedPublicKeys(p)).not.toThrow();
      expect(() => trustedPublicKeys({ ...p, sig: V.keyset.public.sig })).toThrow(/signature/);
    });
  }
  it("generates fresh keysets that verify", () => {
    const ks = generateKeyset();
    expect(verifyPublicKeys(ks)).toBe(true);
  });
});

describe("§6 seal", () => {
  for (const [i, s] of (V.seal as any[]).entries()) {
    it(`vector ${i}`, () => {
      const sealed = seal(fromB64u(s.recipient_enc_pk), fromHex(s.plaintext_hex), s.aad, {
        ephemeralSecretKey: fromHex(s.ephemeral_sk_hex),
        nonce: fromHex(s.nonce_hex),
      });
      expect(b64u(sealed)).toBe(s.sealed);
      expect(toHex(sealed.subarray(1, 33))).toBe(s.ephemeral_pk_hex);
      expect(toHex(sealDerivedKey(fromHex(s.recipient_enc_sk_hex), sealed))).toBe(s.derived_key_hex);
      expect(toHex(unseal(fromHex(s.recipient_enc_sk_hex), fromB64u(s.sealed), s.aad))).toBe(s.plaintext_hex);
      const vaultId = s.aad.split("|")[1];
      expect(toHex(unsealVaultKey(fromHex(s.recipient_enc_sk_hex), vaultId, fromB64u(s.sealed)))).toBe(s.plaintext_hex);
    });
  }
  for (const n of V.seal_negative) {
    it(`negative: ${n.case}`, () => {
      const code = n.expect === "unsupported version" ? "unsupported_version" : "decryption_failed";
      expect(() => unseal(fromHex(n.recipient_enc_sk_hex), fromB64u(n.sealed), n.aad)).toThrow(expect.objectContaining({ code }));
    });
  }
  it("rejects an all-zero shared secret", () => {
    expect(() => seal(new Uint8Array(32), new Uint8Array(32), "x")).toThrow(expect.objectContaining({ code: "low_order_point" }));
  });
});

describe("§4 vault name", () => {
  const v = V.vault_name;
  it("derives the name key and encrypts byte for byte", () => {
    expect(toHex(vaultNameKey(fromHex(v.vault_key_hex)))).toBe(v.name_key_hex);
    expect(encryptVaultName(fromHex(v.vault_key_hex), v.vault_id, v.name, fromHex(v.nonce_hex))).toBe(v.encrypted_name);
    expect(decryptVaultName(fromHex(v.vault_key_hex), v.vault_id, v.encrypted_name)).toBe(v.name);
    expect(AAD.vaultName(v.vault_id)).toBe(v.aad);
  });
  it("is bound to the vault id", () => {
    expect(() => decryptVaultName(fromHex(v.vault_key_hex), "00000000-0000-4000-8000-000000000000", v.encrypted_name)).toThrow();
  });
});

describe("§9 service accounts", () => {
  const sa = V.service_account;
  const payload = JSON.parse(sa.payload_json);
  it("builds and parses the token", () => {
    const token = buildSaToken({ url: payload.url, saId: sa.sa_id, secret: fromB64u(payload.secret), kek: fromHex(sa.kek_hex) });
    expect(token).toBe(sa.token);
    const p = parseSaToken(sa.token);
    expect(p.saId).toBe(sa.sa_id);
    expect(p.url).toBe(payload.url);
    expect(toHex(p.kek)).toBe(sa.kek_hex);
    expect(saSecretHash(p.secret)).toBe(sa.secret_hash_hex);
    expect(saSecretPrefix(p.secret)).toBe(sa.secret_prefix);
  });
  it("rejects malformed tokens", () => {
    expect(() => parseSaToken("ov_rt_abc")).toThrow(OpenVireoError);
    expect(() => parseSaToken("ov_sa_" + b64u(utf8(JSON.stringify({ ...payload, v: 2 }))))).toThrow(/version/);
  });
  it("wraps the master key and the keyset byte for byte, and unwraps the chain", () => {
    expect(wrapSaMaster(fromHex(sa.kek_hex), sa.sa_id, fromHex(sa.master_key_hex), fromHex(sa.wrapped_master_nonce_hex))).toBe(sa.wrapped_master);
    const ks = keysetFromSecrets(fromHex(sa.keyset_enc_sk_hex), fromHex(sa.keyset_sign_seed_hex));
    expect(publicKeysToJson(ks)).toEqual({ enc_pk: sa.public.enc_pk, sign_pk: sa.public.sign_pk, sig: sa.public.sig });
    expect(fingerprint(ks)).toBe(sa.public.fingerprint);
    expect(wrapKeyset(fromHex(sa.master_key_hex), ks, fromHex(sa.wrapped_keyset_nonce_hex)).wrapped).toBe(sa.wrapped_keyset);
    // token → kek → master → keyset
    const p = parseSaToken(sa.token);
    const master = unwrapSaMaster(p.kek, p.saId, sa.wrapped_master);
    expect(toHex(master)).toBe(sa.master_key_hex);
    const back = unwrapKeyset(master, { ...sa.public, wrapped: sa.wrapped_keyset });
    expect(toHex(back.encSk)).toBe(sa.keyset_enc_sk_hex);
  });
  it("seals the master key to an admin byte for byte", () => {
    const m = sa.master_sealed_to_admin;
    expect(m.aad).toBe(AAD.saMaster(sa.sa_id));
    const sealed = seal(fromB64u(V.keyset.public.enc_pk), fromHex(sa.master_key_hex), m.aad, {
      ephemeralSecretKey: fromHex(m.ephemeral_sk_hex),
      nonce: fromHex(m.nonce_hex),
    });
    expect(b64u(sealed)).toBe(m.sealed);
    expect(toHex(unsealSaMaster(fromHex(V.keyset.enc_sk_hex), sa.sa_id, fromB64u(m.sealed)))).toBe(sa.master_key_hex);
  });
  it("newSaSecret produces a token that unwraps the master key", () => {
    const master = fromHex(sa.master_key_hex);
    const { token, body } = newSaSecret({ url: payload.url, saId: sa.sa_id, master, secretId: "s1" });
    const p = parseSaToken(token);
    expect(body.secret_hash).toBe(saSecretHash(p.secret));
    expect(body.prefix).toHaveLength(8);
    expect(toHex(unwrapSaMaster(p.kek, sa.sa_id, body.wrapped_master))).toBe(sa.master_key_hex);
  });
});

describe("§9 refresh token", () => {
  it("stored hash", () => {
    expect(refreshTokenHash(V.refresh_token.token)).toBe(V.refresh_token.stored_hash_hex);
  });
});

describe("§9 JWT", () => {
  const j = V.jwt;
  const opts = { issuer: j.valid[0].claims.iss, audience: "ov-sync", now: j.now }; // SPEC default skew (60 s)
  for (const [i, v] of (j.valid as any[]).entries()) {
    it(`valid ${i}`, async () => {
      expect(decodeJwt(v.token).claims).toEqual(v.claims);
      expect(await verifyJwt(v.token, j.jwks, opts)).toEqual(v.claims);
    });
  }
  for (const v of j.invalid) {
    it(`invalid: ${v.case}`, async () => {
      let refetched = 0;
      const p = verifyJwt(v.token, j.jwks, { ...opts, refetchJwks: async () => (refetched++, j.jwks) });
      await expect(p).rejects.toSatisfy((e: unknown) => isOpenVireoError(e, "unauthorized") && (e as OpenVireoError).status === v.expect);
      if (v.case.startsWith("unknown kid")) expect(refetched).toBe(1);
    });
  }
  it("the 'expired' vector is 61 s past exp, just outside the 60 s skew", async () => {
    const expired = j.invalid[0];
    await expect(verifyJwt(expired.token, j.jwks, { ...opts, now: j.now - 2 })).resolves.toBeTruthy();
  });

});
