# Playwright UI Tests

Playwright gives the team a repeatable browser-level check of the configured-institution path. It confirms the dashboard renders, the configured default course loads, the chart/forecast/backtest appear, the guardrail is visible, and the method explainer opens.

## First-time setup

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm run test:ui
```

The test starts the local Python server automatically when one is not already running. On success, it saves a configured-institution screenshot under `test-results/`; the folder is ignored by git.

## Headed visual check

```bash
npm run test:ui:headed
```

Use this before the demo to observe the actual click path. Playwright is a QA tool; the documented manual [visual QA](VISUAL-QA.md) remains valuable for partner comprehension and presentation polish.
