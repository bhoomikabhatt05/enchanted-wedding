import { useEffect, useRef, useState } from "react";
import { rsvp, saveTheDate } from "../../lib/content";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { gsap, useGSAP } from "../../lib/gsap";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import Label from "../../components/Label";
import Parchment from "../../components/Parchment";
import styles from "./RSVP.module.css";

function InkStamp({ visible }) {
  const svgRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      if (!visible) {
        gsap.set(svg, { autoAlpha: 0 });
        return;
      }
      if (reducedMotion) {
        gsap.set(svg, { autoAlpha: 1, rotate: 0, scale: 1 });
        return;
      }
      gsap.fromTo(
        svg,
        { autoAlpha: 0, scale: 2.6, rotate: -18 },
        { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.85, ease: "power3.out", delay: 0.1 }
      );
    },
    { scope: svgRef, dependencies: [reducedMotion, visible] }
  );

  return (
    <svg
      ref={svgRef}
      className={styles.stamp}
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="54" fill="#8d2630" />
      <circle cx="60" cy="60" r="54" fill="none" stroke="#e8d7b5" strokeWidth="2.5" opacity="0.9" />
      <circle cx="60" cy="60" r="47" fill="none" stroke="#e8d7b5" strokeWidth="1" opacity="0.7" strokeDasharray="3 4" />
      <path d="M 60 14 l 2.4 4.6 5.1 0.7 -3.7 3.6 0.9 5 -4.7 -2.5 -4.7 2.5 0.9 -5 -3.7 -3.6 5.1 -0.7 Z" fill="#e8d7b5" />
      <path d="M 60 98 l 2.4 4.6 5.1 0.7 -3.7 3.6 0.9 5 -4.7 -2.5 -4.7 2.5 0.9 -5 -3.7 -3.6 5.1 -0.7 Z" fill="#e8d7b5" />
      <text x="60" y="72" textAnchor="middle" className={styles.stampLetters}>A · M</text>
    </svg>
  );
}

function sendResponse(payload) {
  const endpoint = rsvp.endpoint;
  if (!endpoint) return Promise.resolve({ ok: true });
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((response) => (response.ok ? { ok: true } : Promise.reject(new Error("request failed"))));
}

function buildIcsContent(guestName) {
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
    `DESCRIPTION:${calendar.description}${guestName ? `\\nGuest: ${guestName}` : ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function RSVP() {
  const rootRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [guestName, setGuestName] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const stored = window.localStorage.getItem(rsvp.storageKey);
      if (!stored) return "";
      const parsed = JSON.parse(stored);
      return typeof parsed.guestName === "string" ? parsed.guestName : "";
    } catch {
      return "";
    }
  });
  const [choice, setChoice] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(rsvp.storageKey);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return typeof parsed.choice === "string" ? parsed.choice : null;
    } catch {
      return null;
    }
  });
  const [state, setState] = useState(() => (choice ? "done" : "idle"));
  const [error, setError] = useState("");

  useScrollReveal(rootRef, { reducedMotion, y: 24, stagger: 0.1 });

  useEffect(() => {
    if (state !== "done" || !choice) return;
    try {
      window.localStorage.setItem(rsvp.storageKey, JSON.stringify({ choice, guestName: guestName.trim() }));
    } catch {
      // Ignore storage failures for private browsing.
    }
  }, [choice, guestName, state]);

  const handleSelect = (id) => {
    if (state === "sending") return;
    setChoice(id);
    setError("");
    if (state === "done") setState("idle");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!choice) {
      setError("Please choose one reply before sealing the letter.");
      return;
    }
    if (!guestName.trim()) {
      setError(rsvp.nameRequired);
      return;
    }
    setState("sending");
    setError("");
    sendResponse({ choice, guestName: guestName.trim(), sentAt: new Date().toISOString() })
      .then(() => setState("done"))
      .catch(() => {
        setState("idle");
        setError(rsvp.errorMessage);
      });
  };

  const handleChangeReply = () => {
    setState("idle");
    setError("");
  };

  const handleDownloadIcs = () => {
    const content = buildIcsContent(guestName.trim());
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = saveTheDate.calendar.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const settled = state === "done";

  return (
    <section className={styles.stage} ref={rootRef} aria-label="RSVP">
      <div className={styles.aurora} aria-hidden="true" />

      <Parchment className={styles.sheet}>
        <form className={styles.inside} onSubmit={handleSubmit} noValidate>
          <Label className={styles.eyebrow} data-scroll-reveal>
            {rsvp.chapter}
          </Label>
          <h2 className={styles.title} data-scroll-reveal>
            {rsvp.title}
          </h2>
          <p className={styles.sub} data-scroll-reveal>
            {rsvp.sub}
          </p>

          <label className={styles.field} data-scroll-reveal htmlFor="rsvp-guest-name">
            <span className={styles.fieldLabel}>{rsvp.nameLabel}</span>
            <input
              id="rsvp-guest-name"
              className={styles.fieldInput}
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder={rsvp.namePlaceholder}
              autoComplete="name"
              disabled={state === "sending"}
            />
          </label>

          <div
            className={`${styles.options} ${settled ? styles.optionsHidden : ""}`.trim()}
            aria-hidden={settled ? "true" : undefined}
            data-scroll-reveal
          >
            {rsvp.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`${styles.option} ${choice === option.id ? styles.optionActive : ""}`.trim()}
                disabled={state === "sending"}
                aria-pressed={choice === option.id}
                onClick={() => handleSelect(option.id)}
              >
                <span className={styles.dot} aria-hidden="true" />
                {option.label}
              </button>
            ))}
          </div>

          {!settled ? (
            <button type="submit" className={styles.submit} disabled={state === "sending"} data-scroll-reveal>
              {state === "sending" ? rsvp.sendingLabel : rsvp.submitLabel}
            </button>
          ) : (
            <button type="button" className={styles.secondary} onClick={handleChangeReply} data-scroll-reveal>
              {rsvp.changeLabel}
            </button>
          )}

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <div className={`${styles.result} ${settled ? styles.resultVisible : ""}`.trim()} aria-live="polite">
            <InkStamp visible={settled} />
            <p className={styles.confirmation}>
              {choice ? rsvp.confirmations[choice] : ""}
            </p>
            <div className={styles.signed} data-scroll-reveal>
              {rsvp.signed}
            </div>
            {settled && choice === "attending" ? (
              <button type="button" className={styles.secondary} onClick={handleDownloadIcs}>
                Save the date to your calendar
              </button>
            ) : null}
          </div>
        </form>
      </Parchment>

      <div className={styles.grain} aria-hidden="true" />
    </section>
  );
}
