import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import styles from "./EnchantedLights.module.css";

/**
 * EnchantedLights — ONE global layer of floating warm-golden lights for the
 * entire site. A single fixed canvas (no layout impact, no pointer events)
 * carrying ~3 depth layers: distant near-still stars, mid fireflies rising
 * gently, and a few soft foreground orbs. Rendered from pre-baked radial
 * sprites (no per-frame shadowBlur), DPR-capped, count-reduced on mobile.
 * A scroll-aware richness multiplier lets chapters breathe (quieter over
 * the map/memories, richer at the closing) without per-chapter systems.
 */

const COLORS = ["#C9A96B", "#E8D7B5", "#F2D28A"];
// Story richness by <main> section index (Experience order).
const RICHNESS = { 4: 0.7, 6: 0.8, 9: 1.25 };

function mulberry(seed) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeSprite(color, innerStop = 0.18) {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "#fff8e2");
  g.addColorStop(innerStop, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return c;
}

function makeSpeck() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, "rgba(216,197,160,0.85)");
  g.addColorStop(1, "rgba(216,197,160,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(32, 32, 26, 15, 0.5, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

function buildParticles(count, rand) {
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    const roll = rand();
    const layer = roll < 0.55 ? 0 : roll < 0.9 ? 1 : 2;
    const color = COLORS[Math.floor(rand() * COLORS.length)];
    parts.push({
      layer,
      color,
      x: rand(),
      y: rand(),
      size:
        layer === 0 ? 0.6 + rand() * 0.7 : layer === 1 ? 1.2 + rand() * 1.1 : 2.6 + rand() * 1.9,
      opacity:
        layer === 0 ? 0.1 + rand() * 0.16 : layer === 1 ? 0.22 + rand() * 0.3 : 0.28 + rand() * 0.3,
      rise: layer === 0 ? 0.5 + rand() * 1.2 : layer === 1 ? 2 + rand() * 5 : 1 + rand() * 2.5,
      swayAmp: layer === 0 ? 2 + rand() * 4 : 6 + rand() * 14,
      swayFreq: 0.05 + rand() * 0.16,
      phase: rand() * Math.PI * 2,
      twinkleFreq: 0.2 + rand() * 0.7,
      flickerIn: layer === 2 && rand() > 0.5 ? 4 + rand() * 14 : 0,
      flicker: 0,
    });
  }
  // A breath of parchment specks and two mini starbursts.
  const specks = [];
  const speckCount = count > 40 ? 3 : 1;
  for (let i = 0; i < speckCount; i += 1) {
    specks.push({
      x: rand(),
      y: rand(),
      size: 3 + rand() * 2.5,
      opacity: 0.08 + rand() * 0.07,
      rise: 1 + rand() * 2,
      rot: rand() * Math.PI,
      rotSpeed: (rand() - 0.5) * 0.1,
      phase: rand() * Math.PI * 2,
    });
  }
  const bursts = [];
  const burstCount = count > 40 ? 2 : 1;
  for (let i = 0; i < burstCount; i += 1) {
    bursts.push({
      x: 0.2 + rand() * 0.6,
      y: 0.2 + rand() * 0.6,
      size: 5 + rand() * 3,
      period: 7 + rand() * 4,
      phase: rand() * Math.PI * 2,
    });
  }
  return { parts, specks, bursts };
}

