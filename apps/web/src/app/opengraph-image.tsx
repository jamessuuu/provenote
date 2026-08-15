import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = "provenote — a C2PA honesty test";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1A1712";
const PAPER = "#FAF7F2";
const AMBER = "#B45309";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: PAPER,
          padding: "80px",
        }}
      >
        <svg width={120} height={120} viewBox="0 0 100 100" style={{ marginBottom: 32 }}>
          <ellipse cx={32} cy={50} rx={20} ry={13} fill="none" stroke={INK} strokeWidth={9} />
          <ellipse cx={56} cy={50} rx={20} ry={13} fill="none" stroke={INK} strokeWidth={9} />
          <path
            d="M 71.966 38.858 A 15 15 0 1 1 71.966 61.142"
            fill="none"
            stroke={AMBER}
            strokeWidth={9}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            fontSize: 84,
            fontFamily: "monospace",
            fontWeight: 700,
            color: INK,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          provenote
        </div>
        <div style={{ fontSize: 34, color: "#57524A", marginTop: 20, display: "flex", maxWidth: 980 }}>
          A C2PA honesty test — drop an image, see the chain, and exactly what it cannot prove.
        </div>
      </div>
    ),
    { ...size }
  );
}
