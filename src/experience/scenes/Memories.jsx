import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "../../lib/gsap";
import { memories } from "../../lib/content";
import { images } from "../../lib/images";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import StoryImage from "../../components/StoryImage";
import Label from "../../components/Label";
import MoonPhase from "../../components/MoonPhase";
import styles from "./Memories.module.css";

const MOMENTUM_FRICTION = 0.95;
const MOMENTUM_STOP = 0.5;

export default function Memories() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const leadSpaceRef = useRef(null);
  const trailSpaceRef = useRef(null);
  const warpRef = useRef(null);
  const prevIndexRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, vel: 0, lastX: 0, lastT: 0, raf: 0 });
  const itemCount = memories.items.length;
  const counterLabel = useMemo(
    () => `${String(activeIndex + 1).padStart(2, "0")} / ${String(itemCount).padStart(2, "0")}`,
    [activeIndex, itemCount]
  );
  const activeItem = memories.items[activeIndex];

  useScrollReveal(rootRef, { reducedMotion, y: 24, stagger: 0.1 });

  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = [...track.querySelectorAll("[data-memory]")];
    if (!cards.length) return;
    const trackRect = track.getBoundingClientRect();
    const center = track.scrollLeft + track.clientWidth / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const mid = rect.left - trackRect.left + rect.width / 2 + track.scrollLeft;
      const distance = Math.abs(mid - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    cards.forEach((card, index) => {
      card.classList.toggle(styles.lit, index === bestIndex);
      card.setAttribute("aria-selected", String(index === bestIndex));
    });
    setActiveIndex((previous) => (previous === bestIndex ? previous : bestIndex));
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const lead = leadSpaceRef.current;
    const trail = trailSpaceRef.current;
    if (!track || !lead || !trail) return;
    const cards = track.querySelectorAll("[data-memory]");
    if (!cards.length) return;
    const first = cards[0];
    const last = cards[cards.length - 1];
    const clientWidth = track.clientWidth;
    const center = clientWidth / 2;
    const contentX = (el) => el.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    const cardWidth = first.getBoundingClientRect().width;
    const lastCenter = (el) => contentX(el) + el.getBoundingClientRect().width / 2;
    lead.style.width = "0px";
    trail.style.width = "0px";
    void track.offsetWidth;
    const firstLeft = contentX(first);
    const lastCenterBase = lastCenter(last);
    const maxScrollBase = track.scrollWidth - clientWidth;
    const leadWidth = Math.max(0, center - firstLeft - cardWidth / 2);
    const trailWidth = Math.max(0, lastCenterBase - maxScrollBase - center);
    lead.style.width = `${leadWidth}px`;
    trail.style.width = `${trailWidth}px`;
    syncActive();
  }, [syncActive]);

  useEffect(() => {
    let raf = 0;
    const refresh = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => measure());
    };
    measure();
    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      document.fonts.ready
        .then(() => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => measure());
        })
        .catch(() => {});
    }
    window.addEventListener("resize", refresh);
    window.addEventListener("orientationchange", refresh);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("orientationchange", refresh);
    };
  }, [measure]);

  // Liquid / ink distortion as the active memory changes — the departing
