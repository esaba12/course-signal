#!/usr/bin/env python3
"""Build a reproducible SQLite database from the public UIUC GPA dataset."""

from __future__ import annotations

import argparse
import csv
import hashlib
import sqlite3
import sys
import urllib.request
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"
CSV_PATH = DATA_DIR / "uiuc-gpa-dataset.csv"
DB_PATH = DATA_DIR / "course_signal.db"
SOURCE_URL = "https://raw.githubusercontent.com/wadefagen/datasets/main/gpa/uiuc-gpa-dataset.csv"
REQUIRED_COLUMNS = {"Year", "Term", "YearTerm", "Subject", "Number", "Course Title", "Students"}


def download_csv(force: bool) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    if CSV_PATH.exists() and not force:
        print(f"Using cached source: {CSV_PATH}")
        return
    print(f"Downloading public source: {SOURCE_URL}")
    request = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "UIUC-Course-Signal-Hackathon/0.1"})
    with urllib.request.urlopen(request, timeout=90) as response, CSV_PATH.open("wb") as out:
        out.write(response.read())
    print(f"Saved {CSV_PATH}")


def build_database() -> None:
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        headers = set(reader.fieldnames or [])
        missing = REQUIRED_COLUMNS - headers
        if missing:
            raise ValueError(f"Unexpected source format. Missing columns: {sorted(missing)}")

        aggregates: dict[tuple[str, str, int, str, str], dict[str, object]] = {}
        skipped = 0
        for row in reader:
            if (row.get("Subject") or "").strip().upper() != "CS":
                continue
            try:
                year = int((row.get("Year") or "").strip())
                students = int(float((row.get("Students") or "").strip()))
            except ValueError:
                skipped += 1
                continue
            term = (row.get("Term") or "").strip()
            number = (row.get("Number") or "").strip()
            title = (row.get("Course Title") or "").strip()
            year_term = (row.get("YearTerm") or "").strip()
            if not (term and number and year_term):
                skipped += 1
                continue
            key = ("CS", number, year, term, year_term)
            record = aggregates.setdefault(key, {"title": title, "students": 0, "section_rows": 0})
            record["students"] = int(record["students"]) + students
            record["section_rows"] = int(record["section_rows"]) + 1

    source_hash = hashlib.sha256(CSV_PATH.read_bytes()).hexdigest()
    fetched_at = datetime.now(UTC).isoformat()
    connection = sqlite3.connect(DB_PATH)
    try:
        connection.executescript(
            """
            DROP TABLE IF EXISTS course_term_aggregate;
            DROP TABLE IF EXISTS ingestion_run;
            CREATE TABLE course_term_aggregate (
                subject TEXT NOT NULL,
                course_number TEXT NOT NULL,
                course_title TEXT,
                year INTEGER NOT NULL,
                term TEXT NOT NULL,
                year_term TEXT NOT NULL,
                students INTEGER NOT NULL,
                source_row_count INTEGER NOT NULL,
                PRIMARY KEY (subject, course_number, year_term)
            );
            CREATE TABLE ingestion_run (
                id INTEGER PRIMARY KEY,
                source_url TEXT NOT NULL,
                source_sha256 TEXT NOT NULL,
                ingested_at TEXT NOT NULL,
                cs_course_term_rows INTEGER NOT NULL,
                skipped_rows INTEGER NOT NULL
            );
            """
        )
        rows = [
            (subject, number, values["title"], year, term, year_term, values["students"], values["section_rows"])
            for (subject, number, year, term, year_term), values in aggregates.items()
        ]
        connection.executemany(
            "INSERT INTO course_term_aggregate VALUES (?, ?, ?, ?, ?, ?, ?, ?)", rows
        )
        connection.execute(
            "INSERT INTO ingestion_run (source_url, source_sha256, ingested_at, cs_course_term_rows, skipped_rows) VALUES (?, ?, ?, ?, ?)",
            (SOURCE_URL, source_hash, fetched_at, len(rows), skipped),
        )
        connection.commit()
    finally:
        connection.close()
    print(f"Built {DB_PATH}: {len(aggregates):,} CS course-term aggregates; skipped {skipped:,} malformed/missing rows.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true", help="redownload the public source before ingesting")
    args = parser.parse_args()
    try:
        download_csv(args.refresh)
        build_database()
    except Exception as error:  # concise terminal message for first-time builders
        print(f"Ingestion failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

