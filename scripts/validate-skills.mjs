#!/usr/bin/env node
// Validates every skill in skills/ against the Agent Skills spec and this repo's conventions:
//  - SKILL.md frontmatter has `name` (kebab-case, <=64, equals folder name) and `description` (<=1024)
//  - every skill is listed in .claude-plugin/plugin.json and every listed path exists
//  - plugin.json version matches package.json version
//  - relative Markdown links inside each skill resolve
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const errors = [];
const err = (msg) => errors.push(msg);

function findSkills(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findSkills(p));
    else if (entry.name === "SKILL.md") out.push(path.dirname(p));
  }
  return out;
}

function frontmatter(text) {
  const m = text.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    const raw = kv[2];
    // An unquoted YAML scalar containing ": " or " #" is parsed as a mapping/comment by strict loaders.
    if (!/^["'>|]/.test(raw) && /: | #/.test(raw)) fm.__yamlError = `${kv[1]} contains ": " or " #" and must be quoted`;
    fm[kv[1]] = raw.replace(/^["']|["']$/g, "");
  }
  return fm;
}

function mdFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...mdFiles(p));
    else if (entry.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const skillDirs = findSkills(path.join(root, "skills"));
if (skillDirs.length === 0) err("No skills found under skills/.");

for (const dir of skillDirs) {
  const rel = path.relative(root, dir).replace(/\\/g, "/");
  const fm = frontmatter(fs.readFileSync(path.join(dir, "SKILL.md"), "utf8"));
  if (!fm) { err(`${rel}/SKILL.md: missing YAML frontmatter`); continue; }
  if (fm.__yamlError) err(`${rel}/SKILL.md: frontmatter ${fm.__yamlError}`);
  const folder = path.basename(dir);
  if (!fm.name) err(`${rel}: frontmatter.name is required`);
  else {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) err(`${rel}: name "${fm.name}" must be lowercase kebab-case`);
    if (fm.name.length > 64) err(`${rel}: name exceeds 64 chars`);
    if (fm.name !== folder) err(`${rel}: name "${fm.name}" must equal folder name "${folder}"`);
  }
  if (!fm.description) err(`${rel}: frontmatter.description is required`);
  else if (fm.description.length > 1024) err(`${rel}: description is ${fm.description.length} chars (max 1024)`);

  for (const file of mdFiles(dir)) {
    const text = fs.readFileSync(file, "utf8");
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const clean = target.split("#")[0];
      if (!fs.existsSync(path.resolve(path.dirname(file), clean))) {
        err(`${path.relative(root, file).replace(/\\/g, "/")}: broken link → ${target}`);
      }
    }
  }
}

const plugin = JSON.parse(fs.readFileSync(path.join(root, ".claude-plugin/plugin.json"), "utf8"));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (plugin.version !== pkg.version) err(`plugin.json version ${plugin.version} ≠ package.json version ${pkg.version}`);
const listed = new Set((plugin.skills ?? []).map((s) => s.replace(/^\.\//, "")));
for (const s of listed) if (!fs.existsSync(path.join(root, s, "SKILL.md"))) err(`plugin.json lists missing skill: ${s}`);
for (const dir of skillDirs) {
  const rel = path.relative(root, dir).replace(/\\/g, "/");
  if (!listed.has(rel)) err(`${rel} is not listed in .claude-plugin/plugin.json "skills"`);
}

if (errors.length) {
  console.error(`✖ ${errors.length} problem(s):\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✔ ${skillDirs.length} skill(s) valid`);