// photograph warps and sinks away while the new one rises up through the
// displacement, settling sharp. A breath of gold motes follows.
useEffect(() => {
  const previous = prevIndexRef.current;
  prevIndexRef.current = activeIndex;
  if (reducedMotion || activeIndex === previous) return;
  const track = trackRef.current;
  const warp = warpRef.current;
  const cards = track ? [...track.querySelectorAll("[data-memory]")] : [];
  const cardIn = cards[activeIndex];
  const cardOut = cards[previous];
  if (!warp || !cardIn || !cardOut || cardIn === cardOut) return;

  const displace = warp.querySelector("feDisplacementMap");
  const artIn = cardIn.querySelector(`.${styles.art}`);
  const artOut = cardOut.querySelector(`.${styles.art}`);
  if (!displace || !artIn || !artOut) return;

  artIn.style.filter = "url(#memories-liquid)";
  artOut.style.filter = "url(#memories-liquid) grayscale(0.85) brightness(0.6)";
  artOut.style.transition = "none";
  artIn.style.transition = "none";

  // Gold motes released as the memory reforms.
  const sparkles = [];
  const host = artIn.querySelector(`.${styles.liquid}`);
  if (host) {
    for (let i = 0; i < 8; i += 1) {
      const s = document.createElement("span");
      s.className = styles.sparkle;
      host.appendChild(s);
      sparkles.push(s);
      const angle = Math.random() * Math.PI * 2;
      const dist = 26 + Math.random() * 44;
      gsap.fromTo(
        s,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 30,
          opacity: 0,
          scale: 0.25,
          duration: 0.85 + Math.random() * 0.5,
          delay: 0.18 + i * 0.02,
          ease: "power2.out",
        }
      );
    }
  }

  const rippleStrength = 62;
  const tl = gsap.timeline({
    onComplete: () => {
      artIn.style.filter = "";
      artOut.style.filter = "";
      artOut.style.transition = "";
      artIn.style.transition = "";
      gsap.set([artIn, artOut], { clearProps: "transform,opacity" });
      sparkles.forEach((s) => s.remove());
    },
  });

  tl.fromTo(
    displace,
    { attr: { scale: 0 } },
    { attr: { scale: rippleStrength }, duration: 0.55, ease: "power2.in" },
    0
  )
    .to(displace, { attr: { scale: 0 }, duration: 0.6, ease: "power2.out" })
    // Departing photo sinks and warps away.
    .fromTo(
      artOut,
      { scale: 1, opacity: 1 },
      { scale: 1.05, opacity: 0.35, duration: 0.7, ease: "power2.inOut" },
      0
    )
    // Incoming photo swells up through the liquid, then settles sharp.
    .fromTo(
      artIn,
      { scale: 1.1 },
      { scale: 1.02, duration: 0.85, ease: "power2.out" },
      0.15
    );

  return () => {
    tl.kill();
    artIn.style.filter = "";
    artOut.style.filter = "";
    artOut.style.transition = "";
    artIn.style.transition = "";
    gsap.set([artIn, artOut], { clearProps: "transform,opacity" });
    sparkles.forEach((s) => s.remove());
  };
}, [activeIndex, reducedMotion]);

