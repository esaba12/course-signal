# Deployment Guide

## Recommendation for the hackathon

Use a local run as the primary demo environment and a Render deployment as a backup/shareable URL. The local run avoids venue Wi-Fi risk; the hosted URL makes it easy for judges to revisit the project.

## Local demo (primary)

```bash
python3 ingest.py
python3 server.py
```

Open `http://localhost:8000`. This is the most reliable option after the source data has been cached.

## Render deployment (backup)

1. Push the project to a private GitHub repository with the included PR-only workflow.
2. Create a Render account/service from that repository.
3. Render detects `render.yaml`; confirm its build command is `python3 ingest.py` and its health check is `/api/health`.
4. Open the deployed URL and verify `/api/health`, CS 225, and the forecast/backtest cards.
5. Warm the URL shortly before judging. Free services may cold-start.

## Important deployment facts

- The historical source CSV and SQLite database are intentionally ignored by git. The host rebuilds them from the public source during its build step.
- A Course Explorer live-status snapshot is optional. Do not deploy an example or invented snapshot as real status data.
- If a real reviewed snapshot is needed in deployment, add it through an approved, documented process. Do not commit private or student-level data.
- The included app has no accounts, secrets, or write endpoints.

## Release check

- `python3 -m unittest discover -s tests -v` passes.
- `/api/health` shows a current ingestion record.
- At least three hero courses render with chart, estimate, and backtest.
- Source, measurement caveat, and status timestamp/unavailability are visible.

