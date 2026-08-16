# Deviations from SPEC.md

Running log of every place the implementation departs from SPEC.md's literal
text, and why. Per the build brief: "repo truth wins over any doc" — this
file is the record of *why* the repo made the call it did, so a future
reader isn't left guessing. Entries are appended milestone by milestone, not
written in one pass — see git log for exactly which commit introduced each
one.

## M2 — Fixture 3's "innocent" row is not literally schema/version-drifted

docs/SPEC.md's Fixtures pipeline section describes F3(a) as "a benign
schema/version-drifted file" — modeled on the real GitHub issue #316/#336
`c2pa.actions` → `c2pa.actions.v2` assertion rename that broke
verify.contentauthenticity.org for ordinary tooling-age reasons, no
tampering involved (see showcase-program/research/batch2-c2pa-verify.md
§2.1).

Reproducing that *exact* signer-vs-parser schema disagreement
deterministically inside `scripts/build-fixtures.mjs` was not achievable
with c2patool 0.27.15 alone: passing `c2pa.actions` (the old label,
copied verbatim from c2patool's own `sample/test.json`) at signing time
does not survive — c2patool silently normalizes it to `c2pa.actions.v2`
in the embedded manifest before signing, confirmed empirically (not
assumed) while building this fixture. Forcing an actual cross-version
disagreement would require signing with one pinned `c2pa-rs` version and
validating with a different one — not something this repo controls or
can pin without vendoring a second, older toolchain, which was judged
disproportionate for what the fixture needs to demonstrate.

**Substitution:** `f3-innocent-reencode.jpg` is instead built by taking
the valid-signed base (`f3-base-signed.jpg`), re-encoding its *pixels*
through an ordinary, non-C2PA-aware JPEG re-save (`sharp`, quality 85 —
standing in for any editor/CDN/pipeline step that has no idea what C2PA
is), then splicing the base file's *original, byte-for-byte-unmodified*
C2PA segment back in verbatim. This is a different mechanism than a
schema-label rename, but it is equally real (this is precisely what
happens to any C2PA-signed image the moment a non-aware tool touches it),
equally non-malicious, and reliably reproducible — and it lands on the
exact claim SPEC.md assigns to this fixture: verified empirically (not
asserted) to produce the identical `validation_state: Invalid` /
`assertion.dataHash.mismatch` result as `f3-tampered.jpg`'s deliberate
byte-flip, from c2patool's own validator. See fixtures/README.md's
Fixture 3 section for the full construction record and the exact status
codes observed.

This deviation does not touch D2 (fixture 2's death condition) — fixture
2 built and validated on the first attempt; see fixtures/README.md.

## M3 — packages/core's internal imports dropped their `.js` extensions

`chain-summary.ts`, `copy.ts`, and `index.ts` originally wrote their
internal relative imports the NodeNext/strict-ESM way
(`from "./copy.js"`, resolving to `copy.ts`) — valid and typechecked
cleanly under `moduleResolution: "Bundler"` the whole time. M1 and M2
never actually bundled this code for the browser (M1 only ever
`import type`s from `@provenote/core`, which is erased at compile time).
The first time M3's Inspector imported real values
(`summarizeChain`, `SIGNER_LINE`, `HEADLINES`, …), Next 16.3.1's
Turbopack failed to resolve those same `.js`-suffixed imports when
bundling `@provenote/core` for the client — a real, reproduced build
failure (`Module not found: Can't resolve './copy.js'`), not a
hypothetical. Switched every internal import to extensionless
(`from "./copy"`) — valid under the same `moduleResolution: "Bundler"`
setting, and Turbopack resolves it correctly (confirmed: clean build
after the change). Not spec-facing — SPEC.md never mandated an import
style — but recorded here since it reverses a specific choice M1 made
deliberately.

## M5 — /docs/limitations cites the arXiv paper by its named headings, not numbered sections

SPEC.md's M5 line asks for "citations with section refs." arXiv:2604.24890
has no numbered sections at all — confirmed in
`showcase-program/research/batch2-c2pa-verify.md`'s own methodology note:
"No numbered sections (no '§3.2' style references exist in the source) —
headings are named only." `/docs/limitations` therefore cites this paper
by its own named headings ("Executive Summary", "Key Findings §1", etc.,
matching how the research doc itself cites it) rather than manufacturing
numbered references the source doesn't have. C2PA spec/Explainer
citations link to the specific dated version (2.4) of the page quoted;
where a quote sits in unstructured running prose rather than a named
subsection (true of the Explainer quote used), the page says so
explicitly instead of inventing a section number for it.

## Post-publication — CI-only 320px overflow (Linux monospace metrics), fixed at the root

The first real GitHub Actions run of `ci.yml` (run 31952473880, ubuntu-latest)
failed only `e2e/gallery.spec.ts:159` "320px — no horizontal scroll", with
`Error: homepage overflows by 1px at 320px`. The full suite was green
locally on Windows both before and after — this was a Linux-runner-only
layout fragility, not a flaky test, and per BATCH-2-STANDARDS.md #2 it was
root-caused and fixed rather than env-gated or skipped.

**Root cause, established locally (not on a hunch):** a Playwright sweep of
every element's distance from the 320px viewport edge on the homepage
(`node` script driving the built static export, not committed — scratch
only) showed the page's normal margin from the edge is a uniform 24px
(`--space-3`, the `.shell` padding) everywhere *except* two unbreakable,
monospace-set brand strings sitting far closer to the edge than everything
else on the page:

1. `.site-header__nav` (the "Gallery of Limits" / "Limitations" links) —
   only 20.14px of slack at 320px, the tightest element on the page. The
   header row (`.site-header__row`) was `display: flex` with default
   `flex-wrap: nowrap`; flex items don't shrink below their own min-content
   width by default, so once the two nav links plus the brand mark's
   combined min-content width got close enough to the container width, any
   platform where the nav text renders even marginally wider tips it into
   overflow.
2. The homepage `<h1>provenote</h1>` — set in the mono type scale's largest
   step (`--step-5`, ~48.8px) as a single unbreakable word, 35px of slack
   at 320px on this machine. Single long words in a block heading have no
   shrink mechanism at all (nothing to wrap on) — they simply overflow
   their own box once the rendered word is wider than the available
   content width, and that overflow propagates to `document.documentElement.scrollWidth`
   exactly like the reported `Error: homepage overflows by 1px`.

Both are set in `var(--font-mono)`
(`ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace`).
None of the named faces before the generic `monospace` keyword are normally
present on a bare `ubuntu-latest` GitHub Actions image (no Apple/Windows
fonts, no bundled JetBrains Mono) — Ubuntu's fontconfig default aliases the
generic `monospace` family to DejaVu Sans Mono, whose glyphs are
measurably wider per character than Windows' Consolas (what this repo's
local dev/verification machine resolves to). That per-character width
delta, multiplied across "provenote" / "Gallery of Limits" / "Limitations"
at the sizes used here, plausibly accounts for exactly the ~1px the CI
runner reported, while a Windows machine with ~20-35px of slack in the
same two spots never notices. This mechanism was confirmed by simulation
(injecting a large `letter-spacing` stress on the same elements at 320px
reproduces the same class of overflow locally), not merely inferred from
the log — the actual Ubuntu font substitution could not be reproduced
bit-for-bit on this Windows dev machine, but the *mechanism* (both
elements sit on razor-thin, platform-font-dependent margins with zero
shrink/wrap fallback, unlike every other element on the page) is
demonstrated, not guessed.

**Fix, at the root (not env-gated, not skipped):**

- `.site-header__row` and `.site-header__nav` (`apps/web/src/app/globals.css`)
  gained `flex-wrap: wrap` (plus a small `row-gap`/`gap` for the wrapped
  state). The header's content comfortably fits within the 320px shell on
  its own two lines regardless of font metrics — this removes the
  font-dependency at that spot entirely rather than merely re-balancing a
  thin margin that could tip again under a different substitution.
- `h1, h2, h3, h4` (`apps/web/src/app/globals.css`) gained
  `overflow-wrap: break-word`. This is a no-op on every render where the
  heading already fits (every render observed so far); it only engages as
  a structural last resort exactly when a single unbreakable word would
  otherwise push `scrollWidth` past `clientWidth` — which is precisely
  what the 320px test checks, so this makes that specific failure mode
  structurally impossible rather than merely unlikely on any given
  platform's font substitution.
- `e2e/gallery.spec.ts`'s 320px test gained a `describeOverflow()` helper
  that, only when an overflow assertion is about to fail, walks every
  element and reports the worst offender(s) by tag/class/text/right-edge
  in the assertion message. This is kept permanently (not scaffolding) so
  a future runner-only overflow regression names its culprit directly in
  the CI log instead of requiring another local repro-by-simulation pass
  like this one.

Verified: `pnpm run ci` green locally (13/13 e2e) after the fix, and — the
actual done condition per the build brief — GitHub Actions run on
`main` after pushing went green. See commit history for the exact commits
and the Actions run ID.
