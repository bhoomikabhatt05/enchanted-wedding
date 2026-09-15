import { useRef, useState } from "react";
import { journey } from "../../lib/content";
import { images, imageSource } from "../../lib/images";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, useGSAP } from "../../lib/gsap";
import StoryImage from "../../components/StoryImage";
import CoupleMotif from "../../components/CoupleMotif";
import Label from "../../components/Label";
import ScrollCue from "../../components/ScrollCue";
import styles from "./JourneyMap.module.css";

const ROUTE_D =
  "M 204 586 C 130 540, 120 500, 170 460 C 230 412, 300 430, 282 372 C 266 322, 170 330, 158 272 C 148 222, 230 210, 252 164 C 266 130, 230 96, 246 60";

const NODE_FRACTIONS = [0.07, 0.29, 0.51, 0.73, 0.93];

/**
 * Chapter V — an enchanted travel journal. The real illustrated map fills the
 * viewport; a golden route draws itself as you scroll, milestones ignite one
 * by one, and each memory photograph is discovered above the map.
 */
export default function JourneyMap() {
  const rootRef = useRef(null);
  const routeRef = useRef(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();
  const mapSrc = imageSource(images.map.base);
  const milestones = journey.milestones;

  useGSAP(
    () => {
      const root = rootRef.current;
      const route = routeRef.current;
      if (!root || !route) return;
      const q = gsap.utils.selector(root);
      const total = route.getTotalLength();

      const updateActive = (index) => {
        if (activeRef.current === index) return;
        activeRef.current = index;
        setActive(index);
      };

      if (reducedMotion) {
        route.style.strokeDasharray = "none";
        route.style.strokeDashoffset = "0";
        gsap.set(q("[data-map-node]"), { opacity: 1, scale: 1 });
        gsap.set(q("[data-traveler]"), { opacity: 0 });
        gsap.set(q("[data-journal-intro]"), { opacity: 1 });
        updateActive(milestones.length - 1);
        return;
      }

      route.style.strokeDasharray = `${total}`;
      route.style.strokeDashoffset = `${total}`;
      gsap.set(q("[data-map-node]"), { opacity: 0.25, scale: 0.7, transformOrigin: "center", transformBox: "fill-box" });

      const travel = { p: 0 };
      const traveler = q("[data-traveler]")[0];
      const progress = q("[data-progress-fill]")[0];

      const render = (p) => {
        const clamped = Math.min(1, Math.max(0, p));
        route.style.strokeDashoffset = `${total * (1 - clamped)}`;
        if (traveler) {
          const point = route.getPointAtLength(clamped * total);
          traveler.setAttribute("cx", point.x);
          traveler.setAttribute("cy", point.y);
          traveler.setAttribute("opacity", clamped > 0.01 && clamped < 0.995 ? "1" : "0");
        }
        if (progress) progress.style.transform = `scaleX(${clamped})`;
        // Illuminate each milestone as the light reaches it.
        const nodes = q("[data-map-node]");
        let current = 0;
        NODE_FRACTIONS.forEach((fraction, i) => {
          const lit = clamped + 0.015 >= fraction;
          if (lit) current = i;
          const node = nodes[i];
          if (node) {
            node.style.opacity = lit ? "1" : "0.25";
            node.style.transform = lit ? "scale(1)" : "scale(0.7)";
          }
        });
        updateActive(current);
      };

      gsap.to(travel, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => render(self.progress),
        },
        onUpdate: () => render(travel.p),
      });
      render(0);

      // The opening journal card yields to the map.
      gsap.fromTo(
        q("[data-journal-intro]"),
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -40,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "12% bottom", scrub: true },
        }
      );
    },
    { scope: rootRef, dependencies: [reducedMotion, milestones.length] }
  );

  return (
    <section ref={rootRef} className={styles.scroll} aria-label="Our journey">
      <div className={styles.viewport}>
        {/* The real illustrated map — route, nodes and light share its space. */}
        <svg className={styles.mapSvg} viewBox="0 0 400 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="journeyGold" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#8a6a3a" />
              <stop offset="0.5" stopColor="#f0d896" />
              <stop offset="1" stopColor="#c9a96b" />
            </linearGradient>
            <radialGradient id="journeyNodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe9ad" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#c9a96b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c9a96b" stopOpacity="0" />
            </radialGradient>
            <filter id="journeyBloom" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feColorMatrix values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 0.6 0" />
            </filter>
          </defs>

          {mapSrc ? (
            <image href={mapSrc} x="0" y="0" width="400" height="620" preserveAspectRatio="xMidYMid slice" />
          ) : null}
          <rect x="0" y="0" width="400" height="620" fill="#0b1422" opacity="0.16" />
          <rect x="0" y="0" width="400" height="620" fill="none" stroke="#c9a96b" strokeWidth="2" opacity="0.35" />

          <path
            ref={routeRef}
            d={ROUTE_D}
            fill="none"
            stroke="url(#journeyGold)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#journeyBloom)"
          />

          {NODE_FRACTIONS.map((f, i) => (
            <MilestoneNode key={i} fraction={f} index={i} routeD={ROUTE_D} />
          ))}

          <circle data-traveler r="5" fill="#fff7dc" stroke="#c9a96b" strokeWidth="1.2" opacity="0" filter="url(#journeyBloom)" />
        </svg>

        <div className={styles.mapShade} aria-hidden="true" />
        <div className={styles.mapGrain} aria-hidden="true" />

        {/* Opening journal header. */}
        <div className={styles.intro} data-journal-intro>
          <Label className={styles.chapter}>{journey.chapter}</Label>
          <h2 className={styles.introLine}>{journey.lede}</h2>
          <div className={styles.cue}>
            <ScrollCue label="Follow the golden thread" />
          </div>
        </div>

        {/* Discovered memories — one journal card at a time. */}
        <div className={`${styles.journal} ${active === milestones.length - 1 ? styles.journalHidden : ""}`.trim()}>
          {milestones.map((m, i) => (
            <article
              key={m.year}
              className={`${styles.card} ${i === active ? styles.cardActive : ""}`.trim()}
              aria-hidden={i === active ? undefined : "true"}
            >
              <div className={`${styles.photoWrap} ${i % 2 ? styles.tiltRight : styles.tiltLeft}`}>
                <StoryImage
                  image={images.memories[m.photo] ?? images.couple[m.photo]}
                  alt={m.alt}
                  tone="night"
                  frame="wide"
                  className={styles.photo}
                />
                <span className={styles.tape} aria-hidden="true" />
                <span className={styles.pin} aria-hidden="true" />
                <span className={styles.year} aria-hidden="true">{m.year}</span>
              </div>
              <div className={styles.cardCopy}>
                <p className={styles.dateLabel}>{m.dateLabel}</p>
                <h3 className={styles.title}>{m.title}</h3>
                <p className={styles.annotation}>{m.annotation}</p>
                <p className={styles.note}>{m.note}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Route progress. */}
        <div className={styles.progress} aria-hidden="true">
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} data-progress-fill />
          </div>
          <div className={styles.progressTicks}>
            {milestones.map((m, i) => (
              <span key={m.year} className={`${styles.tick} ${i <= active ? styles.tickLit : ""}`.trim()} />
            ))}
          </div>
        </div>

        <div
          className={`${styles.closing} ${active === milestones.length - 1 ? styles.closingVisible : ""}`.trim()}
          aria-hidden={active === milestones.length - 1 ? undefined : "true"}
        >
          <CoupleMotif title="" className={styles.closingMotif} />
          <p className={styles.closingLine}>{journey.closing}</p>
        </div>
      </div>
    </section>
  );
}

function MilestoneNode({ fraction, index, routeD }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      // Position the marker exactly on the route by arc length.
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
      probe.setAttribute("d", routeD);
      const total = probe.getTotalLength();
      const point = probe.getPointAtLength(fraction * total);
      node.setAttribute("transform", `translate(${point.x} ${point.y})`);
    },
    { dependencies: [fraction, routeD] }
  );

  return (
    <g ref={ref} data-map-node opacity="0.25">
      <circle r="17" fill="url(#journeyNodeGlow)" />
      <circle r="7.5" fill="#0b1422" stroke="#e8d7b5" strokeWidth="1.6" />
      <circle r="2.6" fill="#ffe9ad" />
      <text y="-24" textAnchor="middle" fill="#e8d7b5" fontSize="11" fontFamily="Cormorant Garamond" letterSpacing="1">
        {["I", "II", "III", "IV", "V"][index]}
      </text>
    </g>
  );
}
