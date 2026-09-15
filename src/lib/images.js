/**
 * Central replaceable photograph system.
 *
 * All artwork lives in `public/assets/` and is served relative to the site
 * root, which works unchanged on localhost and on Vercel (`BASE_URL` aware).
 * No component hardcodes a path — scenes only use the keys below.
 *
 * The site serves optimized `.webp` derivatives (see
 * `scripts/optimize-assets.mjs`). Originals are kept untouched next to them
 * as `fallback` — never loaded by the browser unless needed.
 *
 * Folders:
 * - public/assets/illustrations/  star chart, storybook, map, ornament
 * - public/assets/couple/         all couple + memory photographs
 * - public/assets/events/         venue, ceremony, reception, couple-wedding
 */

const base = import.meta.env.BASE_URL || "/";

const SOURCE_EXT = /\.(jpe?g|png)$/i;

function asset(path) {
  const normalized = String(path).replace(/^\/+/, "");
  const webp = normalized.replace(SOURCE_EXT, ".webp");
  return {
    src: `${base}assets/${webp}`,
    fallback: `${base}assets/${normalized}`,
    file: normalized,
  };
}

export const images = {
  illustrations: {
    starChart: asset("illustrations/celestial-star-chart.png"),
    storybook: asset("illustrations/couple-storybook.png"),
    map: asset("illustrations/magical-map.png"),
    ornament: asset("illustrations/celestial-ornament.png"),
  },
  couple: {
    main: asset("couple/couple-main.jpg"),
    formal: asset("couple/couple-formal.jpg"),
    firstMeeting: asset("couple/first-meeting.jpg"),
    firstWalk: asset("couple/first-walk.jpg"),
    cafe: asset("couple/cafe-memory.jpg"),
    lake: asset("couple/couple-lake.jpg"),
    lights: asset("couple/couple-lights.jpg"),
    dinner: asset("couple/dinner-memory.jpg"),
    ceremony: asset("couple/memory-ceremony.jpg"),
  },
  events: {
    venue: asset("events/wedding-venue.jpg"),
    ceremony: asset("events/wedding-ceremony.jpg"),
    reception: asset("events/wedding-reception.jpg"),
    coupleWedding: asset("events/couple-wedding.jpg"),
  },
  memories: {
    firstMeeting: asset("couple/first-meeting.jpg"),
    firstWalk: asset("couple/first-walk.jpg"),
    cafe: asset("couple/cafe-memory.jpg"),
    lake: asset("couple/couple-lake.jpg"),
    lights: asset("couple/couple-lights.jpg"),
    dinner: asset("couple/dinner-memory.jpg"),
    ceremony: asset("couple/memory-ceremony.jpg"),
  },
  map: {
    base: asset("illustrations/magical-map.png"),
  },
};

export function imageSource(image) {
  return image && typeof image.src === "string" ? image.src : null;
}
