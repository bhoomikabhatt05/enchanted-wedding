import Experience from "./experience/Experience";
import VisualSystemPreview from "./dev/VisualSystemPreview";
import { isVisualSystemPreview } from "./dev/isVisualSystemPreview";

export default function App() {
  if (isVisualSystemPreview()) {
    return <VisualSystemPreview />;
  }

  return <Experience />;
}
