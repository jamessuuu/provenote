# fixtures/ — provenance record

Every file in this directory is either an original constructed work (an SVG
scene under `scenes/`, rendered to JPEG) or a derivative of one, produced
deterministically by [`scripts/build-fixtures.mjs`](../scripts/build-fixtures.mjs).
No third-party media is used anywhere in this pipeline. This file records
**how each committed fixture was made**, per docs/SPEC.md's "Fixtures
pipeline" requirement — read it alongside `hashes.json` (the committed
SHA-256 for every fixture, checked by `pnpm run fixtures:verify` /
`fixtures/test/integrity.test.ts`) and `.work/last-build-provenance.json`
(regenerated, gitignored, per-run notes — this file is the durable summary
of it).

## Toolchain

- **c2patool 0.27.15** (official binary, `contentauth/c2pa-rs` release
  tag `c2patool-v0.27.15`), fetched on demand by
  [`scripts/fetch-c2patool.mjs`](../scripts/fetch-c2patool.mjs) into the
  gitignored `tools/c2patool/` — never vendored into git, always the exact
  pinned version.
- **`@contentauth/c2pa-web` 0.7.x** (the SAME `c2pa-rs`-derived engine,
  compiled to WASM) is what actually reads these files client-side in the
  app — see `apps/web/src/lib/c2pa-client.ts`. c2patool's own read/validate
  report is used here only as a build-time sanity check that each fixture
  lands in the state its filename claims; the semantic proof that the real
  Inspector renders the right state per fixture is the e2e suite (M4), not
  this script.
- **Signing certificate**: c2patool's bundled sample TEST certificate
  (`tools/c2patool/c2patool/sample/es256_certs.pem` /
  `es256_private.key`), issuer `C2PA Test Signing Cert`, common name
  `C2PA Signer`, algorithm ES256. This is **not** a trusted issuer by
  design — every fixture that validates still carries a
  `signingCredential.untrusted` status line, which is the honest, correct
  behavior (see `apps/web/src/lib/c2pa-client.ts`'s comment on why
  provenote ships this unadorned rather than special-casing its own trust
  config). No fixture claims a signature from a real, trusted C2PA
  conformance-program issuer, anywhere.
- No timestamp authority (`ta_url`) is configured for any signing step —
  a deliberate simplification (skips a live network call this build script
  would otherwise depend on) — so signing time comes from the local
  system clock claim only, not an RFC3161-countersigned time. This has no
  bearing on any fixture's claim; none of them depend on trusted-timestamp
  semantics.

## Rebuilding

```
pnpm run fixtures:build
```

