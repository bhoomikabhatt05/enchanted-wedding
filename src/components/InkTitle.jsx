import { useEffect, useRef } from "react";
import styles from "./InkTitle.module.css";

/**
 * Enchanted ink title — letters develop like invisible ink becoming
 * visible, settling into gold/champagne (light) or ink (ink). An optional
 * handwritten rule draws itself underneath. Motion-gated: without
 * prefers-reduced-motion the text simply appears.
 */
export default function InkTitle({
  as: Tag = "h2",
  text = "",
  className = "",
  variant = "light",
  underline = false,
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          el.classList.add(styles.settled);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let key = 0;
  const words = String(text).split(" ");

  return (
    <Tag
      ref={ref}
      className={`${styles.root} ${variant === "ink" ? styles.ink : styles.light} ${className}`.trim()}
      {...props}
    >
      {words.map((word, wi) => (
        <span key={wi} className={styles.word}>
          {[...word].map((ch, ci) => (
            <span key={ci} className={styles.letter} style={{ "--i": key++ }}>
              {ch}
            </span>
          ))}
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
      {underline ? (
        <span
          className={styles.rule}
          aria-hidden="true"
          style={{ "--d": `${((key * 45 + 350) / 1000).toFixed(2)}s` }}
        />
      ) : null}
    </Tag>
  );
}
