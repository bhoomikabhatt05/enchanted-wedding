export function isVisualSystemPreview() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("visual-system");
}
