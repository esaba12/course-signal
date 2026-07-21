#!/usr/bin/env python3
"""Build an isolated Course Signal database from an institution adapter."""

from __future__ import annotations

import argparse
import csv
import hashlib
import sqlite3
import sys
import urllib.request
from collections import defaultdict
from datetime import UTC, datetime

from institutions import database_path, load_institution, source_path


def download_source(config: dict, force: bool) -> None:
    source = config["source"]
    path = source_path(config)
    if source["adapter"] != "uiuc_gpa_csv":
        return
    path.parent.mkdir(exist_ok=True)
    if path.exists() and not force:
        print(f"Using cached source: {path}")
        return
    print(f"Downloading public source: {source['url']}")
    request = urllib.request.Request(source["url"], headers={"User-Agent": "Course-Signal/0.2"})
    with urllib.request.urlopen(request, timeout=90) as response, path.open("wb") as out:
        out.write(response.read())


def uiuc_rows(path):
    required = {"Year", "Term", "YearTerm", "Subject", "Number", "Course Title", "Students"}
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        missing = required - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Unexpected UIUC source format. Missing columns: {sorted(missing)}")
        for row in reader:
            subject = (row.get("Subject") or "").strip().upper()
            number = (row.get("Number") or "").strip()
            term = (row.get("Term") or "").strip()
            year_term = (row.get("YearTerm") or "").strip()
            if not (subject and number and term and year_term):
                continue
            try:
                yield {"year": int((row.get("Year") or "").strip()), "term": term, "year_term": year_term,
                       "subject": subject, "course_number": number, "course_code": f"{subject} {number}",
                       "course_title": (row.get("Course Title") or "").strip(), "headcount": int(float((row.get("Students") or "").strip()))}
            except ValueError:
                continue


def canonical_rows(path):
    required = {"year", "term", "year_term", "subject", "course_number", "course_code", "course_title", "headcount"}
    with path.open(newline="", encoding="utf-8") as source:
        reader = csv.DictReader(source)
        missing = required - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Canonical source is missing columns: {sorted(missing)}")
        for row in reader:
            try:
                yield {key: row[key].strip() for key in required - {"year", "headcount"}} | {"year": int(row["year"]), "headcount": int(row["headcount"])}
            except (KeyError, ValueError, AttributeError):
                continue


def adapter_rows(config: dict):
    path = source_path(config)
    if not path.exists():
        raise FileNotFoundError(f"Source missing: {path}")
    adapter = config["source"]["adapter"]
    if adapter == "uiuc_gpa_csv":
        return uiuc_rows(path)
    if adapter == "canonical_csv":
        return canonical_rows(path)
    raise ValueError(f"Unsupported source adapter: {adapter}")


def build_database(config: dict) -> None:
    aggregates: dict[tuple[str, str], dict] = {}
    skipped = 0
    for row in adapter_rows(config):
        if row["headcount"] < 0:
            skipped += 1
            continue
        key = (row["course_code"], row["year_term"])
        record = aggregates.setdefault(key, row | {"headcount": 0, "source_row_count": 0})
        record["headcount"] += row["headcount"]
        record["source_row_count"] += 1
    if not aggregates:
        raise ValueError("No usable course-term records were supplied by this adapter.")
    path = source_path(config)
    source_hash = hashlib.sha256(path.read_bytes()).hexdigest()
    db_path = database_path(config)
    db_path.parent.mkdir(exist_ok=True)
    with sqlite3.connect(db_path) as db:
        db.executescript("""
            DROP TABLE IF EXISTS course_term_aggregate;
            DROP TABLE IF EXISTS ingestion_run;
            CREATE TABLE course_term_aggregate (
                institution_id TEXT NOT NULL, course_code TEXT NOT NULL, subject TEXT NOT NULL,
                course_number TEXT NOT NULL, course_title TEXT, year INTEGER NOT NULL, term TEXT NOT NULL,
                year_term TEXT NOT NULL, headcount INTEGER NOT NULL, source_row_count INTEGER NOT NULL,
                PRIMARY KEY (institution_id, course_code, year_term)
            );
            CREATE TABLE ingestion_run (
                id INTEGER PRIMARY KEY, institution_id TEXT NOT NULL, source_url TEXT NOT NULL,
                source_sha256 TEXT NOT NULL, ingested_at TEXT NOT NULL, course_term_rows INTEGER NOT NULL,
                skipped_rows INTEGER NOT NULL
            );
        """)
        db.executemany("INSERT INTO course_term_aggregate VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
            (config["id"], row["course_code"], row["subject"], row["course_number"], row["course_title"], row["year"], row["term"], row["year_term"], row["headcount"], row["source_row_count"])
            for row in aggregates.values()
        ])
        db.execute("INSERT INTO ingestion_run (institution_id, source_url, source_sha256, ingested_at, course_term_rows, skipped_rows) VALUES (?, ?, ?, ?, ?, ?)",
                   (config["id"], config["source"]["url"], source_hash, datetime.now(UTC).isoformat(), len(aggregates), skipped))
    print(f"Built {db_path}: {len(aggregates):,} {config['id']} course-term aggregates; skipped {skipped:,} rows.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--institution", default="riverview-demo", help="Configuration name in config/institutions (default: riverview-demo)")
    parser.add_argument("--refresh", action="store_true", help="Redownload a remote source before ingesting")
    args = parser.parse_args()
    try:
        config = load_institution(args.institution)
        download_source(config, args.refresh)
        build_database(config)
    except Exception as error:
        print(f"Ingestion failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
