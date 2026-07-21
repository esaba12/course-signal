#!/usr/bin/env python3
"""Dependency-free API and static server for a configured Course Signal deployment."""

from __future__ import annotations

import json
import math
import os
import sqlite3
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

from institutions import ROOT, database_path, load_institution

INSTITUTION = load_institution()
DB_PATH = database_path(INSTITUTION)
LIVE_STATUS_PATH = ROOT / "data" / "live_status.json"
APP_DIR = ROOT / "app"


def connection() -> sqlite3.Connection:
    if not DB_PATH.exists():
        raise FileNotFoundError("Database missing. Run `python3 ingest.py` first.")
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db


def course_rows(code: str, term: str | None = None) -> list[dict]:
    query = "SELECT * FROM course_term_aggregate WHERE institution_id=? AND course_code=?"
    params: list[str] = [INSTITUTION["id"], code.upper().strip()]
    if term:
        query += " AND term=?"
        params.append(term)
    query += " ORDER BY year, CASE term WHEN 'Spring' THEN 0 WHEN 'Summer' THEN 1 WHEN 'Fall' THEN 2 ELSE 3 END"
    with connection() as db:
        return [{**dict(row), "students": row["headcount"]} for row in db.execute(query, params)]


def linear_predict(rows: list[dict], target_year: int) -> float:
    xs = [row["year"] for row in rows]
    ys = [row["students"] for row in rows]
    mean_x, mean_y = sum(xs) / len(xs), sum(ys) / len(ys)
    denominator = sum((x - mean_x) ** 2 for x in xs)
    if not denominator:
        return mean_y
    slope = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys)) / denominator
    return mean_y + slope * (target_year - mean_x)


def moving_average_predict(rows: list[dict], _: int) -> float:
    values = [row["students"] for row in rows[-3:]]
    return sum(values) / len(values)


def last_value_predict(rows: list[dict], _: int) -> float:
    return float(rows[-1]["students"])


MODELS = {"linear_trend_v1": linear_predict, "moving_average_3_v1": moving_average_predict, "last_value_v1": last_value_predict}


def backtest(rows: list[dict], model_name: str) -> list[dict]:
    predictions = []
    model = MODELS[model_name]
    for index in range(4, len(rows)):
        training, actual = rows[:index], rows[index]
        predicted = max(0, round(model(training, actual["year"])))
        predictions.append({"year_term": actual["year_term"], "actual": actual["students"], "predicted": predicted, "absolute_error": abs(actual["students"] - predicted)})
    return predictions


def forecast_payload(code: str, term: str) -> dict:
    rows = course_rows(code, term)
    if len(rows) < 5:
        return {"eligible": False, "reason": "Fewer than five usable comparable terms are available.", "history_count": len(rows)}
    candidates = []
    for model_name in MODELS:
        tests = backtest(rows, model_name)
        mae = sum(item["absolute_error"] for item in tests) / len(tests)
        candidates.append((mae, model_name, tests))
    mae, model_name, tests = min(candidates, key=lambda item: item[0])
    target_year = rows[-1]["year"] + 1
    prediction = max(0, round(MODELS[model_name](rows, target_year)))
    return {
        "eligible": True,
        "course": rows[0]["course_code"],
        "term": term,
        "target_year": target_year,
        "estimate": prediction,
        "method": model_name,
        "history_count": len(rows),
        "typical_absolute_error": round(mae),
        "latest_backtest": tests[-1],
        "backtests": tests,
    }


def live_status(code: str) -> dict:
    if not INSTITUTION.get("capabilities", {}).get("current_status"):
        return {"available": False, "message": f"{INSTITUTION['name']} has not enabled a current-status connector. Historical planning signals remain available."}
    if not LIVE_STATUS_PATH.exists():
        return {"available": False, "message": "No verified current-status snapshot has been loaded yet. The historical dashboard remains fully usable."}
    try:
        snapshot = json.loads(LIVE_STATUS_PATH.read_text())
        course_snapshot = snapshot.get(code.upper()) if isinstance(snapshot, dict) else None
        if not isinstance(course_snapshot, dict):
            return {"available": False, "message": "No verified current-status snapshot is loaded for this course."}
        return {"available": True, **course_snapshot}
    except (json.JSONDecodeError, OSError):
        return {"available": False, "message": "Cached status snapshot could not be read."}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def send_json(self, payload: object, status: int = 200) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            if parsed.path == "/":
                self.path = "/landing.html"
            elif parsed.path == "/dashboard.html":
                self.path = "/index.html"
            return super().do_GET()
        try:
            params = parse_qs(parsed.query)
            if parsed.path == "/api/health":
                with connection() as db:
                    run = dict(db.execute("SELECT * FROM ingestion_run ORDER BY id DESC LIMIT 1").fetchone())
                return self.send_json({"ok": True, "institution": INSTITUTION["id"], "ingestion": run})
            if parsed.path == "/api/institution":
                return self.send_json({key: INSTITUTION[key] for key in ("id", "name", "dashboard_title", "measurement", "source", "terms", "default_course", "capabilities")})
            if parsed.path == "/api/courses":
                with connection() as db:
                    rows = db.execute("SELECT course_code, MAX(course_title) AS title, COUNT(*) AS term_count FROM course_term_aggregate WHERE institution_id=? GROUP BY course_code ORDER BY course_code", (INSTITUTION["id"],)).fetchall()
                return self.send_json([{"code": row["course_code"], "title": row["title"], "term_count": row["term_count"]} for row in rows])
            parts = parsed.path.strip("/").split("/")
            if len(parts) == 4 and parts[1] == "courses":
                code, action = unquote(parts[2]), parts[3]
                term = params.get("term", [INSTITUTION["terms"][0]])[0]
                if action == "history":
                    return self.send_json(course_rows(code, term))
                if action == "forecast":
                    return self.send_json(forecast_payload(code, term))
                if action == "live-status":
                    return self.send_json(live_status(code))
            return self.send_json({"error": "Unknown endpoint"}, HTTPStatus.NOT_FOUND)
        except FileNotFoundError as error:
            return self.send_json({"error": str(error)}, HTTPStatus.SERVICE_UNAVAILABLE)
        except Exception as error:
            return self.send_json({"error": f"Server error: {error}"}, HTTPStatus.INTERNAL_SERVER_ERROR)


def main() -> None:
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "127.0.0.1")
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"{INSTITUTION['dashboard_title']}: http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
