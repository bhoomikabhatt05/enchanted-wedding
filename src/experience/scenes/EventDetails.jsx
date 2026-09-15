import { useRef, useState } from "react";
import { event } from "../../lib/content";
import { images, imageSource } from "../../lib/images";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, useGSAP } from "../../lib/gsap";
import Label from "../../components/Label";
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
          <Label className={styles.chapter}>{event.chapter}</Label>
          <h2 className={styles.title}>{event.title}</h2>
          <p className={styles.invitation}>{event.invitation}</p>
        </div>

        <div className={styles.copies}>
          {BEATS.map((beat) => (
            <div key={beat.id} className={styles.beatCopy} data-beat-copy>
              <p className={styles.eyebrow}>{beat.eyebrow}</p>
              <h3 className={styles.beatTitle}>{beat.title}</h3>
              <p className={styles.meta}>{beat.meta}</p>
              <Divider className={styles.rule} />
              <p className={styles.detail}>{beat.detail}</p>
            </div>
          ))}
        </div>

        <div className={styles.pips} aria-hidden="true">
          {BEATS.map((b, i) => (
            <span key={b.id} className={`${styles.pip} ${i <= beat ? styles.pipLit : ""}`.trim()} />
          ))}
        </div>

        <div className={styles.veil} aria-hidden="true" />
      </div>
    </section>
  );
}
