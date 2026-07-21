# Course Signal — three-minute demo script

This script is designed for the OpenAI Build Week video requirement: a public YouTube demo under three minutes, with audio, showing the working product and how Codex/GPT-5.6 contributed. Keep the browser zoom at 100%, use a clean demo profile, and record the full browser window so the URL and product context are visible.

## Before recording

- Open `https://course-signal-demo.vercel.app` in a fresh browser tab.
- Confirm the demo loads and that the entry screen says **Public demo · no account required**.
- Use the UIUC adapter only as the visible example. Say explicitly that the product is institution-neutral and that UIUC is the public-data demo.
- Have the repository README and the latest dated commit history ready in a second tab for the Codex segment.
- Do not imply that the cached current-status panel is continuous monitoring. If it says unavailable, leave it visible and explain why; do not manufacture a snapshot.
- If the exact Codex model label or Session ID has not been verified, leave those out of the recording and add them to Devpost separately.

## Timed recording script (about 2:50)

### 0:00–0:18 — The problem

**On screen:** Entry screen, Course Signal mark, and the “What it gives you” card.

**Say:**

> Registrars and course planners often have to make the next scheduling conversation from anecdotes: a class felt crowded, a section disappeared, or a trend looked different this year. Course Signal turns the history they already have into a transparent signal—without pretending it is a capacity or waitlist forecast.

### 0:18–0:35 — Institution-neutral product

**On screen:** Point to the UIUC demo selector and organization-color presets.

**Say:**

> This is the UIUC public-data demo, not a UIUC-only product. The underlying system is configured per institution: each deployment supplies its own source, academic terms, measurement definition, and optional current-status connector. The UIUC dataset simply gives us an accessible, reproducible example.

### 0:35–1:05 — Start a planning question

**On screen:** Click “Explore the UIUC demo.” Select a course and choose Fall or another comparable term.

**Say:**

> I’ll start with one course and compare like-for-like terms. The dashboard gives us the recent observed change, the next comparable-term estimate, and a model check. The chart is not decorative: every bar is keyboard accessible, and I can open the source rows behind an observation.

### 1:05–1:28 — Inspect the evidence

**On screen:** Click a historical bar, then open the table.

**Say:**

> Clicking a bar shows the exact term, observed value, and how many source rows contributed to it. The table provides the same evidence in a form a planning team can review. The source and ingestion timestamp are available in the health and method views, so the result is traceable rather than a mystery score.

### 1:28–1:58 — Explain the algorithm honestly

**On screen:** Open “How this works.” Show the estimate and backtest cards.

**Say:**

> The forecast is intentionally simple and inspectable. Course Signal tests three baselines: the last comparable term, a three-term moving average, and a linear trend over the comparable years. It then hides each historic term in turn, trains only on earlier terms, measures absolute error, and selects the method with the lowest mean absolute error. If there are fewer than five comparable terms, it withholds the estimate instead of guessing. The error shown here is historic mean absolute error—not a confidence interval.

### 1:58–2:20 — Compare courses

**On screen:** Use “Add comparison” to select a second course.

**Say:**

> Planning rarely happens one course at a time. I can search by course code or title, add another course, and compare the latest observation, estimate, history length, and typical error side by side. The URL preserves the selected courses and term, so this view can be handed to a colleague.

### 2:20–2:38 — Turn a signal into a workflow

**On screen:** Add a course to review, enter a note/status, save it, then click “Export CSV.”

**Say:**

> A signal is only useful if it moves the conversation forward. I can save a course with a status and a planning note, then export the selected history and estimates as a CSV handoff. Notes stay in this browser in the prototype; shared institutional storage is deliberately not implied.

### 2:38–2:50 — Guardrails and build story

**On screen:** Show the decision-support guardrail, then briefly show the GitHub README or commit history.

**Say:**

> Course Signal does not see rooms, staffing, capacity, waitlists, or individual student intent. It asks a better question for a human planner; it does not make the decision. We used Codex to turn the adapter architecture into this interactive workflow, add the comparison and review tools, test the API and browser paths, and ship the public demo. The verified model name and Codex Session ID are included in the Devpost submission record.

## Closing frame

Leave the dashboard on the comparison or review view with the Course Signal mark visible. Do not add music, stock footage, or unlicensed logos. Keep the final video below three minutes.

## Claims to avoid

- “We predict capacity.”
- “We know demand.”
- “The model tells departments what to cut.”
- “Open means seats are available.”
- “This is live monitoring.”
- “GPT made the forecast.”
