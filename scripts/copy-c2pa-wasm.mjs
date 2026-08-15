#!/usr/bin/env node
/**
 * Copies the official @contentauth/c2pa-web WASM binary into apps/web's
 * public/ dir, referenced by a PLAIN STRING PATH (wasmSrc: "/c2pa/...")
 * at call time — deliberately not a bundler-magic `?url` import or a
 * `new URL(..., import.meta.url)` asset reference. Both of those are
 * genuinely bundler-specific (the former is Vite-only syntax; the latter
 * is exactly the pattern that broke Next.js/Turbopack's static-export
 * build in a sibling project — see graticule/docs/DEVIATIONS.md #8). A
 * plain public/ file + string path has no bundler involvement at all.
 */
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

const pkgJson = require.resolve("@contentauth/c2pa-web/package.json", {
  paths: [path.join(root, "apps/web")],
});
const pkgDir = path.dirname(pkgJson);
const src = path.join(pkgDir, "dist/resources/c2pa_bg.wasm");
const destDir = path.join(root, "apps/web/public/c2pa");
const dest = path.join(destDir, "c2pa_bg.wasm");

if (!existsSync(src)) {
  console.error(`copy-c2pa-wasm FAIL — source not found: ${src}`);
  process.exit(1);
}
mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`copy-c2pa-wasm: ${path.relative(root, src)} -> ${path.relative(root, dest)}`);
