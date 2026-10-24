import { describe, expect, it } from "vitest";
import { parseReference } from "@openvireo/sdk";
import { CHARSETS, MASK, Masker, findReferences, generatePassword, maskPatterns, parseCharsets, parseEnvFile } from "../src/index.js";

const enc = new TextEncoder();
const dec = new TextDecoder();

function streamThrough(m: Masker, chunks: string[] | Uint8Array[]): string {
  const parts: Uint8Array[] = [];
  for (const c of chunks) parts.push(m.push(typeof c === "string" ? enc.encode(c) : c));
  parts.push(m.flush());
  return parts.map((p) => dec.decode(p, { stream: true })).join("") + dec.decode();
}

describe("Masker", () => {
  it("masks every occurrence", () => {
    const m = new Masker(["s3cret"]);
    expect(streamThrough(m, ["token=s3cret and again s3cret.\n"])).toBe(`token=${MASK} and again ${MASK}.\n`);
    expect(new Masker([]).maskString("s3cret")).toBe("s3cret");
    expect(new Masker([""]).maskString("abc")).toBe("abc");
  });

  it("masks a secret split across chunks at every position", () => {
    const text = "before hunter2-but-longer after";
    for (let a = 0; a <= text.length; a++) {
      for (let b = a; b <= text.length; b += 3) {
        const got = streamThrough(new Masker(["hunter2-but-longer"]), [text.slice(0, a), text.slice(a, b), text.slice(b)]);
        expect(got).toBe(`before ${MASK} after`);
      }
    }
  });

  it("holds back a possible prefix, and releases it when it isn't one", () => {
    const m = new Masker(["password"]);
    expect(dec.decode(m.push(enc.encode("type pass")))).toBe("type ");
    expect(m.pending).toBe(true);
    expect(dec.decode(m.push(enc.encode("port")))).toBe("passport");
    expect(m.pending).toBe(false);
    expect(dec.decode(m.push(enc.encode("pa")))).toBe("");
    expect(dec.decode(m.flush())).toBe("pa");
  });

  it("replaces the longer of two overlapping secrets whole", () => {
    expect(streamThrough(new Masker(["abc", "abcdef"]), ["x abc", "def y abc z"])).toBe(`x ${MASK} y ${MASK} z`);
  });

  it("masks multi-line secrets and each of their lines", () => {
    const key = "-----BEGIN KEY-----\nMIIBOgIBAAJBAK\n-----END KEY-----";
    expect(maskPatterns([key])).toEqual([key, "-----BEGIN KEY-----", "MIIBOgIBAAJBAK", "-----END KEY-----"]);
    const out = new Masker([key]).maskString(`whole:\n${key}\nwith CRLF:\n${key.replace(/\n/g, "\r\n")}\n`);
    expect(out).not.toContain("MIIBOgIBAAJBAK");
    expect(out.startsWith(`whole:\n${MASK}\n`)).toBe(true);
  });

  it("works on bytes, including multi-byte UTF-8 split mid-character", () => {
    const secret = "pä$$wörd✓";
    const bytes = enc.encode(`[${secret}]`);
    for (let cut = 1; cut < bytes.length; cut++) {
      expect(streamThrough(new Masker([secret]), [bytes.slice(0, cut), bytes.slice(cut)])).toBe(`[${MASK}]`);
    }
    // binary output passes through untouched
    const bin = new Uint8Array([0, 255, 1, 254, 0x70]);
    const m = new Masker(["pass"]);
    expect([...m.push(bin), ...m.flush()]).toEqual([...bin]);
  });
});

describe("references and env files", () => {
  it("parses ov:// references", () => {
    expect(parseReference("ov://Team%20Infra/Deploy/Database/password")).toEqual({ vault: "Team Infra", groupPath: ["Deploy"], entry: "Database", field: "password" });
    for (const bad of ["ov://v/e", "ov:/v/e/f", "ov://v//f", "ov://v/e/%E0%A4%A"]) expect(() => parseReference(bad)).toThrow();
  });

  it("finds bare and braced references", () => {
    expect(findReferences('A=ov://v/e/f\nB="ov://v/e/g"\nDSN=postgres://u:{{ ov://v/db/password }}@h/{{ov://v/db/name}}')).toEqual([
      "ov://v/db/password",
      "ov://v/db/name",
      "ov://v/e/f",
      "ov://v/e/g",
    ]);
  });

  it("parses .env files", () => {
    const env = parseEnvFile(
      [
        "# comment",
        "",
        "PLAIN=ov://v/e/f",
        "export SPACED = value with spaces # trailing comment",
        'DQ="line1\\nline2 \\"q\\" # not a comment"',
        "SQ='$literal \\n'",
        'MULTI="a',
        'b"',
        "EMPTY=",
      ].join("\r\n"),
    );
    expect(env).toEqual([
      ["PLAIN", "ov://v/e/f"],
      ["SPACED", "value with spaces"],
      ["DQ", 'line1\nline2 "q" # not a comment'],
      ["SQ", "$literal \\n"],
      ["MULTI", "a\nb"],
      ["EMPTY", ""],
    ]);
    expect(() => parseEnvFile("NOPE", "x.env")).toThrow("x.env:1: expected KEY=value");
    expect(() => parseEnvFile('A="open')).toThrow(/unterminated/);
    expect(() => parseEnvFile('A="x" y')).toThrow(/after the closing quote/);
  });
});

describe("generatePassword", () => {
  it("uses the chosen sets, at least one of each", () => {
    for (let i = 0; i < 50; i++) {
      const p = generatePassword({ length: 8 });
      expect(p).toHaveLength(8);
      for (const set of Object.values(CHARSETS)) expect([...p].some((c) => set.includes(c))).toBe(true);
    }
    expect(generatePassword({ length: 40, charsets: parseCharsets("digits") })).toMatch(/^\d{40}$/);
    expect(generatePassword({ charsets: ["lower", "upper"] })).toMatch(/^[A-Za-z]{32}$/);
    expect(new Set(Array.from({ length: 20 }, () => generatePassword())).size).toBe(20);
    expect(() => parseCharsets("emoji")).toThrow(/unknown charset/);
    expect(() => generatePassword({ length: 3 })).toThrow(/length/);
  });
});
