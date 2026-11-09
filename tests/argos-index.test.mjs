import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, "..", "skills", "prototyping", "argos-prototype", "scripts", "argos-index.mjs");
const fixtures = path.join(here, "fixtures");
const run = (...args) => execFileSync(process.execPath, [script, fixtures, ...args], { encoding: "utf8" });

test("overview lists project, files and prototype-relevant blocks", () => {
  const out = run();
  assert.match(out, /^# Demo - Reservas \(demo-reservas\)/);
  assert.match(out, /scope \*\*contexto\*\*/);
  assert.match(out, /scope \*\*funcional\*\*/);
  assert.match(out, /\| UI-001 \| Agenda de reservas \| confirmado \|/);
  assert.match(out, /\| UC-001 \| Confirmar reserva \| pendiente \|/);
});

test("--show expands JSON fields with coverage", () => {
  const out = run("--show", "UI-001");
  assert.match(out, /## UI-001 — Agenda de reservas/);
  assert.match(out, /### visual_states \(coverage: partial\)/);
  assert.match(out, /No hay reservas hoy/);
});

test("--section prints a raw top-level section", () => {
  assert.match(run("--section", "8"), /Política de cancelación/);
});

test("--graph returns edges touching an ID", () => {
  const out = run("--graph", "UC-001");
  assert.match(out, /`UC-001` --\[covers\]--> `FR-001`/);
  assert.match(out, /`UI-001` --\[requires\]--> `UC-001`/);
});

test("--json is parseable", () => {
  const data = JSON.parse(run("--json"));
  assert.equal(data.project.slug, "demo-reservas");
  assert.equal(data.blocks.length, 2);
});

test("exits 2 when no Argos exports are present", () => {
  const r = spawnSync(process.execPath, [script, here], { encoding: "utf8" });
  assert.equal(r.status, 2);
});
