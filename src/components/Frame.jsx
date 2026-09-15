import Label from "./Label";
import styles from "./Frame.module.css";

export default function Frame({ ratio = "portrait", caption = "Study" }) {
  return (
    <figure className={`${styles.root} ${ratio === "wide" ? styles.wide : styles.portrait}`}>
      <span className={styles.grain} aria-hidden="true" />
      <Label as="figcaption" className={styles.caption}>
        {caption}
      </Label>
    </figure>
  );
}
