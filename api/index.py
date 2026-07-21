"""Vercel WSGI entry point for Course Signal."""

from __future__ import annotations

from flask import Flask, jsonify

import server

app = Flask(__name__)


@app.get("/api/health")
def health():
    with server.connection() as db:
        run = dict(db.execute("SELECT * FROM ingestion_run ORDER BY id DESC LIMIT 1").fetchone())
    return jsonify({"ok": True, "institution": server.INSTITUTION["id"], "ingestion": run})


@app.get("/api/institution")
def institution():
    keys = ("id", "name", "dashboard_title", "measurement", "terms", "default_course", "capabilities")
    return jsonify({key: server.INSTITUTION[key] for key in keys})


@app.get("/api/courses")
def courses():
    with server.connection() as db:
        rows = db.execute(
            "SELECT course_code, MAX(course_title) AS title, COUNT(*) AS term_count "
            "FROM course_term_aggregate WHERE institution_id=? GROUP BY course_code ORDER BY course_code",
            (server.INSTITUTION["id"],),
        ).fetchall()
    return jsonify([{"code": row["course_code"], "title": row["title"], "term_count": row["term_count"]} for row in rows])


@app.get("/api/courses/<path:code>/history")
def history(code: str):
    from flask import request
    return jsonify(server.course_rows(code, request.args.get("term", server.INSTITUTION["terms"][0])))


@app.get("/api/courses/<path:code>/forecast")
def forecast(code: str):
    from flask import request
    return jsonify(server.forecast_payload(code, request.args.get("term", server.INSTITUTION["terms"][0])))


@app.get("/api/courses/<path:code>/live-status")
def live_status(code: str):
    return jsonify(server.live_status(code))
