import styles from "./Parchment.module.css";

export default function Parchment({ children, className = "" }) {
  return (
    <div className={`materialParchment ${styles.root} ${className}`.trim()}>
      <div className={`materialPaperGrain ${styles.grain}`} aria-hidden="true" />
      <div className={styles.edge} aria-hidden="true" />
      <div className={styles.body}>{children}</div>
    </div>
  );
}
