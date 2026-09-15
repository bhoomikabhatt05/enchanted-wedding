import { useRef, useState } from "react";
import { journey } from "../../lib/content";
import { images, imageSource } from "../../lib/images";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, useGSAP } from "../../lib/gsap";
import Label from "../../components/Label";
import ScrollCue from "../../components/ScrollCue";
import styles from "./JourneyMap.module.css";

/**
 * Chapter V — "The Journey of Two Stars".
 *
 * The illustrated map is the world, not a background. The visitor scrolls a
 * single continuous journey: a golden thread draws itself up the map to the
 * first meeting, the camera settles, a memory print is found at that place;
 * the print dissolves, the thread continues, the camera travels onward, and
 * so on until the final star. The clouds that carry the visitor into the
 * wedding day arrive as this chapter ends (MistFlow boundary IV → V).
 */

const ROUTE_D =
  "M 204 586 C 130 540, 120 500, 170 460 C 230 412, 300 430, 282 372 C 266 322, 170 330, 158 272 C 148 222, 230 210, 252 164 C 266 130, 230 96, 246 60";

const NODE_FRACTIONS = [0.07, 0.29, 0.51, 0.73, 0.93];

// Scroll windows (normalised 0..1) — every scroll movement earns a change.
//   intro  · to0  · hold0 · to1 · hold1 · to2 · hold2 · to3 · hold3 · to4 · hold4 · fin
const BEATS = [
  [0.0, 0.07],  // 0  the invitation to travel
  [0.07, 0.16], // 1  route draws to the first meeting · camera rises
  [0.16, 0.21], // 2  first print found
  [0.21, 0.31], // 3  print peels · route draws on · camera travels
  [0.31, 0.36], // 4  second print found
  [0.36, 0.46], // 5  ...
  [0.46, 0.51], // 6  third print found
  [0.51, 0.61], // 7  ...
  [0.61, 0.66], // 8  fourth print found
  [0.66, 0.76], // 9  ...
  [0.76, 0.88], // 10 fifth print found (the last star settles)
  [0.88, 1.0],  // 11 the map dims · mist takes over beyond this chapter
];

const TO_INDEX = [1, 3, 5, 7, 9];
const HOLD_INDEX = [2, 4, 6, 8, 10];

const CAM_IDLE = { x: 0, y: 0, s: 1 };

// Where each milestone's star should rest on screen (viewport fractions) and
// how far the camera zooms toward it. Mobile keeps camera movement modest.
const TARGETS_MOBILE = [
  { tx: 0.5, ty: 0.3, s: 1.12 },
  { tx: 0.5, ty: 0.32, s: 1.14 },
  { tx: 0.5, ty: 0.3, s: 1.16 },
  { tx: 0.5, ty: 0.32, s: 1.19 },
  { tx: 0.5, ty: 0.3, s: 1.2 },
];

const TARGETS_DESKTOP = [
  { tx: 0.4, ty: 0.54, s: 1.22 },
  { tx: 0.6, ty: 0.52, s: 1.26 },
  { tx: 0.38, ty: 0.56, s: 1.28 },
  { tx: 0.62, ty: 0.54, s: 1.3 },
  { tx: 0.5, ty: 0.56, s: 1.32 },
];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (v) => v * v * (3 - 2 * v);

function starPoints(outer = 4.6, inner = 2.1) {
  const pts = [];
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((-90 + i * 36) * Math.PI) / 180;
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}
const STAR_D = starPoints();

// Deterministic dust field (seeded at module load — avoids render-time randomness).
const DUST_FIELD = (() => {
  let seed = 0x2f6e2b1;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  return Array.from({ length: 26 }, () => ({
    left: Math.round(rnd() * 96 + 2),
    top: Math.round(rnd() * 88 + 4),
    delay: (rnd() * 10).toFixed(2),
    dur: (11 + rnd() * 14).toFixed(2),
    drift: Math.round((rnd() * 2 - 1) * 18),
  }));
})();

