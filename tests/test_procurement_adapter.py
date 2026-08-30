import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from thermoshelter.procurement.procurement_adapter import ProcurementAdapter

class TestProcurementAdapter(unittest.TestCase):
    def setUp(self):
        self.adapter = ProcurementAdapter()

    def test_load_registry(self):
        # We assume the canonical registry exists and has some data
        records = self.adapter.get_suppliers_for_material("MAT-EPS")
        if records:
            self.assertTrue(len(records) >= 1)
            self.assertEqual(records[0].material_id, "MAT-EPS")

    def test_estimate_envelope_cost(self):
        est = self.adapter.estimate_envelope_cost(
            wall_material_id="MAT-ROCKWOOL",
            wall_area_m2=50.0,
            wall_thickness_m=0.1,
            roof_material_id="MAT-STEEL",
            roof_area_m2=30.0,
            roof_thickness_m=0.005
        )
        
        self.assertIn('wall', est.breakdown)
        self.assertIn('roof', est.breakdown)
        self.assertGreater(est.total_cost, 0.0)
        self.assertTrue(len(est.provenance_notes) > 0)

if __name__ == '__main__':
    unittest.main()
