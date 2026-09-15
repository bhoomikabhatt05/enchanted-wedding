import { useState } from "react";
import ArtFrame from "./ArtFrame";
import { imageSource } from "../lib/images";
import styles from "./StoryImage.module.css";

/**
 * Semantic photograph slot with an intentional illustrated fallback.
 * Supply `image` from `src/lib/images.js`; no paths are hardcoded in scenes.
 */
export default function StoryImage({
  image,
  alt = "",
  tone = "night",
  frame = "portrait",
  eager = false,
  className = "",
}) {
  const [failed, setFailed] = useState(false);
  const source = failed ? null : imageSource(image);

  if (!source) {
    return <ArtFrame tone={tone} shape={frame} className={`${styles.fallback} ${className}`.trim()} />;
  }

  return (
    <div className={`${styles.frame} ${styles[`frame-${frame}`]} ${className}`.trim()}>
      <img
        src={source}
        alt={alt}
        className={styles.photo}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
      />
      <span className={styles.treatment} aria-hidden="true" />
      <span className={styles.grain} aria-hidden="true" />
    </div>
  );
}
