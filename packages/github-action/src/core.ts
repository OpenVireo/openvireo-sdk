/**
 * The few GitHub Actions runner protocols the action needs (instead of bundling @actions/core):
 * workflow commands on stdout, and the GITHUB_ENV / GITHUB_OUTPUT files.
 */
import { appendFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

export interface ActionIo {
  env: Record<string, string | undefined>;
  stdout: (s: string) => void;
}

const escapeData = (s: string) => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

export function getInput(io: ActionIo, name: string): string {
  return (io.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] ?? "").trim();
}

export function getBooleanInput(io: ActionIo, name: string, fallback: boolean): boolean {
  const v = getInput(io, name).toLowerCase();
  if (!v) return fallback;
  if (["true", "yes", "1"].includes(v)) return true;
  if (["false", "no", "0"].includes(v)) return false;
  throw new Error(`input "${name}" must be true or false, got "${v}"`);
}

/** Registers a value with the runner's log masking. Must happen before the value can appear in a log. */
export const addMask = (io: ActionIo, value: string) => io.stdout(`::add-mask::${escapeData(value)}\n`);
export const info = (io: ActionIo, message: string) => io.stdout(`${message}\n`);
export const error = (io: ActionIo, message: string) => io.stdout(`::error::${escapeData(message)}\n`);

/** NAME<<delimiter\nvalue\ndelimiter: the multi-line safe format of GITHUB_ENV and GITHUB_OUTPUT. */
export function fileCommand(name: string, value: string): string {
  let delim: string;
  do delim = `ghadelimiter_${randomBytes(16).toString("hex")}`;
  while (value.includes(delim) || name.includes(delim));
  return `${name}<<${delim}\n${value}\n${delim}\n`;
}

function appendTo(io: ActionIo, file: "GITHUB_ENV" | "GITHUB_OUTPUT", name: string, value: string) {
  const path = io.env[file];
  if (!path) throw new Error(`${file} is not set: this must run as a GitHub Actions step`);
  appendFileSync(path, fileCommand(name, value), { encoding: "utf8" });
}

export const exportVariable = (io: ActionIo, name: string, value: string) => appendTo(io, "GITHUB_ENV", name, value);
export const setOutput = (io: ActionIo, name: string, value: string) => appendTo(io, "GITHUB_OUTPUT", name, value);
