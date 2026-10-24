/**
 * Pluggable persistent storage for sessions (refresh tokens), trusted-device Secret Keys and sync state.
 * Values are strings (JSON). Adapters: MemoryStorage (anywhere), IndexedDbStorage (browser),
 * FileStorage (Node/Bun, in "@openvireo/sdk/storage/node"), and EncryptedStorage, which wraps another
 * storage with a non-extractable WebCrypto AES-GCM key (SPEC §2: the web keeps the Secret Key that way).
 */
import { b64u, fromB64u, fromUtf8, randomBytes, utf8 } from "../util/bytes.js";

export interface KeyValueStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export class MemoryStorage implements KeyValueStorage {
  private readonly map = new Map<string, string>();
  async get(key: string) {
    return this.map.get(key) ?? null;
  }
  async set(key: string, value: string) {
    this.map.set(key, value);
  }
  async delete(key: string) {
    this.map.delete(key);
  }
}

const idbRequest = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

/** One object store in an IndexedDB database. Also stores structured-cloneable values (CryptoKey) via getRaw/setRaw. */
export class IndexedDbStorage implements KeyValueStorage {
  private db: Promise<IDBDatabase> | null = null;
  constructor(
    readonly dbName = "kpnx-sdk",
    readonly storeName = "kv",
    private readonly idb: IDBFactory | undefined = globalThis.indexedDB,
  ) {}

  private open(): Promise<IDBDatabase> {
    this.db ??= new Promise((resolve, reject) => {
      if (!this.idb) return reject(new Error("IndexedDB is not available"));
      const req = this.idb.open(this.dbName, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(this.storeName)) req.result.createObjectStore(this.storeName);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.db;
  }

  async getRaw<T>(key: string): Promise<T | null> {
    const db = await this.open();
    const v = await idbRequest(db.transaction(this.storeName, "readonly").objectStore(this.storeName).get(key));
    return (v ?? null) as T | null;
  }
  async setRaw(key: string, value: unknown): Promise<void> {
    const db = await this.open();
    const tx = db.transaction(this.storeName, "readwrite");
    tx.objectStore(this.storeName).put(value, key);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  async get(key: string) {
    const v = await this.getRaw<unknown>(key);
    return typeof v === "string" ? v : null;
  }
  set(key: string, value: string) {
    return this.setRaw(key, value);
  }
  async delete(key: string) {
    const db = await this.open();
    const tx = db.transaction(this.storeName, "readwrite");
    tx.objectStore(this.storeName).delete(key);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  close(): void {
    void this.db?.then((d) => d.close());
    this.db = null;
  }
}

/**
 * Encrypts every value with AES-GCM under a key from `getKey`. With `nonExtractableIdbKey` the key is
 * a non-extractable CryptoKey kept in IndexedDB, so script code can use it but never read it out.
 */
export class EncryptedStorage implements KeyValueStorage {
  constructor(
    private readonly inner: KeyValueStorage,
    private readonly getKey: () => Promise<CryptoKey>,
  ) {}
  async get(key: string) {
    const v = await this.inner.get(key);
    if (v === null) return null;
    const [iv, ct] = v.split(".");
    if (!iv || !ct) return null;
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64u(iv) as BufferSource, additionalData: utf8(key) as BufferSource },
      await this.getKey(),
      fromB64u(ct) as BufferSource,
    );
    return fromUtf8(new Uint8Array(pt));
  }
  async set(key: string, value: string) {
    const iv = randomBytes(12);
    const ct = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as BufferSource, additionalData: utf8(key) as BufferSource },
      await this.getKey(),
      utf8(value) as BufferSource,
    );
    await this.inner.set(key, `${b64u(iv)}.${b64u(new Uint8Array(ct))}`);
  }
  delete(key: string) {
    return this.inner.delete(key);
  }
}

/** A non-extractable AES-GCM key created once and kept in IndexedDB under `keyName`. */
export function nonExtractableIdbKey(store: IndexedDbStorage, keyName = "__kpx_wrapping_key"): () => Promise<CryptoKey> {
  let key: Promise<CryptoKey> | null = null;
  return () =>
    (key ??= (async () => {
      const existing = await store.getRaw<CryptoKey>(keyName);
      if (existing) return existing;
      const k = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
      await store.setRaw(keyName, k);
      return k;
    })());
}

/** The browser default: values encrypted with a non-extractable key, both in IndexedDB. */
export function browserStorage(dbName = "kpnx-sdk"): KeyValueStorage {
  const idb = new IndexedDbStorage(dbName);
  return new EncryptedStorage(idb, nonExtractableIdbKey(idb));
}

/** Prefixes keys, so several components can share one storage. */
export class NamespacedStorage implements KeyValueStorage {
  constructor(
    private readonly inner: KeyValueStorage,
    private readonly prefix: string,
  ) {}
  get(key: string) {
    return this.inner.get(this.prefix + key);
  }
  set(key: string, value: string) {
    return this.inner.set(this.prefix + key, value);
  }
  delete(key: string) {
    return this.inner.delete(this.prefix + key);
  }
}
