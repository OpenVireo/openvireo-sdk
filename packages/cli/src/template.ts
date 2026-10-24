/** Secret references in templates (`kpx inject`) and env files (`kpx run`). */
import { KpxError, REFERENCE_PATTERN, parseReference, readField } from "@openvireo/sdk";
import type { VaultSource } from "./source.js";

/** `{{ kpx://… }}` (any spacing); needed when a reference is followed by text, e.g. `{{ kpx://v/db/password }}@host`. */
export const BRACED_REFERENCE = /\{\{\s*(kpx:\/\/[^\s}]+)\s*\}\}/g;

export async function readReference(src: VaultSource, ref: string): Promise<string> {
  const r = parseReference(ref);
  return readField(await src.open(r.vault), r);
}

export function findReferences(text: string): string[] {
  const braced = [...text.matchAll(BRACED_REFERENCE)].map((m) => m[1]!);
  const bare = text.replace(BRACED_REFERENCE, "").match(REFERENCE_PATTERN) ?? [];
  return [...new Set([...braced, ...bare])];
}

/** Replaces every reference; returns the text and the values (to mask). */
export async function resolveTemplate(src: VaultSource, text: string): Promise<{ text: string; secrets: string[] }> {
  const values = new Map<string, string>();
  for (const ref of findReferences(text)) values.set(ref, await readReference(src, ref));
  const out = text.replace(BRACED_REFERENCE, (_, ref: string) => values.get(ref)!).replace(REFERENCE_PATTERN, (m) => values.get(m) ?? m);
  return { text: out, secrets: [...values.values()] };
}

/**
 * Parses a .env file: `KEY=value`, optional `export `, `#` comments, "double quotes" (with \n, \t, \",
 * \\ escapes, may span lines) and 'single quotes' (literal).
 */
export function parseEnvFile(text: string, file = ".env"): [string, string][] {
  const out: [string, string][] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line || line.startsWith("#")) continue;
    const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) throw new KpxError("invalid_request", `${file}:${i + 1}: expected KEY=value`);
    const key = m[1]!;
    let rest = m[2]!;
    let value: string;
    if (rest.startsWith('"')) {
      let body = rest.slice(1);
      let end = closingQuote(body);
      while (end < 0 && i + 1 < lines.length) {
        body += "\n" + lines[++i];
        end = closingQuote(body);
      }
      if (end < 0) throw new KpxError("invalid_request", `${file}:${i + 1}: unterminated "`);
      value = body.slice(0, end).replace(/\\(.)/g, (_, c: string) => ({ n: "\n", t: "\t", r: "\r" })[c] ?? c);
      rest = body.slice(end + 1);
    } else if (rest.startsWith("'")) {
      const end = rest.indexOf("'", 1);
      if (end < 0) throw new KpxError("invalid_request", `${file}:${i + 1}: unterminated '`);
      value = rest.slice(1, end);
      rest = rest.slice(end + 1);
    } else {
      value = rest.replace(/\s+#.*$/, "").trim();
      rest = "";
    }
    if (rest.trim() && !rest.trim().startsWith("#")) throw new KpxError("invalid_request", `${file}:${i + 1}: unexpected text after the closing quote`);
    out.push([key, value]);
  }
  return out;
}

function closingQuote(s: string): number {
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\") i++;
    else if (s[i] === '"') return i;
  }
  return -1;
}
