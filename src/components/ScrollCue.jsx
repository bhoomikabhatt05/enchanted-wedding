import Label from "./Label";
import styles from "./ScrollCue.module.css";

export default function ScrollCue({ label = "Continue" }) {
  return (
    <div className={styles.root}>
      <span className={styles.line} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
      <Label>{label}</Label>
    </div>
  );
}
