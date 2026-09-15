import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../../lib/gsap";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { couple, countdown as countdownCopy } from "../../lib/content";
import Label from "../../components/Label";
import Divider from "../../components/Divider";
import styles from "./Countdown.module.css";

function computeRemaining(targetISO) {
  const target = new Date(targetISO).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/* ── Mechanism geometry ── */

const OUTER_RINGS = [
  { r: 48, stroke: 0.4, opacity: 0.2, dash: "1 6", speed: 1 },
  { r: 45, stroke: 0.3, opacity: 0.15, dash: "0.8 10", speed: -0.7 },
  { r: 42, stroke: 0.5, opacity: 0.18, dash: "2 4", speed: 1.3 },
];

const INNER_RINGS = [
  { r: 36, stroke: 0.35, opacity: 0.22, dash: "1.5 5", speed: -0.5 },
  { r: 33, stroke: 0.3, opacity: 0.16, dash: "0.5 8", speed: 0.8 },
];

const HOUR_MARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
  return {
    x1: 50 + Math.cos(angle) * 38,
    y1: 50 + Math.sin(angle) * 38,
    x2: 50 + Math.cos(angle) * 40.5,
    y2: 50 + Math.sin(angle) * 40.5,
    major: i % 3 === 0,
  };
});

const MINUTE_TICKS = Array.from({ length: 60 }, (_, i) => {
  if (i % 5 === 0) return null;
  const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
  return {
    x1: 50 + Math.cos(angle) * 39,
    y1: 50 + Math.sin(angle) * 39,
    x2: 50 + Math.cos(angle) * 40,
    y2: 50 + Math.sin(angle) * 40,
  };
}).filter(Boolean);

const CELESTIAL_MARKS = [
  { angle: 0, r: 30, size: 1.5 },
  { angle: Math.PI / 2, r: 30, size: 1.5 },
  { angle: Math.PI, r: 30, size: 1.5 },
  { angle: (3 * Math.PI) / 2, r: 30, size: 1.5 },
  { angle: Math.PI / 4, r: 30, size: 1 },
  { angle: (3 * Math.PI) / 4, r: 30, size: 1 },
  { angle: (5 * Math.PI) / 4, r: 30, size: 1 },
  { angle: (7 * Math.PI) / 4, r: 30, size: 1 },
];

const ASTRONOMICAL_MARKS = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * Math.PI * 2,
  kind: i % 3,
}));

