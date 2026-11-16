import Link from "next/link";
import { HeaderFrame } from "./header-frame";
import { CompactNavigation } from "./compact-navigation";
import { FooterFrame } from "./footer-frame";

export function SiteHeader() {
  return <HeaderFrame><CompactNavigation /></HeaderFrame>;
}

export function SiteFooter() {
  return (
    <FooterFrame>
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Link href="/" className="footer-brand" aria-label="Portfolio Quest island home">Portfolio Quest</Link>
          <p>Professional work. New ideas. A little adventure.</p>
          <p>Follow your curiosity, or take the direct route to the portfolio.</p>
          <Link href="/portfolio" className="footer-all-works">See all works <span aria-hidden="true">↗</span></Link>
        </div>
        <nav aria-label="Footer navigation" className="footer-directory">
          <dl>
            <dt>Portfolio</dt><dd><Link href="/work">Selected Work</Link></dd>
            <dt>Explore</dt><dd><Link href="/concepts">Concept Lab</Link> / <Link href="/world">Adventure</Link></dd>
            <dt>More</dt><dd><Link href="/about">About Me</Link> / <Link href="/contact">Contact</Link></dd>
          </dl>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>Three paths. One portfolio.</span>
        <a href="#page-top">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
    </FooterFrame>
  );
}
