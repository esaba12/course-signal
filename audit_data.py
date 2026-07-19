#!/usr/bin/env python3
"""Run concise, repeatable data-quality checks before a demo or deployment."""

from __future__ import annotations

import sqlite3
import sys

import server

HERO_COURSES = ("124", "173", "225", "233", "374")


def main() -> int:
    if not server.DB_PATH.exists():
        print("FAIL: database missing. Run `python3 ingest.py` first.")
        return 1
    failures = []
    with sqlite3.connect(server.DB_PATH) as db:
        run = db.execute("SELECT cs_course_term_rows, skipped_rows, source_sha256 FROM ingestion_run ORDER BY id DESC LIMIT 1").fetchone()
        print(f"PASS: ingestion present — {run[0]:,} course-term aggregates, {run[1]:,} skipped rows, hash {run[2][:12]}…")
        for course in HERO_COURSES:
            rows = db.execute("SELECT COUNT(*), MIN(year), MAX(year), SUM(CASE WHEN students < 0 THEN 1 ELSE 0 END) FROM course_term_aggregate WHERE course_number=?", (course,)).fetchone()
            count, start, end, negatives = rows
            if count == 0:
                failures.append(f"CS {course} has no rows")
                continue
            if negatives:
                failures.append(f"CS {course} has negative student counts")
                continue
            print(f"PASS: CS {course} — {count} terms spanning {start}–{end}")
        duplicate_count = db.execute("SELECT COUNT(*) FROM (SELECT subject, course_number, year_term, COUNT(*) c FROM course_term_aggregate GROUP BY subject, course_number, year_term HAVING c > 1)").fetchone()[0]
        if duplicate_count:
            failures.append(f"{duplicate_count} duplicate course-term keys")
        else:
            print("PASS: no duplicate course-term keys")
    if failures:
        print("FAIL: " + "; ".join(failures))
        return 1
    print("PASS: audit complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

