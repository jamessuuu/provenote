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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
