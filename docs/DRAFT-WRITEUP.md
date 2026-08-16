# We put a valid signature on a fabricated scene

*Draft — staged for review, not published. Word count and every number
below are measured from the actual repo, not estimated.*

We put a valid C2PA signature on an obviously fabricated scene. It
validated cleanly. That's not a bug in the Coalition for Content
Provenance and Authenticity's tooling — it's C2PA working exactly as
designed. And it's the problem none of the badge-readers we tested are
telling you.

provenote is a zero-upload C2PA honesty test: drop an image, and it
parses the same signed provenance chain the C2PA reference tooling does
— using the official `@contentauth/c2pa-web` library, entirely in your
browser, nothing sent anywhere — then states, next to every claim, what
that chain actually proves and what it structurally cannot. We built it
because two live products already tell that difference badly, and the
gap has a name in the research literature now.

## The finding

C2PA's own explainer says it plainly, buried in running prose rather
than flagged as a warning: "Provenance information alone cannot tell you
whether the digital content is true, accurate or factual." We turned
that sentence into an artifact instead of a citation. Fixture 2 in our
Gallery of Limits is a vector-art scene of a whale over a mountain
skyline — obviously constructed, not photorealistic, not AI-generated
(we build our own fixtures from scratch specifically to keep our
provenance clean). We signed it with `c2patool` (the official C2PA
signing CLI, version 0.27.15) using a manifest that asserts
`c2pa.created` with `digitalSourceType: digitalCapture` — a claim that
this image came from a real camera. It didn't. The signature validates
without complaint. A named signer certified these exact bytes at a
stated time — that's all "Valid" has ever meant, and that's all it will
ever mean, no matter how confidently a badge presents it.

## What "Invalid" doesn't tell you either

We went looking for the failure side too. verify.contentauthenticity.org
— Adobe/CAI's own reference verifier — has two live, open GitHub issues
(#316, #336) where a vendor's images started failing with "This file may
have been tampered with" purely because a newer, fully legitimate
version of `c2patool` renamed an assertion label
(`c2pa.actions` → `c2pa.actions.v2`). No tampering happened. We
reproduced the underlying mechanism as our own fixture rather than just
citing it: `f3-innocent-reencode.jpg` is a validly-signed file whose
pixels were re-encoded by an ordinary tool that has never heard of C2PA
(no malicious intent, just an editor doing its job), with the *original,
byte-for-byte-unmodified* C2PA manifest carried over. `f3-tampered.jpg`
is the same base file with one byte deliberately flipped after signing —
genuine tampering. Read both through the actual validator our app uses,
and they land on the identical result: `validation_state: Invalid`,
`assertion.dataHash.mismatch`. We checked this empirically, not by
assertion — it's asserted in `fixtures/test/integrity.test.ts` and
`e2e/gallery.spec.ts`, both green in CI. Nothing in that output
distinguishes "someone innocently re-saved this" from "someone altered
what it depicts." A single scary sentence covers both.

## Absence is the same story, taken further

`f1-stripped.jpg` — a validly-signed file with its C2PA manifest
segment surgically removed — and `f1-never-signed.jpg` — a file that
never carried provenance at all — aren't just similarly indistinguishable
to a verifier. They're the same file. Same SHA-256, checked by CI on
every commit. A missing chain proves nothing about history, including
whether one ever existed, and we didn't have to argue that point; we
just had to strip the bytes and diff them.

## Why this is worth caring about

The formal analysis behind this batch of work — arXiv:2604.24890, the
first formal-methods paper on C2PA's core protocols, out of UMBC's Cyber
Defense Lab with NSA co-authorship — reaches a specific, citable
conclusion: "C2PA should not yet be relied upon for high-stakes uses
such as financial disclosures, journalism, or legal evidence." Six
separate findings back that up (forgeable timestamps, revoked
credentials that still validate, contradictory results across
conforming tools, byte-range exclusions that let regions sit outside the
signed hash, credentials that outlive their own retention windows, and a
conformance program that's self-attested). We don't reproduce all six as
fixtures — some are protocol-level findings that would need a second,
older toolchain to demonstrate honestly, and we'd rather ship three
things we built and verified than six things we half-faked. What we did
reproduce, we reproduced for real: signed files, real cryptographic
validation, real validator output, checked into version control with
recorded hashes.

## What we refused to do

provenote never assesses whether a given image's content is authentic,
real, or AI-generated, and it never will — that's a different question
than the one a C2PA chain can answer, and conflating the two is exactly
the failure mode this whole project exists to name. We don't call any
incumbent product "broken" — where we cite a real-world failure, we cite
it to that vendor's own public bug tracker, not to our own claim of
having found something. We didn't fake a signed artifact anywhere: every
fixture is either genuinely signed with `c2patool`'s test certificate
(clearly labeled as such, never implying a trusted issuer) or
deliberately, verifiably unsigned.

## Reproduce it yourself

```
git clone https://github.com/jamessuuu/provenote.git
cd provenote
pnpm install
pnpm run fixtures:verify   # recomputes SHA-256 for all 7 committed fixtures
pnpm run ci                # typecheck, lint, unit, fixtures:verify, build, full e2e
```

Or skip the clone: open the Gallery of Limits, click any fixture, open
your browser's Network tab, and watch nothing leave your machine while
the chain renders.
