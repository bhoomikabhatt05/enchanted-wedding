import styles from "./Divider.module.css";

export default function Divider({ className = "" }) {
  return (
    <div className={`${styles.root} ${className}`.trim()} role="separator">
      <span className={styles.line} />
      <span className={styles.mark} aria-hidden="true" />
      <span className={styles.line} />
    </div>
  );
}
