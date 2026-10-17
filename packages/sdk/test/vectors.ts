import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("./fixtures/", import.meta.url));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const V: any = JSON.parse(readFileSync(dir + "test-vectors.json", "utf8"));
export const fixtureKdbx = (): Uint8Array => new Uint8Array(readFileSync(dir + "vault-fixture.kdbx"));
