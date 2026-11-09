#!/usr/bin/env node
// Copies package.json "version" into .claude-plugin/plugin.json (run by `npm run version`).
// With --check, exits 1 instead of writing when they differ.
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const pluginPath = ".claude-plugin/plugin.json";
const plugin = JSON.parse(fs.readFileSync(pluginPath, "utf8"));

if (plugin.version === pkg.version) {
  console.log(`plugin.json already at ${pkg.version}`);
} else if (process.argv.includes("--check")) {
  console.error(`plugin.json ${plugin.version} ≠ package.json ${pkg.version}`);
  process.exit(1);
} else {
  plugin.version = pkg.version;
  fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2) + "\n");
  console.log(`plugin.json → ${pkg.version}`);
}
