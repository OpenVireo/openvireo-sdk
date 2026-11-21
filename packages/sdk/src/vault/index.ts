/**
 * Vaults as the shared Rust core's handles (`Vault`, `Kdbx`): opening, creating and saving local
 * databases, plain-data entry views and edits, `ov://` references and items.
 *
 * @module @openvireo/sdk/vault
 */
export * from "./kdbx.js";
export * from "./entries.js";
export * from "./reference.js";
export * from "./items.js";
