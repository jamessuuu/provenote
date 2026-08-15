const INK = "#1A1712";
const AMBER = "#B45309";

function polarPoint(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [Number((cx + r * Math.cos(rad)).toFixed(3)), Number((cy + r * Math.sin(rad)).toFixed(3))];
}

function openRingPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const [x1, y1] = polarPoint(cx, cy, r, startDeg);
  const [x2, y2] = polarPoint(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const largeArc = (((sweep % 360) + 360) % 360) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

const ARC_START = -132;
const ARC_END = 108;

/**
 * The provenote mark, reproduced from scripts/brand.mjs's geometry: two
 * closed ink links and a third, amber, that stays open. Rendered inline
 * (not <img>) so header/footer never spend a request on it.
 */
export function BrandGlyph({ size = 32 }: { size?: number }) {
  const ringPath = openRingPath(82, 50, 15, ARC_START, ARC_END);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="provenote"
      focusable="false"
    >
      <ellipse cx={32} cy={50} rx={20} ry={13} fill="none" stroke={INK} strokeWidth={9} />
      <ellipse cx={56} cy={50} rx={20} ry={13} fill="none" stroke={INK} strokeWidth={9} />
      <path d={ringPath} fill="none" stroke={AMBER} strokeWidth={9} strokeLinecap="round" />
    </svg>
  );
}
