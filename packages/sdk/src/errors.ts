/** Every error the SDK throws on purpose is a OpenVireoError with a machine-readable code. */
export type OpenVireoErrorCode =
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
  // account recovery (SPEC.md §18)
  | "recovery_not_ready"
  | "recovery_cancelled"
  | "restore_locked"
  | "invalid_proof"
  // plans (SPEC.md §19)
  | "plan_limit"
  | "quota_exceeded"
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
  | "not_available_offline"
  | "vault_upload_failed"
  | "aborted";

export class OpenVireoError extends Error {
  override readonly name = "OpenVireoError";
  /**
   * Extra data some codes carry, camelCased: `recovery_not_ready` has `notBefore` (RFC 3339, when the
   * reset link starts working); `plan_limit` has `limit`, `max`, `current`, `plan` and `upgradeUrl`
   * (where to change plan); `quota_exceeded` has `max` (the vault's size limit in bytes).
   */
  readonly details?: Record<string, unknown>;
  constructor(
    readonly code: OpenVireoErrorCode | (string & {}),
    message: string,
    readonly status?: number,
    options?: { cause?: unknown; details?: Record<string, unknown> },
  ) {
    super(message, options);
    if (options?.details) this.details = options.details;
  }
}

export const isOpenVireoError = (e: unknown, code?: string): e is OpenVireoError =>
  e instanceof OpenVireoError && (code === undefined || e.code === code);

/**
 * Whether an error means the server could not be reached (no network, DNS, a refused connection, or
 * a gateway in front of it answering 502/503/504), as opposed to the server refusing the request.
 */
export const isUnreachable = (e: unknown): boolean => {
  const err = e as { code?: unknown; status?: unknown } | null | undefined;
  return err?.code === "network_error" || err?.status === 502 || err?.status === 503 || err?.status === 504;
};
