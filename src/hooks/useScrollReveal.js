import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";

/**
 * Reusable scroll-triggered reveal.
 * Any element with `[data-scroll-reveal]` inside `scopeRef` fades/rises in
 * the first time it enters the viewport. Reduced motion leaves everything
 * visible.
 */
export function useScrollReveal(
  scopeRef,
  { reducedMotion = false, y = 36, start = "top 84%", stagger = 0 } = {}
) {
  useGSAP(
    () => {
      if (reducedMotion || !scopeRef.current) return;
      const targets = scopeRef.current.querySelectorAll("[data-scroll-reveal]");
      if (!targets.length) return;
      gsap.set(targets, { y, autoAlpha: 0 });
      gsap.to(targets, {
        y: 0,
        autoAlpha: 1,
        duration: 1.1,
        ease: "power3.out",
        stagger,
        scrollTrigger: {
          trigger: scopeRef.current,
          start,
          once: true,
        },
      });
    },
    { scope: scopeRef, dependencies: [reducedMotion] }
  );

  useGSAP(
    () => {
      if (!reducedMotion || !scopeRef.current) return;
      gsap.set(scopeRef.current.querySelectorAll("[data-scroll-reveal]"), { y: 0, autoAlpha: 1 });
    },
    { scope: scopeRef, dependencies: [reducedMotion] }
  );
}

/** Animate `[data-parallax-speed]` children with a scrubbed scroll movement. */
export function useParallax(scopeRef, { reducedMotion = false } = {}) {
  useGSAP(
    () => {
      if (reducedMotion || !scopeRef.current) return;
      const layers = scopeRef.current.querySelectorAll("[data-parallax-speed]");
      layers.forEach((el) => {
        const speed = parseFloat(el.dataset.parallaxSpeed || "0.2");
        gsap.to(el, {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: scopeRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: scopeRef, dependencies: [reducedMotion] }
  );
}

export { gsap, ScrollTrigger };