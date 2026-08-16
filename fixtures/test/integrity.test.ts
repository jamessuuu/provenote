import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkFixtureHashes } from "../../scripts/fixtures/hash-check.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "..");
const HASHES_PATH = path.join(FIXTURES_DIR, "hashes.json");

/**
 * docs/SPEC.md's Verification plan: "Unit: ... fixture hash integrity."
 * Same check scripts/verify-fixtures.mjs runs standalone (and `pnpm run
 * ci` wires as its own gate) — this copy exists so it also counts toward
 * `pnpm run unit`'s reported test count, per the SPEC bullet grouping it
 * under "Unit:". Both call the one shared checkFixtureHashes().
 */
describe("fixtures hash integrity", () => {
  it("every committed fixture file's SHA-256 matches fixtures/hashes.json", () => {
    const results = checkFixtureHashes(FIXTURES_DIR, HASHES_PATH);
    expect(results.length).toBeGreaterThan(0);
    const bad = results.filter((r) => !r.ok);
    expect(bad).toEqual([]);
  });

  it("fixture 1's stripped twin is byte-identical to the never-signed original — the fixture's whole claim", () => {
    const results = checkFixtureHashes(FIXTURES_DIR, HASHES_PATH);
    const neverSigned = results.find((r) => r.file === "f1-never-signed.jpg");
    const stripped = results.find((r) => r.file === "f1-stripped.jpg");
    expect(neverSigned?.actual).toBeDefined();
    expect(stripped?.actual).toBe(neverSigned?.actual);
  });
});
