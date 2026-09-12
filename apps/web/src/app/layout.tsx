import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const TITLE = "provenote";
const DESCRIPTION =
  "Drop an image; see its full provenance chain and exactly what that chain cannot prove. Nothing leaves your device — check the Network tab.";

export const metadata: Metadata = {
  title: {
    default: `${TITLE} — a C2PA honesty test`,
    template: `%s — ${TITLE}`,
  },
  description: DESCRIPTION,
  metadataBase: new URL("https://provenote.vercel.app"),
  openGraph: {
    title: `${TITLE} — a C2PA honesty test`,
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} — a C2PA honesty test`,
    description: DESCRIPTION,
  },
};

/**
 * JSON-LD for every route: the site as a WebSite whose author is the same Person entity
 * agentjames publishes (@id), so engines can join the sites to one maker. Rendered as a
 * native script tag per the Next.js JSON-LD guide; "<" is escaped so the payload can never
 * close the tag.
 */
const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "provenote",
  url: "https://provenote.vercel.app",
  author: {
    "@type": "Person",
    "@id": "https://agentjames.vercel.app/#person",
    name: "James Lorenz Santos",
    url: "https://agentjames.vercel.app",
    sameAs: [
      "https://www.linkedin.com/in/james-lorenz-santos-720776251/",
      "https://github.com/jamessuuu",
      "https://www.onlinejobs.ph/jobseekers/info/2766463",
      "https://ph.jobstreet.com/profiles/jameslorenz-santos-SXdpKyGqdK",
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, "\u003c") }}
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
