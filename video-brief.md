# Video Brief: Course Signal

## Research (from source, current working tree — branch `fix/branded-file-picker`)

- **Directory:** `/Users/ethansaba/code/uiuc-course-demand-tool` (canonical — the `course-signal-interactive` and `course-signal-logo` directories are stale worktrees of already-merged branches; ignore them). Repo `esaba12/class-analytics`. Live demo `uiuc-course-demand-tool.vercel.app` may lag behind this branch's UI — building from source, not the deployed site.
- **Real palette** (`app/styles.css` `:root`): ink `#16212c`, muted `#5f6d78`, paper `#f5f3ed` (page bg), surface `#fffdf9` (card bg), line `#d9d5cb`, orange `#f65f0a` (accent/pathway), orange-dark `#ba3e00`, teal `#006b82` (signal/supporting UI), teal-soft `#e4f2f3`, green `#136c4e` (ready status), amber `#8c5b00` (pending status), red `#a72b21` (error/closed).
- **Real brand system** (`docs/BRAND.md`): "two arcs suggest a usable signal; the rising waypoints suggest a course moving through a planning path" — deliberately institution-neutral, no graduation caps or campus colors.
- **Real font:** Inter (system sans) — the actual product's only typeface, used for both headline and body.
- **Real hero copy** (`app/landing.html`): eyebrow "CONFIGURABLE PLANNING SIGNAL", headline "Make the next planning conversation clearer.", CTA "Explore the UIUC demo →". Organization picker shows a "UI" icon card with a "Demo" badge — explicitly built so more institutions can be added without the product being UIUC-specific.
- **Real dashboard structure** (`app/index.html`): a readiness strip ("Historical signal ready" / green dot), a 3-card summary grid — **RECENT OBSERVED CHANGE**, **NEXT COMPARABLE TERM** (the estimate, styled as the "primary" card with an orange top border), **MODEL CHECK** (backtest) — plus a course search/comparison-chip control bar.
- **Real restraint/guardrail copy** (`docs/PITCH.md`, the project's own 2-minute pitch script): *"Course planning conversations often start from anecdotes... But public schedule data does not provide numeric capacity, so we refused to fake a seat-crunch metric."* Explicit "Do not say" list: "We predict capacity," "We know demand," "The model tells departments what to cut." Demo example is always CS 225, compared Fall-to-Fall (never mixing a summer section with a large fall lecture) with a real backtest (what the method would have predicted before a known past term happened vs. what actually occurred).

## Tone / hook

- Tone: serious, deliberately restrained — the project's own docs actively police overclaiming. Confidence comes from precision and honesty about limits, not hype.
- Hook: use the project's own hero line verbatim — **"Make the next planning conversation clearer."**
- Closing line: pull from the same restraint the docs insist on — a planning signal, not a capacity forecast.

## Show-the-thing (non-negotiable visual sequence)

1. Hook — wordmark + real hero headline on the paper/cream background.
2. The organization picker — the real "UI" card + "Demo" badge + "Explore the UIUC demo →" CTA, proving the product is institution-configurable, not UIUC-only.
3. The dashboard payoff — CS 225 selected, Fall-to-Fall comparison, the real 3-card grid (Recent Observed Change / Next Comparable Term / Model Check) landing with real card labels and the readiness strip's green "Historical signal ready" dot.
4. Outro — restrained closing line + credit.

## Format / duration

Landscape, ~18-19s. Hook 3s → Org picker 4s → Dashboard payoff 8s (needs the most room — three cards plus the readiness strip) → Outro 3s.

## Next step

Build the composition directly from the real CSS tokens/copy above — no live screenshots needed, this branch is ahead of the deployed demo.
