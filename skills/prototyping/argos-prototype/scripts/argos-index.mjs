#!/usr/bin/env node
// argos-index — navigate Argos spec exports (schema_version: mind.export.md.v1)
// without loading hundreds of KB into context.
//
// Usage:
//   node argos-index.mjs <dir|file...>                 overview: files + index of prototype-relevant blocks
//   node argos-index.mjs <dir|file...> --all           overview including api/nfr/architecture/compliance/security
//   node argos-index.mjs <dir|file...> --type screen   index filtered by type (comma-separated)
//   node argos-index.mjs <dir|file...> --show UI-002   full block(s), JSON fields expanded (comma-separated IDs)
//   node argos-index.mjs <dir|file...> --section 8     raw top-level section (§N)
//   node argos-index.mjs <dir|file...> --graph UC-011  relationship edges touching an ID (needs a "full" export)
//   node argos-index.mjs <dir|file...> --json          machine-readable index
//
// Zero dependencies. Node >= 18.

import fs from "node:fs";
import path from "node:path";

const SCHEMA = "mind.export.md.v1";
const SCOPE_ORDER = ["contexto", "funcional", "tecnico", "full"];

function parseArgs(argv) {
  const opts = { inputs: [], type: null, show: null, section: null, graph: null, json: false, all: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--type") opts.type = argv[++i]?.split(",").map((s) => s.trim().toLowerCase());
    else if (a === "--show") opts.show = argv[++i]?.split(",").map((s) => s.trim().toUpperCase());
    else if (a === "--section") opts.section = String(argv[++i] ?? "").replace("§", "");
    else if (a === "--graph") opts.graph = argv[++i]?.trim().toUpperCase();
    else if (a === "--json") opts.json = true;
    else if (a === "--all") opts.all = true;
    else if (a === "-h" || a === "--help") opts.help = true;
    else opts.inputs.push(a);
  }
  return opts;
}

function collectFiles(inputs) {
  const files = [];
  for (const input of inputs) {
    const p = path.resolve(input);
    if (!fs.existsSync(p)) throw new Error(`Not found: ${input}`);
    if (fs.statSync(p).isDirectory()) {
      for (const f of fs.readdirSync(p)) if (f.toLowerCase().endsWith(".md")) files.push(path.join(p, f));
    } else files.push(p);
  }
  return files;
}

function parseFrontmatter(lines) {
  const fm = {};
  if (lines[0]?.trim() !== "---") return { fm, end: 0 };
  let i = 1;
  let parent = null;
  for (; i < lines.length && lines[i].trim() !== "---"; i++) {
    const m = lines[i].match(/^(\s*)([\w-]+):\s*(.*)$/);
    if (!m) continue;
    const [, indent, key, value] = m;
    if (indent.length === 0) {
      if (value === "") { fm[key] = {}; parent = key; } else { fm[key] = value; parent = null; }
    } else if (parent) fm[parent][key] = value;
  }
  return { fm, end: i + 1 };
}

