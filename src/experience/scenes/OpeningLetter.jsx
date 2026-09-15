import { useRef } from "react";
import { images, imageSource } from "../../lib/images";
import { opening } from "../../lib/content";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, useGSAP } from "../../lib/gsap";
import Label from "../../components/Label";
import ScrollCue from "../../components/ScrollCue";
import styles from "./OpeningLetter.module.css";

const GLINTS = Array.from({ length: 26 }, (_, i) => {
  const x = 40 + ((i * 137 + 53) % 320);
  const y = 60 + ((i * 89 + 31) % 580);
  return { x, y, r: i % 5 === 0 ? 2 : 1.2, delay: `${(i % 9) * 0.4}s` };
});

// The two fated stars on the chart.
const TWIN_A = { x: 148, y: 296 };
const TWIN_B = { x: 252, y: 332 };

/**
 * Chapter I — a scroll-driven cinematic: darkness, candlelight, the antique
 * star chart emerging, two stars igniting, a gold line joining them, then the
 * chart dissolving into the night sky of the story.
 */
export default function StarChartOpening() {
  const rootRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const chartSrc = imageSource(images.illustrations.starChart);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const line = q("[data-beam]")[0];
      let beamLength = 300;
      if (line) {
        beamLength = line.getTotalLength();
        line.style.strokeDasharray = `${beamLength}`;
        line.style.strokeDashoffset = `${beamLength}`;
      }

      const night = q("[data-night]")[0];

      // Hold the copy until the intro calls it in (prevents a pre-chart flash).
      gsap.set(q("[data-title]"), { opacity: 0 });

      if (reducedMotion) {
        gsap.set(q("[data-settle]"), { opacity: 1 });
        gsap.set(q("[data-chart]"), { opacity: 1, scale: 1 });
        gsap.set(q("[data-glint]"), { opacity: 0.8 });
        gsap.set(q("[data-twin]"), { opacity: 1, scale: 1 });
        if (line) line.style.strokeDashoffset = "0";
        gsap.set(q("[data-caption]"), { opacity: 1, y: 0 });
        gsap.set(q("[data-verse]"), { opacity: 1, y: 0 });
        gsap.set(q("[data-hint]"), { opacity: 1 });
        if (night) gsap.set(night, { opacity: 0.45 });
        return;
      }

      // ── Part 1 · Automatic cinematic intro (plays without scrolling) ──
      // Darkness and stars breathe in the first second, then the chart
      // emerges, the fated stars ignite, and the constellation draws itself.
      const intro = gsap.timeline({ defaults: { ease: "power2.out" } });

      intro.fromTo(q("[data-glow]"), { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.15);
      intro.fromTo(
        q("[data-chart]"),
        { opacity: 0, scale: 1.14 },
        { opacity: 1, scale: 1.04, duration: 1.6 },
        0.4
      );
      intro.fromTo(q("[data-title]"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9 }, 1.7);

      // Chart stars ignite in waves.
      intro.fromTo(q("[data-glint]"), { opacity: 0 }, { opacity: 0.85, duration: 1.1, stagger: 0.04 }, 2.1);

      // The two fated stars flare brighter than the rest.
      intro.fromTo(
        q("[data-twin]"),
        { opacity: 0, scale: 0.4, transformOrigin: "center", transformBox: "fill-box" },
        { opacity: 1, scale: 1, duration: 0.9, stagger: 0.35, ease: "power1.out" },
        3.0
      );

      // A thin antique-gold line joins them — the constellation forms.
      if (line) {
        intro.to(line, { strokeDashoffset: 0, duration: 1.0, ease: "power1.inOut" }, 3.7);
      }
      intro.fromTo(q("[data-caption]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.75 }, 4.6);

      // The verse arrives as the camera breathes in.
      intro.to(q("[data-chart]"), { scale: 1.08, duration: 1.4 }, 5.2);
      intro.fromTo(q("[data-verse]"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 5.2);
      intro.fromTo(q("[data-verse-a]"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 5.2);
      intro.fromTo(q("[data-verse-b]"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 5.7);

      // Nudge the candlelight and reveal the scroll cue.
      intro.to(q("[data-glow]"), { opacity: 0.6, duration: 1.2, ease: "sine.inOut" }, 6.0);
      intro.fromTo(q("[data-hint]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 6.3);

      // ── Part 2 · Scroll-driven handoff to the invitation ──
      // Once the intro has played, scrubbing dissolves the chart into the
      // living night sky and hands off smoothly to the hero chapter.
      const scrub = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      scrub.to(q("[data-hint]"), { opacity: 0, duration: 0.2 }, 0.12);
      scrub.to(q("[data-chart]"), { scale: 1.14, duration: 0.3 }, 0);
      scrub.to(q("[data-chart]"), { opacity: 0, scale: 1.28, filter: "blur(6px)", duration: 0.4 }, 0.5);
      scrub.to(q("[data-chart-ui]"), { opacity: 0, duration: 0.25 }, 0.55);
      scrub.fromTo(night, { opacity: 0.35 }, { opacity: 1, duration: 0.4 }, 0.55);
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  return (
    <section ref={rootRef} className={styles.scroll} aria-label="The star chart">
      <div className={styles.viewport}>
        <div className={styles.darkness} aria-hidden="true" />
        <div className={styles.glow} data-glow aria-hidden="true">
          <span className={styles.flame} />
        </div>

        {/* Night sky that the chart dissolves into. */}
        <div className={styles.night} data-night aria-hidden="true">
          {Array.from({ length: 40 }, (_, i) => (
            <span
              key={i}
              className={styles.nightStar}
              style={{
                top: `${(i * 37 + 11) % 100}%`,
                left: `${(i * 53 + 7) % 100}%`,
                width: i % 6 === 0 ? 2 : 1,
                height: i % 6 === 0 ? 2 : 1,
                animationDelay: `${(i % 8) * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* The antique chart + its living stars share one SVG space so the
            constellation always sits exactly on the artwork. */}
        <div className={styles.chartWrap} data-chart aria-hidden="true">
          <svg className={styles.chartSvg} viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="openingTwinGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff7dc" stopOpacity="1" />
                <stop offset="30%" stopColor="#f4e7c4" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#c9a96b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#c9a96b" stopOpacity="0" />
              </radialGradient>
              <filter id="openingBloom" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feColorMatrix values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 0.6 0" />
              </filter>
            </defs>

            {chartSrc ? (
              <image
                href={chartSrc}
                x="0"
                y="0"
                width="400"
                height="700"
                preserveAspectRatio="xMidYMid slice"
                opacity="0.96"
              />
            ) : null}

            <g data-glint-group>
              {GLINTS.map((s, i) => (
                <circle key={i} data-glint cx={s.x} cy={s.y} r={s.r} fill="#f4e7c4" opacity="0" />
              ))}
            </g>

            {[TWIN_A, TWIN_B].map((s, i) => (
              <g key={i}>
                <circle data-twin cx={s.x} cy={s.y} r="26" fill="url(#openingTwinGlow)" opacity="0" />
                <path
                  data-twin
                  d={`M ${s.x - 10} ${s.y} H ${s.x + 10} M ${s.x} ${s.y - 10} V ${s.y + 10}`}
                  stroke="#e8d7b5"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0"
                />
                <circle
                  data-twin
                  cx={s.x}
                  cy={s.y}
                  r="4.4"
                  fill="#fff7dc"
                  stroke="#c9a96b"
                  strokeWidth="1"
                  opacity="0"
                  filter="url(#openingBloom)"
                />
              </g>
            ))}

            <path
              data-beam
              d={`M ${TWIN_A.x} ${TWIN_A.y} L ${TWIN_B.x} ${TWIN_B.y}`}
              fill="none"
              stroke="#c9a96b"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.95"
              filter="url(#openingBloom)"
            />
          </svg>
          <div className={styles.chartShade} />
        </div>

        <div className={styles.copy} data-chart-ui>
          <div data-title data-settle>
            <p className={styles.eyebrow}>
              <Label as="span">{opening.chapter}</Label>
            </p>
            <p className={styles.names}>{opening.title}</p>
          </div>

          <p className={styles.caption} data-caption data-settle>
            <span>TWO STARS.</span>
            <span>ONE STORY.</span>
          </p>

          <div className={styles.verse} data-verse data-settle>
            <p data-verse-a>{opening.verse[0]}</p>
            <p data-verse-b className={styles.verseGold}>{opening.verse[1]}</p>
          </div>
        </div>

        <div className={styles.hint} data-hint aria-hidden="true">
          <ScrollCue label={opening.scrollHint} />
        </div>

        <div className={styles.vignette} aria-hidden="true" />
      </div>
    </section>
  );
}
