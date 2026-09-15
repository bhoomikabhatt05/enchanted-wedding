# Couple Photos

Drop final JPGs here (also copy to `src/assets/images/couple/` for build).

Supported filenames (any extension jpg/jpeg/png/webp/avif):
- `aarav` / `couple-aarav` / `groom`
- `meera` / `couple-meera` / `bride`
- `together` / `couple-together` / `couple`

They are auto-picked up by `src/lib/images.js` (`import.meta.glob` eager `?url`).
Use cinematic crops: preserve aspect ratio, ~3:4 for portraits, ~4:3 for together.
Film grain + soft glow handled in `StoryImage` — no filters on source needed.
