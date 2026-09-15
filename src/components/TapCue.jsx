import Label from "./Label";
import styles from "./TapCue.module.css";

export default function TapCue({ label = "Hold to open" }) {
  return (
    <div className={styles.root}>
      <span className={styles.ring} aria-hidden="true" />
      <Label>{label}</Label>
    </div>
  );
}