const Countdown = forwardRef(function Countdown(_props, ref) {
  const internalRef = useRef(null);
  const sectionRef = ref || internalRef;
  const reducedMotion = usePrefersReducedMotion();
  const [remaining, setRemaining] = useState(() => computeRemaining(couple.dateISO));
  const [ringRotation, setRingRotation] = useState(0);
  const target = useMemo(() => new Date(couple.dateISO).getTime(), []);

  useEffect(() => {
    const tick = () => {
      setRemaining(computeRemaining(couple.dateISO));
      setRingRotation(((Date.now() - target) / 86_400_000) * 12);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  useGSAP(
    () => {
      if (reducedMotion) return;
      const el = typeof ref === "object" ? ref.current : null;
      if (!el) return;
      gsap.set(el.querySelectorAll("[data-countdown-reveal]"), { y: 36, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(el.querySelectorAll("[data-countdown-reveal]"), {
            y: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.14,
            ease: "power3.out",
          });
        },
      });
    },
    { dependencies: [reducedMotion] }
  );

  useGSAP(
    () => {
      if (reducedMotion) return;
      const el = typeof ref === "object" ? ref.current : null;
      if (!el) return;
      const ring = el.querySelector("[data-scroll-rotate]");
      if (!ring) return;
      gsap.fromTo(
        ring,
        { rotation: -8 },
        {
          rotation: 10,
          ease: "none",
          transformOrigin: "50% 50%",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { dependencies: [reducedMotion] }
  );

  return (
    <section ref={sectionRef} className={styles.stage} aria-label="Countdown">
      {/* ── Celestial mechanism ── */}
      <div className={styles.mechanism} aria-hidden="true">
        <svg viewBox="0 0 100 100" className={styles.dial}>
          {/* Outer glow ring */}
          <circle
            cx="50" cy="50" r="49"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.2"
            opacity="0.12"
          />

          {/* Scroll-linked astronomical ring */}
          <g data-scroll-rotate className={styles.zodiac}>
            {ASTRONOMICAL_MARKS.map((mark, i) => {
              const x = 50 + Math.cos(mark.angle) * 44.5;
              const y = 50 + Math.sin(mark.angle) * 44.5;
              if (mark.kind === 0) {
                return (
                  <g key={`astro-${i}`} transform={`translate(${x} ${y})`} opacity="0.34" stroke="currentColor" fill="none">
                    <circle r="1.7" strokeWidth="0.35" />
                    <circle r="0.35" fill="currentColor" stroke="none" />
                  </g>
                );
              }
              if (mark.kind === 1) {
                return (
                  <path
                    key={`astro-${i}`}
                    d={`M ${x + 1.1} ${y - 1.6} A 2 2 0 1 0 ${x + 1.1} ${y + 1.6} A 1.5 1.5 0 1 1 ${x + 1.1} ${y - 1.6} Z`}
                    fill="currentColor"
                    opacity="0.32"
                  />
                );
              }
              return (
                <path
                  key={`astro-${i}`}
                  d={`M ${x} ${y - 1.8} L ${x + 0.45} ${y - 0.45} L ${x + 1.8} ${y} L ${x + 0.45} ${y + 0.45} L ${x} ${y + 1.8} L ${x - 0.45} ${y + 0.45} L ${x - 1.8} ${y} L ${x - 0.45} ${y - 0.45} Z`}
                  fill="currentColor"
                  opacity="0.3"
                />
              );
            })}
          </g>

          {/* Outer rotating rings */}
          {OUTER_RINGS.map((ring, i) => (
            <circle
              key={`outer-${i}`}
              cx="50" cy="50" r={ring.r}
              fill="none"
              stroke="currentColor"
              strokeWidth={ring.stroke}
              strokeDasharray={ring.dash}
              opacity={ring.opacity}
              style={{
                transform: `rotate(${ringRotation * ring.speed}deg)`,
                transformOrigin: "50% 50%",
              }}
            />
          ))}

          {/* Hour marks */}
          {HOUR_MARKS.map((m, i) => (
            <line
              key={`hour-${i}`}
              x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
              stroke="currentColor"
              strokeWidth={m.major ? "0.6" : "0.4"}
              opacity={m.major ? "0.4" : "0.25"}
            />
          ))}

          {/* Minute ticks */}
          {MINUTE_TICKS.map((m, i) => (
            <line
              key={`min-${i}`}
              x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
              stroke="currentColor"
              strokeWidth="0.25"
              opacity="0.15"
            />
          ))}

          {/* Inner rotating rings */}
          {INNER_RINGS.map((ring, i) => (
            <circle
              key={`inner-${i}`}
              cx="50" cy="50" r={ring.r}
              fill="none"
              stroke="currentColor"
              strokeWidth={ring.stroke}
              strokeDasharray={ring.dash}
              opacity={ring.opacity}
              style={{
                transform: `rotate(${ringRotation * ring.speed}deg)`,
                transformOrigin: "50% 50%",
              }}
            />
          ))}

          {/* Celestial markers */}
          {CELESTIAL_MARKS.map((mark, i) => (
            <circle
              key={`cel-${i}`}
              cx={50 + Math.cos(mark.angle) * mark.r}
              cy={50 + Math.sin(mark.angle) * mark.r}
              r={mark.size}
              fill="currentColor"
              opacity="0.3"
            />
          ))}

          {/* Inner decorative circle */}
          <ellipse
            cx="50"
            cy="50"
            rx="27"
            ry="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
            opacity="0.16"
            transform="rotate(-18 50 50)"
          />
          <path
            d="M50 42 L51 49 L58 50 L51 51 L50 58 L49 51 L42 50 L49 49 Z"
            fill="currentColor"
            opacity="0.28"
          />
          <path
            d="M59 39a5 5 0 1 0 3.5 8.5A3.8 3.8 0 1 1 59 39Z"
            fill="currentColor"
            opacity="0.28"
          />
          <circle
            cx="50" cy="50" r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
            opacity="0.18"
          />

          {/* Center hub */}
          <circle cx="50" cy="50" r="2" fill="currentColor" opacity="0.35" />
          <circle cx="50" cy="50" r="1" fill="currentColor" opacity="0.5" />
        </svg>
      </div>

      {/* ── Content ── */}
      <p data-countdown-reveal className={styles.chapter}>
        <Label as="span">{countdownCopy.chapter}</Label>
      </p>

      <p data-countdown-reveal className={styles.eyebrow}>
        <Label as="span">{countdownCopy.eyebrow}</Label>
      </p>

      <h2 data-countdown-reveal className={styles.heading}>
        <span className={styles.script}>{countdownCopy.script}</span>
      </h2>

      <div data-countdown-reveal className={styles.units}>
        <div className={styles.unit}>
          <span className={styles.numeral}>{pad(remaining.days)}</span>
          <span className={styles.unitLabel}>Days</span>
        </div>
        <span className={styles.sep} aria-hidden="true">:</span>
        <div className={styles.unit}>
          <span className={styles.numeral}>{pad(remaining.hours)}</span>
          <span className={styles.unitLabel}>Hours</span>
        </div>
        <span className={styles.sep} aria-hidden="true">:</span>
        <div className={styles.unit}>
          <span className={styles.numeral}>{pad(remaining.minutes)}</span>
          <span className={styles.unitLabel}>Minutes</span>
        </div>
        <span className={styles.sep} aria-hidden="true">:</span>
        <div className={styles.unit}>
          <span className={styles.numeral}>{pad(remaining.seconds)}</span>
          <span className={styles.unitLabel}>Seconds</span>
        </div>
      </div>

      <div data-countdown-reveal className={styles.rule}>
        <Divider />
      </div>

      <p data-countdown-reveal className={styles.quote}>
        {countdownCopy.quote}
      </p>
    </section>
  );
});

export default Countdown;
