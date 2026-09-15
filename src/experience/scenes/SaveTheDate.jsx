import { useEffect, useRef, useState } from "react";
import { saveTheDate } from "../../lib/content";
import { images } from "../../lib/images";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, useGSAP } from "../../lib/gsap";
import { useScrollReveal, useParallax } from "../../hooks/useScrollReveal";
import StarField from "../../components/StarField";
import StoryImage from "../../components/StoryImage";
import Label from "../../components/Label";
import styles from "./SaveTheDate.module.css";

function buildIcsContent() {
  const calendar = saveTheDate.calendar;
  const uid = `${Date.now()}@enchanted-wedding.local`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Enchanted Wedding//Aarav & Meera//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;TZID=${calendar.timeZone}:${calendar.start}`,
    `DTEND;TZID=${calendar.timeZone}:${calendar.end}`,
    `SUMMARY:${calendar.title}`,
    `LOCATION:${calendar.location}`,
    `DESCRIPTION:${calendar.description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function SaveTheDate() {
  const rootRef = useRef(null);
  const moonRef = useRef(null);
  const stageRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [saved, setSaved] = useState(false);

  useScrollReveal(rootRef, { reducedMotion, y: 26, stagger: 0.16 });
  useParallax(rootRef, { reducedMotion });

  useGSAP(
    () => {
      const moon = moonRef.current;
      const stage = stageRef.current;
      if (!moon || !stage) return;
      if (reducedMotion) {
        gsap.set(moon, { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: stage, start: "top 62%", once: true },
      });
      tl.fromTo(moon, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 1.4, ease: "power2.out" });
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  const handleSave = () => {
    const content = buildIcsContent();
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = saveTheDate.calendar.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setSaved(true);
  };

  return (
    <section className={styles.stage} ref={rootRef} aria-label="Save the date">
      <div className={styles.sky} aria-hidden="true" data-parallax-speed="0.18">
        <div className={styles.starLayer}>
          <StarField count={55} seed={11} scatter={0.5} />
        </div>
        <div className={styles.moonWrap} ref={moonRef}>
          <div className={styles.moon} />
          <div className={styles.moonHalo} />
        </div>
        <svg
          className={styles.landscape}
          viewBox="0 0 1440 420"
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
        >
          <path d="M0 420 L0 300 L 200 210 L 380 300 L 520 250 L 700 340 L 880 260 L 1040 340 L 1220 230 L 1440 320 L 1440 420 Z" fill="#0a1420" />
          <path d="M0 420 L0 350 L 240 262 L 430 342 L 620 292 L 820 368 L 1020 300 L 1240 366 L 1440 306 L 1440 420 Z" fill="#0c1726" />
          <g className={styles.estate} fill="#0d1828">
            <rect x="620" y="268" width="46" height="96" />
            <polygon points="616,268 643,236 670,268" />
            <rect x="668" y="292" width="34" height="72" />
            <polygon points="664,292 685,266 706,292" />
            <rect x="560" y="300" width="30" height="64" />
            <rect x="592" y="316" width="26" height="48" />
          </g>
        </svg>
        <div className={styles.fog} aria-hidden="true" />
      </div>

      <div className={styles.content}>
        <Label className={styles.label} data-scroll-reveal>
          {saveTheDate.chapter}
        </Label>
        <h2 className={styles.heading} data-scroll-reveal>
          {saveTheDate.label}
        </h2>
        <div className={styles.date} data-scroll-reveal>
          {saveTheDate.date}
        </div>
        <div className={styles.names} data-scroll-reveal>
          {saveTheDate.names}
        </div>
        <div className={styles.portrait} data-scroll-reveal>
          <StoryImage
            image={images.couple.lights}
            alt="Aarav and Meera beneath festival lights"
            tone="night"
            frame="wide"
          />
          <span className={styles.portraitLine} aria-hidden="true" />
        </div>
        <button type="button" className={styles.saveButton} onClick={handleSave} data-scroll-reveal>
          {saveTheDate.saveLabel}
        </button>
        <p className={styles.saveNote} aria-live="polite">
          {saved ? "Added to your calendar." : "An .ics file your calendar can open."}
        </p>
      </div>
    </section>
  );
}
