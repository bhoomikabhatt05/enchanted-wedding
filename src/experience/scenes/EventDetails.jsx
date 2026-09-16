import { useRef, useState } from "react";
import { event } from "../../lib/content";
import { images, imageSource } from "../../lib/images";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, useGSAP } from "../../lib/gsap";
import Label from "../../components/Label";
import MoonPhase from "../../components/MoonPhase";
import InkTitle from "../../components/InkTitle";
import Divider from "../../components/Divider";
import styles from "./EventDetails.module.css";

const BEATS = [
  {
    id: "venue",
    eyebrow: "The Venue",
    title: event.venue.title,
    meta: event.venue.place,
    detail: event.venue.detail,
    image: images.events.venue,
    alt: event.venue.alt,
  },
  {
    id: "ceremony",
    eyebrow: "The Ceremony",
    title: event.schedule[0].title,
    meta: `${event.schedule[0].time} · ${event.venue.place}`,
    detail: event.schedule[0].detail,
    image: images.events.ceremony,
    alt: event.schedule[0].alt,
  },
  {
    id: "reception",
    eyebrow: "The Reception",
    title: event.schedule[1].title,
    meta: `${event.schedule[1].time} · ${event.venue.place}`,
    detail: event.schedule[1].detail,
    image: images.events.reception,
    alt: event.schedule[1].alt,
  },
  {
    id: "couple",
    eyebrow: "The Couple",
    title: "Aarav & Meera",
    meta: "12 · 12 · 2026",
    detail: event.closing,
    image: images.events.coupleWedding,
    alt: "Aarav and Meera on their wedding day",
  },
];

/**
 * Chapter VI — the wedding day as a cinematic progression: venue emerging
 * from darkness, into ceremony, into celebration, ending on the couple.
 */
