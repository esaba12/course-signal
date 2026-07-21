"""Institution configuration for isolated Course Signal deployments."""

from __future__ import annotations

import json
import os
from pathlib import Path

ROOT = Path(__file__).parent
CONFIG_DIR = ROOT / "config" / "institutions"


def institution_id() -> str:
    return os.environ.get("COURSE_SIGNAL_INSTITUTION", "uiuc").strip().lower()


def load_institution(identifier: str | None = None) -> dict:
    identifier = (identifier or institution_id()).strip().lower()
    path = CONFIG_DIR / f"{identifier}.json"
    if not path.exists():
        available = ", ".join(sorted(item.stem for item in CONFIG_DIR.glob("*.json")))
        raise ValueError(f"Unknown institution {identifier!r}. Available configurations: {available}.")
    config = json.loads(path.read_text())
    required = {"id", "name", "dashboard_title", "measurement", "source", "default_course", "terms"}
    missing = required - set(config)
    if missing:
        raise ValueError(f"Institution configuration {path.name} is missing: {sorted(missing)}")
    if config["id"] != identifier:
        raise ValueError(f"Institution configuration id must match its filename: {path.name}")
    config["config_path"] = path
    return config


def database_path(config: dict) -> Path:
    return ROOT / config.get("database", f"data/{config['id']}-course-signal.db")


def source_path(config: dict) -> Path:
    return ROOT / config["source"]["path"]
