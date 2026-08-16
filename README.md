# provenote

<img src="apps/web/public/brand/glyph-on-paper.svg" alt="" width="72" height="72" align="left" style="margin-right: 16px" />

A C2PA honesty test. Drop an image; see its full provenance chain and
exactly what that chain cannot prove. Nothing leaves your device — check
the Network tab.

<br clear="left" />

Not a verifier — provenote parses the same signed provenance chains the
Coalition for Content Provenance and Authenticity's own tooling does,
using the official client-side `@contentauth/c2pa-web` library, and
states — in plain language, next to every claim — what a valid chain
proves and what it structurally cannot. The **Gallery of Limits** loads
three fixtures built specifically to demonstrate this: a valid signature
on an obviously fabricated scene, a stripped manifest that's byte-for-byte
identical to a file that was never signed, and an innocent post-signing
re-encode that collapses to the exact same failure code as deliberate
tampering. Full write-up: [`docs/DRAFT-WRITEUP.md`](docs/DRAFT-WRITEUP.md).

provenote does not detect AI-generated images, and never will. It
explains chains; it never judges content.

## Real numbers

Every number below is copied from an actual run's output, not estimated.
Reproduce any of them with the command shown.

| | |
|---|---|
| Unit tests | 9 passed, 2 test files — `pnpm run unit` |
| e2e tests | 13 passed (Chromium) — `pnpm run e2e:full`; 6 of the 13 are the `@smoke` fast subset, `pnpm run e2e:smoke` |
| Gallery fixtures | 7, all hash-verified — `pnpm run fixtures:verify` |
| c2patool version used to build every fixture | 0.27.15 (`contentauth/c2pa-rs` release `c2patool-v0.27.15`) |
| C2PA reader used at runtime | `@contentauth/c2pa-web` 0.7.1 |
| Full pipeline | `pnpm run ci` (typecheck, lint, unit, fixtures:verify, build, e2e:full) |

Fixture-by-fixture provenance — exact construction steps, the signing
certificate used, and the SHA-256 of every committed file — is in
[`fixtures/README.md`](fixtures/README.md), not repeated here.

## Pages

- `/` — the Inspector: drop or choose any image, see its chain.
- `/gallery/` — the Gallery of Limits, wired to the same Inspector.
- `/docs/limitations/` — every claim above, cited: the arXiv paper, the
  C2PA spec/Explainer, the CAI FAQ, and two live vendor bug reports.

## Local development

```
pnpm install
pnpm run ci
```

`pnpm run fixtures:build` rebuilds the Gallery's fixtures from
`fixtures/scenes/*.svg` via c2patool (fetched on demand, never vendored —
see `scripts/fetch-c2patool.mjs`). Rebuilding changes fixture bytes (a
fresh signing timestamp each run) — review and re-commit
`fixtures/hashes.json` alongside the new files.

## Status

M0–M5 of `docs/SPEC.md`'s milestone plan are built and locally verified.
Not yet deployed — this repo has never been pushed; a later publication
pass pushes it, verifies the CI workflow actually runs green on GitHub
Actions itself (per `BATCH-2-STANDARDS.md` #2 — local green is not CI
green), and checks the deployed artifact directly.

Full spec: [`docs/SPEC.md`](docs/SPEC.md). Build log of every departure
from it, with reasoning: [`docs/DEVIATIONS.md`](docs/DEVIATIONS.md).
