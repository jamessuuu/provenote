# SPEC — provenote (C2PA honesty test)

2026-08-16. Batch-2 slot D (strategist 46/70, keep-reshaped). Binds to
BATCH-2-STANDARDS.md. Wedge re-verified 2026-08-16 (research/
batch2-c2pa-verify.md): incumbents do NOT foreground limits — CAI's verify
site shows a generic error toast for zero-credential files, Digimarc's
extension has NO UI state for absence, and the "may have been tampered
with" copy fires on benign version drift (vendor bug reports #316/#336 as
receipts). The wedge is honesty UX, not verification tech.

## Positioning

NOT a verifier — a C2PA honesty test. Drop an image (nothing uploads —
verifiable in your own Network tab): see the full provenance chain in plain
language, then the Gallery of Limits — three adversarially-built
demonstrations of what a valid chain does NOT and CANNOT prove. Prior art
credited by name (official c2pa JS libraries do the parsing; arXiv
2604.24890 and CAI's own docs supply the limits we demonstrate). We
contribute fixtures, plain language, and the refusal to overclaim.

## Death conditions

- D1: the official c2pa web/JS library cannot run fully client-side in the
  browser — STOP; zero-upload IS the product.
- D2: fixture 2 (valid-signature, fabricated scene) unbuildable with
  c2patool's documented test-cert signing after 2 real attempts — degrade
  the gallery to fixtures 1+3 and record it in DEVIATIONS.md; do not fake a
  signed artifact.
- D3: any surface that claims or implies AI-detection. The landing page
  states the refusal explicitly.

## Surfaces

1. **Inspector** — drop/choose an image → parse client-side (official c2pa
   JS lib) → chain rendered legibly: signer, time, assertions, ingredient
   tree, each with a paired "proves / does not prove" line in plain
   language. Three explicit top-level states, each with its own honest copy:
   - CHAIN PRESENT, VALIDATES: "these bytes were signed by X at T — this
     says nothing about whether the depicted scene is real."
   - CHAIN PRESENT, FAILS VALIDATION: shown with the honest ambiguity —
     where the library cannot distinguish benign version drift from
     tampering, SAY SO (this is the incumbents' documented failure).
   - NO CHAIN: "absent or stripped — indistinguishable by design; here's
     why" (links to fixture 1).
2. **Gallery of Limits** — three committed fixture demonstrations, each
   loadable into the same inspector, side-by-side where paired:
   - F1 twins: signed photo / same photo with manifest stripped (JUMBF
     segment removal) / never-signed original — stripped and never-signed
     render identically.
   - F2 valid-signature-fabricated-scene: an obviously synthetic image WE
     construct deterministically (SVG-rendered absurd scene → JPEG; no AI
     generation — keeps our own provenance clean), signed with c2patool's
     test-cert path → chain VALIDATES. "Valid certifies bytes-at-signing,
     never the event depicted."
   - F3 same-badge-different-crimes: a benign schema/version-drifted file
     vs a genuinely pixel-tampered file — both collapsing to the same
     failure state in standard tooling.
3. **/docs/limitations** — what this tool cannot know, incl. its own
   dependence on the official parser's correctness; citations (paper,
   spec sections, the vendor bug reports).

## Fixtures pipeline (the craft core)

`fixtures/` holds the artifacts + `scripts/build-fixtures.*` that rebuilds
them (c2patool CLI — install from official release; record exact version),
a provenance README (how each was made, hashes), and integrity tests
asserting committed hashes. Fixture images are original works (constructed
scenes / own photos), never third-party media.

## Verification plan

- Unit: chain-summary transformer (raw lib output → plain-language model)
  against recorded lib outputs for all three states; fixture hash integrity.
- e2e (Playwright): each fixture loads → expected state + copy renders;
  keyboard-only walkthrough; **zero-upload proof**: network interception
  asserting no request carries image bytes anywhere (same-origin asset GETs
  only — chaff precedent), running in CI.
- CI green ON ACTIONS post-publication.

## Milestones

M0 scaffold (static site, TS strict, vitest+Playwright, CI, brand).
M1 c2pa lib integration + summary model + unit tests (recorded outputs).
M2 fixtures pipeline: c2patool scripts, committed artifacts F1+F3 (+F2 or
D2 recorded), integrity tests.
M3 Inspector UI: three states, plain-language pairing, a11y complete.
M4 Gallery of Limits wired to fixtures + zero-upload e2e + 320px proof.
M5 limitations page (citations with section refs), README (real numbers:
fixture hashes, test counts), docs/DRAFT-WRITEUP.md (finding-first: "we put
a valid signature on a fabricated scene — that's C2PA working as designed,
and that's the problem the badge-readers aren't telling you"),
DEVIATIONS.md, OG/favicon (16px proof).

## Claims ceiling

We demonstrate documented, citable limits with our own fixtures. We do not
claim novel vulnerabilities, do not name incumbent products as "broken"
(we cite their own public bug trackers where relevant), and do not assess
any third-party image's authenticity — the tool explains chains; it never
judges content.
