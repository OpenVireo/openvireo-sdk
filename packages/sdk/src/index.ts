/**
 * @openvireo/sdk: OpenVireo accounts, vault sync and sharing (ov v1). Subpaths: crypto, opaque, auth, sync, vault, merge, share.
 *
 * @module @openvireo/sdk
 */
export * from "./errors.js";
export * as crypto from "./crypto/index.js";
export * from "./crypto/index.js";
export * from "./opaque/index.js";
export * from "./auth/index.js";
export * from "./sync/index.js";
export * from "./vault/index.js";
export * from "./merge/index.js";
export { Account, AccountVault, VaultUploadError, deletionExpired, type AccountOptions, type DeletionPreview, type CreatedShare, type RecoveryReset, type RecoveryStatus, type ShareListing, type ShareOptions, type TotpPrompt, type VaultInfo } from "./account.js";
export { DEFAULT_SHARE_FIELDS, getShareInfo, itemSharePayload, openShare, shareableFields, textSharePayload, type OpenedShare, type ShareInfo } from "./share/index.js";
export * from "./share/totp.js";
export { ServiceAccount, type SaVault } from "./service-account.js";
export { SelfHostedSync, type SelfHostedOptions } from "./self-hosted.js";
