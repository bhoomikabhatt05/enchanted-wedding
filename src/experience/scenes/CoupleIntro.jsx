import { useRef } from "react";
import { duo } from "../../lib/content";
import { images, imageSource } from "../../lib/images";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, useGSAP } from "../../lib/gsap";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import StoryImage from "../../components/StoryImage";
import CoupleMotif from "../../components/CoupleMotif";
import Label from "../../components/Label";
import Divider from "../../components/Divider";
import styles from "./CoupleIntro.module.css";

/**
 * Chapter IV — the storybook page comes alive: the illustration reveals like
 * ink on old paper, then gives way to the real couple.
 */
export default function CoupleIntro() {
  const rootRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const storybookSrc = imageSource(images.illustrations.storybook);

  useScrollReveal(rootRef, { reducedMotion, y: 30, stagger: 0.16 });

  // Ink-on-paper reveal for the storybook illustration.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion) return;
      const page = root.querySelector("[data-storybook]");
      const wash = root.querySelector("[data-ink-wash]");
      if (!page) return;
      gsap.fromTo(
        page,
        { clipPath: "inset(8% 6% 92% 6% round 4px)", opacity: 0.4 },
        {
          clipPath: "inset(0% 0% 0% 0% round 4px)",
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: page,
            start: "top 88%",
            end: "top 38%",
            scrub: true,
          },
        }
      );
      if (wash) {
        gsap.fromTo(
          wash,
          { opacity: 0.85 },
          {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: page,
              start: "top 80%",
              end: "top 40%",
              scrub: true,
            },
          }
        );
      }
      const formal = root.querySelector("[data-formal]");
      if (formal) {
        gsap.fromTo(
          formal,
          { y: 46 },
          {
            y: -46,
            ease: "none",
            scrollTrigger: {
              trigger: formal,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  return (
    <section className={styles.stage} ref={rootRef} aria-label="The two who found each other">
      <div className={styles.sky} aria-hidden="true">
        <div className={styles.haze} />
      </div>

      <div className={styles.content}>
        <Label className={styles.chapter} data-scroll-reveal>
          {duo.chapter}
        </Label>
        <h2 className={styles.title} data-scroll-reveal>
          {duo.title}
        </h2>
        <p className={styles.onceUpon} data-scroll-reveal>
          {duo.onceUpon}
        </p>

        {/* The storybook page — a recurring motif, not decoration. */}
        {storybookSrc ? (
          <figure className={styles.page} data-scroll-reveal>
            <div className={styles.pageInner} data-storybook>
              <img
                src={storybookSrc}
                alt="Vintage storybook illustration of Aarav and Meera"
                className={styles.pageArt}
                loading="lazy"
                decoding="async"
              />
              <div className={styles.inkWash} data-ink-wash aria-hidden="true" />
              <div className={styles.pageGrain} aria-hidden="true" />
            </div>
            <figcaption className={styles.motifCaption}>{duo.motifCaption}</figcaption>
          </figure>
        ) : null}

        <p className={styles.lede} data-scroll-reveal>
          {duo.story}
        </p>

        <div className={styles.editorial}>
          {duo.portraits.map((person, i) => (
            <article key={person.name} className={`${styles.portrait} ${i === 0 ? styles.portraitA : styles.portraitB}`}>
              <div className={styles.frameWrap} data-formal={i === 1 ? true : undefined}>
                <span className={styles.frameOffset} aria-hidden="true" />
                <StoryImage
                  image={images.couple[person.image]}
                  alt={person.alt}
                  tone={i === 0 ? "dreamer" : "adventurer"}
                  frame="portrait"
                  className={styles.portraitArt}
                />
                <span className={styles.frameLine} aria-hidden="true" />
              </div>
              <div className={styles.meta}>
                <p className={styles.epithet} data-scroll-reveal>
                  {person.name} · {person.epithet}
                </p>
                <h3 className={styles.name}>{person.name}</h3>
                <p className={styles.personStory} data-scroll-reveal>
                  {person.story}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.center} data-scroll-reveal>
          <Divider />
          <CoupleMotif className={styles.motif} />
          <p className={styles.mid}>{duo.mid}</p>
        </div>

        <p className={styles.finale} data-scroll-reveal>
          {duo.finale}
        </p>
      </div>
    </section>
  );
}
