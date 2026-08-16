#!/usr/bin/env node
/**
 * Ensures the pinned c2patool release binary is present at
 * tools/c2patool/c2patool/ — downloading and extracting it from the
 * official contentauth/c2pa-rs GitHub release if missing or the wrong
 * version. tools/c2patool/ is gitignored (see .gitignore's comment on that
 * line) specifically so this script can stand in for "vendor the binary
 * into git": the exact pinned version below plus this script IS the
 * reproducibility story, and the exact version actually used is also
 * recorded in fixtures/README.md by scripts/build-fixtures.mjs.
 *
 * Only used for local fixture (re)building — never invoked by `pnpm run
 * ci` / CI, which only runs `fixtures:verify` against already-committed
 * fixture files and never needs c2patool itself.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const C2PATOOL_VERSION = "0.27.15";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const TOOL_DIR = path.join(REPO_ROOT, "tools", "c2patool");
const EXTRACT_DIR = path.join(TOOL_DIR, "c2patool");

function platformTarget() {
  if (process.platform === "win32") return { target: "x86_64-pc-windows-msvc", ext: "zip", bin: "c2patool.exe" };
  if (process.platform === "darwin") return { target: "universal-apple-darwin", ext: "zip", bin: "c2patool" };
  if (process.platform === "linux") return { target: "x86_64-unknown-linux-gnu", ext: "tar.gz", bin: "c2patool" };
  throw new Error(`fetch-c2patool: unsupported platform ${process.platform}`);
}

function binaryPath() {
  return path.join(EXTRACT_DIR, platformTarget().bin);
}

function installedVersion() {
  const bin = binaryPath();
  if (!existsSync(bin)) return null;
  try {
    const out = execFileSync(bin, ["--version"], { encoding: "utf8" }).trim();
    // Output looks like "c2patool 0.27.15".
    return out.split(/\s+/).pop() ?? null;
  } catch {
    return null;
  }
}

export async function ensureC2patool({ log = console.log } = {}) {
  const current = installedVersion();
  if (current === C2PATOOL_VERSION) {
    log(`c2patool ${C2PATOOL_VERSION} already present at ${binaryPath()}`);
    return binaryPath();
  }
  if (current) {
    log(`c2patool ${current} present but pinned version is ${C2PATOOL_VERSION} — re-downloading`);
  } else {
    log(`c2patool not found — downloading ${C2PATOOL_VERSION}`);
  }

  const { target, ext } = platformTarget();
  const assetName = `c2patool-v${C2PATOOL_VERSION}-${target}.${ext}`;
  const url = `https://github.com/contentauth/c2pa-rs/releases/download/c2patool-v${C2PATOOL_VERSION}/${assetName}`;

  mkdirSync(TOOL_DIR, { recursive: true });
  const archivePath = path.join(TOOL_DIR, assetName);

  log(`downloading ${url}`);
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`fetch-c2patool: download failed (${res.status} ${res.statusText}) for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const { writeFileSync } = await import("node:fs");
  writeFileSync(archivePath, buf);

  rmSync(EXTRACT_DIR, { recursive: true, force: true });
  mkdirSync(EXTRACT_DIR, { recursive: true });
  // `tar` reads both .zip (via bsdtar, bundled with Windows 10+/macOS) and
  // .tar.gz (GNU tar and bsdtar both) — avoids a separate unzip dependency.
  execFileSync("tar", ["-xf", archivePath, "-C", EXTRACT_DIR], { stdio: "inherit" });

  const version = installedVersion();
  if (version !== C2PATOOL_VERSION) {
    throw new Error(
      `fetch-c2patool: extracted binary reports version "${version}", expected "${C2PATOOL_VERSION}" — archive layout may have changed`,
    );
  }
  log(`c2patool ${C2PATOOL_VERSION} installed at ${binaryPath()}`);
  return binaryPath();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await ensureC2patool();
}
