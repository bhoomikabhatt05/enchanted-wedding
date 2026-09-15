import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import Atmosphere from "./overlays/Atmosphere";
import StarChartOpening from "./scenes/OpeningLetter";
import HeroInvitation from "./scenes/HeroInvitation";
import Countdown from "./scenes/Countdown";
import CoupleIntro from "./scenes/CoupleIntro";
import JourneyMap from "./scenes/JourneyMap";
import EventDetails from "./scenes/EventDetails";
import Memories from "./scenes/Memories";
import RSVP from "./scenes/RSVP";
import SaveTheDate from "./scenes/SaveTheDate";
import Closing from "./scenes/Closing";
import styles from "./Experience.module.css";

export default function Experience() {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const countdownRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  // Scroll-linked parallax for layered hero elements.
  useGSAP(
    () => {
      if (reducedMotion) return;
      const hero = heroRef.current;
      if (!hero) return;

      hero.querySelectorAll("[data-hero-drift]").forEach((layer) => {
        const distance = Number(layer.dataset.heroDrift || 0);
        if (!distance) return;
        gsap.to(layer, {
          y: distance,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  return (
    <div ref={rootRef} className={styles.root}>
      <Atmosphere reducedMotion={reducedMotion} />
      <main className={styles.story}>
        <StarChartOpening />
        <HeroInvitation heroRef={heroRef} />
        <Countdown ref={countdownRef} />
        <CoupleIntro />
        <JourneyMap />
        <EventDetails />
        <Memories />
        <RSVP />
        <SaveTheDate />
        <Closing />
      </main>
    </div>
  );
}
