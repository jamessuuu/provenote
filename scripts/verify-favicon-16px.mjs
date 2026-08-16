#!/usr/bin/env node
/**
 * BATCH-2-STANDARDS.md's Brand bar: "favicon VERIFIED BY RASTERIZING AT
 * 16px AND LOOKING." Rasterizes apps/web/public/brand/favicon.svg at
 * 16x16 and 32x32 (the two sizes browsers actually render a favicon at)
 * to scratch PNGs so a human/agent can open and look at them — this
 * script cannot judge legibility itself, only produce the honest artifact
 * to look at. Referenced from scripts/brand.mjs since M0; written for M5.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const SRC = path.join(REPO_ROOT, "apps", "web", "public", "brand", "favicon.svg");
const OUT_DIR = path.join(REPO_ROOT, "scripts", ".favicon-check");

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const size of [16, 32]) {
    const out = path.join(OUT_DIR, `favicon-${size}px.png`);
    await sharp(SRC, { density: 384 }).resize(size, size).png().toFile(out);
    console.log(`verify-favicon-16px: wrote ${path.relative(REPO_ROOT, out)} (${size}x${size})`);
  }
  console.log("verify-favicon-16px: now open scripts/.favicon-check/favicon-16px.png and look at it.");
}

main();
