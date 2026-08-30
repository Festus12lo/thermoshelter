import unittest
import sys
import os
import json

# Ensure src/ is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from thermoshelter import (
    ShelterRequest, ShelterDesignOrchestrator, ContextBuilder,
    ProcurementAdapter, MaterialIntelligenceService, LLMExplanationEngine
)

class TestProductAPIAndServices(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.ctx_builder = ContextBuilder()
        cls.orchestrator = ShelterDesignOrchestrator(
            context_builder=cls.ctx_builder,
            n_candidates=12,
            n_finalists=3,
            simulation_hours=24
        )
        cls.mat_service = MaterialIntelligenceService()
        cls.procurement = ProcurementAdapter()

    def test_material_intelligence_service_cards(self):
        """Verify that MaterialIntelligenceService produces rich cards with properties and procurement."""
        card = self.mat_service.get_material_card("MAT-ROCKWOOL")
        self.assertEqual(card["material_id"], "MAT-ROCKWOOL")
        self.assertIn("Rockwool", card["material_name"])
        self.assertGreater(card["properties"]["thermal_conductivity_W_mK"], 0.0)
        self.assertGreater(card["properties"]["density_kg_m3"], 0.0)
        self.assertTrue(card["procurement"]["has_observed_prices"])
        self.assertGreater(card["procurement"]["suppliers_count"], 0)
        self.assertIsNotNone(card["procurement"]["lowest_supplier"])

    def test_multi_supplier_comparison(self):
        """Verify multi-supplier price comparison analytics."""
        comp = self.procurement.get_supplier_comparison("MAT-STEEL")
        self.assertTrue(comp["has_observed_prices"])
        self.assertGreaterEqual(comp["suppliers_count"], 2)
        self.assertLessEqual(comp["price_range_min"], comp["price_range_max"])
        self.assertEqual(comp["currency"], "INR")
        # SAIL Jyoti is 520 INR/m2, Tata Steel is 550 INR/m2, so SAIL is lowest
        self.assertIn("sail.co.in", comp["lowest_supplier"]["product_url"])
        self.assertEqual(comp["lowest_supplier"]["price_per_unit"], 520.0)

    def test_end_to_end_design_enrichment(self):
        """Verify full design generation includes 2D, 3D blueprint, validation, materials, and LLM explanation."""
        req = ShelterRequest(location="Leh", occupants=4, purpose="emergency_shelter", thermal_objective="winter_warmth")
        report = self.orchestrator.design_shelter(req)
        data = report.to_dict()

        # 1. Recommended design checks
        rec = data["recommended"]
        self.assertIn("design_id", rec)
        self.assertIn("blueprint", rec)
        self.assertIn("floor_plan", rec)
        self.assertIn("materials", rec)
        self.assertIn("llm_explanation", rec)
        self.assertIn("validation", rec)

        # 2. 2D & 3D Geometry consistency
        geom_bb = rec["blueprint"]["visualization_3d_data"]["bounding_box_dimensions_m"]
        fp_dims = rec["floor_plan"]
        self.assertGreater(geom_bb["length_x"], 0)
        self.assertGreater(geom_bb["width_y"], 0)
        self.assertGreater(fp_dims["floor_area_m2"], 0)

        # 3. Materials & Procurement Isolation
        mats = rec["materials"]
        self.assertIn("wall_assembly", mats)
        self.assertIn("roof_assembly", mats)
        self.assertIn("cost_estimation", mats)
        self.assertTrue(mats["cost_estimation"]["total_cost"] > 0)
        self.assertEqual(mats["cost_estimation"]["currency"], "INR")

        # 4. LLM Explanation Grounding
        exp = rec["llm_explanation"]
        self.assertIn("summary", exp)
        self.assertIn("material_rationale", exp)
        self.assertIn("orientation_rationale", exp)
        self.assertEqual(exp["traceability_hash"], rec["design_id"])

        # 5. Engineering Validation Gate
        val = rec["validation"]
        self.assertIn("is_fully_compliant", val)
        self.assertIn("evaluations", val)
        self.assertGreater(len(val["evaluations"]), 4)


if __name__ == '__main__':
    unittest.main()
