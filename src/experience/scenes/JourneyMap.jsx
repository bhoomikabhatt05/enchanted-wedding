import { Fragment, useRef, useState } from "react";
import { journey } from "../../lib/content";
import { images, imageSource } from "../../lib/images";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap";
import StoryImage from "../../components/StoryImage";
import Label from "../../components/Label";
import MoonPhase from "../../components/MoonPhase";
import ScrollCue from "../../components/ScrollCue";
import styles from "./JourneyMap.module.css";

/**
 * Chapter V — The Journey of Two Stars.
 *
 * A stable, full-bleed enchanted map. The artwork (1408x768) always covers
 * the stage (slice) — no camera, no pan, no zoom. One scroll progress draws
 * the golden thread, lights five star markers, and cross-fades words and
 * memory prints that are anchored next to their map locations. A whisper of
 * drift, light, mist and dust is the only other motion.
 *
 * Two route geometries: a west→east journey for landscape viewports and a
 * south→north ascent for portrait ones, so the active region is never
 * cropped on any screen.
 */
const MAP_W = 1408;
const MAP_H = 768;

const WIDE = {
  route:
    "M 230 440 C 274 422, 412 335, 495 330 C 578 325, 652 410, 730 410 C 808 410, 892 327, 965 330 C 1038 333, 1136 413, 1170 430",
  fractions: [0, 0.283, 0.529, 0.774, 1],
  notes: [
    { i: 0, text: "the first hello", x: 230, y: 502 },
    { i: 2, text: "the little moments", x: 730, y: 472 },
    { i: 3, text: "between then and now", x: 965, y: 392 },
    { i: 4, text: "countless nights", x: 1170, y: 372 },
  ],
  // Soft pools where the illustrated lanterns breathe as the story passes.
  lanterns: [
    { x: 150, y: 520, r: 90 },
    { x: 575, y: 265, r: 80 },
    { x: 815, y: 475, r: 85 },
    { x: 890, y: 395, r: 80 },
    { x: 1255, y: 490, r: 85 },
  ],
  wand: { x: 1290, y: 690 },
  compass: { x: 118, y: 112 },
  sparkles: [
    [350, 180, 0.55],
    [1150, 600, 0.5],
    [1050, 150, 0.45],
  ],
};

const TALL = {
  route:
    "M 640 610 C 662 588, 772 522, 770 480 C 768 438, 630 400, 630 360 C 630 320, 765 278, 770 240 C 775 202, 678 148, 660 130",
  fractions: [0, 0.258, 0.52, 0.78, 1],
  notes: [
    { i: 0, text: "the first hello", x: 640, y: 666 },
    { i: 2, text: "the little moments", x: 630, y: 416 },
    { i: 3, text: "between then and now", x: 770, y: 296 },
    { i: 4, text: "countless nights", x: 660, y: 186 },
  ],
  lanterns: [
    { x: 575, y: 665, r: 80 },
    { x: 845, y: 425, r: 75 },
    { x: 560, y: 420, r: 80 },
    { x: 845, y: 295, r: 75 },
    { x: 735, y: 190, r: 80 },
  ],
  wand: { x: 830, y: 700 },
  compass: { x: 600, y: 92 },
  sparkles: [
    [838, 560, 0.5],
    [572, 250, 0.45],
    [700, 706, 0.5],
  ],
};

// A four-pointed star, drawn around each milestone marker's origin.
const STAR_D =
  "M0 -11 C 1.6 -3.2, 3.2 -1.6, 11 0 C 3.2 1.6, 1.6 3.2, 0 11 C -1.6 3.2, -3.2 1.6, -11 0 C -3.2 -1.6, -1.6 -3.2, 0 -11 Z";

