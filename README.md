# UIUC CS Course Signal

A five-day hackathon prototype for exploring UIUC CS course **completed-grade headcount** over comparable terms. It combines public historical data with a cache-ready current section-status panel.

## Important scope

This is an advisor-facing planning signal—not a capacity forecast, waitlist predictor, or automated decision-maker. Historical headcount is the sum of students receiving a final grade; it excludes withdrawals and does not equal initial enrollment or seat capacity.

## Run locally

```bash
python3 ingest.py
python3 server.py
```

Then visit `http://localhost:8000`.

`ingest.py` downloads the public GPA dataset on its first run and builds `data/course_signal.db`. Subsequent runs use the cached CSV unless `--refresh` is supplied. The live-status importer follows the same cache-first principle and only retrieves one explicitly requested course snapshot.

## Data credits

- Historical data: [wadefagen/datasets](https://github.com/wadefagen/datasets), UIUC GPA dataset.
- Planned live-status source: UIUC Course Explorer. Live snapshots are intentionally cached, timestamped, and never presented as continuously monitored.

## Project map

- `ingest.py` — download, validate, aggregate, and store public historical data.
- `ingest_live_snapshot.py` — validates a deliberately cached, reviewed status snapshot.
- `server.py` — dependency-free local API and dashboard server.
- `app/` — one-screen dashboard.
- `data/live_status.json` — optional cached Course Explorer snapshot fixture.

Read [the demo runbook](docs/HACKATHON-RUNBOOK.md) before presenting.

Useful companion docs: [data dictionary](docs/DATA-DICTIONARY.md), [pitch](docs/PITCH.md), and [integration decisions](docs/INTEGRATION-DECISIONS.md).

For a local-first demo and hosted backup plan, see [deployment](docs/DEPLOYMENT.md).

Before presenting, run `python3 audit_data.py` and use the [demo checklist](docs/DEMO-CHECKLIST.md).

After the hackathon, use the [customer-discovery guide](docs/CUSTOMER-DISCOVERY.md) before expanding data access or building institutional integrations.

For automated browser QA, see [Playwright tests](docs/PLAYWRIGHT.md).
