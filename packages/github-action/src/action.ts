/**
 * Loads ov:// references into the job: every variable of the step's `env:` whose value contains a
 * reference, plus the `secrets` input lines. Each value (and each line of a multi-line value) is masked
 * before it is exported, so it can't show up unmasked in any later log line.
 */
import { ServiceAccount, type FetchLike } from "@openvireo/sdk";
import { findReferences, maskPatterns, resolveTemplate, serviceAccountSource } from "@openvireo/cli";
import { type ActionIo, addMask, error, exportVariable, getBooleanInput, getInput, info, setOutput } from "./core.js";

const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const RESERVED = new Set(["OPENVIREO_SERVICE_ACCOUNT_TOKEN", "GITHUB_ENV", "GITHUB_OUTPUT", "GITHUB_PATH", "PATH", "NODE_OPTIONS"]);

/** The variables to load: [name, template] from the step's env and the `secrets` input. */
export function collect(io: ActionIo): [string, string][] {
  const out = new Map<string, string>();
  for (const [k, v] of Object.entries(io.env)) {
    if (!v || k.startsWith("INPUT_") || RESERVED.has(k) || !findReferences(v).length) continue;
    out.set(k, v);
  }
  for (const line of getInput(io, "secrets").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    const name = i > 0 ? t.slice(0, i).trim() : "";
    if (!NAME.test(name)) throw new Error(`secrets: expected NAME=ov://…, got "${t}"`);
    if (RESERVED.has(name)) throw new Error(`secrets: ${name} can't be set by this action`);
    out.set(name, t.slice(i + 1).trim());
  }
  return [...out];
}

export async function run(io: ActionIo, opts: { fetch?: FetchLike } = {}): Promise<number> {
  try {
    const token = getInput(io, "service-account-token") || io.env.OPENVIREO_SERVICE_ACCOUNT_TOKEN?.trim();
    if (!token) throw new Error("no service account token: set the service-account-token input or OPENVIREO_SERVICE_ACCOUNT_TOKEN");
    addMask(io, token);
    const exportEnv = getBooleanInput(io, "export-env", true);
    const wanted = collect(io);
    if (!wanted.length) {
      info(io, "No ov:// references found in the step's env or the secrets input.");
      setOutput(io, "loaded", "");
      return 0;
    }
    const sa = await ServiceAccount.fromToken(token, { fetch: opts.fetch, headers: { "User-Agent": "openvireo-github-action/0.4.0" } });
    const src = serviceAccountSource(sa);
    const resolved: [string, string][] = [];
    try {
      for (const [name, template] of wanted) {
        const { text, secrets } = await resolveTemplate(src, template);
        for (const p of maskPatterns([...secrets, text])) addMask(io, p);
        resolved.push([name, text]);
      }
    } finally {
      src.close();
    }
    for (const [name, value] of resolved) {
      if (exportEnv) exportVariable(io, name, value);
      else setOutput(io, name, value);
    }
    const names = resolved.map(([n]) => n);
    setOutput(io, "loaded", names.join(","));
    info(io, `Loaded ${names.length} secret${names.length === 1 ? "" : "s"} ${exportEnv ? "into the environment" : "as outputs"}: ${names.join(", ")}`);
    return 0;
  } catch (e) {
    error(io, `openvireo: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}
