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

      if (reducedMotion) {
        gsap.set(q("[data-settle]"), { opacity: 1 });
        gsap.set(q("[data-chart]"), { opacity: 1, scale: 1 });
        gsap.set(q("[data-glint]"), { opacity: 0.8 });
        gsap.set(q("[data-twin]"), { opacity: 1, scale: 1 });
        if (line) line.style.strokeDashoffset = "0";
        gsap.set(q("[data-caption]"), { opacity: 1, y: 0 });
        gsap.set(q("[data-verse]"), { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      // 1. Darkness lifts, candlelight breathes, chart emerges.
      tl.fromTo(q("[data-glow]"), { opacity: 0 }, { opacity: 1, duration: 1 }, 0);
      tl.fromTo(
        q("[data-chart]"),
        { opacity: 0, scale: 1.14 },
        { opacity: 1, scale: 1.04, duration: 2 },
        0.2
      );
      tl.fromTo(q("[data-title]"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1 }, 0.7);

      // 2. Chart stars ignite one field at a time.
      tl.fromTo(q("[data-glint]"), { opacity: 0 }, { opacity: 0.85, duration: 1.2, stagger: 0.03 }, 1.4);

      // 3. The two fated stars flare brighter than the rest.
      tl.fromTo(
        q("[data-twin]"),
        { opacity: 0, scale: 0.4, transformOrigin: "center", transformBox: "fill-box" },
        { opacity: 1, scale: 1, duration: 0.9, stagger: 0.35, ease: "power1.out" },
        2.2
      );

      // 4. A thin antique-gold line joins them — the constellation forms.
      if (line) {
        tl.to(line, { strokeDashoffset: 0, duration: 1.1, ease: "power1.inOut" }, 2.7);
      }
      tl.fromTo(q("[data-caption]"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 3.1);

      // 5. The verse arrives as the camera pushes in.
      tl.to(q("[data-chart]"), { scale: 1.16, duration: 1.6 }, 3.6);
      tl.fromTo(q("[data-verse]"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 3.8);
      tl.fromTo(q("[data-verse-a]"), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7 }, 3.8);
      tl.fromTo(q("[data-verse-b]"), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7 }, 4.15);

      // 6. The chart dissolves into living night sky.
      tl.to(q("[data-chart]"), { opacity: 0, scale: 1.28, filter: "blur(6px)", duration: 1.4 }, 4.9);
      tl.to(q("[data-chart-ui]"), { opacity: 0, duration: 0.8 }, 4.9);
      tl.fromTo(q("[data-night]"), { opacity: 0 }, { opacity: 1, duration: 1.4 }, 5.1);
      tl.to(q("[data-title]"), { opacity: 0, y: -30, duration: 0.8 }, 5.2);
      tl.to(q("[data-caption]"), { opacity: 0, duration: 0.6 }, 5.2);
      tl.to(q("[data-hint]"), { opacity: 0, duration: 0.5 }, 0.6);
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
