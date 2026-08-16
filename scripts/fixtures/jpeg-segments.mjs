/**
 * Minimal JPEG marker-segment utilities used by scripts/build-fixtures.mjs
 * to construct fixtures/'s twins and same-badge-different-crimes pairs.
 *
 * Deliberately hand-rolled and narrow (not a general JPEG parser): it only
 * needs to (1) find the APP11 (0xFFEB) marker segments that carry a C2PA
 * JUMBF manifest — always located between SOI and SOS in a baseline JPEG
 * per the JPEG marker-ordering rules — and (2) treat them as an ordered,
 * opaque byte-for-byte unit that can be removed or spliced back in
 * unmodified. It does not parse JUMBF box internals; the C2PA manifest
 * itself is never decoded, edited, or re-derived here — only ever moved or
 * deleted as raw bytes, so nothing it touches can silently corrupt a valid
 * signature into a different valid signature.
 */

const SOI = 0xffd8;
const EOI = 0xffd9;
const SOS = 0xffda;
const APP11 = 0xffeb;

/**
 * Walks marker segments from just after SOI up to (not including) SOS,
 * returning `{ marker, start, end }` for every segment found, where
 * `start`/`end` bound the FULL segment (the 0xFFxx marker bytes through
 * the end of its payload) as offsets into `buf`.
 */
function walkMarkerSegments(buf) {
  if (buf.readUInt16BE(0) !== SOI) {
    throw new Error("Not a JPEG (missing SOI marker at byte 0)");
  }
  const segments = [];
  let offset = 2;
  while (offset < buf.length - 1) {
    const marker = buf.readUInt16BE(offset);
    if ((marker & 0xff00) !== 0xff00) {
      throw new Error(`Expected a marker at byte ${offset}, found 0x${marker.toString(16)}`);
    }
    if (marker === SOS || marker === EOI) {
      return { segments, scanStart: offset };
    }
    // Markers with no payload: RST0-RST7 (0xFFD0-0xFFD7), TEM (0xFF01) —
    // none are expected before SOS in a well-formed single-scan JPEG, but
    // handled for robustness rather than silently misreading length bytes.
    if (marker >= 0xffd0 && marker <= 0xffd7) {
      segments.push({ marker, start: offset, end: offset + 2 });
      offset += 2;
      continue;
    }
    const length = buf.readUInt16BE(offset + 2);
    const end = offset + 2 + length;
    segments.push({ marker, start: offset, end });
    offset = end;
  }
  throw new Error("Reached end of file before finding SOS/EOI — not a well-formed JPEG");
}

/** Returns the ordered list of raw APP11 segment buffers (marker+length+payload), verbatim. */
export function extractApp11Segments(buf) {
  const { segments } = walkMarkerSegments(buf);
  return segments.filter((s) => s.marker === APP11).map((s) => buf.subarray(s.start, s.end));
}

/** Returns a new buffer with every APP11 segment removed, all other bytes untouched. */
export function stripApp11Segments(buf) {
  const { segments } = walkMarkerSegments(buf);
  const keep = [buf.subarray(0, 2)]; // SOI
  let cursor = 2;
  for (const s of segments) {
    if (s.marker === APP11) {
      keep.push(buf.subarray(cursor, s.start));
      cursor = s.end;
    }
  }
  keep.push(buf.subarray(cursor)); // remainder: any trailing pre-SOS segments + SOS + scan + EOI
  return Buffer.concat(keep);
}

/**
 * Returns a new buffer with `app11Segments` (as returned by
 * extractApp11Segments) spliced in immediately after SOI, in their
 * original relative order, ahead of every marker already in `buf`. Used to
 * reconstruct fixtures/README.md's "innocent re-encode" case: a signed
 * file's original C2PA segment(s), carried over byte-for-byte onto pixel
 * data an ordinary (non-C2PA-aware) re-encode produced.
 */
export function injectApp11After(buf, app11Segments) {
  if (buf.readUInt16BE(0) !== SOI) {
    throw new Error("Not a JPEG (missing SOI marker at byte 0)");
  }
  return Buffer.concat([buf.subarray(0, 2), ...app11Segments, buf.subarray(2)]);
}

/**
 * Flips a single bit deep inside the entropy-coded scan data (well after
 * SOS), simulating a genuine post-signing content edit. Returns a new
 * buffer; the original is untouched.
 */
export function flipByteInScanData(buf, bytesFromEnd = 64) {
  const { scanStart } = walkMarkerSegments(buf);
  const target = buf.length - bytesFromEnd;
  if (target <= scanStart) {
    throw new Error(
      `flipByteInScanData: target offset ${target} falls before scan data starts at ${scanStart} — file too small for bytesFromEnd=${bytesFromEnd}`,
    );
  }
  const out = Buffer.from(buf);
  out[target] ^= 0xff;
  return out;
}

export function hasApp11(buf) {
  const { segments } = walkMarkerSegments(buf);
  return segments.some((s) => s.marker === APP11);
}
