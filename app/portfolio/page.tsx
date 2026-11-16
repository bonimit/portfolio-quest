import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ActionLink } from "@/components/ui/action-link";
import { KineticWordmark } from "@/components/home/kinetic-wordmark";
import { LandingReveals } from "@/components/home/landing-reveals";
import { DestinationArt } from "@/components/home/destination-art";
import { WorldPreview } from "@/components/home/world-preview";
import { ADVENTURE_PREVIEW_LABEL } from "@/lib/shared/navigation";

const description =
  "Explore professional design work, creative concepts, and playable prototypes. Choose the editorial portfolio or preview a future adventure through Portfolio Quest.";

export const metadata: Metadata = {
  title: "Portfolio",
  description,
  openGraph: { title: "Portfolio | Portfolio Quest", description },
};

const destinations = [
  { title: "Selected Work", href: "/work", kind: "work", tint: "var(--landing-orange)", description: "Professional projects, the thinking behind them, and the details that matter.", tag: "The direct route" },
  { title: "Concept Lab", href: "/concepts", kind: "concepts", tint: "var(--landing-lilac)", description: "Room for possibilities. Ideas, pitches, and experiments as they take shape.", tag: "Ideas in progress" },
  { title: "Prototype Arcade", href: "/arcade", kind: "arcade", tint: "var(--landing-yellow)", description: "Interactive experiments, creative tools, and things built to try.", tag: "Experiments & prototypes" },
  { title: "About", href: "/about", kind: "about", tint: "var(--landing-lime)", description: "A place for background, skills, and experience. Approved details are on their way.", tag: "Content coming soon" },
  { title: "Contact", href: "/contact", kind: "contact", tint: "var(--landing-teal)", description: "A direct way to connect, once approved public contact details are available.", tag: "Details coming soon" },
  { title: ADVENTURE_PREVIEW_LABEL, href: "/world", kind: "world", tint: "var(--landing-pink)", description: "Three playable prototype demos, with a choice of Island, Arcade and Neon themes.", tag: "The scenic route" },
] as const;

export default function HomePage() {
  return (
    <div className="home home--reference">
      <section className="reference-hero" aria-labelledby="home-title">
        <div className="hero-atmosphere" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        <div className="reference-hero-copy">
          <div>
            <p>
              Design, ideas, and interactive experiments. Take the direct route to
              the portfolio, or get a glimpse of the world taking shape around it.
            </p>
            <div className="hero-actions">
              <ActionLink href="/work">View Portfolio</ActionLink>
              <ActionLink href="/world" variant="secondary">{ADVENTURE_PREVIEW_LABEL}</ActionLink>
            </div>
          </div>
        </div>
        <div className="hero-breathing-room" aria-hidden="true" />
        <KineticWordmark id="home-title" firstLine="Portfolio" secondLine="Quest" />
      </section>

      <section className="landing-playground" id="explore" aria-labelledby="explore-title">
        <h2 id="explore-title">Find your own path.</h2>
        <p className="landing-subtitle">Two ways in. Plenty to explore. No gameplay required.</p>
        <nav className="landing-toolbar" aria-label="Portfolio shortcuts">
          <span className="toolbar-label">Go directly</span>
          <Link href="/work">Selected Work</Link>
          <Link href="/concepts">Concept Lab</Link>
          <Link href="/arcade">Prototype Arcade</Link>
        </nav>
        <p className="landing-tally"><b>06</b><span>destinations · project content is on its way</span></p>
        <LandingReveals>
          {destinations.map((destination, index) => (
            <Link
              href={destination.href}
              className={`landing-card landing-card--${destination.kind}`}
              key={destination.href}
              aria-labelledby={`destination-title-${index}`}
              aria-describedby={`destination-description-${index}`}
              style={{
                "--card-tint": destination.tint,
                "--card-tilt": `${index % 2 === 0 ? -1 : 1.2}deg`,
                "--card-delay": `${index * 30}ms`,
              } as CSSProperties}
            >
              <div className="landing-card-art">
                {destination.kind === "world"
                  ? <WorldPreview />
                  : <DestinationArt kind={destination.kind} />}
                <span className="art-wash" aria-hidden="true" />
              </div>
              <span className="landing-card-number" aria-hidden="true">0{index + 1}</span>
              <h3 id={`destination-title-${index}`}>{destination.title}</h3>
              <p id={`destination-description-${index}`}>{destination.description}</p>
              <span className="landing-card-tag">{destination.tag}</span>
              <span className="landing-card-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </LandingReveals>
      </section>
    </div>
  );
}
