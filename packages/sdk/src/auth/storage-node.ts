/** File storage for Node/Bun (CLI, connect): one JSON file, written atomically with mode 0600. */
import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { KeyValueStorage } from "./storage.js";

export class FileStorage implements KeyValueStorage {
  private cache: Record<string, string> | null = null;
  private chain: Promise<void> = Promise.resolve();
  constructor(readonly path: string) {}

  private async load(): Promise<Record<string, string>> {
    if (this.cache) return this.cache;
    try {
      this.cache = JSON.parse(await readFile(this.path, "utf8")) as Record<string, string>;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      this.cache = {};
    }
    return this.cache;
  }

  private persist(): Promise<void> {
    const run = async () => {
      await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
      const tmp = `${this.path}.${process.pid}.tmp`;
      await writeFile(tmp, JSON.stringify(this.cache ?? {}, null, 2), { mode: 0o600 });
      await chmod(tmp, 0o600);
      await rename(tmp, this.path);
    };
    this.chain = this.chain.then(run, run);
    return this.chain;
  }

  async get(key: string) {
    return (await this.load())[key] ?? null;
  }
  async set(key: string, value: string) {
    (await this.load())[key] = value;
    await this.persist();
  }
  async delete(key: string) {
    const data = await this.load();
    if (key in data) {
      delete data[key];
      await this.persist();
    }
  }
}

export { MemoryStorage } from "./storage.js";
export type { KeyValueStorage } from "./storage.js";
