#!/usr/bin/env python3
"""Run concise, repeatable data-quality checks before a demo or deployment."""

from __future__ import annotations

import sqlite3
import sys

import server


def main() -> int:
    if not server.DB_PATH.exists():
        print("FAIL: database missing. Run `python3 ingest.py` first.")
        return 1
    failures = []
    with sqlite3.connect(server.DB_PATH) as db:
        run = db.execute("SELECT course_term_rows, skipped_rows, source_sha256 FROM ingestion_run ORDER BY id DESC LIMIT 1").fetchone()
        print(f"PASS: ingestion present — {run[0]:,} course-term aggregates, {run[1]:,} skipped rows, hash {run[2][:12]}…")
        courses = db.execute("SELECT course_code FROM course_term_aggregate WHERE institution_id=? GROUP BY course_code ORDER BY COUNT(*) DESC LIMIT 5", (server.INSTITUTION["id"],)).fetchall()
        for (course,) in courses:
            rows = db.execute("SELECT COUNT(*), MIN(year), MAX(year), SUM(CASE WHEN headcount < 0 THEN 1 ELSE 0 END) FROM course_term_aggregate WHERE institution_id=? AND course_code=?", (server.INSTITUTION["id"], course)).fetchone()
            count, start, end, negatives = rows
            if count == 0:
                failures.append(f"{course} has no rows")
                continue
            if negatives:
                failures.append(f"{course} has negative headcounts")
                continue
            print(f"PASS: {course} — {count} terms spanning {start}–{end}")
        duplicate_count = db.execute("SELECT COUNT(*) FROM (SELECT institution_id, course_code, year_term, COUNT(*) c FROM course_term_aggregate GROUP BY institution_id, course_code, year_term HAVING c > 1)").fetchone()[0]
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
