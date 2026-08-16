#!/usr/bin/env node
/**
 * Integrity gate: recomputes SHA-256 for every committed fixture in
 * fixtures/ and compares it against fixtures/hashes.json. Never invokes
 * c2patool or touches the network — this is the check `pnpm run ci` (and
 * CI on GitHub Actions) runs, so it only ever depends on already-committed
 * bytes. To actually rebuild fixtures, use `pnpm run fixtures:build`
 * instead (requires c2patool, fetched on demand — see fetch-c2patool.mjs).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkFixtureHashes } from "./fixtures/hash-check.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const FIXTURES_DIR = path.join(REPO_ROOT, "fixtures");
const HASHES_PATH = path.join(FIXTURES_DIR, "hashes.json");

const results = checkFixtureHashes(FIXTURES_DIR, HASHES_PATH);
let failed = false;
for (const r of results) {
  if (r.ok) {
    console.log(`OK       ${r.file}`);
  } else if (r.reason === "missing") {
    failed = true;
    console.error(`MISSING  ${r.file}`);
  } else {
    failed = true;
    console.error(`MISMATCH ${r.file}\n  expected ${r.expected}\n  actual   ${r.actual}`);
  }
}

if (results.length === 0) {
  console.error("fixtures:verify FAILED — fixtures/hashes.json listed zero fixtures.");
  process.exit(1);
}

if (failed) {
  console.error(`\nfixtures:verify FAILED — ${results.filter((r) => !r.ok).length}/${results.length} fixture(s) do not match fixtures/hashes.json.`);
  process.exit(1);
}

console.log(`\nfixtures:verify OK — ${results.length} fixture(s) match their committed hash.`);
