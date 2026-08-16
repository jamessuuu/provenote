import Link from "next/link";
import { BrandGlyph } from "./BrandMark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__row">
        <Link href="/" className="site-header__brand">
          <BrandGlyph size={28} />
          <span className="site-header__wordmark">provenote</span>
        </Link>
        <nav className="site-header__nav" aria-label="Primary">
          <Link href="/gallery/">Gallery of Limits</Link>
        </nav>
      </div>
    </header>
  );
}
