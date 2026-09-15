import { useMemo } from "react";
import styles from "./StarField.module.css";

function mulberry(seed) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Deterministic, performant star field for night scenes.
 * `scatter` controls vertical spread (0.45 keeps stars high in the sky).
 */
export default function StarField({
  count = 42,
  seed = 7,
  scatter = 0.55,
  className = "",
}) {
  const stars = useMemo(() => {
    const rand = mulberry(seed);
    return Array.from({ length: count }, () => ({
      top: `${(rand() * scatter * 100).toFixed(1)}%`,
      left: `${(rand() * 98).toFixed(1)}%`,
      size: rand() > 0.85 ? 2 : rand() > 0.6 ? 1.5 : 1,
      opacity: (0.12 + rand() * 0.5).toFixed(2),
      delay: (rand() * 6).toFixed(2),
    }));
  }, [count, seed, scatter]);

  return (
    <div className={`${styles.field} ${className}`.trim()} aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className={styles.star}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}