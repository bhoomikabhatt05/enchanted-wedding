import styles from "./WorldButton.module.css";

export default function WorldButton({ children, variant = "ghost", type = "button", ...props }) {
  const variantClass = variant === "solid" ? styles.solid : variant === "ink" ? styles.ink : "";

  return (
    <button type={type} className={`${styles.root} ${variantClass}`.trim()} {...props}>
      {children}
    </button>
  );
}
