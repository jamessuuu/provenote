import Link from "next/link";
import { BrandGlyph } from "@/components/BrandMark";
import { Inspector } from "@/components/inspector/Inspector";

export default function HomePage() {
  return (
    <>
      <div className="shell page-hero">
        <div className="page-hero__mark" aria-hidden="true">
          <BrandGlyph size={64} />
        </div>
        <h1>provenote</h1>
        <p className="page-hero__tagline">
          Drop an image; see its full provenance chain and exactly what that chain cannot prove.
          Nothing leaves your device — check the Network tab.
        </p>
        <p>
          provenote is not a verifier. It is a C2PA honesty test: it parses the same signed
          provenance chains the Coalition for Content Provenance and Authenticity&rsquo;s tooling
          does, using the official client-side library, and states — in plain language, next to
          every claim — what a valid chain proves and what it structurally cannot.
        </p>
        <p>
          provenote does not detect AI-generated images, and never will. It explains chains; it
          never judges content.
        </p>
        <p>
          See three adversarially-built demonstrations in the <Link href="/gallery/">Gallery of Limits</Link>,
          or the full citation list in <Link href="/docs/limitations/">Limitations</Link>.
        </p>
      </div>
      <div className="shell page-inspector">
        <Inspector />
      </div>
    </>
  );
}
