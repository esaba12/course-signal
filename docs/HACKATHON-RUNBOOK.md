# Hackathon Runbook

## Demo setup

1. Run `python3 ingest.py` once while online. This creates the local SQLite database.
2. Load one intentionally cached Course Explorer snapshot for the hero course:

   ```bash
   python3 ingest_live_snapshot.py --fetch --course "CS 225" --year 2026 --term fall
   ```

   The importer caches raw XML under `data/cache/` only after it parses a usable response, and writes the minimal dashboard snapshot to `data/live_status.json`. In development on 2026-07-17, a direct request returned an empty body; treat direct API access as a demo risk. If Course Explorer blocks a direct request, save a public XML response and use `--xml path/to/response.xml`; do not substitute invented section data. The JSON example remains a parser/display example only and must never be used in the actual demo.
3. Run `python3 server.py` and open `http://localhost:8000`.
4. Test CS 124, CS 173, CS 225, CS 233, and CS 374 before presenting.

## Presenting responsibly

- Call historical values “students receiving a final grade,” not enrollment capacity.
- Point to the forecast’s number of comparable terms and historic absolute error.
- State that the current-status panel is cached and timestamped.
- End with the institutional path: approved data, governed pilot, workflow discovery.

## Before demo day

- Refresh the historical dataset only if you want new data; check that outcomes remain sensible.
- Freeze the dashboard after selecting hero courses.
- Keep local data and a working local server ready in case venue Wi-Fi fails.
- Have one partner narrate the problem and another explain the “what this does not measure” guardrail.

## Why this snapshot approach

The live-status overlay is a point-in-time observation, not a continuous monitor. The official Course Explorer documentation describes schedule data as providing per-section live status such as open/closed; it does not support treating those values as numeric enrollment or capacity. Keeping a raw response and visible retrieval time makes the demo reproducible and honest.
