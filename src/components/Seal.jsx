import styles from "./Seal.module.css";

export default function Seal({ mark = "E", label = "Seal", ...props }) {
  return (
    <button type="button" className={styles.root} aria-label={label} {...props}>
      <span className={styles.mark} aria-hidden="true">
        {mark}
      </span>
    </button>
  );
}