const BEAT_ICONS = {
  venue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#8a6a3f" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M6 20 V12 A6 6 0 0 1 18 12 V20" />
      <path d="M12 20 V12" opacity="0.7" />
      <path d="M4 20 H20" />
    </svg>
  ),
  ceremony: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#8a6a3f" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M12 3 C 10.5 5, 10.5 6.5, 12 8 C 13.5 6.5, 13.5 5, 12 3 Z" fill="#e8a94e" opacity="0.85" stroke="none" />
      <path d="M12 9 V20" />
      <path d="M8 20 H16" />
    </svg>
  ),
  reception: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#8a6a3f" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M7 4 H17 C17 9, 15 11, 12 11 C9 11, 7 9, 7 4 Z" />
      <path d="M12 11 V19" />
      <path d="M8 19 H16" />
    </svg>
  ),
  couple: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 13 l1.1 2.6 2.6 1.1 -2.6 1.1 -1.1 2.6 -1.1-2.6 -2.6-1.1 2.6-1.1 Z" fill="#c9a96b" />
      <path d="M17.5 4.5 l0.8 1.9 1.9 0.8 -1.9 0.8 -0.8 1.9 -0.8-1.9 -1.9-0.8 1.9-0.8 Z" fill="#e8c87e" />
      <path d="M8.5 15.5 L15.5 9.5" stroke="#c9a96b" strokeWidth="1" opacity="0.7" />
    </svg>
  ),
};
export default function EventDetails() {
  const rootRef = useRef(null);
  const [beat, setBeat] = useState(0);
  const beatRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const scenes = q("[data-beat-scene]");
      const copies = q("[data-beat-copy]");

      const updateBeat = (index) => {
        if (beatRef.current === index) return;
        beatRef.current = index;
        setBeat(index);
      };

      if (reducedMotion) {
        root.classList.add(styles.static);
        return;
      }

      // Chapter entry, once: a golden stroke sweeps left → right and the
      // entry mist parts to reveal the estate. Afterwards only the
      // atmosphere remains.
      const entry = q("[data-entry-mist]")[0];
      if (entry) {
        const halves = q("[data-entry-half]");
        const spark = q("[data-entry-spark]")[0];
        gsap.set(entry, { display: "block" });
        gsap.timeline({
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
        })
          .fromTo(entry, { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .fromTo(
            spark,
            { xPercent: -60, opacity: 0 },
            { xPercent: 60, opacity: 1, duration: 0.55, ease: "power1.inOut" },
            0.25
          )
          .to(spark, { opacity: 0, duration: 0.2 }, 0.75)
          .to(
            halves,
            { yPercent: (i) => (i === 0 ? -72 : 72), opacity: 0, duration: 0.9, ease: "power2.inOut" },
            0.55
          )
          .to(entry, { opacity: 0, duration: 0.4 }, 1.1)
          .set(entry, { display: "none" });
      }

      scenes.forEach((scene, i) => {
        gsap.set(scene, { autoAlpha: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 1.08 });
        gsap.set(copies[i], { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 34 });
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const index = Math.min(BEATS.length - 1, Math.floor(self.progress * BEATS.length));
            updateBeat(index);
          },
        },
      });

      const span = 1 / BEATS.length;
      BEATS.forEach((_, i) => {
        if (i === 0) return;
        const at = i * span;
        tl.to(scenes[i - 1], { autoAlpha: 0, scale: 1.06, duration: span * 0.7 }, at);
        tl.fromTo(scenes[i], { autoAlpha: 0, scale: 1.1 }, { autoAlpha: 1, scale: 1.02, duration: span }, at);
        tl.to(copies[i - 1], { autoAlpha: 0, y: -26, duration: span * 0.5 }, at);
        tl.fromTo(copies[i], { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: span * 0.6 }, at + span * 0.2);
      });
      // Gentle continuous push on the closing portrait.
      tl.to(scenes[BEATS.length - 1], { scale: 1.1, duration: span }, 1 - span);
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  return (
    <section ref={rootRef} className={styles.scroll} aria-label="The big day">
      <div className={styles.viewport}>
        {BEATS.map((beat) => {
          const src = imageSource(beat.image);
          return (
            <div key={beat.id} className={styles.scene} data-beat-scene>
              {src ? (
                <img src={src} alt={beat.alt} className={styles.photo} loading="lazy" decoding="async" />
              ) : null}
              <div className={styles.grade} aria-hidden="true" />
              <div className={styles.grain} aria-hidden="true" />
            </div>
          );
        })}

        <div className={styles.head} aria-hidden={reducedMotion ? undefined : "true"}>
          <Label className={styles.chapter}>
            <MoonPhase phase="gibbous" />
            {event.chapter}
          </Label>
          <InkTitle as="h2" text={event.title} variant="light" className={styles.title} />
          <p className={styles.invitation}>{event.invitation}</p>
        </div>

        <div className={styles.copies}>
          {BEATS.map((item, i) => (
            <div
              key={item.id}
              className={`${styles.beatCopy} ${i === beat ? styles.beatCopyActive : ""}`.trim()}
              data-beat-copy
            >
              <span className={styles.beatIcon} aria-hidden="true">
                {BEAT_ICONS[item.id]}
              </span>
              <p className={styles.eyebrow}>
                <span aria-hidden="true">✦&ensp;</span>
                {item.eyebrow}
                <span aria-hidden="true">&ensp;✦</span>
              </p>
              <h3 className={styles.beatTitle}>{item.title}</h3>
              <p className={styles.meta}>{item.meta}</p>
              <Divider className={styles.rule} />
              <p className={styles.detail}>{item.detail}</p>
            </div>
          ))}
        </div>

        <div
          className={styles.candle}
          aria-hidden="true"
          style={{ opacity: 0.35 + beat * 0.15 }}
        >
          <div className={styles.candleGlow} />
        </div>

        <div className={styles.pips} aria-hidden="true">
          {BEATS.map((b, i) => (
            <span key={b.id} className={`${styles.pip} ${i <= beat ? styles.pipLit : ""}`.trim()} />
          ))}
        </div>

        <div className={styles.veil} aria-hidden="true" />

        {/* Entry veil: mist that a golden stroke parts exactly once. */}
        <div className={styles.entryMist} data-entry-mist aria-hidden="true">
          <div className={`${styles.entryHalf} ${styles.entryTop}`} data-entry-half />
          <div className={styles.entrySpark} data-entry-spark />
          <div className={`${styles.entryHalf} ${styles.entryBottom}`} data-entry-half />
        </div>
      </div>
    </section>
  );
}
