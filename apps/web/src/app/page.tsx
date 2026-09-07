import Link from "next/link";
import { summarizeChain } from "@provenote/core";
import { Inspector } from "@/components/inspector/Inspector";
import { RECORDED_EXAMPLE } from "@/data/recorded-example";

/**
 * The example chain shown above the fold. It is produced HERE, at build
 * time, by the same summarizeChain() the live Inspector calls — over a
 * ManifestStore recorded verbatim from a real browser run of
 * @contentauth/c2pa-web. Not a mockup of a result, and not a live read
 * either; the surface says which it is.
 *
 * The alternative — parsing a bundled fixture on mount — would make every
 * first-time visitor download a 7.4 MB WebAssembly binary before the page
 * showed them anything. The wasm still loads, on the first real file.
 */
const EXAMPLE = summarizeChain(RECORDED_EXAMPLE as never);

export default function HomePage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
        <p className="eyebrow">a C2PA honesty test</p>
        <h1>A valid signature proves less than you think.</h1>
        <p className="page-hero__tagline">
          Drop an image. See its provenance chain in plain language — and, beside every claim,
          what that claim structurally cannot establish.
        </p>
        <div className="claims">
          <span className="claim claim--live">nothing uploads &mdash; check the Network tab</span>
          <span className="claim">parsed by the official C2PA library</span>
          <span className="claim">
            <Link href="/gallery/" style={{ color: "inherit" }}>
              3 adversarial demonstrations &rarr;
            </Link>
          </span>
          </div>
        </div>
      </section>

      <div className="shell page-inspector">
        <Inspector example={EXAMPLE} />
        <p className="docs-block__note" style={{ marginTop: "14px", maxWidth: "78ch" }}>
          provenote is not a verifier and it does not detect AI-generated images — it never will.
          It explains chains; it never judges content. The full reasoning, with citations, is on{" "}
          <Link href="/docs/limitations/">Limitations</Link>.
        </p>
      </div>
    </>
  );
}
