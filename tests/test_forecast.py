import unittest
from datetime import UTC, datetime
from unittest.mock import patch

import ingest_live_snapshot
import server


class ForecastTests(unittest.TestCase):
    def test_predictors_use_only_supplied_history(self):
        rows = [
            {"year": 2020, "students": 100},
            {"year": 2021, "students": 110},
            {"year": 2022, "students": 120},
            {"year": 2023, "students": 130},
            {"year": 2024, "students": 140},
        ]
        self.assertEqual(server.last_value_predict(rows, 2025), 140)
        self.assertEqual(server.moving_average_predict(rows, 2025), 130)
        self.assertAlmostEqual(server.linear_predict(rows, 2025), 150)

    def test_backtest_does_not_peek_at_target(self):
        rows = [{"year": 2020 + i, "year_term": f"{2020 + i}-fa", "students": 100 + i * 10} for i in range(6)]
        results = server.backtest(rows, "last_value_v1")
        self.assertEqual(results[0]["year_term"], "2024-fa")
        self.assertEqual(results[0]["predicted"], 130)
        self.assertEqual(results[0]["actual"], 140)

    def test_live_xml_parser_extracts_section_status(self):
        fixture = b'''<course xmlns="http://example.edu/course"><section><sectionNumber>AL1</sectionNumber><crn>12345</crn><enrollmentStatus>Open</enrollmentStatus></section><section><sectionNumber>AL2</sectionNumber><enrollmentStatus>Closed</enrollmentStatus></section></course>'''
        parsed = ingest_live_snapshot.parse_course_xml(fixture, "CS 225", "2026-07-17T12:00:00+00:00")
        self.assertEqual(parsed["CS 225"]["sections"], [{"section": "AL1", "status": "Open", "crn": "12345"}, {"section": "AL2", "status": "Closed"}])

    def test_empty_live_status_cache_is_not_presented_as_available(self):
        with patch.object(server, "LIVE_STATUS_PATH") as path:
            path.exists.return_value = True
            path.read_text.return_value = "{}"
            result = server.live_status("CS 225")
        self.assertFalse(result["available"])
        self.assertTrue("current-status" in result["message"] or "verified" in result["message"])


if __name__ == "__main__":
    unittest.main()
