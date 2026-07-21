# Course Signal

A configurable, per-institution planning-signal prototype. UIUC is the demo data adapter; the product identity and deployment are institution-neutral.

## Important scope

This is an advisor-facing planning signal—not a capacity forecast, waitlist predictor, or automated decision-maker. Historical headcount is the sum of students receiving a final grade; it excludes withdrawals and does not equal initial enrollment or seat capacity.

## Run locally

```bash
python3 ingest.py --institution uiuc
python3 server.py
```

Then visit `http://localhost:8000`.

`ingest.py` downloads the UIUC GPA dataset on its first run and builds an institution-isolated database. Subsequent runs use the cached CSV unless `--refresh` is supplied. To verify the portable reference deployment, run `python3 validate_institution.py --institution riverview-demo` and `python3 ingest.py --institution riverview-demo`, then start with `COURSE_SIGNAL_INSTITUTION=riverview-demo python3 server.py`.

## Data credits

- Historical data: [wadefagen/datasets](https://github.com/wadefagen/datasets), UIUC GPA dataset.
- Planned live-status source: UIUC Course Explorer. Live snapshots are intentionally cached, timestamped, and never presented as continuously monitored.

## Project map

- `config/institutions/` — isolated institution configuration and source/measurement definitions.
- `ingest.py` — adapter-driven download, validation, aggregation, and storage.
- `ingest_live_snapshot.py` — validates a deliberately cached, reviewed status snapshot.
- `server.py` — dependency-free local API and dashboard server.
- `app/` — one-screen dashboard.
- `data/live_status.json` — optional cached Course Explorer snapshot fixture.

Read [the demo runbook](docs/HACKATHON-RUNBOOK.md) before presenting.

Useful companion docs: [data dictionary](docs/DATA-DICTIONARY.md), [pitch](docs/PITCH.md), and [integration decisions](docs/INTEGRATION-DECISIONS.md).

For a local-first demo and hosted backup plan, see [deployment](docs/DEPLOYMENT.md).

For a Vercel serverless deployment, see [Vercel deployment](docs/VERCEL.md).

Before presenting, run `python3 audit_data.py` and use the [demo checklist](docs/DEMO-CHECKLIST.md).

Use the [institution onboarding guide](docs/INSTITUTION-ONBOARDING.md) with registrars and planners before adding an institution. The [customer-discovery guide](docs/CUSTOMER-DISCOVERY.md) helps establish the decision workflow first.

For the product story and the reason UIUC appears in the demo, see [product pitch](docs/PRODUCT-PITCH.md) and [UIUC demo adapter](docs/UIUC-DEMO.md).

For automated browser QA, see [Playwright tests](docs/PLAYWRIGHT.md).
