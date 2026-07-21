# Course Signal brand system

The Course Signal identity is an institution-neutral signal-and-pathway system. Two arcs suggest a usable signal; the rising waypoints suggest a course moving through a planning path. It intentionally avoids graduation caps, campus landmarks, and school-specific colors so the same identity can travel across institutions.

## Files

- `app/assets/course-signal-mark.svg` — full-color source mark, used by the app header and favicon.
- `app/assets/course-signal-mark-mono.svg` — light/dark-safe monochrome mark for constrained surfaces.
- `app/assets/course-signal-social.svg` — 1200×630 social preview artwork.
- `app/manifest.json` — PWA metadata and install icons.

The Vercel build copies `app/` to `public/`, so the asset is included in deploys automatically.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#16212C` | Primary mark and type |
| Teal | `#006B82` | Signal arc and supporting UI |
| Orange | `#F65F0A` | Pathway accent and action emphasis |

## Usage

- Keep the mark on light, quiet surfaces with enough clear space to preserve the arcs.
- Use the live `Course Signal` wordmark beside it when the product name is needed; do not bake institution names into the asset.
- At small sizes, use the mark alone. At larger sizes, keep the mark and wordmark optically balanced rather than scaling the mark to the height of the full headline.
- Organization themes may recolor interface accents, but the core mark remains CourseSignal-owned and institution-neutral.
- Do not recolor the core mark with a campus palette, add a graduation cap, or place it in a generic badge/container.
