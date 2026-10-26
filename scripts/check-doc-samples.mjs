#!/usr/bin/env node
// Type-checks every ```ts block in docs/ and the package READMEs against the SDK's sources, so the docs
// can't drift from the API (a renamed method, a removed export, a wrong argument shape).
//
//   node scripts/check-doc-samples.mjs
//
// Each block is compiled as its own module. Names a block uses without declaring them are allowed; to
// check them too, declare them in a comment right before the block (hidden on GitHub and the site):
//
//   <!-- prelude
//   import type { Account } from "@openvireo/sdk";
//   declare const account: Account;
//   -->
//
// `<!-- no-check -->` before a block skips it.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sdk = join(root, "packages/sdk/src");

// Undeclared names (TS2304, TS2552, TS18004, TS2580-style "install types" hints) and the implicit anys they cause
const ALLOWED = new Set([2304, 2552, 18004, 2580, 2591, 2867, 2868, 7005, 7006, 7031, 7034]);

function markdownFiles() {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith(".md")) files.push(path);
    }
  };
  walk(join(root, "docs"));
  files.push(join(root, "README.md"));
  for (const pkg of readdirSync(join(root, "packages"))) {
    const readme = join(root, "packages", pkg, "README.md");
    try {
      statSync(readme);
      files.push(readme);
    } catch {
      /* no README */
    }
  }
  return files;
}

/** The ```ts blocks of a Markdown file, with the prelude comment before each and the line it starts on. */
function samples(file) {
  const lines = readFileSync(file, "utf8").split("\n");
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    const open = /^(\s*)(`{3,}|~{3,})\s*([\w-]*)/.exec(lines[i]);
    if (!open) continue;
    const fence = open[2];
    const lang = open[3];
    let end = i + 1;
    while (end < lines.length && !lines[end].trimStart().startsWith(fence)) end++;
    if (lang === "ts" || lang === "typescript") {
      let j = i - 1;
      while (j >= 0 && lines[j].trim() === "") j--;
      let prelude = "";
      let skip = false;
      let preludeLine = i;
      if (j >= 0 && lines[j].trim() === "<!-- no-check -->") skip = true;
      else if (j >= 0 && lines[j].trim().endsWith("-->")) {
        let k = j;
        while (k >= 0 && !lines[k].includes("<!--")) k--;
        const comment = lines.slice(k, j + 1).join("\n");
        const m = /^\s*<!--\s*prelude\b([\s\S]*?)-->\s*$/.exec(comment);
        if (m) {
          prelude = m[1].trim();
          preludeLine = k;
        }
      }
      if (!skip) {
        found.push({ file, line: i + 2, preludeLine: preludeLine + 1, prelude, code: lines.slice(i + 1, end).join("\n") });
      }
    }
    i = end;
  }
  return found;
}

const all = markdownFiles().flatMap(samples);
const virtual = new Map();
all.forEach((s, n) => {
  const name = join(root, ".doc-samples", `${n}-${relative(root, s.file).replace(/[^\w]+/g, "_")}.ts`);
  s.preludeLines = s.prelude ? s.prelude.split("\n").length : 0;
  virtual.set(name, `${s.prelude}\nexport {};\n${s.code}\n`);
  s.virtual = name;
});

const base = ts.parseConfigFileTextToJson("tsconfig.base.json", readFileSync(join(root, "tsconfig.base.json"), "utf8")).config;
const { options } = ts.convertCompilerOptionsFromJson(
  {
    ...base.compilerOptions,
    noEmit: true,
    declaration: false,
    sourceMap: false,
    types: ["node"],
    baseUrl: root,
    paths: {
      "@openvireo/sdk": [`${sdk}/index.ts`],
      "@openvireo/sdk/storage/node": [`${sdk}/auth/storage-node.ts`],
      "@openvireo/sdk/*": [`${sdk}/*/index.ts`],
      "@openvireo/connect": [join(root, "packages/connect/src/index.ts")],
    },
  },
  root,
);

const host = ts.createCompilerHost(options);
const { fileExists, readFile, getSourceFile } = host;
host.fileExists = (f) => virtual.has(f) || fileExists.call(host, f);
host.readFile = (f) => virtual.get(f) ?? readFile.call(host, f);
host.getSourceFile = (f, lang, ...rest) =>
  virtual.has(f) ? ts.createSourceFile(f, virtual.get(f), lang, true) : getSourceFile.call(host, f, lang, ...rest);

const program = ts.createProgram([...virtual.keys(), `${sdk}/vendor.d.ts`], options, host);
const problems = [];
for (const s of all) {
  const source = program.getSourceFile(s.virtual);
  const diagnostics = [...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source)];
  for (const d of diagnostics) {
    if (ALLOWED.has(d.code)) continue;
    const { line } = d.start === undefined ? { line: 0 } : source.getLineAndCharacterOfPosition(d.start);
    // Line 0..preludeLines-1 is the prelude, then "export {};", then the block
    const at = line < s.preludeLines ? s.preludeLine : s.line + line - s.preludeLines - 1;
    problems.push(`${relative(root, s.file)}:${at}: TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s) in the docs' code samples`);
  process.exit(1);
}
console.log(`${all.length} code samples type-check`);
