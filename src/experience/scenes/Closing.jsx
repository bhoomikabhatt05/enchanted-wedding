import { useRef } from "react";
import { closing } from "../../lib/content";
import { images, imageSource } from "../../lib/images";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, useGSAP } from "../../lib/gsap";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import StarField from "../../components/StarField";
import CoupleMotif from "../../components/CoupleMotif";
import Divider from "../../components/Divider";
import Label from "../../components/Label";
import styles from "./Closing.module.css";

export default function Closing() {
  const rootRef = useRef(null);
  const skyRef = useRef(null);
  const twinsRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const ornamentSrc = imageSource(images.illustrations.ornament);

  useScrollReveal(rootRef, { reducedMotion, y: 22, stagger: 0.3 });

  // The final stars slowly fade as the story ends.
  useGSAP(
    () => {
      const sky = skyRef.current;
      const root = rootRef.current;
      if (!sky || !root || reducedMotion) return;
      gsap.fromTo(
        sky,
        { opacity: 1 },
        {
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "center center",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  // Circle-closure: the silver thread draws itself between the two stars,
  // twin flares bloom, and the pair's halos pulse to seal the spell.
  useGSAP(
    () => {
      const twins = twinsRef.current;
      if (!twins || reducedMotion) return;
      const thread = twins.querySelector(`.${styles.thread}`);
      const mid = twins.querySelector(`.${styles.mid}`);
      const flares = [...twins.querySelectorAll(`.${styles.flare}`)];
      const glows = [...twins.querySelectorAll(`.${styles.glow}`)];
      if (!thread) return;

      const len = thread.getTotalLength();

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: twins,
          start: "top 82%",
          once: true,
        },
      });

      tl.fromTo(
        thread,
        { attr: { strokeDasharray: len, strokeDashoffset: len, opacity: 1 } },
        { attr: { strokeDashoffset: 0 }, duration: 0.95, ease: "power2.inOut" }
      )
        // The joining star ignites as the thread meets it.
        .fromTo(
          mid,
          { attr: { r: 2, opacity: 0 }, transformOrigin: "50% 50%" },
          { attr: { r: 3.4, opacity: 1 }, duration: 0.35 },
          "<0.45"
        )
        .fromTo(
          flares,
          { attr: { r: 3, opacity: 0.85 }, transformOrigin: "50% 50%" },
          { attr: { r: 11, opacity: 0 }, duration: 0.95, stagger: 0.14, ease: "power2.out" },
          "<0.15"
        )
        .fromTo(
          glows,
          { attr: { r: 14 }, transformOrigin: "50% 50%" },
          { attr: { r: 22 }, duration: 0.9, yoyo: true, repeat: 1, stagger: 0.16, ease: "power3.out" },
          "<0.5"
        );
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  return (
    <section className={styles.stage} ref={rootRef} aria-label="Closing">
      <div className={styles.sky} ref={skyRef} aria-hidden="true">
        <StarField count={70} seed={31} scatter={0.6} />
      </div>

      <div className={styles.lanterns} aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className={styles.lantern} data-lantern={i} />
        ))}
      </div>

      <div className={styles.water} aria-hidden="true" />

      <div className={styles.landscape} aria-hidden="true">
        <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice">
          <path d="M0 300 L0 210 L 260 110 L 520 230 L 800 120 L 1080 250 L 1440 150 L 1440 300 Z" fill="#0a121f" />
          <path d="M0 300 L0 250 L 320 170 L 640 260 L 960 190 L 1220 270 L 1440 210 L 1440 300 Z" fill="#0c1626" opacity="0.85" />
        </svg>
      </div>

      <svg className={styles.ornament} viewBox="0 0 240 40" aria-hidden="true">
        <path d="M 10 20 H 100 M 140 20 H 230" fill="none" stroke="#c9a96b" strokeWidth="1" opacity="0.6" />
        <path d="M 120 4 l 3.2 6 6.8 1 -5 4.8 1.2 6.8 -6.2 -3.3 -6.2 3.3 1.2 -6.8 -5 -4.8 6.8 -1 Z" fill="#c9a96b" opacity="0.85" />
      </svg>

      <div className={styles.content}>
        {ornamentSrc ? (
          <img
            src={ornamentSrc}
            alt=""
            aria-hidden="true"
            className={styles.ornamentArt}
            loading="lazy"
            decoding="async"
            data-scroll-reveal
          />
        ) : null}
        <Label className={styles.chapter} data-scroll-reveal>
          {closing.chapter}
        </Label>
        <p className={styles.prelude} data-scroll-reveal>
          {closing.prelude}
        </p>
        <p className={styles.names} data-scroll-reveal>
          {closing.names}
        </p>
        <CoupleMotif title="" className={styles.motif} />
        <p className={styles.line} data-scroll-reveal>
          {closing.line1}
        </p>
        <p className={styles.line} data-scroll-reveal>
          {closing.line2}
        </p>
        <p className={styles.finalLine} data-scroll-reveal>
          {closing.line3}
        </p>
        <Divider className={styles.divider} />
        <svg className={styles.twins} viewBox="0 0 200 60" aria-hidden="true" data-scroll-reveal ref={twinsRef}>
          <defs>
            <radialGradient id="closingTwinGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff7dc" stopOpacity="1" />
              <stop offset="55%" stopColor="#c9a96b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c9a96b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className={styles.glow} cx="72" cy="30" r="14" fill="url(#closingTwinGlow)" />
          <circle className={styles.glow} cx="128" cy="30" r="14" fill="url(#closingTwinGlow)" />
          <line className={styles.thread} x1="72" y1="30" x2="128" y2="30" stroke="#c9a96b" strokeWidth="1.2" opacity="0.85" strokeLinecap="round" />
          <circle className={styles.flare} cx="72" cy="30" r="3" fill="#e8d7b5" opacity="0" />
          <circle className={styles.flare} cx="128" cy="30" r="3" fill="#e8d7b5" opacity="0" />
          <circle className={styles.mid} cx="100" cy="30" r="2" fill="#fff7dc" opacity="0" />
          <circle cx="72" cy="30" r="3" fill="#fff7dc" stroke="#c9a96b" strokeWidth="0.8" />
          <circle cx="128" cy="30" r="3" fill="#fff7dc" stroke="#c9a96b" strokeWidth="0.8" />
        </svg>
        <p className={styles.finale} data-scroll-reveal>
          {closing.finale}
        </p>
        <p className={styles.date} data-scroll-reveal>
          {closing.date}
        </p>
      </div>

      <div className={styles.vignette} aria-hidden="true" />
    </section>
  );
}
