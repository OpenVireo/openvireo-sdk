/**
 * The result of a vault sync and the clock-skew check. The sync loop itself is the shared Rust core's
 * (`Vault.sync()`, ov-sync): pull, three-way merge, upload with ETag preconditions, deletions, rotation.
 */
export type { MergeChange, SyncConflict, SyncOptions, SyncOutcome, SyncReport, SyncReport as SyncResult } from "@openvireo/core-wasm";

/** How far off a clock may be before apps warn (5 minutes), as the desktop and iOS apps do. */
export const CLOCK_SKEW_WARNING_MS = 5 * 60 * 1000;

/**
 * Whether this computer's clock is far enough off the server's to warn the user. Sync itself doesn't
 * depend on the clock (deletions and edits are decided against the base copy), but a wrong clock still
 * gives entries wrong modification times, which decide between two copies when there is no base, and it
 * breaks TOTP codes. Pass `SyncReport.clockOffsetMs`.
 */
export const isClockSkewed = (clockOffsetMs: number | undefined): boolean =>
  clockOffsetMs !== undefined && Math.abs(clockOffsetMs) > CLOCK_SKEW_WARNING_MS;
