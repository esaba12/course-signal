import unittest

from ingest import adapter_rows
from institutions import database_path, load_institution


class InstitutionTests(unittest.TestCase):
    def test_fixture_institution_uses_canonical_adapter_and_isolated_database(self):
        config = load_institution("riverview-demo")
        rows = list(adapter_rows(config))
        self.assertEqual(config["default_course"], "MATH 101")
        self.assertEqual(config["source"]["adapter"], "canonical_csv")
        self.assertEqual(len(rows), 12)
        self.assertTrue(all(row["course_code"] in {"MATH 101", "ENG 201"} for row in rows))
        self.assertNotEqual(database_path(config).name, database_path(load_institution("uiuc")).name)

    def test_uiuc_configuration_keeps_uiuc_details_out_of_core_contract(self):
        config = load_institution("uiuc")
        self.assertEqual(config["source"]["adapter"], "uiuc_gpa_csv")
        self.assertIn("Completed", config["measurement"]["label"])


if __name__ == "__main__":
    unittest.main()
