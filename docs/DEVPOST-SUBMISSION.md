# OpenAI Build Week submission checklist

The recommended category is **Education**: Course Signal helps registrars, planners, and advisors use historical course signals to make better planning decisions.

## Rule-to-project checklist

- [x] Working project: the public entry screen, UIUC demo, dashboard, API, and local server expose the project without requiring an account.
- [x] Non-trivial implementation: institution adapters, source validation, SQLite aggregation, forecasting/backtesting, live-status provenance, comparisons, and review workflow.
- [x] Public code repository with `LICENSE`: `https://github.com/esaba12/class-analytics`.
- [x] Third-party data is credited in the README and its source terms must be preserved.
- [x] Pre-existing work is distinguished from submission-period additions in this document and the dated Git history.
- [x] No private or student-level data, secrets, credentials, or restricted institutional extracts are included in the repository.
- [ ] Public YouTube demo under three minutes, with audio, showing the product and how Codex/GPT-5.6 contributed.
- [ ] Paste the Codex Session ID for the project thread where most core functionality was built.
- [ ] Confirm the exact model label shown in the Codex session before describing GPT-5.6 usage; do not guess this value.

## Suggested demo path (under three minutes)

Use the full [demo script](DEMO-SCRIPT.md) when recording; it includes the narration, screen actions, algorithm explanation, and claims to avoid.

1. Open the public Course Signal entry screen and select the UIUC demo.
2. Briefly show the organization color presets and the “What we need from you” prototype.
3. Search for a course and change the comparable term.
4. Click a historical bar to inspect the term detail.
5. Add a comparison course and show the side-by-side forecast/backtest view.
6. Save a course to the review queue and export the planning handoff.
7. Close with the limitation: this is a transparent planning signal, not a capacity or waitlist forecast.

## README/Codex contribution statement

During the submission period, Codex was used to inspect the existing repository, implement the institution-neutral product language and interactive planner workbench, add the public demo entry flow, organization themes, Course Signal brand assets, and submission documentation, run the Python and Playwright test suites, and reconcile/publish the changes to GitHub. The final Devpost entry must supplement this statement with the verified model label and actual Codex Session ID; neither should be guessed.

## Pre-existing work versus submission-period work

Course Signal existed before the submission period. The pre-existing foundation includes the institution adapter architecture, public-data ingestion, SQLite aggregation, forecasting/backtesting, the dashboard, and the initial Course Signal mark. The submission-period additions are the institution-neutral public entry experience, UIUC demo chooser, organization color presets, document-intake prototype, refined brand variants and metadata, public documentation cleanup, and the associated tests and deployment validation. The dated Git history is the supporting evidence.

## Submission links to fill in

- Demo: `https://course-signal-demo.vercel.app`
- Repository: `https://github.com/esaba12/class-analytics`
- YouTube video: **ADD PUBLIC VIDEO URL**
- Codex Session ID: **ADD SESSION ID FROM THE PROJECT THREAD**
