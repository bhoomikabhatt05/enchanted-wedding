import Atmosphere from "../experience/overlays/Atmosphere";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import Divider from "../components/Divider";
import Frame from "../components/Frame";
import Label from "../components/Label";
import Parchment from "../components/Parchment";
import ScrollCue from "../components/ScrollCue";
import Seal from "../components/Seal";
import TapCue from "../components/TapCue";
import WorldButton from "../components/WorldButton";
import styles from "./VisualSystemPreview.module.css";

const SWATCHES = [
  { name: "Midnight Navy", value: "#0B1422", token: "--color-midnight-navy" },
  { name: "Deep Charcoal", value: "#12100F", token: "--color-deep-charcoal" },
  { name: "Antique Gold", value: "#C9A96B", token: "--color-antique-gold" },
  { name: "Warm Champagne", value: "#E8D7B5", token: "--color-warm-champagne" },
  { name: "Aged Parchment", value: "#D8C5A0", token: "--color-aged-parchment" },
  { name: "Deep Burgundy", value: "#641F2B", token: "--color-deep-burgundy" },
  { name: "Forest Green", value: "#18382F", token: "--color-forest-green" },
];

const SPACES = [
  { name: "XS", token: "--space-xs" },
  { name: "S", token: "--space-s" },
  { name: "M", token: "--space-m" },
  { name: "L", token: "--space-l" },
  { name: "XL", token: "--space-xl" },
  { name: "2XL", token: "--space-2xl" },
];

export default function VisualSystemPreview() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={styles.page}>
      <p className={styles.badge}>
        <Label as="span">Visual system · development only</Label>
      </p>

      <header className={styles.intro}>
        <Atmosphere reducedMotion={reducedMotion} contained />
        <Label>Stage one</Label>
        <h1 className="typeDisplay">
          Night <em className="typeScript">and</em> paper
        </h1>
        <Divider />
        <p className={`typeBody ${styles.lede}`}>
          A private specimen of the cinematic invitation language: dark atmosphere,
          parchment as a material, gold as a quiet accent. No wedding narrative yet.
        </p>
        <ScrollCue label="Inspect" />
      </header>

      <section className={styles.section} aria-labelledby="palette">
        <Label as="h2" id="palette">
          Palette
        </Label>
        <ul className={styles.swatches}>
          {SWATCHES.map((swatch) => (
            <li key={swatch.value} className={styles.swatch}>
              <span className={styles.chip} style={{ background: `var(${swatch.token})` }} />
              <Label>{swatch.name}</Label>
              <span className={styles.hex}>{swatch.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="type">
        <Label as="h2" id="type">
          Typography
        </Label>
        <div className={styles.typeGrid}>
          <div className={styles.typeStack}>
            <p className="typeLabel">Display · Cormorant Garamond</p>
            <p className="typeDisplay">Midnight</p>
            <p className="typeLabel">Section heading</p>
            <p className="typeHeading">The room holds its breath</p>
            <p className="typeLabel">Body · Newsreader</p>
            <p className="typeBody">
              Body text is meant to be read slowly. Script is reserved for a single word of
              emphasis, never for a paragraph or a control.
            </p>
          </div>
          <div className={styles.typeAside}>
            <p className="typeLabel">Script accent</p>
            <p className="typeScript">beloved</p>
            <p className="typeLabel">Metadata</p>
            <p className="typeLabel">Chapter mark · evening</p>
            <p className="typeLabel">Numerical</p>
            <p className="typeNumeral">08 14</p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="atmosphere">
        <Label as="h2" id="atmosphere">
          Dark cinematic material
        </Label>
        <div className={`${styles.stage} materialNight`}>
          <Atmosphere reducedMotion={reducedMotion} contained />
          <div className={styles.stageCopy}>
            <p className="typeHeading">Candle in a vast room</p>
            <p className="typeBody">
              Navy and charcoal hold the world. Light stays low. Gold appears only as a
              glint at the edge of vision.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="layers">
        <Label as="h2" id="layers">
          Atmospheric effects
        </Label>
        <div className={styles.layers}>
          <div className={`${styles.layer} materialCharcoal`}>
            <div className={`materialVignette ${styles.layerFill}`} />
            <Label>Vignette</Label>
          </div>
          <div className={`${styles.layer} materialCharcoal`}>
            <div className={`materialGlow ${styles.layerFill}`} />
            <Label>Candle glow</Label>
          </div>
          <div className={`${styles.layer} materialCharcoal`}>
            <div className={`materialHaze ${styles.layerFill}`} />
            <Label>Haze</Label>
          </div>
          <div className={`${styles.layer} materialCharcoal`}>
            <div className={`materialFilmGrain ${styles.layerFill}`} />
            <Label>Film grain</Label>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="parchment">
        <Label as="h2" id="parchment">
          Parchment material
        </Label>
        <Parchment>
          <Label ink>Document surface</Label>
          <p className={`typeHeading ${styles.inkHeading}`}>A letter waits unopened</p>
          <p className={`typeBody ${styles.inkBody}`}>
            Parchment is a change of world, not a card. Grain, softened edges, and ink-dark
            type. Gold recedes; the paper carries the story.
          </p>
        </Parchment>
      </section>

      <section className={styles.section} aria-labelledby="gold">
        <Label as="h2" id="gold">
          Gold detailing
        </Label>
        <Divider />
        <hr className={`materialGoldLine ${styles.goldRule}`} />
        <div className={styles.ornaments}>
          <span className="ornamentMark" />
          <span className="ornamentMark" />
          <span className="ornamentMark" />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="controls">
        <Label as="h2" id="controls">
          Controls
        </Label>
        <div className={styles.controls}>
          <WorldButton>Continue</WorldButton>
          <WorldButton variant="solid">Reveal</WorldButton>
          <Seal />
          <TapCue />
          <ScrollCue />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="frames">
        <Label as="h2" id="frames">
          Image treatment
        </Label>
        <div className={styles.frames}>
          <Frame caption="Neutral field" />
          <Frame ratio="wide" caption="Wide study" />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="space">
        <Label as="h2" id="space">
          Spacing
        </Label>
        <ul className={styles.spaces}>
          {SPACES.map((item) => (
            <li key={item.name} className={styles.spaceRow}>
              <Label as="span">{item.name}</Label>
              <span className={styles.spaceBar} style={{ width: `var(${item.token})` }} />
            </li>
          ))}
        </ul>
        <div className={styles.spaceSample}>
          <p className="typeLabel">Mobile column · page pad</p>
          <p className="typeBody">
            Text sits in a narrow, breathable column. Touch targets stay at least 44px.
            Desktop widens the margin, not the density.
          </p>
        </div>
      </section>

      <section className={styles.transition} aria-labelledby="ink">
        <Label as="h2" id="ink">
          Ink transition
        </Label>
        <div className={styles.inkScene}>
          <div className={styles.inkNight}>
            <p className="typeHeading">From the dark</p>
          </div>
          <div className={`materialInkEdge ${styles.inkBlot}`} aria-hidden="true" />
          <Parchment className={styles.inkPaper}>
            <p className={`typeScript ${styles.inkScript}`}>into paper</p>
            <p className={`typeBody ${styles.inkBody}`}>
              A seam of ink, then the document. The story will later use this change of
              material instead of a hard cut.
            </p>
            <WorldButton variant="ink">Unfold</WorldButton>
          </Parchment>
        </div>
      </section>
    </div>
  );
}
