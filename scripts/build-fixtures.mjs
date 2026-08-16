#!/usr/bin/env node
/**
 * Builds fixtures/'s Gallery of Limits artifacts (docs/SPEC.md M2) from
 * fixtures/scenes/*.svg (original constructed scenes) and
 * fixtures/manifests/*.json (manifest templates, cert paths resolved at
 * build time from the locally-fetched c2patool sample dir — see
 * fetch-c2patool.mjs). Every construction step is asserted against
 * c2patool's OWN validation report before the file is accepted — this
 * script fails loudly rather than committing a fixture that doesn't
 * actually land in the state its name claims. See fixtures/README.md for
 * the full provenance record this script writes.
 *
 * Not part of `pnpm run ci` / CI — only `fixtures:verify` (checking
 * already-committed bytes) runs there. This script is a local dev tool;
 * re-running it changes fixture bytes (c2patool stamps a fresh signing
 * time each run) and must be followed by reviewing + re-committing the
 * output, never run unattended in a gate.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { C2PATOOL_VERSION, ensureC2patool } from "./fetch-c2patool.mjs";
import {
  extractApp11Segments,
  flipByteInScanData,
  injectApp11After,
  stripApp11Segments,
} from "./fixtures/jpeg-segments.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const FIXTURES_DIR = path.join(REPO_ROOT, "fixtures");
const SCENES_DIR = path.join(FIXTURES_DIR, "scenes");
const MANIFESTS_DIR = path.join(FIXTURES_DIR, "manifests");
const WORK_DIR = path.join(FIXTURES_DIR, ".work");
const SAMPLE_CERT_DIR = path.join(REPO_ROOT, "tools", "c2patool", "c2patool", "sample");

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

async function renderScene(svgName, jpegQuality = 90) {
  const svg = readFileSync(path.join(SCENES_DIR, svgName));
  return sharp(svg).jpeg({ quality: jpegQuality, chromaSubsampling: "4:4:4" }).toBuffer();
}

/** Signs `inputPath` per `manifestName` (cert paths resolved to the local sample dir), returns the parsed report c2patool prints on a successful sign. */
function sign(c2patoolBin, inputPath, manifestName, outputPath) {
  const manifest = JSON.parse(readFileSync(path.join(MANIFESTS_DIR, manifestName), "utf8"));
  manifest.private_key = path.join(SAMPLE_CERT_DIR, "es256_private.key");
  manifest.sign_cert = path.join(SAMPLE_CERT_DIR, "es256_certs.pem");
  manifest.alg = "es256";
  const resolvedManifestPath = path.join(WORK_DIR, `${path.basename(manifestName, ".json")}.resolved.json`);
  writeFileSync(resolvedManifestPath, JSON.stringify(manifest, null, 2));
  const raw = execFileSync(c2patoolBin, [inputPath, "-m", resolvedManifestPath, "-f", "-o", outputPath], {
    encoding: "utf8",
  });
  return JSON.parse(raw);
}

/** Reads back a file's C2PA report via c2patool. Distinguishes a genuine "no claim" file from any other failure. */
function readReport(c2patoolBin, filePath) {
  try {
    const raw = execFileSync(c2patoolBin, [filePath], { encoding: "utf8" });
    return { report: JSON.parse(raw) };
  } catch (err) {
    const stderr = String(err.stderr ?? "");
    if (stderr.includes("No claim found")) {
      return { noClaim: true, stderr };
    }
    throw new Error(`build-fixtures: c2patool failed reading ${filePath}: ${stderr || err.message}`);
  }
}

function assertValidationState(label, result, expectedState) {
  const actual = result.report?.validation_state;
  if (actual !== expectedState) {
    throw new Error(
      `build-fixtures: ${label} expected validation_state "${expectedState}", got "${actual}"\n${JSON.stringify(result, null, 2)}`,
    );
  }
  console.log(`  ✓ ${label}: validation_state=${actual}`);
}

function assertNoClaim(label, result) {
  if (!result.noClaim) {
    throw new Error(`build-fixtures: ${label} expected "No claim found", got:\n${JSON.stringify(result, null, 2)}`);
  }
  console.log(`  ✓ ${label}: no claim found`);
}

