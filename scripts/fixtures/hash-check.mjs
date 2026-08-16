/**
 * Shared by scripts/verify-fixtures.mjs (the CLI/CI entry point) and
 * fixtures/test/integrity.test.ts (the vitest entry point docs/SPEC.md's
 * Verification plan asks for under "Unit: ... fixture hash integrity") so
 * the actual comparison logic exists exactly once.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * @param {string} fixturesDir absolute path to fixtures/
 * @param {string} hashesPath absolute path to fixtures/hashes.json
 * @returns {{ file: string, ok: boolean, expected?: string, actual?: string, reason?: "missing" }[]}
 */
export function checkFixtureHashes(fixturesDir, hashesPath) {
  const expected = JSON.parse(readFileSync(hashesPath, "utf8"));
  const results = [];
  for (const [relPath, expectedHash] of Object.entries(expected)) {
    const filePath = path.join(fixturesDir, relPath);
    if (!existsSync(filePath)) {
      results.push({ file: relPath, ok: false, reason: "missing" });
      continue;
    }
    const actual = createHash("sha256").update(readFileSync(filePath)).digest("hex");
    results.push({ file: relPath, ok: actual === expectedHash, expected: expectedHash, actual });
  }
  return results;
}