export default function EnchantedLights({ storyRef = null }) {
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sprites = {
      "#C9A96B": makeSprite("#C9A96B"),
      "#E8D7B5": makeSprite("#E8D7B5"),
      "#F2D28A": makeSprite("#F2D28A", 0.12),
      speck: makeSpeck(),
    };
    const rand = mulberry(20261212);
    let field = buildParticles(vw >= 768 ? 60 : 28, rand);
    canvas.dataset.particles = String(field.parts.length);
    let richness = 1;
    let richnessTarget = 1;
    let frameCount = 0;

    const measureRichness = () => {
      const story = storyRef?.current;
      if (!story) return;
      const sections = story.querySelectorAll(":scope > section");
      if (!sections.length) return;
      const mid = window.scrollY + window.innerHeight / 2;
      let idx = 0;
      sections.forEach((s, i) => {
        if (s.offsetTop <= mid) idx = i;
      });
      richnessTarget = RICHNESS[idx] ?? 1;
    };

    const drawParticle = (p, t, W, H) => {
      const sway = Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
      const x = p.x * W + sway;
      const y = p.y * H;
      let op = p.opacity * (0.72 + 0.28 * Math.sin(t * p.twinkleFreq + p.phase));
      if (p.flicker > 0) {
        op *= 0.3;
        p.flicker -= 1 / 60;
      } else if (p.flickerIn > 0) {
        p.flickerIn -= 1 / 60;
        if (p.flickerIn <= 0) {
          p.flicker = 24;
          p.flickerIn = 8 + Math.random() * 18;
        }
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, op * richness));
      const s = p.size * (p.layer === 2 ? 3.2 : 2.4);
      ctx.drawImage(sprites[p.color], x - s / 2, y - s / 2, s, s);
    };

    const render = (t) => {
      ctx.clearRect(0, 0, vw, vh);
      ctx.globalCompositeOperation = "lighter";
      field.parts.forEach((p) => drawParticle(p, t, vw, vh));
      field.specks.forEach((sp) => {
        ctx.globalAlpha = sp.opacity * richness;
        ctx.save();
        ctx.translate(sp.x * vw, sp.y * vh);
        ctx.rotate(sp.rot + t * sp.rotSpeed);
        ctx.drawImage(sprites.speck, -sp.size, -sp.size, sp.size * 2, sp.size * 2);
        ctx.restore();
      });
      field.bursts.forEach((b) => {
        const pulse = Math.max(0, Math.sin((t / b.period) * Math.PI * 2 + b.phase));
        ctx.globalAlpha = 0.4 * pulse * pulse * richness;
        const s = b.size;
        ctx.drawImage(sprites["#F2D28A"], b.x * vw - s / 2, b.y * vh - s / 2, s, s);
        ctx.strokeStyle = "#ffe9ad";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(b.x * vw - s, b.y * vh);
        ctx.lineTo(b.x * vw + s, b.y * vh);
        ctx.moveTo(b.x * vw, b.y * vh - s);
        ctx.lineTo(b.x * vw, b.y * vh + s);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    if (reducedMotion) {
      // One static sparse frame; recompute on resize only.
      const paint = () => {
        vw = window.innerWidth;
        vh = window.innerHeight;
        canvas.width = Math.floor(vw * dpr);
        canvas.height = Math.floor(vh * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        field = buildParticles(vw >= 768 ? 34 : 18, mulberry(7));
        canvas.dataset.particles = String(field.parts.length);
        richness = 1;
        render(3.2);
      };
      paint();
      window.addEventListener("resize", paint);
      return () => window.removeEventListener("resize", paint);
    }

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      richness += (richnessTarget - richness) * Math.min(1, dt * 1.5);
      field.parts.forEach((p) => {
        p.y -= (p.rise / vh) * dt;
        if (p.y < -0.06) {
          p.y = 1.06;
          p.x = Math.random();
        }
      });
      field.specks.forEach((sp) => {
        sp.y -= (sp.rise / vh) * dt;
        if (sp.y < -0.06) {
          sp.y = 1.06;
          sp.x = Math.random();
        }
      });
      render(t);
      frameCount += 1;
      if (frameCount % 15 === 0) canvas.dataset.richness = richness.toFixed(2);
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const wide = window.innerWidth >= 768;
      const wasWide = vw >= 768;
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (wide !== wasWide) {
        field = buildParticles(wide ? 60 : 28, rand);
        canvas.dataset.particles = String(field.parts.length);
      }
      measureRichness();
    };
    const onScroll = () => measureRichness();

    measureRichness();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reducedMotion, storyRef]);

  return <canvas ref={canvasRef} className={styles.lights} aria-hidden="true" />;
}
