# OpenAI Build Week submission checklist

The recommended category is **Education**: Course Signal helps registrars, planners, and advisors use historical course signals to make better planning decisions.

## Rule-to-project checklist

- [x] Working project: the Vercel demo and local server expose the dashboard and API.
- [x] Non-trivial implementation: institution adapters, source validation, SQLite aggregation, forecasting/backtesting, live-status provenance, comparisons, and review workflow.
- [x] Public code repository with `LICENSE`.
- [x] Third-party data is credited in the README and its source terms must be preserved.
- [ ] Public YouTube demo under three minutes, with audio, showing the product and how Codex/GPT-5.6 contributed.
- [ ] Paste the Codex Session ID for the project thread where most core functionality was built.
- [ ] Confirm the exact model label shown in the Codex session before describing GPT-5.6 usage; do not guess this value.

## Suggested demo path (under three minutes)

1. Open the hosted demo and identify the institution-neutral Course Signal workflow.
2. Search for a course and change the comparable term.
3. Click a historical bar to inspect the term detail.
4. Add a comparison course and show the side-by-side forecast/backtest view.
5. Save a course to the review queue and export the planning handoff.
6. Close with the limitation: this is a transparent planning signal, not a capacity or waitlist forecast.

## README/Codex contribution statement

During the submission period, Codex was used to inspect the existing repository, implement the institution-neutral product language and interactive planner workbench, add the Course Signal brand mark, run the Python and Playwright test suites, and reconcile/publish the changes to GitHub. The final Devpost entry should supplement this statement with the verified GPT-5.6 model details and the actual Codex Session ID.

## Submission links to fill in

- Demo: `https://course-signal-demo.vercel.app`
- Repository: `https://github.com/esaba12/class-analytics`
- YouTube video: **ADD PUBLIC VIDEO URL**
- Codex Session ID: **ADD SESSION ID FROM THE PROJECT THREAD**
