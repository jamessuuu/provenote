"use client";

import { FixtureButton } from "@/components/inspector/FixtureButton";
import { Inspector } from "@/components/inspector/Inspector";
import { useInspector } from "@/components/inspector/useInspector";

/**
 * docs/SPEC.md's Gallery of Limits: three committed fixture
 * demonstrations, each loadable into the SAME Inspector a real upload
 * uses (`inspector.inspectUrl` runs through the identical `runInspection`
 * path `inspect` does — see useInspector.ts). Full construction record,
 * exact hashes, and every observed validation_state per file:
 * fixtures/README.md in the repo (linked below).
 */
export function Gallery() {
  const inspector = useInspector();
  const busy = inspector.state.status === "loading";

  return (
    <div className="shell page-gallery">
      <h1>Gallery of Limits</h1>
      <p className="page-hero__tagline">
        Three adversarially-built demonstrations of what a valid C2PA chain does not and cannot
        prove. Every fixture below loads into the same Inspector a real upload would use — the
        identical code path, the identical honest copy.
      </p>
      <p>
        Full provenance for every file here — exact construction steps, c2patool version, signing
        certificate, and the SHA-256 of every fixture —{" "}
        <a href="https://github.com/jamessuuu/provenote/blob/main/fixtures/README.md" target="_blank" rel="noreferrer">
          lives in fixtures/README.md
        </a>
        , not just asserted on this page.
      </p>

      <section className="gallery-group" aria-labelledby="f1-heading">
        <h2 id="f1-heading">Fixture 1 — the indistinguishable twins</h2>
        <p>
          A file that never had provenance and a file whose valid provenance was deliberately
          deleted moments ago produce the identical verification result. Load each below and
          compare.
        </p>
        <div className="fixture-row">
          <FixtureButton
            label="Signed"
            fileName="f1-signed.jpg"
            url="/fixtures/f1-signed.jpg"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
          <FixtureButton
            label="Never signed"
            fileName="f1-never-signed.jpg"
            url="/fixtures/f1-never-signed.jpg"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
          <FixtureButton
            label="Stripped (manifest removed)"
            fileName="f1-stripped.jpg"
            url="/fixtures/f1-stripped.jpg"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
        </div>
        <p className="gallery-group__note">
          &ldquo;Never signed&rdquo; and &ldquo;Stripped&rdquo; are byte-for-byte identical files —
          the same SHA-256, checked automatically in CI — not merely files that happen to look
          similar.
        </p>
      </section>

      <section className="gallery-group" aria-labelledby="f2-heading">
        <h2 id="f2-heading">Fixture 2 — valid signature, fabricated scene</h2>
        <p>
          An obviously-constructed, impossible scene, signed with a manifest that asserts it was
          captured by a real device. The signature validates cleanly. Signed with c2patool&rsquo;s
          test certificate — never a real, trusted issuer.
        </p>
        <div className="fixture-row">
          <FixtureButton
            label="Fabricated scene, validly signed"
            fileName="f2-fabricated-signed.jpg"
            url="/fixtures/f2-fabricated-signed.jpg"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
        </div>
      </section>

      <section className="gallery-group" aria-labelledby="f3-heading">
        <h2 id="f3-heading">Fixture 3 — same badge, different crimes</h2>
        <p>
          One file was re-encoded by an ordinary, non-C2PA-aware tool after signing — no malicious
          intent. The other had a single byte deliberately altered after signing. Both land on the
          identical failure code in the underlying validator; nothing here can tell you which is
          which.
        </p>
        <div className="fixture-row">
          <FixtureButton
            label="Innocent re-encode"
            fileName="f3-innocent-reencode.jpg"
            url="/fixtures/f3-innocent-reencode.jpg"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
          <FixtureButton
            label="Deliberate tamper"
            fileName="f3-tampered.jpg"
            url="/fixtures/f3-tampered.jpg"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
        </div>
      </section>

      <div className="gallery-inspector">
        <h2 className="gallery-inspector__heading">Inspector</h2>
        <Inspector api={inspector} />
      </div>
    </div>
  );
}
