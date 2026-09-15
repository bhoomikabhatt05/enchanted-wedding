import { couple, hero } from "../../lib/content";
import { images, imageSource } from "../../lib/images";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, useGSAP } from "../../lib/gsap";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useRef } from "react";
import Divider from "../../components/Divider";
import Label from "../../components/Label";
import ScrollCue from "../../components/ScrollCue";
import styles from "./HeroInvitation.module.css";

const FAR_STARS = Array.from({ length: 28 }, (_, i) => ({
  top: `${3 + ((i * 41 + 11) % 42)}%`,
  left: `${2 + ((i * 29 + 5) % 96)}%`,
  size: i % 6 === 0 ? 1.8 : 1,
  opacity: 0.1 + (i % 4) * 0.06,
  delay: `${(i * 0.55) % 6}s`,
}));

const NEAR_STARS = Array.from({ length: 18 }, (_, i) => ({
  top: `${2 + ((i * 31 + 17) % 36)}%`,
  left: `${3 + ((i * 47 + 13) % 94)}%`,
  size: i % 4 === 0 ? 2.2 : i % 3 === 0 ? 1.6 : 1.1,
  opacity: 0.18 + (i % 4) * 0.08,
  delay: `${(i * 0.8) % 6}s`,
}));

const MOTES = Array.from({ length: 12 }, (_, i) => ({
  top: `${8 + ((i * 53 + 19) % 80)}%`,
  left: `${4 + ((i * 67 + 23) % 92)}%`,
  delay: `${(i % 7) * 0.9}s`,
  dur: `${7 + (i % 5)}s`,
}));

export default function HeroInvitation({ heroRef }) {
  const rootRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const photoSrc = imageSource(images.couple.main);

  useScrollReveal(rootRef, { reducedMotion, y: 32, stagger: 0.15 });

  // Slow cinematic push-in on the portrait as the story arrives.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion) return;
      const photo = root.querySelector("[data-hero-photo]");
      if (!photo) return;
      gsap.fromTo(
        photo,
        { scale: 1.16 },
        {
          scale: 1.02,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  const setRefs = (el) => {
    rootRef.current = el;
    if (typeof heroRef === "object" && heroRef) heroRef.current = el;
  };

  return (
    <section ref={setRefs} className={styles.stage} aria-label="The invitation">
      {/* ── Night layers, continuous with the star chart ── */}
      <div className={styles.sky} aria-hidden="true">
        <div className={styles.skyGrad} />

        <div data-hero-drift="-34" className={styles.starFar}>
          {FAR_STARS.map((s, i) => (
            <span
              key={i}
              className={styles.star}
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                opacity: s.opacity,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>

        <div data-hero-drift="26" className={styles.starNear}>
          {NEAR_STARS.map((s, i) => (
            <span
              key={i}
              className={styles.star}
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                opacity: s.opacity,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>

        <div data-hero-drift="-18" className={styles.moonWrap}>
          <div data-moon className={styles.moon}>
            <span className={styles.moonGlow} />
            <span className={styles.moonShade} />
          </div>
        </div>

        {/* ── The protagonists, full-bleed editorial ── */}
        {photoSrc ? (
          <div data-hero-drift="30" className={styles.portraitLayer}>
            <img
              data-hero-photo
              src={photoSrc}
              alt="Aarav and Meera together"
              className={styles.portrait}
              fetchPriority="high"
              decoding="async"
            />
            <div className={styles.portraitGrade} />
            <div className={styles.portraitGrain} />
            <span className={styles.lightSweep} aria-hidden="true" />
          </div>
        ) : null}

        <svg
          data-hero-drift="-8"
          className={styles.landscapeFar}
          viewBox="0 0 800 200"
          preserveAspectRatio="xMidYMax slice"
          fill="none"
        >
          <path
            d="M0 200 L0 148 Q90 112 180 136 Q260 102 340 128 Q410 88 480 116 Q560 82 640 122 Q720 96 800 130 L800 200 Z"
            fill="rgba(13, 24, 40, 0.72)"
          />
          <path
            d="M0 200 L0 168 Q120 146 230 160 Q340 142 450 158 Q570 142 690 158 L800 150 L800 200 Z"
            fill="rgba(10, 18, 31, 0.72)"
          />
        </svg>

        <svg
          data-hero-drift="22"
          className={styles.landscapeNear}
          viewBox="0 0 800 220"
          preserveAspectRatio="xMidYMax slice"
          fill="none"
        >
          <path
            d="M310 220 L310 150 L322 150 L322 122 L328 114 L334 122 L334 150 L356 150 L356 134 L362 128 L368 134 L368 150 L378 150 L378 112 L385 100 L392 112 L392 150 L412 150 L412 130 L418 124 L424 130 L424 150 L444 150 L444 142 L452 136 L460 142 L460 150 L484 150 L484 220 Z"
            fill="rgba(6, 11, 19, 0.94)"
          />
          <g className={styles.estateLights} fill="#ffd98f">
            <rect x="384" y="122" width="4" height="6" />
            <rect x="418" y="136" width="3" height="5" />
            <rect x="338" y="130" width="3" height="5" />
            <rect x="448" y="144" width="3" height="4" />
          </g>
          <path
            d="M0 220 L0 178 Q110 162 220 174 Q330 156 430 170 Q540 154 640 168 Q730 160 800 172 L800 220 Z"
            fill="rgba(5, 9, 16, 0.98)"
          />
        </svg>

        <div className={styles.hazeLayer} />
        <div className={styles.mist} />

        {!reducedMotion &&
          MOTES.map((m, i) => (
            <span
              key={i}
              className={styles.mote}
              style={{ top: m.top, left: m.left, animationDelay: m.delay, animationDuration: m.dur }}
            />
          ))}
      </div>

      {/* ── Content over negative space ── */}
      <div className={styles.inner}>
        <p data-scroll-reveal className={styles.chapter}>
          <Label as="span">{hero.chapter}</Label>
        </p>
        <p data-scroll-reveal className={styles.eyebrow}>
          <Label as="span">{hero.title}</Label>
        </p>

        <h1 data-scroll-reveal className={styles.names}>
          <span className={styles.name}>{couple.partnerA}</span>
          <span className={styles.ampersand} aria-hidden="true">
            <span className={styles.script}>&amp;</span>
          </span>
          <span className={styles.name}>{couple.partnerB}</span>
        </h1>

        <div data-scroll-reveal className={styles.rule}>
          <Divider />
        </div>

        <p data-scroll-reveal className={styles.invitation}>
          {couple.tagline}
        </p>

        <p data-scroll-reveal className={styles.date}>
          <span className={styles.dateValue}>{couple.dateLabel}</span>
        </p>

        <p data-scroll-reveal className={styles.coords}>
          {hero.coordinates}
        </p>

        <div data-scroll-reveal className={styles.cue}>
          <ScrollCue label="Follow their story" />
        </div>
      </div>

      <div className={styles.ink} aria-hidden="true" />
    </section>
  );
}
