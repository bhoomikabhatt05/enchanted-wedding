import styles from "./Label.module.css";

export default function Label({ children, ink = false, as: Tag = "p", className = "" }) {
  return (
    <Tag className={`${styles.root} ${ink ? styles.ink : ""} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
