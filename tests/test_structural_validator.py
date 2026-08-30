"""
Test suite for StructuralValidator (IS 875 and IS 1904 logic).
"""

import unittest
from thermoshelter.validation.structural_validator import StructuralValidator
from thermoshelter.core.design_state import (
    DesignState, ClimateContext, SiteState, UserRequirements, GeometryState, OpeningItem, EnvelopeAssemblies
)

class TestStructuralValidator(unittest.TestCase):
    
    def setUp(self):
        self.validator = StructuralValidator()
        self.context = ClimateContext(
            location_id="LOC-IN-LEH",
            location_name="Leh",
            climate_zone="Cold-Arid",
            latitude_deg=34.1526,
            longitude_deg=77.5771,
            elevation_m=3500.0,
            heating_degree_days_18C=4850.0,
            cooling_degree_days_18C=45.0,
            design_temp_min_C=-17.2,
            design_temp_max_C=27.9,
            design_solar_peak_W_m2=1105.0,
            weather_dataset_id="WEA-IN-LEH",
            site_condition_id="SITE-LEH"
        )
        self.site = SiteState(
            site_condition_id="SITE-LEH",
            location_id="LOC-IN-LEH",
            terrain_type="Mountain",
            soil_classification="GM",
            soil_type="Gravel",
            moisture_condition="DRY",
            density_kg_m3=1800.0,
            thermal_conductivity_W_mK=1.8,
            ground_temperature_C=5.0,
            ground_frost_depth_m=1.2,
            allowable_bearing_capacity_kPa=150.0,
            groundwater_depth_m=10.0,
            drainage_condition="WELL",
            frost_risk="HIGH",
            slope_percent=5.0,
            snow_load_kN_m2=2.5,  # High snow load > 1.5
            seismic_zone="Zone IV"
        )
        self.requirements = UserRequirements()
        self.geometry = GeometryState(
            geometry_id="GEOM-TEST",
            geometry_type="GEOM-TYPE-RECT",
            length_m=5.0,
            width_m=4.0,
            height_m=3.0,
            roof_type="pitched",
            roof_angle_deg=35.0  # Safe pitch
        )
        self.envelope = EnvelopeAssemblies(
            wall_assembly_id="A", wall_material_id="B", wall_thickness_mm=300, wall_u_value_W_m2K=0.4,
            roof_assembly_id="A", roof_material_id="B", roof_thickness_mm=200, roof_u_value_W_m2K=0.3,
            floor_assembly_id="A", floor_material_id="B", floor_thickness_mm=150, floor_u_value_W_m2K=0.5
        )
        
    def _build_design(self) -> DesignState:
        return DesignState(
            design_id="DESIGN-TEST",
            design_name="Test Design",
            context=self.context,
            site=self.site,
            requirements=self.requirements,
            geometry=self.geometry,
            openings=[],
            envelope=self.envelope
        )

    def test_safe_pitched_roof_passes(self):
        design = self._build_design()
        res = self.validator.validate(design)
        self.assertTrue(res.passed, f"Should pass with 35 deg roof: {res.violations}")

    def test_flat_roof_fails_in_high_snow(self):
        self.geometry.roof_angle_deg = 5.0
        self.geometry.roof_type = "flat"
        # We must re-init geometry to recalculate dependent fields
        self.geometry.__post_init__()
        
        design = self._build_design()
        res = self.validator.validate(design)
        self.assertFalse(res.passed, "Flat roof in 2.5 kN/m2 snow zone should fail.")
        self.assertTrue(any("STRUCT-IS875-01" in v for v in res.violations))

    def test_thin_slab_on_frost_soil_warns(self):
        # 50mm floor thickness in 1.2m frost depth soil
        self.envelope.floor_thickness_mm = 50.0
        design = self._build_design()
        res = self.validator.validate(design)
        self.assertTrue(any("STRUCT-IS1904-01" in w for w in res.warnings))

    def test_low_bearing_capacity_fails(self):
        self.site.allowable_bearing_capacity_kPa = 30.0  # Below 50
        design = self._build_design()
        res = self.validator.validate(design)
        self.assertFalse(res.passed)
        self.assertTrue(any("STRUCT-IS1904-02" in v for v in res.violations))

    def test_extreme_aspect_ratio_fails(self):
        self.geometry.length_m = 20.0
        self.geometry.width_m = 4.0
        self.geometry.__post_init__()  # AR = 5.0
        design = self._build_design()
        res = self.validator.validate(design)
        self.assertFalse(res.passed)
        self.assertTrue(any("STRUCT-NBC-01" in v for v in res.violations))

if __name__ == '__main__':
    unittest.main()
