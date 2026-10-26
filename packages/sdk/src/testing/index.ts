/**
 * In-memory auth and sync servers for tests of apps built on the SDK (`@openvireo/sdk/testing`). They
 * follow the account server's openapi.yaml and the sync server's docs/openapi.yaml closely enough for
 * end-to-end tests; pass `fetch` of each (or a router over both) to the SDK. Not for production use.
 *
 * @module @openvireo/sdk/testing
 */
export { MockServer, json, bytes, type Handler, type Recorded } from "./mock-fetch.js";
export { FakeAuthServer, CONFIG, ISSUER, type FakeArchive, type FakeRecovery } from "./auth-server.js";
export { FakeSyncServer } from "./sync-server.js";