// The thread completes just before the section ends so the finale (dusk,
// closing line, mist handoff) has room to breathe.
const ROUTE_END = 0.94;
// Milestones awaken just before the thread reaches them.
const AWAKEN_LEAD = 0.06;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function JourneyMap() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const routeRef = useRef(null);
  const lightRef = useRef(null);
  const mistRef = useRef(null);
  const duskRef = useRef(null);
  const introRef = useRef(null);
  const introLabelRef = useRef(null);
  const introLedeRef = useRef(null);
  const introCueRef = useRef(null);
  const wordsRef = useRef(null);
  const closingRef = useRef(null);
  const ticksRef = useRef(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();
  const mapSrc = imageSource(images.map.base);
  const milestones = journey.milestones;
  const [wide, setWide] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth / window.innerHeight >= 1
  );
  const layout = wide ? WIDE : TALL;

  useGSAP(
    () => {
      const root = rootRef.current;
      const route = routeRef.current;
      if (!root || !route) return;
      if (reducedMotion) return;

      const q = gsap.utils.selector(root);
      const total = route.getTotalLength();
      const glowPath = q("[data-route-glow]")[0];
      const shimmer = q("[data-route-shimmer]")[0];
      const traveler = q("[data-traveler]")[0];
      const progress = q("[data-progress-fill]")[0];
      const wand = q("[data-wand]")[0];
      const wandArm = q("[data-wand-arm]")[0];
      const wandArc = q("[data-wand-arc]")[0];
      const wandSpark = q("[data-wand-spark]")[0];
      const wandTip = q("[data-wand-tip]")[0];
      const arcLen = wandArc ? wandArc.getTotalLength() : 0;
      if (wandArc && arcLen > 0) {
        wandArc.style.strokeDasharray = `${arcLen}`;
        wandArc.style.strokeDashoffset = `${arcLen}`;
      }
      let lastFlare = -1;
      const light = lightRef.current;
      const mist = mistRef.current;
      const dusk = duskRef.current;
      const intro = introRef.current;
      const introLabel = introLabelRef.current;
      const introLede = introLedeRef.current;
      const introCue = introCueRef.current;
      const words = wordsRef.current;
      const closing = closingRef.current;
      const prints = q("[data-prints]")[0];
      const ticks = ticksRef.current;
      const mq = window.matchMedia("(min-aspect-ratio: 1/1)");
      const onLayout = (e) => setWide(e.matches);
      if (mq.addEventListener) mq.addEventListener("change", onLayout);
      else if (mq.addListener) mq.addListener(onLayout);

      const updateActive = (index) => {
        if (activeRef.current === index) return;
        activeRef.current = index;
        setActive(index);
      };

      route.style.strokeDasharray = `${total}`;
      route.style.strokeDashoffset = `${total}`;
      if (glowPath) {
        glowPath.style.strokeDasharray = `${total}`;
        glowPath.style.strokeDashoffset = `${total}`;
      }

      // Anchor every memory print beside its own star. Positions are measured
      // live from the rendered nodes, so prints track the map on any screen.
      const placePrints = () => {
        const stage = stageRef.current;
        const wordsEl = wordsRef.current;
        const ticksEl = ticksRef.current;
        if (!stage || !wordsEl) return;
        const stageRect = stage.getBoundingClientRect();
        const W = stageRect.width;
        const H = stageRect.height;
        const m = 18;
        const titleB = wordsEl.getBoundingClientRect().bottom - stageRect.top + 10;
        const ticksT = ticksEl
          ? ticksEl.getBoundingClientRect().top - stageRect.top - 10
          : H - 56;
        const nodes = q("[data-map-node]");
        const figs = q("[data-print-fig]");
        nodes.forEach((node, i) => {
          const fig = figs[i];
          if (!node || !fig) return;
          const nr = node.getBoundingClientRect();
          const cx = nr.left + nr.width / 2 - stageRect.left;
          const cy = nr.top + nr.height / 2 - stageRect.top;
          const pw = fig.offsetWidth;
          const ph = fig.offsetHeight;
          if (!pw || !ph) return;
          const coversNode = (l, t) =>
            cx > l + 10 && cx < l + pw - 10 && cy > t + 10 && cy < t + ph - 10;
          const valid = (l, t) =>
            l >= m && l + pw <= W - m && t >= titleB && t + ph <= ticksT && !coversNode(l, t);
          const below = { l: cx - pw / 2, t: cy + 44 };
          const above = { l: cx - pw / 2, t: cy - 44 - ph };
          const right = { l: cx + 40, t: cy - ph / 2 };
          const left = { l: cx - 40 - pw, t: cy - ph / 2 };
          // Clamped variants keep the preferred relationship while sliding
          // into the viewport.
          const clampL = (l) => clamp(l, m, Math.max(m, W - m - pw));
          const clampT = (t) => clamp(t, titleB, Math.max(titleB, ticksT - ph));
          const belowC = { l: clampL(below.l), t: below.t };
          const aboveC = { l: clampL(above.l), t: above.t };
          const rightC = { l: right.l, t: clampT(right.t) };
          const leftC = { l: left.l, t: clampT(left.t) };
          const sides = i % 2
            ? [left, right, leftC, rightC]
            : [right, left, rightC, leftC];
          // Per-milestone manners: 01 leans inward/up away from the forest
          // edge, 05 leans inward away from the closing edge.
          const order =
            i === 0
              ? [right, above, aboveC, below, belowC, left, leftC, rightC]
              : i === milestones.length - 1
                ? [left, below, belowC, above, aboveC, right, leftC, rightC]
                : [below, above, belowC, aboveC, ...sides];
          const pick =
            order.find((c) => valid(c.l, c.t)) ||
            ({ l: clampL(below.l), t: clampT(below.t) });
          fig.style.left = `${pick.l.toFixed(1)}px`;
          fig.style.top = `${pick.t.toFixed(1)}px`;
        });
      };

      const render = (p) => {
        const progressClamped = clamp01(p);
        // The thread draws across most of the chapter, then rests.
        const drawn = clamp01(progressClamped / ROUTE_END);
        route.style.strokeDashoffset = `${total * (1 - drawn)}`;
        if (glowPath) glowPath.style.strokeDashoffset = `${total * (1 - drawn)}`;
        if (traveler) {
          const point = route.getPointAtLength(drawn * total);
          traveler.setAttribute("cx", point.x);
          traveler.setAttribute("cy", point.y);
          traveler.setAttribute("opacity", drawn > 0.01 && drawn < 0.995 ? "1" : "0");
        }
        if (progress) progress.style.transform = `scaleX(${drawn})`;

        // Enchanted footprints trail the traveler, fading behind them.
        // Attribute transforms only — never CSS transforms on SVG.
        const headLen = drawn * total;
        q("[data-footstep]").forEach((step, k, steps) => {
          const d = headLen - (k + 1) * 46;
          if (d < 10) {
            step.style.opacity = "0";
            return;
          }
          const pt = route.getPointAtLength(d);
          const ahead = route.getPointAtLength(Math.min(d + 6, total));
          const ang = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
          step.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
          step.style.opacity = `${(0.5 * (1 - k / steps.length)).toFixed(3)}`;
        });

        // Shimmer tail: the last stretch of thread glows brighter, so the
        // story feels physically present at its leading edge.
        if (shimmer) {
          const head = drawn * total;
          const tail = total * 0.055;
          shimmer.style.strokeDasharray = `${tail.toFixed(1)} ${total.toFixed(1)}`;
          shimmer.style.strokeDashoffset = `${(total - head).toFixed(1)}`;
          shimmer.style.opacity = drawn > 0.02 && drawn < 0.995 ? "0.85" : "0";
        }

        // Stars awaken as the thread approaches; past stars stay softly lit.
        // Opacity only — never CSS transforms on SVG nodes (Chromium
        // misplaces them when transform-box/scale is involved).
        let current = 0;
        q("[data-map-node]").forEach((node, i) => {
          const lit = drawn + AWAKEN_LEAD >= layout.fractions[i];
          if (lit) current = i;
          node.style.opacity = lit ? "1" : "0.25";
          if (lit && i === current) node.setAttribute("data-current", "true");
          else node.removeAttribute("data-current");
        });
        updateActive(current);

        // Activation flare: a halo expands once as each star awakens.
        if (current !== lastFlare) {
          lastFlare = current;
          try {
            q("[data-flare-ring]")[current]
              ?.querySelectorAll("animate")
              .forEach((anim) => anim.beginElement());
          } catch {
            // SMIL unavailable — the glow still carries the moment.
          }
        }

        // Marginalia: the active memory's name is inked bright, the previous
        // one lingers faintly, the rest rest. Never more than two prominent.
        q("[data-marginalia]").forEach((note) => {
          const i = Number(note.getAttribute("data-i") || 0);
          note.style.opacity = i === current ? "0.95" : i === current - 1 ? "0.45" : "0";
        });

        // Lantern regions breathe as the thread passes: bright while the
        // story is near, a low warm remainder once it has passed by.
        q("[data-lantern]").forEach((lamp, j) => {
          const f = layout.fractions[j];
          const prox = Math.exp(-((drawn - f) ** 2) / (2 * 0.11 ** 2));
          lamp.style.opacity = `${(0.5 * prox + (drawn > f ? 0.14 : 0)).toFixed(3)}`;
        });

        // The five stars briefly join into one constellation at the finale.
        q("[data-const-line]").forEach((line) => {
          const len = parseFloat(line.dataset.len || "0");
          const w = clamp01((progressClamped - 0.93) / 0.05);
          const out = 1 - clamp01((progressClamped - 0.982) / 0.018);
          if (len > 0) line.style.strokeDashoffset = `${(len * (1 - w)).toFixed(1)}`;
          line.style.opacity = `${(w * 0.7 * out).toFixed(3)}`;
        });

        // Whisper drift on light and mist only — the map itself is perfectly
        // still, so cover edges can never show.
        if (light)
          light.style.transform = `translate3d(${(-30 + progressClamped * 60).toFixed(1)}px, 0, 0)`;
        if (mist) {
          mist.style.transform = `translate3d(${(-progressClamped * 48).toFixed(2)}px, 0, 0)`;
          // Light mist passes while travelling between milestones, then clears.
          const fa = layout.fractions[current];
          const fb = layout.fractions[Math.min(current + 1, layout.fractions.length - 1)];
          const span = Math.max(fb - fa, 0.001);
          const t = clamp01((drawn - fa) / span);
          mist.style.opacity = `${(0.35 + 0.25 * Math.sin(Math.PI * t)).toFixed(3)}`;
        }

        // The wand exists for one page-turn only: it enters, makes a single
        // movement, looses its spark across the dark, and is gone with the mist.
        if (wand) {
          const wIn = clamp01((progressClamped - 0.925) / 0.02);
          const wOut = 1 - clamp01((progressClamped - 0.982) / 0.018);
          wand.style.opacity = `${(wIn * wOut).toFixed(3)}`;
          if (wandArm) {
            const sweep = Math.sin(Math.PI * clamp01((progressClamped - 0.938) / 0.045));
            wandArm.setAttribute("transform", `rotate(${(-16 * sweep).toFixed(2)} 0 0)`);
          }
          if (wandTip) wandTip.style.opacity = `${(wIn * (0.4 + 0.6 * clamp01((progressClamped - 0.93) / 0.03))).toFixed(3)}`;
          if (wandArc && arcLen > 0) {
            const a = clamp01((progressClamped - 0.945) / 0.03);
            wandArc.style.strokeDashoffset = `${(arcLen * (1 - a)).toFixed(1)}`;
          }
          if (wandSpark && arcLen > 0) {
            const s = clamp01((progressClamped - 0.962) / 0.03);
            let sx = 0;
            let sy = 0;
            if (s <= 0.45 && s > 0) {
              const tip = wandArc.getPointAtLength((s / 0.45) * arcLen);
              sx = tip.x;
              sy = tip.y;
            } else if (s > 0.45) {
              const end = wandArc.getPointAtLength(arcLen);
              const u = (s - 0.45) / 0.55;
              sx = end.x + 170 * u;
              sy = end.y - 30 * u;
            }
            wandSpark.setAttribute("cx", sx.toFixed(1));
            wandSpark.setAttribute("cy", sy.toFixed(1));
            wandSpark.setAttribute("opacity", s > 0 && s < 1 ? "1" : "0");
          }
        }

        // Chapter opening, staged like a title card: chapter marker first,
        // then the lede, then the cue — then all of it lifts away BEFORE
        // the first milestone's words arrive. Never two titles at once.
        if (intro) {
          if (introLabel) introLabel.style.opacity = `${clamp01(progressClamped / 0.02).toFixed(3)}`;
          if (introLede) introLede.style.opacity = `${clamp01((progressClamped - 0.015) / 0.035).toFixed(3)}`;
          if (introCue) introCue.style.opacity = `${clamp01((progressClamped - 0.04) / 0.025).toFixed(3)}`;
          const t = clamp01((progressClamped - 0.07) / 0.04);
          intro.style.opacity = `${1 - t}`;
          intro.style.transform = `translate3d(0, ${(-34 * t).toFixed(1)}px, 0)`;
          intro.style.visibility = t >= 1 ? "hidden" : "visible";
        }
        if (words) {
          const fadeIn = clamp01((progressClamped - 0.1) / 0.05);
          // The words leave well before the page turns, so the finale
          // belongs to the closing line alone.
          const fadeOut = clamp01((progressClamped - 0.9) / 0.04);
          words.style.opacity = `${fadeIn * (1 - fadeOut)}`;
          words.style.visibility = fadeIn > 0 && fadeOut < 1 ? "visible" : "hidden";
        }
        if (dusk) dusk.style.opacity = `${(clamp01((progressClamped - 0.85) / 0.15) * 0.6).toFixed(3)}`;
        if (closing) {
          const t = clamp01((progressClamped - 0.9) / 0.045);
          // The closing line has its moment, then leaves with margin to
          // spare — scrub lag must never strand it past the turn.
          const out = 1 - clamp01((progressClamped - 0.95) / 0.035);
          closing.style.opacity = `${(t * out).toFixed(3)}`;
          closing.style.visibility = t > 0 && out > 0 ? "visible" : "hidden";
        }
        // Page-turn: prints and progress arrive only once the title has
        // yielded, and dissolve before the section releases.
        const enter = clamp01((progressClamped - 0.05) / 0.05);
        const exit = 1 - clamp01((progressClamped - 0.945) / 0.035);
        if (prints) prints.style.opacity = `${(enter * exit).toFixed(3)}`;
        if (ticks) ticks.style.opacity = `${(enter * exit).toFixed(3)}`;
      };

      gsap.to(
        { p: 0 },
        {
          p: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => render(self.progress),
          },
        }
      );
      render(0);
      // Nodes position in child effects; prints anchor after paint settles.
      requestAnimationFrame(() => requestAnimationFrame(placePrints));

      const onResize = () => {
        placePrints();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      // Prints change size as photographs load — re-anchor whenever any
      // print, the title block, or the ticks change size.
      let ro = null;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => placePrints());
        q("[data-print-fig]").forEach((fig) => ro.observe(fig));
        if (words) ro.observe(words);
        const ticks = ticksRef.current;
        if (ticks) ro.observe(ticks);
      }

      // Late artwork above can shift trigger positions after measure (a lazy
      // image swelling an earlier chapter moves this chapter's start).
      // Re-sync — debounced — whenever any resource finishes loading.
      let refreshTimer = 0;
      const refreshTriggers = () => {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => {
          ScrollTrigger.refresh();
          placePrints();
        }, 200);
      };
      window.addEventListener("load", refreshTriggers);
      document.addEventListener("load", refreshTriggers, true);
      if (document.fonts?.ready) document.fonts.ready.then(refreshTriggers).catch(() => {});
      return () => {
        window.clearTimeout(refreshTimer);
        window.removeEventListener("load", refreshTriggers);
        document.removeEventListener("load", refreshTriggers, true);
        window.removeEventListener("resize", onResize);
        if (ro) ro.disconnect();
        if (mq.removeEventListener) mq.removeEventListener("change", onLayout);
        else if (mq.removeListener) mq.removeListener(onLayout);
      };
    },
    { scope: rootRef, dependencies: [reducedMotion, milestones.length, wide] }
  );

  if (reducedMotion) {
    return (
      <section ref={rootRef} className={styles.static} aria-label="Our journey">
        <div className={styles.staticInner}>
          <Label className={styles.chapter} sigil><MoonPhase phase="half" />{journey.chapter}</Label>
          <h2 className={styles.lede}>{journey.lede}</h2>
          <div className={styles.staticMap}>
            <MapArt routeRef={routeRef} mapSrc={mapSrc} litAll layout={WIDE} notesOpacity={0.85} />
          </div>
          <div className={styles.staticPrints}>
            {milestones.map((m) => (
              <figure key={m.year} className={styles.staticPrint}>
                <StoryImage
                  image={images.memories[m.photo] ?? images.couple[m.photo]}
                  alt={m.alt}
                  tone="night"
                  frame="wide"
                />
                <figcaption>
                  <p className={styles.printStep}>{m.step} · {m.dateLabel}</p>
                  <p className={styles.printTitle}>{m.title}</p>
                  <p className={styles.printNote}>{m.annotation}</p>
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
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.backdrop} aria-hidden="true" />

        <div className={styles.mapDrift} aria-hidden="true">
          <MapArt routeRef={routeRef} mapSrc={mapSrc} litAll={false} layout={layout} notesOpacity={0} />
        </div>

        <div ref={lightRef} className={styles.mapLight} aria-hidden="true" />
        <div className={`${styles.candle} ${styles.candleBreathe}`} aria-hidden="true" />
        <div ref={mistRef} className={styles.mist} aria-hidden="true" />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />
        <div ref={duskRef} className={styles.dusk} data-dusk aria-hidden="true" />

        {/* Opening words — the map is already visible behind them. */}
        <header ref={introRef} className={styles.intro} data-intro>
          <div ref={introLabelRef} data-intro-label>
            <Label className={styles.chapter} sigil><MoonPhase phase="half" />{journey.chapter}</Label>
          </div>
          <h2 ref={introLedeRef} data-intro-lede className={styles.lede}>{journey.lede}</h2>
          <div ref={introCueRef} data-intro-cue className={styles.cue}>
            <ScrollCue label="Follow the golden thread" />
          </div>
        </header>

        {/* Milestone words — one composition, cross-fading content. */}
        <div ref={wordsRef} className={styles.words} data-words>
          {milestones.map((m, i) => (
            <div
              key={m.year}
              className={`${styles.word} ${i === active ? styles.wordActive : ""}`.trim()}
              aria-hidden={i === active ? undefined : "true"}
            >
              <p className={styles.step}>{m.step}</p>
              <h3 className={`${styles.title} ${styles.inkTitle}`}>{m.title}</h3>
              <p className={styles.annotation}>{m.annotation}</p>
              <p className={styles.note}>{m.note}</p>
            </div>
          ))}
        </div>

        {/* Closing line arrives with the dusk. */}
        <p ref={closingRef} className={styles.closing} data-closing>
          {journey.closing}
        </p>

        {/* Memory prints — each anchored beside its own star. */}
        <div className={styles.prints} data-prints>
          {milestones.map((m, i) => (
            <figure
              key={m.year}
              data-print-fig={i}
              className={`${styles.print} ${i === active ? styles.printActive : ""} ${i % 2 ? styles.tiltRight : styles.tiltLeft}`.trim()}
              aria-hidden={i === active ? undefined : "true"}
            >
              <div className={styles.printFrame}>
                <StoryImage
                  image={images.memories[m.photo] ?? images.couple[m.photo]}
                  alt={i === active ? m.alt : ""}
                  tone="night"
                  frame="wide"
                />
              </div>
              <figcaption className={styles.printCaption}>
                <span className={styles.printYear}>{m.year}</span>
                <span className={styles.printMeta}>{m.step} · {m.dateLabel}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* A tiny constellation being completed — not pagination. */}
        <div ref={ticksRef} className={styles.progress} aria-hidden="true">
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} data-progress-fill />
          </div>
          <div className={styles.progressTicks}>
            {milestones.map((m, i) => (
              <Fragment key={m.year}>
                {i > 0 ? <span className={styles.link} /> : null}
                <span
                  className={`${styles.star} ${i < active ? styles.starDone : ""} ${i === active ? styles.starNow : ""}`.trim()}
                >
                  ✦
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MapArt({ routeRef, mapSrc, litAll, layout, notesOpacity }) {
  return (
    <svg
      className={styles.mapSvg}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="An illustrated magical map with a golden thread passing through five stars"
    >
      <defs>
        <linearGradient id="journeyGold" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6a3a" />
          <stop offset="0.5" stopColor="#f0d896" />
          <stop offset="1" stopColor="#c9a96b" />
        </linearGradient>
        <radialGradient id="journeyNodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9ad" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#c9a96b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c9a96b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="journeyLantern" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f2c979" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#e8a94e" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#e8a94e" stopOpacity="0" />
        </radialGradient>
        <filter id="journeyBloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feColorMatrix values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 0.55 0" />
        </filter>
      </defs>

      {mapSrc ? (
        <image href={mapSrc} x="0" y="0" width={MAP_W} height={MAP_H} preserveAspectRatio="none" />
      ) : null}
      <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#0b1422" opacity="0.14" />

      <path
        data-route-glow
        d={layout.route}
        fill="none"
        stroke="#e8c87e"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.22"
        filter="url(#journeyBloom)"
      />
      <path
        ref={routeRef}
        data-route
        d={layout.route}
        fill="none"
        stroke="url(#journeyGold)"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.95"
      />

      {layout.fractions.map((f, i) => (
        <MilestoneNode key={i} fraction={f} routeD={layout.route} lit={litAll} pulse={!litAll} />
      ))}

      {/* Lantern regions breathe as the story passes through them. */}
      {layout.lanterns.map((lamp, j) => (
        <circle
          key={j}
          data-lantern
          cx={lamp.x}
          cy={lamp.y}
          r={lamp.r}
          fill="url(#journeyLantern)"
          opacity="0"
        />
      ))}

      <Constellation fractions={layout.fractions} routeD={layout.route} />

      {/* A quiet compass and a few hand-drawn stars — the map's furniture. */}
      <g opacity="0.5" aria-hidden="true">
        <circle cx={layout.compass.x} cy={layout.compass.y} r="30" fill="none" stroke="#c9a96b" strokeWidth="1" />
        <circle cx={layout.compass.x} cy={layout.compass.y} r="24" fill="none" stroke="#c9a96b" strokeWidth="0.75" opacity="0.7" />
        <path
          d={`M ${layout.compass.x} ${layout.compass.y - 26} L ${layout.compass.x + 5} ${layout.compass.y + 8} L ${layout.compass.x} ${layout.compass.y + 2} L ${layout.compass.x - 5} ${layout.compass.y + 8} Z`}
          fill="#e8d7b5"
          opacity="0.9"
        />
        <circle cx={layout.compass.x} cy={layout.compass.y} r="2" fill="#e8d7b5" />
      </g>
      {layout.sparkles.map(([sx, sy, ss], k) => (
        <path
          key={k}
          d={STAR_D}
          transform={`translate(${sx} ${sy}) scale(${ss})`}
          fill="#e8d7b5"
          opacity="0.35"
          aria-hidden="true"
        />
      ))}

      {layout.notes.map((note) => (
        <text
          key={note.text}
          data-marginalia
          data-i={note.i}
          x={note.x}
          y={note.y}
          textAnchor="middle"
          fill="#e8d7b5"
          fontSize="25"
          fontFamily="Italianno, Snell Roundhand, cursive"
          letterSpacing="1"
          opacity={notesOpacity}
          transform={`rotate(-3 ${note.x} ${note.y})`}
          stroke="#0b1422"
          strokeWidth="4"
          paintOrder="stroke"
        >
          {note.text}
        </text>
      ))}

      <path
        data-route-shimmer
        d={layout.route}
        fill="none"
        stroke="#fff3d0"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0"
        filter="url(#journeyBloom)"
      />

      {/* Footsteps hand-drawn behind the traveler, fading with distance. */}
      {Array.from({ length: 7 }, (_, k) => (
        <g key={k} data-footstep opacity="0">
          <ellipse cx={k % 2 ? 2.6 : -2.6} cy="-3.4" rx="1.9" ry="3.2" fill="#d8c5a0" />
          <ellipse cx={k % 2 ? -2.6 : 2.6} cy="3.4" rx="1.9" ry="3.2" fill="#d8c5a0" />
        </g>
      ))}

      <circle data-traveler r="6" fill="#fff7dc" stroke="#c9a96b" strokeWidth="1.4" opacity="0" filter="url(#journeyBloom)" />

      {/* The wand — one page-turn at the very end, then gone with the mist. */}
      <g data-wand opacity="0" transform={`translate(${layout.wand.x} ${layout.wand.y})`}>
        <g data-wand-arm>
          <line x1="0" y1="0" x2="-34" y2="-64" stroke="#4a3320" strokeWidth="6" strokeLinecap="round" />
          <line x1="0" y1="0" x2="-34" y2="-64" stroke="#8a6a3f" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <line x1="-28" y1="-52" x2="-34" y2="-64" stroke="#c9a96b" strokeWidth="7" strokeLinecap="round" />
          <circle data-wand-tip cx="-34" cy="-64" r="3" fill="#ffe9ad" opacity="0" />
        </g>
        <path
          data-wand-arc
          d="M-34 -64 C -10 -92, 18 -90, 30 -70"
          fill="none"
          stroke="#e8c87e"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle data-wand-spark r="4.5" fill="#fff7dc" opacity="0" filter="url(#journeyBloom)" />
      </g>
    </svg>
  );
}

function Constellation({ fractions, routeD }) {
  const refs = useRef([]);
  useGSAP(
    () => {
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
      probe.setAttribute("d", routeD);
      const total = probe.getTotalLength();
      refs.current.forEach((line, k) => {
        if (!line) return;
        const a = probe.getPointAtLength(fractions[k] * total);
        const b = probe.getPointAtLength(fractions[k + 1] * total);
        line.setAttribute("x1", a.x);
        line.setAttribute("y1", a.y);
        line.setAttribute("x2", b.x);
        line.setAttribute("y2", b.y);
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        line.dataset.len = len;
        line.style.strokeDasharray = `${len}`;
        line.style.strokeDashoffset = `${len}`;
      });
    },
    { dependencies: [fractions, routeD] }
  );

  return (
    <g>
      {fractions.slice(0, -1).map((_, k) => (
        <line
          key={k}
          data-const-line
          ref={(el) => {
            refs.current[k] = el;
          }}
          stroke="#ffe9ad"
          strokeWidth="1.6"
          opacity="0"
        />
      ))}
    </g>
  );
}

function MilestoneNode({ fraction, routeD, lit, pulse }) {
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
    <g ref={ref} data-map-node opacity={lit ? "1" : "0.25"}>
      <circle r="24" fill="url(#journeyNodeGlow)" />
      {pulse ? (
        <circle className={styles.nodeRing} r="16" fill="none" stroke="#c9a96b" strokeWidth="1.2" strokeDasharray="2 5">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="28s" repeatCount="indefinite" />
        </circle>
      ) : (
        <circle r="16" fill="none" stroke="#c9a96b" strokeWidth="1.2" strokeDasharray="2 5" opacity="0.6" />
      )}
      {pulse ? (
        <circle className={styles.nodePulse} r="10" fill="none" stroke="#ffe9ad" strokeWidth="1.6">
          <animate attributeName="r" values="10;30" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.7;0" dur="2.6s" repeatCount="indefinite" />
        </circle>
      ) : (
        <circle r="14" fill="none" stroke="#ffe9ad" strokeWidth="1.2" opacity="0.5" />
      )}
      {/* One-shot halo flare fired when this star awakens. Base state is
          identical to the animation end, so no freeze is needed. */}
      {pulse ? (
        <circle data-flare-ring r="12" fill="none" stroke="#fff3d0" strokeWidth="2" opacity="0">
          <animate attributeName="r" values="12;46" dur="1.1s" begin="indefinite" />
          <animate attributeName="opacity" values="0.85;0" dur="1.1s" begin="indefinite" />
        </circle>
      ) : null}
      <path d={STAR_D} fill="url(#journeyGold)" stroke="#fff2c8" strokeWidth="0.8" />
      <circle r="2.4" fill="#fff7dc" />
      {pulse ? (
        <g>
          <circle className={styles.mote} cx="-17" cy="-9" r="1.7" fill="#ffe9ad">
            <animate attributeName="cx" values="-17;-23;-17" dur="3.4s" repeatCount="indefinite" />
            <animate attributeName="cy" values="-9;-15;-9" dur="3.4s" repeatCount="indefinite" />
          </circle>
          <circle className={styles.mote} cx="18" cy="-6" r="1.4" fill="#ffe9ad">
            <animate attributeName="cx" values="18;24;18" dur="4.1s" repeatCount="indefinite" />
            <animate attributeName="cy" values="-6;-12;-6" dur="4.1s" repeatCount="indefinite" />
          </circle>
          <circle className={styles.mote} cx="2" cy="19" r="1.5" fill="#ffe9ad">
            <animate attributeName="cx" values="2;7;2" dur="2.9s" repeatCount="indefinite" />
            <animate attributeName="cy" values="19;25;19" dur="2.9s" repeatCount="indefinite" />
          </circle>
        </g>
      ) : null}
    </g>
  );
}
