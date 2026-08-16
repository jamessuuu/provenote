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