Regenerates every file below from `scenes/*.svg` + `manifests/*.json`,
re-signing with a fresh local timestamp each run (so **rebuilding changes
fixture bytes and their hashes** — commit the new `hashes.json` alongside
the new fixture files, don't run this unattended in CI). The script
self-checks every fixture's `validation_state` against what its name
claims via c2patool's own report and fails loudly (non-zero exit) if any
step doesn't land in the expected state.

```
pnpm run fixtures:verify
```

The CI-safe half: recomputes SHA-256 for every fixture already committed
here and compares against `hashes.json`. Touches neither c2patool nor the
network — this is what `pnpm run ci` / GitHub Actions actually runs.

## Fixture 1 — chain-absent vs. chain-stripped twins

Demonstrates CAI's own admitted limitation as a hands-on artifact: a file
that never had provenance and a file whose valid provenance was
deliberately deleted produce **the identical verification result** — in
this case, literally identical bytes.

| File | validation_state | Note |
|---|---|---|
| `f1-never-signed.jpg` | *(no C2PA data at all)* | Rendered from `scenes/twins-scene.svg`; never touched c2patool. |
| `f1-signed.jpg` | `Valid` | `f1-never-signed.jpg` signed with `manifests/twins.manifest.json`. |
| `f1-stripped.jpg` | *(no C2PA data — "No claim found")* | `f1-signed.jpg` with every APP11/JUMBF marker segment removed via `scripts/fixtures/jpeg-segments.mjs`'s `stripApp11Segments`. |

**Verified claim, not asserted:** `f1-stripped.jpg` is **byte-for-byte
identical** to `f1-never-signed.jpg` (same SHA-256 in `hashes.json`) —
checked in `scripts/build-fixtures.mjs` at build time (the build fails if
this ever stops being true) and again in
`fixtures/test/integrity.test.ts`. This is the strongest possible form of
"a missing chain is not evidence of anything, including whether one ever
existed": these two files are not merely similar, they are the same file.

## Fixture 2 — valid signature, fabricated scene

Demonstrates the paper's central thesis turned into something you can
watch fail: a cryptographically valid "Valid" chain around content that
depicts something that never happened.

| File | validation_state | Note |
|---|---|---|
| `f2-fabricated-signed.jpg` | `Valid` | An obviously-constructed, non-photorealistic scene (`scenes/fabricated-scene.svg` — a vector-art whale over a mountain skyline) signed with a manifest asserting `c2pa.created` / `digitalSourceType: digitalCapture` — the deliberate lie this fixture demonstrates. |

The manifest's `digitalCapture` claim is intentionally false — that's the
whole point (docs/SPEC.md F2: "a green 'Valid' badge is possible around
content that depicts something that never happened"). Every surface this
renders on says so explicitly and labels the signing cert as a test
artifact, never implying a real capture device or a trusted issuer signed
it.

D2 was not triggered: this fixture built and validated on the first
attempt.

## Fixture 3 — same badge, different crimes

Demonstrates the incumbent-UX finding from `showcase-program/research/
batch2-c2pa-verify.md` §2.1 as a reproducible artifact: an ordinary,
non-malicious cause and genuine post-signing tampering both collapse to
the exact same failure code in the underlying validator.

| File | validation_state | validation_status (beyond `signingCredential.untrusted`, present on all three) | Note |
|---|---|---|---|
| `f3-base-signed.jpg` | `Valid` | — | Common valid-signed base both rows below derive from, so the comparison is exact. |
| `f3-innocent-reencode.jpg` | `Invalid` | `assertion.dataHash.mismatch` | `f3-base-signed.jpg`'s **pixels** re-encoded by an ordinary, non-C2PA-aware JPEG re-save (quality 85 via `sharp` — standing in for any editor/CDN/pipeline step that isn't C2PA-aware), with the **original, byte-for-byte-unmodified** C2PA segment spliced back in verbatim (`injectApp11After`). No edit was made with intent to deceive; the C2PA data itself was never touched — only the pixels the signature covers changed. |
| `f3-tampered.jpg` | `Invalid` | `assertion.dataHash.mismatch` | `f3-base-signed.jpg` with a single byte flipped inside the entropy-coded scan data, post-signing (`flipByteInScanData`) — genuine, deliberate content tampering. |

**The claim this proves, empirically, not just by citation:** both rows
land on `validation_state: Invalid` with the identical
`assertion.dataHash.mismatch` status code, from c2patool's own validator
(the same `c2pa-rs` engine `@contentauth/c2pa-web` wraps for the browser).
Nothing in that output distinguishes "someone innocently re-saved this
file" from "someone deliberately altered what it depicts" — which is
exactly the incumbent-UX failure this fixture reproduces.

**Deviation from docs/SPEC.md's literal wording** for the "innocent" row:
see `docs/DEVIATIONS.md` — SPEC.md describes this row as
"schema/version-drifted" (mirroring GitHub issue #316's `c2pa.actions` →
`c2pa.actions.v2` rename); reproducing that *exact* signer-vs-parser
schema disagreement deterministically was not achievable with c2patool
0.27.15 alone (it silently upgrades any `c2pa.actions` label to
`c2pa.actions.v2` at signing time — confirmed empirically while building
this fixture, not assumed), so an equally real, equally non-malicious,
reliably reproducible cause (an ordinary re-encode by a tool that doesn't
understand C2PA) was substituted. The claim the fixture supports is
unchanged.

## Source files

- `scenes/*.svg` — original constructed scenes (own work; geometric
  shapes only, no external assets, no fonts — fully deterministic
  rendering via `sharp`).
- `manifests/*.json` — manifest definition templates. `sign_cert` /
  `private_key` / `alg` are injected at build time from the locally
  fetched c2patool sample cert (never committed with a hardcoded absolute
  path, since `tools/c2patool/` itself is gitignored and machine-local).