function MapArt({ isStatic, routeRef }) {
  const mapSrc = imageSource(images.map.base);
  return (
    <svg
      className={isStatic ? styles.staticSvg : styles.mapSvg}
      viewBox="0 0 400 620"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
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
        <filter id="journeyBloom" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feColorMatrix values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 0.6 0" />
        </filter>
      </defs>

      {mapSrc ? (
        <image href={mapSrc} x="0" y="0" width="400" height="620" preserveAspectRatio="xMidYMid slice" />
      ) : null}
      <rect x="0" y="0" width="400" height="620" fill="#0b1422" opacity="0.14" />

      <path
        className={isStatic ? styles.staticRouteGlow : styles.routeGlow}
        d={ROUTE_D}
        fill="none"
        stroke="url(#journeyGold)"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#journeyBloom)"
      />
      <path
        ref={routeRef}
        data-route
        className={isStatic ? styles.staticRoute : styles.route}
        d={ROUTE_D}
        fill="none"
        stroke="url(#journeyGold)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {NODE_FRACTIONS.map((f, i) => (
        <MilestoneNode key={i} fraction={f} index={i} routeD={ROUTE_D} isStatic={isStatic} />
      ))}

      {!isStatic ? (
        <circle
          data-traveler
          r="5"
          fill="#fff7dc"
          stroke="#c9a96b"
          strokeWidth="1.2"
          opacity="0"
          filter="url(#journeyBloom)"
        />
      ) : null}
    </svg>
  );
}

function MilestoneNode({ fraction, index, routeD, isStatic }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
      probe.setAttribute("d", routeD);
      const total = probe.getTotalLength();
      const point = probe.getPointAtLength(fraction * total);
      node.setAttribute("transform", `translate(${point.x} ${point.y})`);
    },
    { dependencies: [fraction, routeD] }
  );

  return (
    <g ref={ref} data-map-node={index} className={isStatic ? "" : undefined} opacity="1">
      {isStatic ? null : <circle r="16" fill="url(#journeyNodeGlow)" />}
      <circle r="6.5" fill="#0b1422" stroke="#e8d7b5" strokeWidth="1.4" />
      <circle r="2.4" fill="#ffe9ad" />
      <text y="-20" textAnchor="middle" fill="#e8d7b5" fontSize="11" fontFamily="var(--font-label)" letterSpacing="1">
        {["I", "II", "III", "IV", "V"][index]}
      </text>
    </g>
  );
}

