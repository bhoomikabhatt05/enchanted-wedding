import { useRef } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import styles from "./MistFlow.module.css";

/**
 * MistFlow — a scroll-lit veil of cloud passing between chapters.
 *
 * Each boundary between two scenes gets a wide wavering bank of mist that
 * drifts directionally across the viewport as the visitor scrolls: it rolls
 * in over the finished scene, carries them across the transition, then
 * clears to reveal the next environment — nothing fades; the world itself
 * moves through the clouds.
 */
export default function MistFlow({ reducedMotion = false, storyRef = null }) {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      if (reducedMotion) return;
      const root = rootRef.current;
      const story = storyRef?.current;
      if (!root || !story) return;
      const sections = [...story.querySelectorAll(":scope > section")];
      if (!sections.length) return;
      const banks = [...root.querySelectorAll("[data-mist-bank]")];
      const created = [];

      // Scene pairs the mist carries the visitor between (section indexes).
      const boundaries = [
        { from: 0, to: 1 }, // star chart → invitation
        { from: 3, to: 4 }, // couple story → magical map
        { from: 4, to: 5 }, // map → the big day (clouds clear over the venue)
        { from: 5, to: 6 }, // big day → memories
        { from: 6, to: 7 }, // memories → enchanted RSVP
      ];

      boundaries.forEach((boundary, i) => {
        const trigger = sections[boundary.from];
        const bank = banks[i];
        if (!trigger || !bank) return;
        const direction = i % 2 === 0 ? 1 : -1;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger,
            start: "bottom 62%",
            end: "bottom 160%",
            scrub: 0.5,
          },
        });
        created.push(tl.scrollTrigger);
        tl.set(bank, { xPercent: direction * 46, opacity: 0 })
          .to(bank, { xPercent: direction * -48, opacity: 0.85, duration: 0.48 }, 0)
          .to(bank, { xPercent: direction * -150, opacity: 0, duration: 0.42 }, 0.58);
        // Every crossing carries a faint travelling spark; the map → big day
        // crossing alone gets the full wand streak and the parting clouds.
        const wisp = bank.querySelector("[data-bank-streak]");
        if (wisp) {
          tl.fromTo(
            wisp,
            { xPercent: -70, opacity: 0 },
            { xPercent: 70, opacity: 0.45, duration: 0.2 },
            0.6
          ).to(wisp, { opacity: 0, duration: 0.14 }, 0.8);
        }
        // The page-turn: for the map → big day crossing only, the wand's
        // spark streaks across as the bank dramatically parts to clear.
        if (i === 2) {
          const streak = bank.querySelector("[data-wand-streak]");
          const top = bank.querySelector(`.${styles.blobA}`);
          const bottom = bank.querySelector(`.${styles.blobC}`);
          if (streak) {
            tl.fromTo(
              streak,
              { xPercent: -70, opacity: 0 },
              { xPercent: 70, opacity: 1, duration: 0.2 },
              0.6
            ).to(streak, { opacity: 0, duration: 0.14 }, 0.8);
          }
          if (top) tl.to(top, { yPercent: -38, duration: 0.35 }, 0.58);
          if (bottom) tl.to(bottom, { yPercent: 38, duration: 0.35 }, 0.58);
        }
      });

      return () => {
        created.forEach((st) => st.kill());
      };
    },
    { scope: rootRef, dependencies: [reducedMotion, storyRef] }
  );

  return (
    <div
      ref={rootRef}
      className={styles.root}
      aria-hidden="true"
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={styles.bank}
            data-mist-bank={i}
            data-mist-parity={i % 2 === 0 ? "out" : "in"}
          >
            <span className={`${styles.blob} ${styles.blobA}`} />
            <span className={`${styles.blob} ${styles.blobB}`} />
            <span className={`${styles.blob} ${styles.blobC}`} />
            {i === 2 ? <span className={styles.streak} data-wand-streak /> : null}
            {i !== 2 ? <span className={styles.wisp} data-bank-streak /> : null}
            {i === 2 || i === 4 ? (
              <>
                <span className={`${styles.mote} ${styles.moteA}`} aria-hidden="true">A</span>
                <span className={`${styles.mote} ${styles.moteB}`} aria-hidden="true">M</span>
              </>
            ) : null}
          </div>
        ))}
    </div>
  );
}