function loadExport(file) {
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const { fm } = parseFrontmatter(lines);
  if (fm.schema_version !== SCHEMA) return null;

  const sections = {}; // "1" -> { title, start, end }
  const blocks = [];
  let currentSection = null;
  let current = null;

  const closeBlock = (endLine) => { if (current) { current.end = endLine; blocks.push(current); current = null; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const sec = line.match(/^## §(\d+)\s+(.*)$/);
    if (sec) {
      closeBlock(i);
      if (currentSection) sections[currentSection].end = i;
      currentSection = sec[1];
      sections[currentSection] = { title: sec[2].trim(), start: i, end: lines.length };
      continue;
    }
    const h3 = line.match(/^### (.+)$/);
    if (h3) {
      closeBlock(i);
      current = { title: h3[1].trim(), section: currentSection, start: i, file, scope: fm.scope };
      continue;
    }
    if (current) {
      const meta = line.match(/^- \*\*(Tipo|Estado|ID|Descripción):\*\*\s*(.*)$/);
      if (meta) {
        const key = { Tipo: "type", Estado: "status", ID: "id", "Descripción": "description" }[meta[1]];
        current[key] = meta[2].trim();
      }
    }
  }
  closeBlock(lines.length);

  for (const b of blocks) {
    const body = lines.slice(b.start, b.end).join("\n");
    const json = body.match(/```json\n([\s\S]*?)\n```/);
    b.fields = {};
    if (json) {
      try {
        const obj = JSON.parse(json[1]);
        for (const [k, v] of Object.entries(obj)) {
          b.fields[k] = v && typeof v === "object" && "value" in v ? { value: v.value, coverage: v.coverage } : { value: v };
        }
      } catch { b.jsonError = true; }
    }
  }

  return { file, fm, lines, sections, blocks: blocks.filter((b) => b.id) };
}

function truncate(s, n) {
  if (!s) return "";
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > n ? one.slice(0, n - 1) + "…" : one;
}

function rel(file) { return path.relative(process.cwd(), file) || file; }

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || opts.inputs.length === 0) {
    console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 12).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
    process.exit(opts.help ? 0 : 1);
  }

  const exports = collectFiles(opts.inputs).map(loadExport).filter(Boolean);
  if (exports.length === 0) {
    console.error(`No Argos exports found (looking for frontmatter schema_version: ${SCHEMA}).`);
    process.exit(2);
  }
  exports.sort((a, b) => SCOPE_ORDER.indexOf(a.fm.scope) - SCOPE_ORDER.indexOf(b.fm.scope));

  // Dedupe blocks by ID: scoped exports win over "full".
  const byId = new Map();
  for (const ex of exports) for (const b of ex.blocks) if (!byId.has(b.id)) byId.set(b.id, b);
  const blocks = [...byId.values()];
  const primary = exports[0];

  if (opts.section) {
    const ex = exports.find((e) => e.sections[opts.section]);
    if (!ex) { console.error(`Section §${opts.section} not found.`); process.exit(2); }
    const s = ex.sections[opts.section];
    console.log(`<!-- ${rel(ex.file)}:${s.start + 1} -->`);
    console.log(ex.lines.slice(s.start, s.end).join("\n").trim());
    return;
  }

  if (opts.show) {
    for (const id of opts.show) {
      const b = byId.get(id);
      if (!b) { console.log(`## ${id}\n\n_Not found._\n`); continue; }
      console.log(`## ${b.id} — ${b.title}`);
      console.log(`_${b.type} · ${b.status} · ${rel(b.file)}:${b.start + 1}_\n`);
      if (b.description) console.log(`${b.description}\n`);
      for (const [k, f] of Object.entries(b.fields)) {
        console.log(`### ${k}${f.coverage ? ` (coverage: ${f.coverage})` : ""}\n`);
        console.log(typeof f.value === "string" ? f.value : JSON.stringify(f.value, null, 2));
        console.log("");
      }
      if (b.jsonError) console.log(`_JSON payload could not be parsed; read the file at the line above._\n`);
    }
    return;
  }

  if (opts.graph) {
    const ex = exports.find((e) => Object.values(e.sections).some((s) => /grafo|graph/i.test(s.title)));
    if (!ex) { console.error("No relationship graph section found (it ships in the 'full' export)."); process.exit(2); }
    const s = Object.values(ex.sections).find((x) => /grafo|graph/i.test(x.title));
    const edges = ex.lines.slice(s.start, s.end).filter((l) => l.includes(`\`${opts.graph}\``));
    console.log(edges.length ? edges.join("\n") : `No edges for ${opts.graph}.`);
    return;
  }

  const PROTOTYPE_TYPES = ["screen", "use_case", "requirement", "rule", "data"];
  const wanted = opts.type ?? (opts.all || opts.json ? null : PROTOTYPE_TYPES);
  const filtered = wanted ? blocks.filter((b) => wanted.includes((b.type || "").toLowerCase())) : blocks;

  if (opts.json) {
    console.log(JSON.stringify({
      project: { name: primary.fm.name, slug: primary.fm.slug, exported_at: primary.fm.exported_at },
      files: exports.map((e) => ({ file: rel(e.file), scope: e.fm.scope, sections: Object.fromEntries(Object.entries(e.sections).map(([k, v]) => [k, v.title])) })),
      blocks: filtered.map((b) => ({ id: b.id, type: b.type, status: b.status, title: b.title, description: b.description, fields: Object.fromEntries(Object.entries(b.fields).map(([k, f]) => [k, f.coverage ?? null])), at: `${rel(b.file)}:${b.start + 1}` })),
    }, null, 2));
    return;
  }

  // Overview
  console.log(`# ${primary.fm.name ?? "Argos project"} (${primary.fm.slug ?? "?"})\n`);
  console.log("## Files\n");
  for (const e of exports) {
    const secs = Object.entries(e.sections).map(([k, v]) => `§${k} ${v.title}`).join(" · ");
    console.log(`- \`${rel(e.file)}\` — scope **${e.fm.scope}**, ${e.lines.length} lines — ${secs}`);
  }
  const counts = {};
  for (const b of blocks) counts[b.type] = (counts[b.type] || 0) + 1;
  console.log("\n## Block counts\n");
  console.log(Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}: ${n}`).join(" · "));

  if (!opts.type && !opts.all) console.log("\n_Index below lists prototype-relevant types only; pass --all or --type <t> for the rest._");
  const typeOrder = ["screen", "use_case", "requirement", "rule", "data", "api", "nfr", "architecture", "compliance", "security"];
  const types = [...new Set(filtered.map((b) => b.type))].sort((a, b) => {
    const ia = typeOrder.indexOf(a), ib = typeOrder.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  for (const t of types) {
    const group = filtered.filter((b) => b.type === t);
    console.log(`\n## ${t} (${group.length})\n`);
    console.log("| ID | Título | Estado | Descripción |");
    console.log("|---|---|---|---|");
    for (const b of group) console.log(`| ${b.id} | ${truncate(b.title, 70)} | ${b.status ?? ""} | ${truncate(b.description, 120).replace(/\|/g, "\\|")} |`);
  }
}

try { main(); } catch (e) { console.error(e.message); process.exit(1); }