function MapPhoto({ image, alt }) {
  const [failed, setFailed] = useState(false);
  const source = failed ? null : imageSource(image);
  if (!source) {
    return <div className={styles.photoFallback} role="img" aria-label={alt} />;
  }
  return (
    <img
      src={source}
      alt={alt}
      className={styles.photo}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

function Constellation({ active, count }) {
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    const state = i < active ? styles.gStarDone : i === active ? styles.gStarCur : styles.gStarPending;
    stars.push(
      <path key={`s${i}`} d={STAR_D} className={`${styles.gStar} ${state}`.trim()} />
    );
  }
  const ties = [];
  for (let i = 0; i < count - 1; i += 1) {
    ties.push(
      <line
        key={`t${i}`}
        x1={24 * i + 11}
        y1="12"
        x2={24 * i + 25}
        y2="12"
        className={`${styles.gTie} ${i < active ? styles.gTieDone : ""}`.trim()}
      />
    );
  }
  return (
    <svg
    className={styles.constSvg}
    viewBox={`0 0 ${24 * count - 2} 24`}
    data-constellation
    aria-hidden="true"
    focusable="false"
  >
      {ties}
      {stars.map((s, i) => (
        <g key={`g${i}`} transform={`translate(${24 * i + 12} 12)`}>{s}</g>
      ))}
    </svg>
  );
}

export default function JourneyMap() {
  const rootRef = useRef(null);
  const worldRef = useRef(null);
  const routeRef = useRef(null);
  const stageRef = useRef(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();
  const milestones = journey.milestones;

  useGSAP(
    () => {
      const root = rootRef.current;
      const world = worldRef.current;
      const route = routeRef.current;
      const stage = stageRef.current;
      if (!root || !world || !route || !stage) return;
      if (reducedMotion) return;

      const nodes = [...root.querySelectorAll("[data-map-node]")];
      const beacons = [...root.querySelectorAll("[data-beacon]")];
      const prints = [...root.querySelectorAll("[data-print]")];
      const intro = root.querySelector("[data-intro]");
      const closing = root.querySelector("[data-closing]");
      const dusk = root.querySelector("[data-dusk]");
      const traveler = route.ownerSVGElement?.querySelector("[data-traveler]");
      const glowPath = root.querySelector(`.${styles.routeGlow}`);
      const total = route.getTotalLength();

      const state = {
        vw: window.innerWidth,
        vh: window.innerHeight,
        nodeScreen: [],
        cam: [],
      };

      const measure = () => {
        state.vw = window.innerWidth;
        state.vh = window.innerHeight;
        const svg = route.ownerSVGElement;
        const svgRect = svg.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const vbw = svg.viewBox.baseVal.width;
        const vbh = svg.viewBox.baseVal.height;
        // Node positions are computed in stage-local coordinates: the camera
        // targets must not drift as the page (and stage) moves through scroll.
        const scale = Math.max(svgRect.width / vbw, svgRect.height / vbh);
        const ox = svgRect.left - stageRect.left + (svgRect.width - vbw * scale) / 2;
        const oy = svgRect.top - stageRect.top + (svgRect.height - vbh * scale) / 2;
        const targets = state.vw >= 768 ? TARGETS_DESKTOP : TARGETS_MOBILE;
        state.nodeScreen = NODE_FRACTIONS.map((f) => {
          const pt = route.getPointAtLength(f * total);
          return { x: ox + pt.x * scale, y: oy + pt.y * scale };
        });
        state.cam = targets.map((t, i) => ({
          x: t.tx * state.vw - state.nodeScreen[i].x * t.s,
          y: t.ty * state.vh - state.nodeScreen[i].y * t.s,
          s: t.s,
        }));
        // Park each beacon so its glow "belongs" to the star it came from.
        beacons.forEach((b, i) => {
          const t = targets[i];
          b.style.left = `${t.tx * 100}%`;
          b.style.top = `${t.ty * 100}%`;
        });
      };

      // initial paint under controls
      const paint = (p) => {
        const beatAt = (b) => p >= BEATS[b][0] && p < BEATS[b][1];
        const uOf = (b) =>
          clamp01((p - BEATS[b][0]) / (BEATS[b][1] - BEATS[b][0] || 1));

        // ── Camera: travel between resting stars ──
        let cam = CAM_IDLE;
        let hold = -1;
        let travel = -1;
        for (let i = 0; i < 5; i += 1) {
          if (beatAt(HOLD_INDEX[i])) hold = i;
          if (travel === -1 && p >= BEATS[TO_INDEX[i]][0] && p < BEATS[TO_INDEX[i]][1]) travel = i;
        }
        if (hold >= 0) cam = state.cam[hold];
        if (travel >= 0) {
          const u = smooth(uOf(TO_INDEX[travel]));
          const a = travel === 0 ? CAM_IDLE : state.cam[travel - 1];
          const b = state.cam[travel];
          cam = { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, s: a.s + (b.s - a.s) * u };
        }
        if (p >= BEATS[10][0]) cam = state.cam[4];
        gsap.set(world, { x: cam.x, y: cam.y, scale: cam.s });

        // ── The golden thread ──
        let drawn = 0;
        if (p >= BEATS[1][0]) drawn = NODE_FRACTIONS[0];
        for (let i = 1; i < 5; i += 1) {
          const [ta, tb] = BEATS[TO_INDEX[i]];
          if (p < ta) break;
          drawn = NODE_FRACTIONS[i];
          if (p < tb) {
            const u = smooth(uOf(TO_INDEX[i]));
            drawn = NODE_FRACTIONS[i - 1] + (NODE_FRACTIONS[i] - NODE_FRACTIONS[i - 1]) * u;
            break;
          }
        }
        if (p >= BEATS[11][0]) drawn = 1;
        const offset = total * (1 - drawn);
        route.style.strokeDasharray = `${total}`;
        route.style.strokeDashoffset = `${offset}`;
        if (glowPath) {
          glowPath.style.strokeDasharray = `${total}`;
          glowPath.style.strokeDashoffset = `${offset}`;
        }
        if (traveler) {
          if (drawn > 0.002 && drawn < 0.998) {
            const pt = route.getPointAtLength(drawn * total);
            traveler.setAttribute("cx", pt.x);
            traveler.setAttribute("cy", pt.y);
            traveler.setAttribute("opacity", "1");
          } else {
            traveler.setAttribute("opacity", "0");
          }
        }

        // ── Stars awaken as the light reaches them ──
        let current = 0;
        nodes.forEach((n, i) => {
          const lit = drawn + 0.02 >= NODE_FRACTIONS[i];
          if (lit) current = i;
          gsap.set(n, { opacity: lit ? 1 : 0.22, scale: lit ? 1 : 0.72 });
        });
        if (activeRef.current !== current) {
          activeRef.current = current;
          setActive(current);
        }

        // ── Halo gathering around the waking star ──
        beacons.forEach((b, i) => {
          let o = 0;
          if (p >= BEATS[TO_INDEX[i]][0] && p <= BEATS[HOLD_INDEX[i]][1]) {
            const u = uOf(TO_INDEX[i]);
            o = u > 0.3 ? smooth(clamp01((u - 0.3) / 0.7)) : 0;
          }
          const peelWin = i < 4 ? TO_INDEX[i + 1] : 11;
          if (p > BEATS[peelWin][0]) {
            const u = uOf(peelWin);
            o = Math.min(o, 1 - smooth(clamp01(u * 1.5)));
          }
          gsap.set(b, { opacity: o, scale: 0.9 + o * 0.7 });
        });

        // ── Memory prints: found in the hold, peeled away in travel ──
        prints.forEach((pr, i) => {
          const [ha, hb] = BEATS[HOLD_INDEX[i]];
          const [pa, pb] = BEATS[i < 4 ? TO_INDEX[i + 1] : 11];
          let op = 0;
          if (p >= ha && p <= hb) {
            op = smooth(clamp01(((p - ha) / (hb - ha || 1)) * 1.55));
          }
          if (p > pa && p <= pb) {
            const v = clamp01(((p - pa) / (pb - pa || 1)) * 1.4);
            op = Math.min(op, 1 - smooth(v));
          }
          gsap.set(pr, {
            opacity: op,
            y: (1 - op) * 18,
            scale: 0.94 + op * 0.08,
            filter: op >= 1 ? "blur(0px)" : `blur(${(1 - op) * 6}px)`,
          });
        });

        // ── The quiet invitation, then open air ──
        if (intro) gsap.set(intro, { opacity: 1 - smooth(clamp01(p / 0.13)), y: -20 * (p / 0.13) });
        if (closing) gsap.set(closing, { opacity: clamp01((p - 0.8) / 0.07), y: (1 - clamp01((p - 0.8) / 0.07)) * 14 });
        if (dusk) gsap.set(dusk, { opacity: clamp01((p - 0.9) / 0.1) });
      };

      const measureAndRefresh = () => {
        measure();
        paint(0);
        gsap.set(route, { strokeDasharray: `${total}`, strokeDashoffset: `${total}` });
        if (glowPath) gsap.set(glowPath, { strokeDasharray: `${total}`, strokeDashoffset: `${total}` });
      };

      measureAndRefresh();
      window.addEventListener("resize", measureAndRefresh);
      window.addEventListener("orientationchange", measureAndRefresh);

      gsap.to({ p: 0 }, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => paint(self.progress),
        },
      });
      paint(0);

      // Subtle pointer drift for the atmosphere on precise pointers (desktop).
      let clearPointer = () => {};
      if (typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches && state.vw >= 1024) {
        const haze = stage.querySelector(`.${styles.parallax}`);
        if (haze) {
          const qx = gsap.quickTo(haze, "x", { duration: 1.2, ease: "power3.out" });
          const qy = gsap.quickTo(haze, "y", { duration: 1.2, ease: "power3.out" });
          const onMove = (e) => {
            const dx = (e.clientX / window.innerWidth - 0.5) * 2;
            const dy = (e.clientY / window.innerHeight - 0.5) * 2;
            qx(dx * -10);
            qy(dy * -6);
          };
          window.addEventListener("pointermove", onMove);
          clearPointer = () => window.removeEventListener("pointermove", onMove);
        }
      }

      return () => {
        window.removeEventListener("resize", measureAndRefresh);
        window.removeEventListener("orientationchange", measureAndRefresh);
        clearPointer();
      };
    },
    { scope: rootRef, dependencies: [reducedMotion, milestones.length] }
  );

  if (reducedMotion) {
    return (
      <section ref={rootRef} className={styles.scrollStatic} aria-label="Our journey">
        <div className={styles.staticWrap}>
          <Label className={styles.chapter}>{journey.chapter}</Label>
          <h2 className={styles.introLine}>{journey.lede}</h2>
          <div className={styles.staticMap}>
          <MapArt isStatic />
        </div>
          <div className={styles.staticConstel}>
            <Constellation active={milestones.length - 1} count={milestones.length} />
          </div>
          <div className={styles.staticPrints}>
            {milestones.map((m, i) => (
              <figure key={m.year} className={styles.staticPrint}>
                <div className={`${styles.printMedia} ${i % 2 ? styles.tiltRight : styles.tiltLeft}`.trim()}>
                  <MapPhoto image={images.memories[m.photo] ?? images.couple[m.photo]} alt={m.alt} />
                  <span className={styles.printHair} aria-hidden="true" />
                </div>
                <figcaption className={styles.printCopy}>
                  <p className={styles.step}>{m.step} · {m.dateLabel}</p>
                  <h3 className={styles.title}>{m.title}</h3>
                  <p className={styles.annotation}>{m.annotation}</p>
                  <p className={styles.note}>{m.note}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className={styles.staticClosing}>{journey.closing}</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={rootRef} className={styles.scroll} aria-label="Our journey">
      <div className={styles.stage} ref={stageRef}>
        {/* The world — map, thread and stars travel as one. */}
        <div className={styles.world} ref={worldRef} data-world aria-hidden="true">
          <MapArt routeRef={routeRef} />
        </div>

        {/* Beacons of light around the waking stars. */}
        <div className={styles.beacons} aria-hidden="true">
          {milestones.map((m, i) => (
            <span key={m.year} data-beacon={i} className={styles.beacon} />
          ))}
        </div>

        {/* The world breathing. */}
        <div className={styles.parallax} aria-hidden="true">
          <div className={styles.atmosphere}>
            <span className={styles.hazeA} />
            <span className={styles.hazeB} />
            {DUST_FIELD.map((d, i) => (
              <span
                key={i}
                className={styles.dust}
                style={{
                  left: `${d.left}%`,
                  top: `${d.top}%`,
                  animationDelay: `${d.delay}s`,
                  animationDuration: `${d.dur}s`,
                }}
                data-drift={d.drift}
              />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <span key={`tw${i}`} className={styles.twinkle} style={{ left: `${6 + i * 11}%`, top: `${14 + (i % 4) * 13}%` }} />
            ))}
          </div>
        </div>

        {/* The invitation to travel. */}
        <div className={styles.intro} data-intro>
          <Label className={styles.chapter}>{journey.chapter}</Label>
          <h2 className={styles.introLine}>{journey.lede}</h2>
          <div className={styles.cue}>
            <ScrollCue label="Follow the golden thread" />
          </div>
        </div>

        {/* Memories found along the route. */}
        <div className={styles.prints}>
          {milestones.map((m, i) => (
            <figure
              key={m.year}
              className={styles.print}
              data-print={i}
              aria-hidden={i === active ? undefined : "true"}
            >
              <div className={`${styles.printMedia} ${i % 2 ? styles.tiltRight : styles.tiltLeft}`.trim()}>
                <MapPhoto image={images.memories[m.photo] ?? images.couple[m.photo]} alt={m.alt} />
                <span className={styles.printHair} aria-hidden="true" />
              </div>
              <figcaption className={styles.printCopy}>
                <p className={styles.step}>{m.step}</p>
                <h3 className={styles.title}>{m.title}</h3>
                <p className={styles.annotation}>{m.annotation}</p>
                <p className={styles.note}>{m.note}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Closing whisper, then the mist takes over. */}
        <p className={styles.closing} data-closing>
          {journey.closing}
        </p>

        {/* The night settling as the chapter ends. */}
        <div className={styles.dusk} data-dusk aria-hidden="true" />

        {/* The constellation, complete star by star. */}
        <div className={styles.constellation}>
          <Constellation active={active} count={milestones.length} />
        </div>

        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
      </div>
    </section>
  );
}