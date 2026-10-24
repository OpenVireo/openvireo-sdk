/** @openvireo/sdk: OpenVireo accounts, vault sync and sharing (ov v1). Subpaths: crypto, opaque, auth, sync, vault, merge. */
export * from "./errors.js";
export * as crypto from "./crypto/index.js";
export * from "./crypto/index.js";
export * from "./opaque/index.js";
export * from "./auth/index.js";
export * from "./sync/index.js";
export * from "./vault/index.js";
export * from "./merge/index.js";
export { Account, AccountVault, VaultUploadError, type AccountOptions, type TotpPrompt, type VaultInfo } from "./account.js";
export { ServiceAccount, type SaVault } from "./service-account.js";
export { SelfHostedSync, type SelfHostedOptions } from "./self-hosted.js";
