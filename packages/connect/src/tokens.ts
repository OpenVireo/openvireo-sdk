/**
 * openvireo connect's own bearer tokens. They are independent of the SA token it holds: each one is
 * `ov_ct_` + base64url(32 random bytes), stored only as its SHA-256, and scoped to some vaults with
 * read or write access.
 */
import { OpenVireoError, b64u, ctEqual, fromHex, randomBytes, sha256, toHex, utf8 } from "@openvireo/sdk";

export const CONNECT_TOKEN_PREFIX = "ov_ct_";

export interface ConnectToken {
  name: string;
  /** hex SHA-256 of the UTF-8 token */
  sha256: string;
  /** vault ids or names this token may use; "*" for every vault the SA can open */
  vaults: string[];
  access: "read" | "write";
}

export const hashConnectToken = (token: string): string => toHex(sha256(utf8(token)));

/** A new token and its config entry (the plain token is shown once and not stored). */
export function newConnectToken(p: { name: string; vaults?: string[]; access?: "read" | "write" }): { token: string; entry: ConnectToken } {
  const token = CONNECT_TOKEN_PREFIX + b64u(randomBytes(32));
  return { token, entry: { name: p.name, sha256: hashConnectToken(token), vaults: p.vaults?.length ? p.vaults : ["*"], access: p.access ?? "read" } };
}

/** Parses and checks a tokens config: a JSON array of ConnectToken, or `{ "tokens": [...] }`. */
export function parseConnectTokens(text: string): ConnectToken[] {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new OpenVireoError("invalid_request", `connect tokens config is not JSON: ${(e as Error).message}`);
  }
  const list = Array.isArray(raw) ? raw : (raw as { tokens?: unknown })?.tokens;
  if (!Array.isArray(list)) throw new OpenVireoError("invalid_request", "connect tokens config must be an array or {\"tokens\": [...]}");
  return list.map((t, i) => {
    const o = t as Partial<ConnectToken>;
    const where = `connect token #${i + 1}${o?.name ? ` (${o.name})` : ""}`;
    if (typeof o?.name !== "string" || !o.name) throw new OpenVireoError("invalid_request", `${where}: "name" is required`);
    if (typeof o.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(o.sha256)) throw new OpenVireoError("invalid_request", `${where}: "sha256" must be 64 lowercase hex digits`);
    const vaults = o.vaults ?? ["*"];
    if (!Array.isArray(vaults) || vaults.some((v) => typeof v !== "string" || !v)) throw new OpenVireoError("invalid_request", `${where}: "vaults" must be a list of vault ids or names`);
    const access = o.access ?? "read";
    if (access !== "read" && access !== "write") throw new OpenVireoError("invalid_request", `${where}: "access" must be "read" or "write"`);
    return { name: o.name, sha256: o.sha256, vaults, access };
  });
}

/** Finds the token presented in `Authorization: Bearer …` (constant-time comparison of the hashes). */
export function authenticate(tokens: readonly ConnectToken[], header: string | null): ConnectToken | null {
  const m = /^Bearer\s+(\S+)\s*$/i.exec(header ?? "");
  if (!m) return null;
  const presented = sha256(utf8(m[1]!));
  let found: ConnectToken | null = null;
  for (const t of tokens) if (ctEqual(presented, fromHex(t.sha256)) && !found) found = t;
  return found;
}

export const allowsVault = (t: ConnectToken, vault: { id: string; name: string }): boolean =>
  t.vaults.some((v) => v === "*" || v === vault.id || v === vault.name);
