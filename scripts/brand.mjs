#!/usr/bin/env node
/**
 * Deterministic brand glyph generator, house style (BRAND-KIT.md,
 * palette binding: PAPER #FAF7F2 / INK #1A1712 / AMBER #B45309 / RULE
 * #E4DDD3; 0-2px radius, no gradients, no glow, no dark chrome).
 *
 * provenote's glyph: two closed ink chain links (the provenance chain —
 * what the tool actually establishes) and a third link in AMBER, drawn
 * OPEN with a real geometric gap rather than closed. The amber ring is
 * not a broken/failed link — it is the honest edge of the chain: the
 * exact point past which no cryptographic signature reaches, no matter
 * how far the chain up to it verifies. Two links prove something; the
 * third refuses to pretend it does.
 *
 * Pure string templating, zero dependencies, zero randomness, zero
 * timestamps in the output — running this twice produces byte-identical
 * files (same discipline as graticule's and chaff's brand scripts).
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const INK = "#1A1712";
const PAPER = "#FAF7F2";
const AMBER = "#B45309";

const STROKE = 9;

// Two overlapping ink capsules (the universal "link" silhouette), then a
// third capsule-turned-ring in amber with a real gap — not stroke-dash
// styling on top of a complete shape, an actual open arc, so it is
// geometrically true that the third link never closes.
const LINK1 = { cx: 32, cy: 50, rx: 20, ry: 13 };
const LINK2 = { cx: 56, cy: 50, rx: 20, ry: 13 };
const LINK3 = { cx: 82, cy: 50, r: 15 };

// The open ring is one <path> arc from startAngle to endAngle (degrees,
// 0 = +x axis, clockwise), leaving the remaining arc as a true gap on the
// outward-facing side, away from the two closed links.
const ARC_START = -132;
const ARC_END = 108;

function polarPoint(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);
  return [Number(x.toFixed(3)), Number(y.toFixed(3))];
}

function openRingPath(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = polarPoint(cx, cy, r, startDeg);
  const [x2, y2] = polarPoint(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const largeArc = ((sweep % 360) + 360) % 360 > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

function glyphSvg({ withBackground }) {
  const bg = withBackground ? `<rect width="100" height="100" fill="${PAPER}"/>` : "";
  const ringPath = openRingPath(LINK3.cx, LINK3.cy, LINK3.r, ARC_START, ARC_END);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="provenote mark: two closed links of a chain, and a third that stays open">
  <title>provenote</title>
${bg}
  <ellipse cx="${LINK1.cx}" cy="${LINK1.cy}" rx="${LINK1.rx}" ry="${LINK1.ry}" fill="none" stroke="${INK}" stroke-width="${STROKE}"/>
  <ellipse cx="${LINK2.cx}" cy="${LINK2.cy}" rx="${LINK2.rx}" ry="${LINK2.ry}" fill="none" stroke="${INK}" stroke-width="${STROKE}"/>
  <path d="${ringPath}" fill="none" stroke="${AMBER}" stroke-width="${STROKE}" stroke-linecap="round"/>
</svg>
`;
}

function wordmarkSvg() {
  const ringPath = openRingPath(30, 32, 15, ARC_START, ARC_END);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 64" role="img" aria-label="provenote">
  <title>provenote</title>
  <g transform="translate(0,0) scale(0.72)">
    <ellipse cx="14" cy="32" rx="15" ry="10" fill="none" stroke="${INK}" stroke-width="7"/>
    <ellipse cx="30" cy="32" rx="15" ry="10" fill="none" stroke="${INK}" stroke-width="7"/>
    <path d="${ringPath}" fill="none" stroke="${AMBER}" stroke-width="7" stroke-linecap="round"/>
  </g>
  <text x="58" y="42" font-family="ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace" font-size="30" fill="${INK}" letter-spacing="-0.5">provenote</text>
</svg>
`;
}

function faviconSvg() {
  // Same geometry as the glyph — verified separately by rasterizing at
  // 16px (scripts/verify-favicon-16px.mjs) rather than hand-simplifying
  // and hoping; only redrawn as a distinct compact variant if that check
  // fails.
  return glyphSvg({ withBackground: true });
}

function writeIfChanged(targetPath, content) {
  mkdirSync(path.dirname(targetPath), { recursive: true });
  if (existsSync(targetPath)) {
    const current = readFileSync(targetPath, "utf8");
    if (current === content) {
      console.log(`brand: unchanged ${path.relative(root, targetPath)}`);
      return;
    }
  }
  writeFileSync(targetPath, content, "utf8");
  console.log(`brand: wrote ${path.relative(root, targetPath)}`);
}

const glyphNoBg = glyphSvg({ withBackground: false });
const glyphWithBg = glyphSvg({ withBackground: true });
const wordmark = wordmarkSvg();
const favicon = faviconSvg();

// Next.js App Router special file — auto-wired as the site favicon/icon.
writeIfChanged(path.join(root, "apps/web/src/app/icon.svg"), favicon);

// General-purpose brand assets referenced from the footer, README, OG image.
writeIfChanged(path.join(root, "apps/web/public/brand/glyph.svg"), glyphNoBg);
writeIfChanged(path.join(root, "apps/web/public/brand/glyph-on-paper.svg"), glyphWithBg);
writeIfChanged(path.join(root, "apps/web/public/brand/wordmark.svg"), wordmark);
writeIfChanged(path.join(root, "apps/web/public/brand/favicon.svg"), favicon);

console.log("brand: done");