const handleDistortion = (event) => {
  if (reducedMotion) return;
  const track = trackRef.current;
  if (!track) return;
  const card = event.currentTarget;
  const bounds = card.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
  card.style.setProperty("--tilt-x", `${y.toFixed(2)}deg`);
  card.style.setProperty("--tilt-y", `${(-x).toFixed(2)}deg`);
};

  const clearDistortion = (event) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  };

  const onScroll = () => syncActive();

  const onPointerDown = (event) => {
    const track = trackRef.current;
    if (!track || reducedMotion) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;
    drag.current.active = true;
    drag.current.startX = event.clientX;
    drag.current.startScroll = track.scrollLeft;
    drag.current.lastX = event.clientX;
    drag.current.lastT = performance.now();
    drag.current.vel = 0;
    track.classList.add(styles.dragging);
    try {
      track.setPointerCapture(event.pointerId);
    } catch {
      // Synthesized or already-released pointers have nothing to capture;
      // drag tracking via window-level moves still works.
    }
    cancelAnimationFrame(drag.current.raf);
  };

  const onPointerMove = (event) => {
    const state = drag.current;
    const track = trackRef.current;
    if (!state.active || !track) return;
    const dx = event.clientX - state.startX;
    track.scrollLeft = state.startScroll - dx;
    const now = performance.now();
    const dt = now - state.lastT;
    if (dt > 0) state.vel = 0.8 * state.vel + 0.2 * ((event.clientX - state.lastX) / dt);
    state.lastX = event.clientX;
    state.lastT = now;
    syncActive();
  };

  const endDrag = (event) => {
    const state = drag.current;
    const track = trackRef.current;
    if (!state.active) return;
    state.active = false;
    track.classList.remove(styles.dragging);
    try {
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    } catch {
      // Nothing captured — safe to ignore.
    }
    const speed = Math.abs(state.vel) > MOMENTUM_STOP ? state.vel : 0;
    if (reducedMotion || speed === 0) {
      syncActive();
      return;
    }
    const step = () => {
      const el = trackRef.current;
      if (!el || Math.abs(state.vel) < 0.05) {
        syncActive();
        return;
      }
      el.scrollLeft -= state.vel * 14;
      state.vel *= MOMENTUM_FRICTION;
      state.raf = requestAnimationFrame(step);
    };
    state.raf = requestAnimationFrame(step);
  };

  return (
    <section className={styles.stage} ref={rootRef} aria-label="Memories">
      <div className={styles.skyGlow} aria-hidden="true" />

      <div className={styles.head}>
        <Label className={styles.eyebrow} data-scroll-reveal>
          <MoonPhase phase="full" />
          {memories.chapter}
        </Label>
        <h2 className={styles.title} data-scroll-reveal>
          {memories.title}
        </h2>
        <p className={styles.accent} data-scroll-reveal>
          {memories.accent}
        </p>
        <Label className={styles.hint} data-scroll-reveal>
          {memories.dragHint} →
        </Label>
      </div>

      <div className={styles.stageMeta} data-scroll-reveal>
        <p className={styles.counter} aria-live="polite">
          {counterLabel}
        </p>
        <div className={styles.activeCopy}>
          <h3 className={styles.activeTitle}>{activeItem.title}</h3>
          <p className={styles.activeDate}>{activeItem.date}</p>
          <p className={styles.activeCaption}>{activeItem.caption}</p>
        </div>
      </div>

      {/* Shared liquid-displacement filter for the memory transitions. */}
      <svg className={styles.filterDefs} ref={warpRef} aria-hidden="true" focusable="false">
        <filter id="memories-liquid" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className={styles.rail}>
        <div
          className={styles.track}
          ref={trackRef}
          role="listbox"
          aria-label="Memory photographs"
          aria-orientation="horizontal"
          data-memory-track
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
onPointerCancel={endDrag}
          >
            <span ref={leadSpaceRef} className={styles.spacer} aria-hidden="true" />
            {memories.items.map((item, index) => (
            <figure
              key={item.title}
              className={styles.card}
              data-memory
              role="option"
              tabIndex={0}
              onMouseMove={handleDistortion}
              onMouseLeave={clearDistortion}
              onFocus={() => {
                const track = trackRef.current;
                if (!track) return;
                const card = track.querySelectorAll("[data-memory]")[index];
                if (!card) return;
                const left = card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft - track.clientWidth / 2 + card.clientWidth / 2;
                track.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
              }}
            >
              <div className={styles.art}>
                <StoryImage image={images.memories[item.image]} alt={item.alt} tone={item.tone} className={styles.artInner} />
                <div className={styles.liquid} aria-hidden="true" />
                <span className={styles.frameLine} aria-hidden="true" />
                <span className={styles.cardCounter} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <figcaption className={styles.caption}>
                <span className={styles.rank}>0{index + 1}</span>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDate}>{item.date}</p>
                  <p className={styles.cardCaption}>{item.caption}</p>
                </div>
              </figcaption>
            </figure>
          ))}
            <span ref={trailSpaceRef} className={styles.spacer} aria-hidden="true" />
          </div>
        <div className={styles.railFadeL} aria-hidden="true" />
        <div className={styles.railFadeR} aria-hidden="true" />
      </div>

      <div className={styles.fade} aria-hidden="true" />
    </section>
  );
}
