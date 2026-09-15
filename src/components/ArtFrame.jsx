import styles from "./ArtFrame.module.css";

/**
 * Filmic placeholder frame — layered atmosphere, grain, rim light and a
 * soft silhouette. Acts as stand-in artwork so real photographs can be
 * dropped in later with zero layout change.
 *
 * Tones: sunset | snow | garden | night | dreamer | adventurer
 * Shapes: portrait | square | round | wide
 */
export default function ArtFrame({ tone = "night", shape = "portrait", className = "" }) {
  return (
    <div
      className={`${styles.root} ${styles[`tone-${tone}`]} ${styles[`shape-${shape}`]} ${className}`.trim()}
      aria-hidden="true"
    >
      <div className={styles.atmosphere} />
      <div className={styles.rim} />
      <div className={styles.figure}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet">
          <circle cx="50" cy="37" r="15" fill="var(--af-sil)" />
          <path d="M14 98 C 20 58 32 50 50 50 C 68 50 80 58 86 98 Z" fill="var(--af-sil)" />
        </svg>
      </div>
      <div className={styles.grain} />
      <div className={styles.vignette} />
    </div>
  );
}