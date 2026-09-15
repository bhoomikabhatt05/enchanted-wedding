import styles from "./CoupleMotif.module.css";

/**
 * Original storybook ink motif: Aarav and Meera seated together beneath a
 * crescent moon. Used as a recurring storytelling emblem, not decoration.
 */
export default function CoupleMotif({ title = "Aarav and Meera seated together beneath a crescent moon", className = "" }) {
  return (
    <svg
      className={`${styles.root} ${className}`.trim()}
      viewBox="0 0 360 250"
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : "true"}
    >
      {title ? <title>{title}</title> : null}

      <g className={styles.stars} fill="currentColor" aria-hidden="true">
        <circle cx="48" cy="48" r="1.2" />
        <circle cx="74" cy="88" r="0.9" />
        <circle cx="104" cy="42" r="1" />
        <circle cx="298" cy="118" r="1" />
        <circle cx="318" cy="62" r="1.2" />
        <path d="M62 124 l2.2 5 5.2.5-3.9 3.5.9 5.1-4.4-2.4-4.4 2.4.9-5.1-3.9-3.5 5.2-.5Z" />
        <path d="M286 162 l1.8 4 4.2.4-3.1 2.8.7 4.1-3.6-1.9-3.6 1.9.7-4.1-3.1-2.8 4.2-.4Z" />
      </g>

      <g className={styles.moon} aria-hidden="true">
        <circle cx="262" cy="66" r="27" fill="none" strokeWidth="1.6" />
        <path
          d="M252 46c-9 5.4-14 13.5-14 22.5 0 13.5 10.5 25 24 27-2.5.4-5 .6-7.5.6-14.5 0-26.5-11.8-26.5-27 0-9.4 5.4-18.4 13.5-23.6Z"
          stroke="none"
        />
      </g>

      <path
        className={styles.ground}
        d="M18 210c58-30 102-32 152-20s104 12 172-10l2 70H18Z"
        aria-hidden="true"
      />
      <path
        className={styles.groundLine}
        d="M28 200c54-25 98-27 146-16s98 11 158-9"
        fill="none"
        strokeWidth="1.4"
        aria-hidden="true"
      />

      <g className={styles.couple} aria-hidden="true">
        <ellipse cx="148" cy="136" rx="14" ry="16" />
        <path d="M126 190c2-22 10-34 22-36s20 14 22 36l-2 8h-40Z" />
        <path d="M126 190c-8 5-12 12-11 18h55c1-7-1-13-4-18" fill="none" strokeWidth="1.4" />

        <ellipse cx="188" cy="141" rx="12" ry="14" transform="rotate(-12 188 141)" />
        <circle cx="199" cy="129" r="5" fill="none" strokeWidth="1.2" />
        <path d="M168 190c4-20 10-30 18-32s16 11 20 30c8 7 12 12 12 18h-54c0-6 2-11 4-16Z" />
        <path d="M178 170c-1 8-3 15-7 21M194 168c2 8 1 16-2 24" fill="none" strokeWidth="1" opacity="0.65" />
        <path d="M166 182c5 3 11 3 17 1s11-1 15 3" fill="none" strokeWidth="1.3" />
      </g>

      <path
        className={styles.thread}
        d="M162 122c18-18 48-24 72-38s20-24 20-24"
        fill="none"
        strokeWidth="1.2"
        strokeDasharray="1 5"
        strokeLinecap="round"
        aria-hidden="true"
      />
    </svg>
  );
}
