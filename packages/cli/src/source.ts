/**
 * Where secrets come from: a service account (OPENVIREO_SERVICE_ACCOUNT_TOKEN) or a signed-in user. Both
 * read the same ov:// references and write through the SDK's conditional PUT with merge/retry.
 */
import { type Account, type AccountVault, KpxError, type Kdbx, type ServiceAccount, type VaultRole } from "@openvireo/sdk";

export interface VaultSummary {
  id: string;
  name: string;
  role: VaultRole;
}

export interface VaultSource {
  readonly kind: "service-account" | "user";
  readonly principal: string;
  listVaults(): Promise<VaultSummary[]>;
  /** the vault's current contents (downloaded once per process) */
  open(idOrName: string): Promise<Kdbx>;
  /** edits the vault and uploads it (needs `write`; a `read` grant fails before anything is sent) */
  edit<T>(idOrName: string, fn: (db: Kdbx) => T | Promise<T>): Promise<T>;
  close(): void;
}

export function serviceAccountSource(sa: ServiceAccount): VaultSource {
  return {
    kind: "service-account",
    principal: sa.principal,
    listVaults: async () => (await sa.listVaults()).map(({ id, name, role }) => ({ id, name, role })),
    open: (v) => sa.openVault(v),
    edit: (v, fn) => sa.edit(v, fn),
    close: () => sa.close(),
  };
}

/** Same lookup rules as ServiceAccount.vault: an id, or a unique name. */
export function pickVault<T extends { id: string; name: string }>(all: T[], idOrName: string, who: string): T {
  const byId = all.find((v) => v.id === idOrName);
  if (byId) return byId;
  const byName = all.filter((v) => v.name === idOrName);
  if (byName.length === 1) return byName[0]!;
  throw new KpxError("not_found", byName.length ? `${byName.length} vaults are named "${idOrName}"; use the vault id` : `vault "${idOrName}" not found or not shared with ${who}`, 404);
}

export function userSource(account: Account): VaultSource {
  let list: VaultSummary[] | null = null;
  const opened = new Map<string, AccountVault>();
  const listVaults = async () => (list ??= (await account.listVaults()).map(({ id, name, role }) => ({ id, name, role })));
  const vault = async (idOrName: string) => {
    const v = pickVault(await listVaults(), idOrName, "this account");
    let av = opened.get(v.id);
    if (!av) opened.set(v.id, (av = await account.openVault(v.id)));
    return { v, av };
  };
  return {
    kind: "user",
    principal: account.principal,
    listVaults,
    open: async (idOrName) => (await vault(idOrName)).av.db!,
    edit: async (idOrName, fn) => {
      const v = pickVault(await listVaults(), idOrName, "this account");
      if (v.role === "read") throw new KpxError("forbidden", `you can only read vault "${v.name || v.id}"`, 403);
      const { av } = await vault(v.id);
      const out = await fn(av.db!);
      await av.sync();
      return out;
    },
    close: () => account.lock(),
  };
}
