/**
 * Streaming secret masking for `kpx run`: replaces every occurrence of a secret value in a byte stream,
 * also when a value is split across chunks. Bytes that could be the start of a secret are held back
 * until the next chunk (or `flush`) shows whether they are.
 */
export const MASK = "<concealed by kpx>";

const enc = new TextEncoder();

/** The values to look for: each secret, and each line (≥ 4 characters) of a multi-line secret. */
export function maskPatterns(secrets: Iterable<string>): string[] {
  const set = new Set<string>();
  for (const s of secrets) {
    if (!s) continue;
    set.add(s);
    if (/[\r\n]/.test(s)) for (const line of s.split(/\r?\n|\r/)) if (line.trim().length >= 4) set.add(line);
  }
  return [...set];
}

export class Masker {
  private readonly patterns: Uint8Array[];
  private readonly first = new Set<number>();
  private readonly maskBytes: Uint8Array;
  private held: Uint8Array = new Uint8Array(0);

  constructor(
    private readonly secrets: string[],
    private readonly mask = MASK,
  ) {
    // longest first, so a secret that contains another one is replaced whole
    this.patterns = maskPatterns(secrets).map((s) => enc.encode(s)).sort((a, b) => b.length - a.length);
    for (const p of this.patterns) this.first.add(p[0]!);
    this.maskBytes = enc.encode(mask);
  }

  get pending(): boolean {
    return this.held.length > 0;
  }

  /** Masks a chunk; returns what can be written now. */
  push(chunk: Uint8Array): Uint8Array {
    return this.run(concat(this.held, chunk), false);
  }

  /** Emits whatever is held back (at the end of the stream, or after a pause). */
  flush(): Uint8Array {
    return this.run(this.held, true);
  }

  /** Masks a whole string at once (a fresh masker, so held bytes of this stream are not mixed in). */
  maskString(s: string): string {
    const m = new Masker(this.secrets, this.mask);
    return new TextDecoder().decode(concat(m.push(enc.encode(s)), m.flush()));
  }

  private run(buf: Uint8Array, final: boolean): Uint8Array {
    this.held = new Uint8Array(0);
    if (!this.patterns.length) return buf;
    const out: Uint8Array[] = [];
    let start = 0; // first byte not yet copied to out
    for (let i = 0; i < buf.length; i++) {
      if (!this.first.has(buf[i]!)) continue;
      // Could a secret still be starting here? Then wait for more input before deciding.
      if (!final && this.patterns.some((p) => isCutOffAt(p, buf, i))) {
        out.push(buf.subarray(start, i));
        this.held = buf.slice(i);
        return concat(...out);
      }
      const hit = this.patterns.find((p) => matchesAt(p, buf, i));
      if (hit) {
        out.push(buf.subarray(start, i), this.maskBytes);
        i += hit.length - 1;
        start = i + 1;
      }
    }
    out.push(buf.subarray(start));
    return concat(...out);
  }
}

/** The whole pattern is at buf[i…]. */
function matchesAt(pattern: Uint8Array, buf: Uint8Array, i: number): boolean {
  if (pattern.length > buf.length - i) return false;
  for (let k = 0; k < pattern.length; k++) if (buf[i + k] !== pattern[k]) return false;
  return true;
}

/** buf ends with a proper prefix of the pattern starting at i (the rest may be in the next chunk). */
function isCutOffAt(pattern: Uint8Array, buf: Uint8Array, i: number): boolean {
  const n = buf.length - i;
  if (n >= pattern.length) return false;
  for (let k = 0; k < n; k++) if (buf[i + k] !== pattern[k]) return false;
  return true;
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const n = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
