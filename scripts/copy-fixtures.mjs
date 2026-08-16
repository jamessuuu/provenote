#!/usr/bin/env node
/**
 * Copies the Gallery of Limits' JPEG fixtures from fixtures/ (source of
 * truth — see fixtures/README.md for full provenance) into
 * apps/web/public/fixtures/ so the static export can serve them
 * same-origin. Only the built JPEGs the Gallery actually loads — never
 * the manifests/scenes/hashes.json/README, which stay build-time-only.
 *
 * This is a build artifact, not source: apps/web/public/fixtures/ is
 * gitignored (same discipline as apps/web/public/c2pa/'s copied WASM).
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(REPO_ROOT, "fixtures");
const DEST_DIR = path.join(REPO_ROOT, "apps", "web", "public", "fixtures");

export const GALLERY_FIXTURES = [
  "f1-never-signed.jpg",
  "f1-signed.jpg",
  "f1-stripped.jpg",
  "f2-fabricated-signed.jpg",
  "f3-base-signed.jpg",
  "f3-innocent-reencode.jpg",
  "f3-tampered.jpg",
];

function main() {
  mkdirSync(DEST_DIR, { recursive: true });
  for (const name of GALLERY_FIXTURES) {
    const src = path.join(SRC_DIR, name);
    if (!existsSync(src)) {
      console.error(`copy-fixtures: missing ${src} — run \`pnpm run fixtures:build\` first.`);
      process.exit(1);
    }
    copyFileSync(src, path.join(DEST_DIR, name));
  }
  console.log(`copy-fixtures: ${GALLERY_FIXTURES.length} fixture(s) -> apps/web/public/fixtures/`);
}

main();
