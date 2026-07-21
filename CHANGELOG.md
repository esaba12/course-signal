# Changelog

All notable changes to this project are logged here so contributors can see what happened and why, without digging through commit history.

## Unreleased

### 2026-07-20 — Review and fix `feature/status-led-ui` before merge (Jonathan)

- **Fixed**: `ui-tests/dashboard.spec.js` — the "method explanation is accessible" test still targeted the old button name (`How to read this`) and old dialog copy (`does not know seats`) after the dashboard redesign changed both. This test would fail every PR/push CI run. Updated the selector to `How this works` and the content assertion to `Seats, fill rate, or waitlist size`, matching the new `<dialog>` markup. Verified with `npx playwright test` — both tests pass.
- **Removed**: unused `termLabel()` helper in `app/app.js` — defined during the redesign but never called anywhere.
- Verified backend is unaffected: `python -m unittest discover -s tests` still passes (4/4).
- Verified visually: loaded the dashboard locally (CS 225), confirmed the data-status strip, trend/forecast/backtest cards, chart + table, live-status panel, and method dialog all render as designed.
- Note for contributors: this repo requires Python 3.11+ (`ingest.py` uses `datetime.UTC`). If your default `python3` is older, install 3.11+ and use that explicitly.
