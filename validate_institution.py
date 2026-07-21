#!/usr/bin/env python3
"""Validate an institution configuration and its source before onboarding."""

from __future__ import annotations

import argparse

from ingest import adapter_rows
from institutions import load_institution, source_path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--institution", required=True, help="Configuration name in config/institutions")
    args = parser.parse_args()
    try:
        config = load_institution(args.institution)
        source = source_path(config)
        if not source.exists():
            raise FileNotFoundError(f"Source file is missing: {source}")
        rows = list(adapter_rows(config))
        if not rows:
            raise ValueError("Adapter returned no usable records.")
        course_count = len({row["course_code"] for row in rows})
        terms = sorted({row["term"] for row in rows})
        invalid_terms = set(terms) - set(config["terms"])
        if invalid_terms:
            raise ValueError(f"Source has terms absent from configuration: {sorted(invalid_terms)}")
        if config["default_course"] not in {row["course_code"] for row in rows}:
            raise ValueError("default_course does not exist in the source.")
        print(f"PASS: {config['name']} ({config['id']})")
        print(f"PASS: {len(rows):,} source rows across {course_count} courses; terms: {', '.join(terms)}")
        print(f"PASS: measurement = {config['measurement']['label']}; adapter = {config['source']['adapter']}")
        return 0
    except Exception as error:
        print(f"FAIL: {error}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
