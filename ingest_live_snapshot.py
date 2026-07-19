#!/usr/bin/env python3
"""Fetch or parse a single Course Explorer course snapshot, then cache its status.

The tool deliberately fetches only when a human runs it. It records retrieval time,
keeps raw XML for inspection, and never infers numeric capacity from a status label.
"""

from __future__ import annotations

import argparse
import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).parent
OUTPUT = ROOT / "data" / "live_status.json"
CACHE_DIR = ROOT / "data" / "cache"


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def text_for(element: ET.Element, names: set[str]) -> str | None:
    for child in element.iter():
        if local_name(child.tag) in names and child.text and child.text.strip():
            return child.text.strip()
    for key, value in element.attrib.items():
        if local_name(key) in names and value.strip():
            return value.strip()
    return None


def parse_course_xml(xml_bytes: bytes, course: str, fetched_at: str) -> dict:
    """Extract a minimal section/status snapshot across documented XML shape variants."""
    if not xml_bytes.strip():
        raise ValueError("Course Explorer returned an empty response; no snapshot was saved.")
    root = ET.fromstring(xml_bytes)
    sections = []
    seen = set()
    for element in root.iter():
        tag = local_name(element.tag).lower()
        if tag not in {"section", "classsection"}:
            continue
        status = text_for(element, {"enrollmentStatus", "registrationStatus", "status"})
        section = text_for(element, {"sectionNumber", "section", "sectionCode"})
        crn = text_for(element, {"crn", "courseRegistrationNumber"})
        if not status:
            continue
        identity = (section or "", crn or "", status)
        if identity in seen:
            continue
        seen.add(identity)
        item = {"section": section or (f"CRN {crn}" if crn else "Section"), "status": status}
        if crn:
            item["crn"] = crn
        sections.append(item)
    if not sections:
        raise ValueError("No section status fields found. Save this XML and update the parser mapping before using it in a demo.")
    return {course: {"fetched_at": fetched_at, "sections": sections}}


def fetch_course_xml(year: int, term: str, course: str) -> bytes:
    number = course.upper().replace("CS", "").strip()
    url = f"https://courses.illinois.edu/cisapp/explorer/schedule/{year}/{term.lower()}/CS/{number}.xml?mode=cascade"
    request = urllib.request.Request(url, headers={"User-Agent": "UIUC-Course-Signal-Hackathon/0.1", "Accept": "application/xml"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--input-json", type=Path, help="Path to a reviewed JSON snapshot")
    source.add_argument("--xml", type=Path, help="Path to previously saved Course Explorer XML")
    source.add_argument("--fetch", action="store_true", help="Fetch one public course XML document")
    parser.add_argument("--course", default="CS 225", help="Course code for XML/fetch mode; default: CS 225")
    parser.add_argument("--year", type=int, default=2026, help="Schedule year for --fetch; default: 2026")
    parser.add_argument("--term", default="fall", choices=["spring", "summer", "fall"], help="Schedule term for --fetch")
    args = parser.parse_args()
    if args.input_json:
        raw = json.loads(args.input_json.read_text())
    else:
        fetched_at = datetime.now(UTC).isoformat()
        if args.xml:
            xml_bytes = args.xml.read_bytes()
        else:
            xml_bytes = fetch_course_xml(args.year, args.term, args.course)
        raw = parse_course_xml(xml_bytes, args.course.upper(), fetched_at)
        if args.fetch:
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            cached = CACHE_DIR / f"course-explorer-{args.year}-{args.term}-{args.course.replace(' ', '-').lower()}.xml"
            cached.write_bytes(xml_bytes)
            print(f"Saved raw response to {cached}")
    if not isinstance(raw, dict):
        raise ValueError("Snapshot must be a JSON object keyed by course code.")
    for course, value in raw.items():
        if not course.startswith("CS ") or not isinstance(value, dict):
            raise ValueError(f"Invalid course entry: {course!r}")
        if not value.get("fetched_at") or not isinstance(value.get("sections", []), list):
            raise ValueError(f"{course} needs fetched_at and sections fields.")
        for section in value["sections"]:
            if not isinstance(section, dict) or not section.get("status"):
                raise ValueError(f"{course} has a section without a status.")
    OUTPUT.write_text(json.dumps(raw, indent=2) + "\n")
    print(f"Saved cached snapshot to {OUTPUT}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ET.ParseError, ValueError, json.JSONDecodeError) as error:
        print(f"Live-status import failed: {error}")
        raise SystemExit(1)
