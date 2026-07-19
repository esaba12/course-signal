#!/usr/bin/env python3
"""Rank well-supported courses for an honest hackathon demo.

The report rewards comparable-history coverage and low relative backtest error.
It is a shortlist tool, not an instruction to hide poor model performance.
"""

from __future__ import annotations

import argparse
import csv
import sqlite3
import sys

import server


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--term", default="Fall", choices=["Fall", "Spring", "Summer", "Winter"])
    parser.add_argument("--limit", type=int, default=15)
    args = parser.parse_args()
    if not server.DB_PATH.exists():
        print("Database missing. Run `python3 ingest.py` first.", file=sys.stderr)
        return 1
    with sqlite3.connect(server.DB_PATH) as db:
        codes = [row[0] for row in db.execute("SELECT DISTINCT course_number FROM course_term_aggregate ORDER BY course_number")]
    candidates = []
    for number in codes:
        result = server.forecast_payload(f"CS {number}", args.term)
        if not result.get("eligible"):
            continue
        latest = result["latest_backtest"]
        relative_error = latest["absolute_error"] / max(latest["actual"], 1)
        candidates.append({
            "course": result["course"], "term": args.term, "history_terms": result["history_count"],
            "forecast": result["estimate"], "method": result["method"],
            "typical_absolute_error": result["typical_absolute_error"], "latest_backtest_actual": latest["actual"],
            "latest_backtest_error": latest["absolute_error"], "latest_backtest_relative_error": round(relative_error, 3),
        })
    candidates.sort(key=lambda row: (-row["history_terms"], row["latest_backtest_relative_error"], row["typical_absolute_error"]))
    writer = csv.DictWriter(sys.stdout, fieldnames=list(candidates[0]) if candidates else ["course"])
    writer.writeheader()
    writer.writerows(candidates[:args.limit])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