async function main() {
  rmSync(WORK_DIR, { recursive: true, force: true });
  mkdirSync(WORK_DIR, { recursive: true });

  const c2patoolBin = await ensureC2patool();
  console.log(`Using c2patool ${C2PATOOL_VERSION} at ${c2patoolBin}\n`);

  const hashes = {};
  const provenance = [];
  const record = (name, buf, note) => {
    writeFileSync(path.join(FIXTURES_DIR, name), buf);
    const hash = sha256(buf);
    hashes[name] = hash;
    provenance.push({ file: name, sha256: hash, bytes: buf.length, note });
  };

  // ---------------------------------------------------------------------
  // Fixture 1 — chain-absent vs chain-stripped twins
  // ---------------------------------------------------------------------
  console.log("Fixture 1 — twins (chain-absent vs chain-stripped)");

  const f1Base = await renderScene("twins-scene.svg");
  record("f1-never-signed.jpg", f1Base, "Rendered from fixtures/scenes/twins-scene.svg; never touched c2patool.");

  const f1BasePath = path.join(WORK_DIR, "f1-base.jpg");
  writeFileSync(f1BasePath, f1Base);
  const f1SignedPath = path.join(WORK_DIR, "f1-signed.jpg");
  const f1SignReport = sign(c2patoolBin, f1BasePath, "twins.manifest.json", f1SignedPath);
  assertValidationState("f1-signed.jpg (post-sign)", { report: f1SignReport }, "Valid");
  const f1SignedBuf = readFileSync(f1SignedPath);
  record(
    "f1-signed.jpg",
    f1SignedBuf,
    "f1-never-signed.jpg signed with fixtures/manifests/twins.manifest.json via c2patool's test cert.",
  );

  const f1Stripped = stripApp11Segments(f1SignedBuf);
  if (Buffer.compare(f1Stripped, f1Base) !== 0) {
    throw new Error(
      "build-fixtures: f1-stripped.jpg is not byte-identical to f1-never-signed.jpg after APP11 removal — stripping left residue.",
    );
  }
  const f1StrippedPath = path.join(WORK_DIR, "f1-stripped.jpg");
  writeFileSync(f1StrippedPath, f1Stripped);
  assertNoClaim("f1-stripped.jpg", readReport(c2patoolBin, f1StrippedPath));
  record(
    "f1-stripped.jpg",
    f1Stripped,
    "f1-signed.jpg with every APP11/JUMBF segment removed — byte-identical to f1-never-signed.jpg (verified above).",
  );

  // ---------------------------------------------------------------------
  // Fixture 2 — valid signature, fabricated scene
  // ---------------------------------------------------------------------
  console.log("\nFixture 2 — valid signature, fabricated scene");

  const f2Base = await renderScene("fabricated-scene.svg");
  const f2BasePath = path.join(WORK_DIR, "f2-base.jpg");
  writeFileSync(f2BasePath, f2Base);
  const f2SignedPath = path.join(WORK_DIR, "f2-signed.jpg");
  const f2SignReport = sign(c2patoolBin, f2BasePath, "fabricated.manifest.json", f2SignedPath);
  assertValidationState("f2-fabricated-signed.jpg", { report: f2SignReport }, "Valid");
  record(
    "f2-fabricated-signed.jpg",
    readFileSync(f2SignedPath),
    "Obviously-constructed scene (fixtures/scenes/fabricated-scene.svg) signed with a manifest asserting c2pa.created/digitalCapture — the deliberate provenance lie the fixture demonstrates. Signed with c2patool's test cert (labeled as such everywhere it's shown; never a real trusted issuer).",
  );

  // ---------------------------------------------------------------------
  // Fixture 3 — same badge, different crimes
  // ---------------------------------------------------------------------
  console.log("\nFixture 3 — same badge, different crimes");

  const f3Base = await renderScene("crimes-scene.svg");
  const f3BasePath = path.join(WORK_DIR, "f3-base.jpg");
  writeFileSync(f3BasePath, f3Base);
  const f3SignedPath = path.join(WORK_DIR, "f3-signed.jpg");
  const f3SignReport = sign(c2patoolBin, f3BasePath, "crimes.manifest.json", f3SignedPath);
  assertValidationState("f3-base-signed.jpg", { report: f3SignReport }, "Valid");
  const f3SignedBuf = readFileSync(f3SignedPath);
  record(
    "f3-base-signed.jpg",
    f3SignedBuf,
    "Common valid-signed base both f3-innocent-reencode.jpg and f3-tampered.jpg are derived from, so the ‘same badge’ comparison is exact.",
  );

  const f3Segments = extractApp11Segments(f3SignedBuf);
  const f3ReencodedPixels = await sharp(f3SignedBuf).jpeg({ quality: 85 }).toBuffer();
  const f3Drift = injectApp11After(f3ReencodedPixels, f3Segments);
  const f3DriftPath = path.join(WORK_DIR, "f3-drift.jpg");
  writeFileSync(f3DriftPath, f3Drift);
  assertValidationState("f3-innocent-reencode.jpg", readReport(c2patoolBin, f3DriftPath), "Invalid");
  record(
    "f3-innocent-reencode.jpg",
    f3Drift,
    "f3-base-signed.jpg's pixels re-encoded by an ordinary, non-C2PA-aware JPEG re-save (sharp, quality 85 — simulating any editor/CDN/pipeline step that isn't C2PA-aware) with the ORIGINAL, byte-for-byte-unmodified C2PA segment carried over verbatim — no malicious edit, just an innocent re-save touching bytes the signature covers. See docs/DEVIATIONS.md for why this stands in for SPEC.md's literal ‘schema/version-drifted’ phrasing.",
  );

  const f3Tampered = flipByteInScanData(f3SignedBuf, 64);
  const f3TamperedPath = path.join(WORK_DIR, "f3-tampered.jpg");
  writeFileSync(f3TamperedPath, f3Tampered);
  assertValidationState("f3-tampered.jpg", readReport(c2patoolBin, f3TamperedPath), "Invalid");
  record(
    "f3-tampered.jpg",
    f3Tampered,
    "f3-base-signed.jpg with a single byte deliberately flipped inside the entropy-coded scan data post-signing — genuine content tampering.",
  );

  writeFileSync(path.join(FIXTURES_DIR, "hashes.json"), `${JSON.stringify(hashes, null, 2)}\n`);
  writeFileSync(
    path.join(WORK_DIR, "last-build-provenance.json"),
    JSON.stringify({ builtAt: new Date().toISOString(), c2patoolVersion: C2PATOOL_VERSION, files: provenance }, null, 2),
  );

  console.log(`\nWrote ${Object.keys(hashes).length} fixture files + fixtures/hashes.json`);
  console.log("Per-file provenance notes: fixtures/.work/last-build-provenance.json (read before updating fixtures/README.md, then discard — .work/ is scratch).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
