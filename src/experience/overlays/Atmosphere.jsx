import styles from "./Atmosphere.module.css";

const DUST = [
  { top: "11%", left: "14%", size: 1.5, delay: "0s", dur: "16s" },
  { top: "19%", left: "72%", size: 1, delay: "2.2s", dur: "18s" },
  { top: "32%", left: "58%", size: 1.25, delay: "5s", dur: "15s" },
  { top: "44%", left: "22%", size: 1, delay: "1.5s", dur: "20s" },
  { top: "56%", left: "82%", size: 1.5, delay: "3.5s", dur: "17s" },
  { top: "68%", left: "38%", size: 1, delay: "7s", dur: "19s" },
  { top: "78%", left: "11%", size: 1.25, delay: "4s", dur: "16s" },
  { top: "25%", left: "48%", size: 1, delay: "9s", dur: "22s" },
  { top: "8%", left: "62%", size: 0.8, delay: "6s", dur: "21s" },
  { top: "52%", left: "6%", size: 0.8, delay: "11s", dur: "18s" },
  { top: "88%", left: "55%", size: 1, delay: "8s", dur: "15s" },
  { top: "36%", left: "90%", size: 0.8, delay: "13s", dur: "20s" },
];

const STARS = [
  { top: "6%", left: "20%", size: 1.5, opacity: 0.4, delay: "0s" },
  { top: "14%", left: "78%", size: 1, opacity: 0.3, delay: "1.2s" },
  { top: "22%", left: "42%", size: 1, opacity: 0.25, delay: "3s" },
  { top: "8%", left: "55%", size: 1.5, opacity: 0.35, delay: "2s" },
  { top: "30%", left: "12%", size: 1, opacity: 0.2, delay: "4.5s" },
  { top: "18%", left: "88%", size: 1.5, opacity: 0.3, delay: "1.8s" },
  { top: "4%", left: "35%", size: 1, opacity: 0.2, delay: "5.5s" },
  { top: "26%", left: "65%", size: 1.5, opacity: 0.28, delay: "0.8s" },
  { top: "12%", left: "5%", size: 1, opacity: 0.18, delay: "7s" },
  { top: "38%", left: "92%", size: 1, opacity: 0.22, delay: "2.5s" },
];

export default function Atmosphere({ reducedMotion = false, contained = false }) {
  return (
    <div
      className={`${styles.root} ${contained ? styles.contained : ""}`.trim()}
      aria-hidden="true"
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <div className={styles.haze} />
      <div className={styles.glow} />
      <div className={styles.bloom} />
      <div className={styles.vignette} />
      <div className={styles.grain} />

      <div className={styles.stars}>
        {!reducedMotion &&
          STARS.map((star, i) => (
            <span
              key={`star-${i}`}
              className={styles.star}
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                animationDelay: star.delay,
              }}
            />
          ))}
        {reducedMotion &&
          STARS.map((star, i) => (
            <span
              key={`star-${i}`}
              className={styles.star}
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              }}
            />
          ))}
      </div>

      {!reducedMotion &&
        DUST.map((dot, i) => (
          <span
            key={`dust-${i}`}
            className={styles.dust}
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              animationDelay: dot.delay,
              animationDuration: dot.dur,
            }}
          />
        ))}
    </div>
  );
}
