"""
White Box (Structural) Unit Test Suite for Recommendation Engine
================================================================
Target: scripts/recommend.py
Techniques: Statement Coverage, Branch Coverage, Condition Coverage,
            Path Coverage, Boundary Value Analysis, Loop Testing.
"""

import sys
import io
import json
import unittest
from unittest.mock import patch
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import scripts.recommend as recommend


def run_recommend(input_str: str) -> dict:
    """Helper to run recommend.main() with mocked stdin and stdout."""
    with patch('sys.stdin', io.StringIO(input_str)), patch('sys.stdout', new_callable=io.StringIO) as mock_stdout:
        recommend.main()
        output = mock_stdout.getvalue().strip()
        return json.loads(output) if output else {}


class TestRecommendationWhiteBox(unittest.TestCase):
    """White box test suite covering all statements, branches, and conditions."""

    # ── Statement & Path Coverage: Early Exit Paths ───────────────

    def test_wb01_empty_stdin(self):
        """Statement / Branch: Empty stdin triggers early error exit (S1 -> B1:True -> S2, S3)."""
        result = run_recommend("")
        self.assertIn("error", result)
        self.assertEqual(result["error"], "No input data provided")

    def test_wb02_malformed_json(self):
        """Statement / Exception: Invalid JSON triggers exception catch (S4 -> Exception -> S7, S8)."""
        result = run_recommend("{{invalid-json")
        self.assertIn("error", result)
        self.assertTrue(len(result["error"]) > 0)

    def test_wb03_empty_courses_loop(self):
        """Loop Testing: Zero iterations of the courses loop (L1: False -> S17 -> S19)."""
        payload = json.dumps({
            "userInterests": ["machine learning"],
            "courses": []
        })
        result = run_recommend(payload)
        self.assertEqual(result.get("algorithmVersion"), "v2_python")
        self.assertEqual(result.get("recommendations"), [])

    # ── Branch Coverage: All Branches Evaluated to True ───────────

    def test_wb04_all_branches_true(self):
        """Branch Coverage: Course satisfies all scoring criteria (B3:T, B4:T, B5:T, B6:T, B7:T, B8:T)."""
        payload = json.dumps({
            "userInterests": ["deep learning", "ai"],
            "courses": [
                {
                    "id": "c-full",
                    "title": "Intro to Deep Learning and AI",
                    "category": "AI",
                    "tags": ["deep learning", "ai"],
                    "rating": 4.9,
                    "_count": {"enrollments": 50}
                }
            ]
        })
        result = run_recommend(payload)
        recs = result.get("recommendations", [])
        self.assertEqual(len(recs), 1)
        rec = recs[0]
        self.assertEqual(rec["courseId"], "c-full")
        # Tags: 2 * 3 = 6; Category: +2; Popularity (>10): +1; Title words: matches; Rating (>=4.0): +1
        self.assertGreaterEqual(rec["score"], 10)
        self.assertIn("Matches interests", rec["reason"])
        self.assertIn("Related category", rec["reason"])
        self.assertIn("Popular course", rec["reason"])
        self.assertIn("Highly rated", rec["reason"])

    # ── Branch Coverage: All Branches Evaluated to False ──────────

    def test_wb05_all_branches_false(self):
        """Branch Coverage: Completely unrelated course scores 0 and is excluded (B3:F, B4:F, B5:F, B6:F, B7:F, B8:F)."""
        payload = json.dumps({
            "userInterests": ["cooking", "baking"],
            "courses": [
                {
                    "id": "c-unrelated",
                    "title": "Quantum Physics Analysis",
                    "category": "Physics",
                    "tags": ["quantum", "mechanics"],
                    "rating": 3.2,
                    "_count": {"enrollments": 5}
                }
            ]
        })
        result = run_recommend(payload)
        self.assertEqual(result.get("recommendations"), [])

    # ── Condition & Boundary Coverage ─────────────────────────────

    def test_wb06_rating_boundary_conditions(self):
        """Condition Coverage: Tests B7 condition 'if rating and rating >= 4.0:' across boundaries."""
        # Case A: Rating is None (First condition False)
        payload_none = json.dumps({
            "userInterests": ["data"],
            "courses": [{"id": "c1", "title": "Data", "tags": ["data"], "rating": None}]
        })
        res_none = run_recommend(payload_none)["recommendations"][0]
        self.assertNotIn("Highly rated", res_none["reason"])

        # Case B: Rating is 3.9 (Second condition False at lower boundary)
        payload_39 = json.dumps({
            "userInterests": ["data"],
            "courses": [{"id": "c2", "title": "Data", "tags": ["data"], "rating": 3.9}]
        })
        res_39 = run_recommend(payload_39)["recommendations"][0]
        self.assertNotIn("Highly rated", res_39["reason"])

        # Case C: Rating is 4.0 (Exact threshold boundary -> True)
        payload_40 = json.dumps({
            "userInterests": ["data"],
            "courses": [{"id": "c3", "title": "Data", "tags": ["data"], "rating": 4.0}]
        })
        res_40 = run_recommend(payload_40)["recommendations"][0]
        self.assertIn("Highly rated", res_40["reason"])

    def test_wb07_enrollment_boundary(self):
        """Boundary Value Analysis: Tests B5 'if enrollments > 10:' at 10 and 11."""
        # Case A: Exactly 10 enrollments (False)
        payload_10 = json.dumps({
            "userInterests": ["web"],
            "courses": [{"id": "c10", "title": "Web", "tags": ["web"], "_count": {"enrollments": 10}}]
        })
        res_10 = run_recommend(payload_10)["recommendations"][0]
        self.assertNotIn("Popular course", res_10["reason"])

        # Case B: Exactly 11 enrollments (True)
        payload_11 = json.dumps({
            "userInterests": ["web"],
            "courses": [{"id": "c11", "title": "Web", "tags": ["web"], "_count": {"enrollments": 11}}]
        })
        res_11 = run_recommend(payload_11)["recommendations"][0]
        self.assertIn("Popular course", res_11["reason"])

    # ── Path Coverage: Slicing & Ranking Top 5 ─────────────────────

    def test_wb08_top_5_sorting_and_slicing(self):
        """Path Coverage: Verifies descending score sorting and truncation to top 5 (S17, S18)."""
        courses = []
        for i in range(1, 9):
            courses.append({
                "id": f"course-{i}",
                "title": f"Course title {'ai ' * i}",
                "tags": ["ai"] if i % 2 == 0 else [],
                "category": "AI" if i > 3 else "General",
                "rating": 4.5 if i > 4 else 3.0,
                "_count": {"enrollments": 20 if i > 2 else 0}
            })

        payload = json.dumps({
            "userInterests": ["ai"],
            "courses": courses
        })
        result = run_recommend(payload)
        recs = result.get("recommendations", [])
        
        # Must return at most 5
        self.assertEqual(len(recs), 5)

        # Must be strictly sorted descending by score
        scores = [r["score"] for r in recs]
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_wb09_case_insensitivity_normalization(self):
        """Branch / Statement: Normalization of uppercase user interests and mixed tags."""
        payload = json.dumps({
            "userInterests": ["PYTHON", "DATA SCIENCE"],
            "courses": [
                {
                    "id": "c-case",
                    "title": "python programming",
                    "category": "data science",
                    "tags": ["Python", "Pandas"],
                    "rating": 4.5
                }
            ]
        })
        result = run_recommend(payload)
        recs = result.get("recommendations", [])
        self.assertEqual(len(recs), 1)
        self.assertGreater(recs[0]["score"], 0)


if __name__ == "__main__":
    unittest.main()
