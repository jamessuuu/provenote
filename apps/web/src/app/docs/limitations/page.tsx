import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Limitations",
  description: "What provenote — and C2PA provenance itself — cannot tell you, with citations.",
};

export default function LimitationsPage() {
  return (
    <>
      <div className="shell page-hero">
        <p className="eyebrow">limitations</p>
        <h1>Every limit here is someone else&rsquo;s finding.</h1>
        <p className="page-hero__tagline">
          Documented, citable limits of C2PA provenance itself, or of this tool — never something
          provenote inferred on its own authority. Sources are linked, not paraphrased into a
          stronger claim than they support.
        </p>
      </div>

      <div className="shell page-docs docs-index">
        <nav className="docs-index__rail" aria-label="On this page">
          <p className="eyebrow">on this page</p>
          <ol className="docs-index__list">
            <li><a href="#scope-heading">What this page is not</a></li>
            <li><a href="#provenance-heading">Provenance is not authenticity</a></li>
            <li><a href="#absence-heading">A missing chain is not evidence</a></li>
            <li><a href="#ambiguous-heading">&ldquo;Invalid&rdquo; is ambiguous</a></li>
            <li><a href="#findings-heading">Six protocol-level findings</a></li>
            <li><a href="#self-heading">Our own dependence on the parser</a></li>
            <li><a href="#sources-heading">Sources</a></li>
          </ol>
        </nav>

        <div>

      <section className="docs-block" aria-labelledby="scope-heading">
        <h2 id="scope-heading">What this page is not</h2>
        <p>
          provenote does not claim to have discovered any of the limits below. It does not name
          any incumbent product as &ldquo;broken&rdquo; — where a real-world failure is cited, it
          is cited to that vendor&rsquo;s own public bug tracker. It never assesses whether any
          particular image is authentic, real, or AI-generated, and it never will — a valid C2PA
          chain is a claim about bytes and a signer, not a verdict on content.
        </p>
      </section>

      <section className="docs-block" aria-labelledby="provenance-heading">
        <h2 id="provenance-heading">Provenance is not authenticity</h2>
        <p>
          This is the foundational distinction every claim below sits on top of, and it is
          C2PA&rsquo;s own coalition saying it, not a critique from outside:
        </p>
        <blockquote>
          &ldquo;C2PA provides provenance signals, not proof of authenticity.&rdquo;
          <cite>
            {" "}
            — arXiv:2604.24890, &ldquo;What is C2PA?&rdquo;, quoting the distinction C2PA&rsquo;s own
            documentation draws
          </cite>
        </blockquote>
        <blockquote>
          &ldquo;Provenance information alone cannot tell you whether the digital content is true,
          accurate or factual.&rdquo;
          <cite>
            {" "}
            —{" "}
            <a
              href="https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
              target="_blank"
              rel="noreferrer"
            >
              C2PA Explainer, spec version 2.4
            </a>
            . This sentence sits in running prose — there is no dedicated, prominent
            &ldquo;Limitations&rdquo; section in either the spec or the Explainer.
          </cite>
        </blockquote>
        <p>
          Fixture 2 in the{" "}
          <a href="/gallery/">Gallery of Limits</a> makes this concrete: a cryptographically valid
          signature, cleanly attached to a scene that never happened.
        </p>
      </section>

      <section className="docs-block" aria-labelledby="absence-heading">
        <h2 id="absence-heading">A missing chain is not evidence of anything</h2>
        <p>
          A file that never carried C2PA data and a file whose valid manifest was stripped a
          moment ago are, by design, indistinguishable:
        </p>
        <blockquote>
          &ldquo;An image with no Content Credentials is like a box of cereal without any nutrition
          information, so you don&rsquo;t know what&rsquo;s in it or where it came from.&rdquo;
          <cite>
            {" "}
            —{" "}
            <a href="https://opensource.contentauthenticity.org/docs/getting-started/faqs/" target="_blank" rel="noreferrer">
              Content Authenticity Initiative FAQ
            </a>
          </cite>
        </blockquote>
        <p>
          The same FAQ concedes stripping is a real, unrecoverable-by-default event: recovery of a
          stripped manifest depends on &ldquo;a lookup process using either a watermarked ID or a
          perceptual content-aware hash&rdquo; — a best-effort lookup against a separate registry,
          not a guarantee, and not something this tool (or any client-side reader) can do on its
          own. Fixture 1 in the Gallery demonstrates this literally: the stripped file and the
          never-signed file are byte-for-byte identical.
        </p>
      </section>

      <section className="docs-block" aria-labelledby="ambiguous-heading">
        <h2 id="ambiguous-heading">An &ldquo;Invalid&rdquo; verdict does not distinguish tampering from tooling age</h2>
        <p>
          Two live GitHub issues against the field&rsquo;s reference verifier document this
          directly, not hypothetically:
        </p>
        <ul>
          <li>
            <a href="https://github.com/contentauth/verify-site/issues/316" target="_blank" rel="noreferrer">
              contentauth/verify-site#316
            </a>{" "}
            — a vendor&rsquo;s images, re-signed with a newer, fully legitimate version of
            c2patool, began showing &ldquo;This file may have been tampered with&rdquo; purely from
            an assertion-schema rename (<code>c2pa.actions</code> → <code>c2pa.actions.v2</code>).
          </li>
          <li>
            <a href="https://github.com/contentauth/verify-site/issues/336" target="_blank" rel="noreferrer">
              contentauth/verify-site#336
            </a>{" "}
            — the same vendor reports millions of older, honestly-signed images failing with the
            identical message, traced to <code>assertion.action.ingredientMismatch</code>, again
            with no tampering involved.
          </li>
        </ul>
        <p>
          Fixture 3 in the Gallery reproduces the underlying mechanism directly: an ordinary
          post-signing re-encode by a tool that has never heard of C2PA, and a deliberate
          single-byte edit, land on the exact same validator output.
        </p>
      </section>

      <section className="docs-block" aria-labelledby="findings-heading">
        <h2 id="findings-heading">Six documented protocol-level findings</h2>
        <p>
          <a href="https://arxiv.org/abs/2604.24890" target="_blank" rel="noreferrer">
            arXiv:2604.24890, &ldquo;Verifying Provenance of Digital Media: Why the C2PA
            Specifications Fall Short&rdquo;
          </a>{" "}
          (Golaszewski, Krawetz, Sherman, et al. — Cyber Defense Lab, UMBC; Hacker Factor; NSA) is
          the first formal-methods analysis of C2PA&rsquo;s core protocols. Its six Key Findings,
          named as the paper names them:
        </p>
        <ol>
          <li>
            <strong>Timestamps can be forged or altered.</strong> Nothing in the signed manifest
            data references the timestamp, so it can be stripped and replaced without invalidating
            the signature.
          </li>
          <li>
            <strong>Revoked or compromised credentials are still accepted.</strong> Conforming
            validators often skip or mishandle revocation checks — the spec makes strict
            revocation checking optional and disallows CRLs. A Nikon Z6 III credential revoked
            around November 2025 still validated as trusted in Adobe&rsquo;s own Inspect tool six
            months later.
          </li>
          <li>
            <strong>Different tools produce contradictory results.</strong> The same file is
            labeled valid by one conforming validator and invalid by another.
          </li>
          <li>
            <strong>Parts of files can be modified without detection.</strong> C2PA&rsquo;s
            byte-range &ldquo;exclusions&rdquo; mechanism lets some file regions sit outside the
            hard-binding hash by design, so they can be edited post-signing with no signature
            break — demonstrated by altering GPS location data in a Pixel 10 Pro test image without
            a validator flagging it.
          </li>
          <li>
            <strong>Credentials expire and become unverifiable.</strong> Certificates back C2PA
            signatures and expire on a timescale shorter than standard legal or records-retention
            windows (the paper cites 22–25 months as typical) — an Arizona Secretary of State pilot
            image that validated in January 2025 failed validation roughly a year later, with the
            file itself unchanged.
          </li>
          <li>
            <strong>Certification does not ensure compliance.</strong> The C2PA Conformance
            Program is largely self-attested; no source-code review is required to earn
            &ldquo;Conformant&rdquo; status.
          </li>
        </ol>
        <blockquote>
          &ldquo;C2PA should not yet be relied upon for high-stakes uses such as financial
          disclosures, journalism, or legal evidence.&rdquo;
          <cite> — arXiv:2604.24890, Executive Summary</cite>
        </blockquote>
        <p className="docs-block__note">
          These six findings are protocol-specific (timestamp binding, revocation, cross-validator
          consistency, exclusion ranges, certificate expiry, conformance rigor) and do not cover
          manifest stripping, re-signing, or capture-time (&ldquo;analog hole&rdquo;) attacks — this
          page cites those to C2PA&rsquo;s own spec design and CAI&rsquo;s own FAQ above, not to
          this paper, so nothing here is attributed to a source that didn&rsquo;t make the claim.
        </p>
      </section>

      <section className="docs-block" aria-labelledby="self-heading">
        <h2 id="self-heading">provenote&rsquo;s own dependence on the official parser</h2>
        <p>
          Every result this tool shows comes from{" "}
          <a href="https://github.com/contentauth/c2pa-js" target="_blank" rel="noreferrer">
            <code>@contentauth/c2pa-web</code>
          </a>
          , the official client-side C2PA reader, running unmodified in your browser. provenote
          does not re-implement cryptographic verification, does not second-guess the
          library&rsquo;s validation_state, and cannot detect a bug in that library if one exists —
          it is a plain-language front end for what the official parser reports, not an independent
          verifier. If the official library is wrong, provenote is wrong in exactly the same way,
          honestly labeled or not.
        </p>
      </section>

      <section className="docs-block" aria-labelledby="sources-heading">
        <h2 id="sources-heading">Sources</h2>
        <ul>
          <li>
            <a href="https://arxiv.org/abs/2604.24890" target="_blank" rel="noreferrer">
              arXiv:2604.24890
            </a>{" "}
            (
            <a href="https://arxiv.org/html/2604.24890v1" target="_blank" rel="noreferrer">
              full text
            </a>
            )
          </li>
          <li>
            <a
              href="https://spec.c2pa.org/specifications/specifications/2.4/specs/C2PA_Specification.html"
              target="_blank"
              rel="noreferrer"
            >
              C2PA Specification, version 2.4
            </a>
          </li>
          <li>
            <a
              href="https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
              target="_blank"
              rel="noreferrer"
            >
              C2PA Explainer, version 2.4
            </a>
          </li>
          <li>
            <a href="https://opensource.contentauthenticity.org/docs/getting-started/faqs/" target="_blank" rel="noreferrer">
              Content Authenticity Initiative FAQ
            </a>
          </li>
          <li>
            <a href="https://verify.contentauthenticity.org/" target="_blank" rel="noreferrer">
              verify.contentauthenticity.org
            </a>{" "}
            and its{" "}
            <a href="https://github.com/contentauth/verify-site/blob/main/locales/en-US.json" target="_blank" rel="noreferrer">
              source locale strings
            </a>
          </li>
          <li>
            <a href="https://github.com/contentauth/verify-site/issues/316" target="_blank" rel="noreferrer">
              verify-site#316
            </a>{" "}
            ·{" "}
            <a href="https://github.com/contentauth/verify-site/issues/336" target="_blank" rel="noreferrer">
              verify-site#336
            </a>
          </li>
          <li>
            <a href="https://github.com/contentauth/c2pa-js" target="_blank" rel="noreferrer">
              c2pa-js
            </a>{" "}
            ·{" "}
            <a href="https://github.com/contentauth/c2patool" target="_blank" rel="noreferrer">
              c2patool
            </a>{" "}
            (used to build every fixture in the Gallery — see{" "}
            <a href="https://github.com/jamessuuu/provenote/blob/main/fixtures/README.md" target="_blank" rel="noreferrer">
              fixtures/README.md
            </a>{" "}
            for exact versions and construction steps)
          </li>
        </ul>
      </section>
        </div>
      </div>
    </>
  );
}
