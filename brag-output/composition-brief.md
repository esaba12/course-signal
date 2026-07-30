# Hyperframes Composition Brief: Course Signal

## Objective
Short launch-style brag video for Course Signal.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080, ~18.5s

## Source Material
- Project root: `/Users/ethansaba/code/uiuc-course-demand-tool` (branch `fix/branded-file-picker`)
- Primary files: `app/styles.css` (design tokens), `app/landing.html` (hero + org picker), `app/index.html` (dashboard grid), `docs/BRAND.md`, `docs/PITCH.md`
- Tagline: "Make the next planning conversation clearer."
- Key UI moments: organization picker ("UI" card, "Demo" badge, "Explore the UIUC demo →"), the 3-card summary grid (Recent Observed Change / Next Comparable Term / Model Check), readiness strip.
- Copy that must appear verbatim: the hero line above, "CONFIGURABLE PLANNING SIGNAL", card labels, "Historical signal ready", "CS 225".

## Creative Direction
- Tone preset: `polished`
- Direction: restrained, guardrail-conscious confidence
- Avoid: hype language, invented statistics, anything the project's own "do not say" list bans.

## Visual Identity
Ink `#16212c`, muted `#5f6d78`, paper `#f5f3ed`, surface `#fffdf9`, line `#d9d5cb`, orange `#f65f0a`, teal `#006b82`, teal-soft `#e4f2f3`, green `#136c4e`, amber `#8c5b00`. Font: Inter.

## Storyboard
See `brag-plan.md`. Scenes: Hook (3s) → Organization picker (4s) → Dashboard payoff (8s, beat-locked estimate reveal at 12.55s) → Outro (3.5s).

## Audio
`happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`, steady/clean, sparse SFX. See `brag-plan.md` Audio direction.

## Hyperframes Instructions
Load `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`. Show real UI/copy above. Keep readable, 15-25s. Run `hyperframes check` before render.
