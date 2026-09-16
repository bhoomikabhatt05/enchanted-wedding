import styles from "./Label.module.css";

export default function Label({ children, ink = false, as: Tag = "p", className = "", sigil = false }) {
  return (
    <Tag className={`${styles.root} ${ink ? styles.ink : ""} ${className}`.trim()}>
      {sigil ? (
        <span className={styles.sigil} aria-hidden="true">
          ✦
        </span>
      ) : null}
      {children}
    </Tag>
  );
}
