import styles from "./MoonPhase.module.css";

/**
 * A tiny moon-phase sigil — the site's recurring celestial motif.
 * new → crescent → half → gibbous → full across the chapters.
 */
const SHAPES = {
  new: <circle cx="10" cy="10" r="6.5" fill="none" stroke="#c9a96b" strokeWidth="1.1" opacity="0.75" />,
  crescent: (
    <path d="M13.5,3.5 A6.8,6.8 0 1,0 13.5,16.5 A5.2,5.2 0 1,1 13.5,3.5 Z" fill="#e8d7b5" opacity="0.9" />
  ),
  half: (
    <>
      <circle cx="10" cy="10" r="6.5" fill="none" stroke="#c9a96b" strokeWidth="0.9" opacity="0.5" />
      <path d="M10,3.5 A6.5,6.5 0 0,1 10,16.5 Z" fill="#f0d896" opacity="0.95" />
    </>
  ),
  gibbous: (
    <>
      <circle cx="10" cy="10" r="6.5" fill="#f0d896" opacity="0.95" />
      <circle cx="6.8" cy="10" r="5.6" fill="#070d16" opacity="0.55" />
    </>
  ),
  full: <circle cx="10" cy="10" r="6.5" fill="#ffe9ad" opacity="0.95" />,
};

export default function MoonPhase({ phase = "full", className = "" }) {
  return (
    <span className={`${styles.moon} ${styles[phase] || ""} ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 20 20">{SHAPES[phase] || SHAPES.full}</svg>
    </span>
  );
}
