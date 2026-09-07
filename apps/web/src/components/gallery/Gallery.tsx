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
 *
 * The cards show the fixtures themselves. The page's central claim about
 * fixture 1 is that two of those pictures are indistinguishable; a row of
 * three text buttons made that claim impossible to see.
 */
export function Gallery() {
  const inspector = useInspector();
  const busy = inspector.state.status === "loading";

  return (
    <div className="shell page-gallery">
      <p className="eyebrow">gallery of limits</p>
      <h1>Three things a valid chain cannot tell you.</h1>
      <p className="page-hero__tagline">
        Each fixture loads into the same Inspector a real upload uses — identical code path,
        identical copy. Click one and read what comes back.
      </p>
      <div className="claims">
        <span className="claim claim--live">every file committed and hash-checked in CI</span>
        <span className="claim">
          <a
            href="https://github.com/jamessuuu/provenote/blob/main/fixtures/README.md"
            target="_blank"
            rel="noreferrer"
            style={{ color: "inherit" }}
          >
            construction record &rarr;
          </a>
        </span>
      </div>

      <section className="gallery-group" aria-labelledby="f1-heading">
        <h2 id="f1-heading">1 &mdash; The indistinguishable twins</h2>
        <p>
          A file that never had provenance and a file whose valid provenance was deleted moments
          ago produce the identical verification result.
        </p>
        <div className="fixture-row">
          <FixtureButton
            label="Signed"
            note="a valid chain is present"
            fileName="f1-signed.jpg"
            url="/fixtures/f1-signed.jpg"
            alt="A flat illustration of four coloured blocks on a table against a pale sky"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
          <FixtureButton
            label="Never signed"
            note="no chain was ever added"
            fileName="f1-never-signed.jpg"
            url="/fixtures/f1-never-signed.jpg"
            alt="The same illustration of four coloured blocks on a table, with no provenance data"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
          <FixtureButton
            label="Stripped"
            note="a valid chain was removed"
            fileName="f1-stripped.jpg"
            url="/fixtures/f1-stripped.jpg"
            alt="The same illustration of four coloured blocks on a table, with its provenance chain removed"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
        </div>
        <p className="gallery-group__note">
          &ldquo;Never signed&rdquo; and &ldquo;Stripped&rdquo; are byte-for-byte identical — the
          same SHA-256, checked automatically in CI. Not files that merely look similar.
        </p>
      </section>

      <section className="gallery-group" aria-labelledby="f2-heading">
        <h2 id="f2-heading">2 &mdash; Valid signature, fabricated scene</h2>
        <p>
          An obviously impossible scene, signed with a manifest asserting it was captured by a real
          device. The signature validates cleanly.
        </p>
        <div className="fixture-row">
          <FixtureButton
            label="Fabricated scene, validly signed"
            note="signed with c2patool's test certificate — never a trusted issuer"
            fileName="f2-fabricated-signed.jpg"
            url="/fixtures/f2-fabricated-signed.jpg"
            alt="A flat illustration of an airship floating over stylised mountains at dusk — an obviously constructed scene"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
        </div>
      </section>

      <section className="gallery-group" aria-labelledby="f3-heading">
        <h2 id="f3-heading">3 &mdash; Same badge, different crimes</h2>
        <p>
          One file was re-encoded by an ordinary, non-C2PA-aware tool after signing. The other had a
          single byte deliberately altered. Both land on the identical failure code, and nothing
          here can tell you which is which.
        </p>
        <div className="fixture-row">
          <FixtureButton
            label="Innocent re-encode"
            note="an ordinary tool rewrote the file"
            fileName="f3-innocent-reencode.jpg"
            url="/fixtures/f3-innocent-reencode.jpg"
            alt="A flat illustration of a stylised badge scene, re-encoded by a tool unaware of C2PA"
            onLoad={inspector.inspectUrl}
            disabled={busy}
          />
          <FixtureButton
            label="Deliberate tamper"
            note="one byte flipped after signing"
            fileName="f3-tampered.jpg"
            url="/fixtures/f3-tampered.jpg"
            alt="The same stylised badge scene, with a single byte altered after signing"
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
