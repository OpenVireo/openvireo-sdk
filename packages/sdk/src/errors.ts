/** Every error the SDK throws on purpose is a KpxError with a machine-readable code. */
export type KpxErrorCode =
  // crypto
  | "unsupported_version"
  | "decryption_failed"
  | "invalid_secret_key"
  | "invalid_public_keys"
  | "invalid_token"
  | "weak_kdf"
  | "low_order_point"
  // OPAQUE
  | "opaque_failed"
  // HTTP (server codes from openapi.yaml, plus client-side ones)
  | "invalid_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "mfa_required"
  | "invalid_mfa"
  | "mfa_expired"
  | "session_expired"
  | "token_reused"
  | "precondition_failed"
  | "precondition_required"
  | "gone"
  | "server_error"
  | "network_error"
  | "signed_out"
  // vault / sync
  | "vault_key_mismatch"
  | "no_vault_key"
  | "kdbx_error"
  | "merge_failed"
  | "server_rolled_back"
  | "server_lost_database"
  | "too_many_conflicts"
  | "invalid_reference"
  | "entry_not_found"
  | "aborted";

export class KpxError extends Error {
  override readonly name = "KpxError";
  constructor(
    readonly code: KpxErrorCode | (string & {}),
    message: string,
    readonly status?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export const isKpxError = (e: unknown, code?: string): e is KpxError =>
  e instanceof KpxError && (code === undefined || e.code === code);
