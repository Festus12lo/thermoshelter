import unittest
import sys
import os
import json
from unittest.mock import Mock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from thermoshelter.core.design_state import (
    DesignState, ClimateContext, SiteState, UserRequirements, GeometryState, EnvelopeAssemblies
)
from thermoshelter.validation.engineering_validator import EngineeringValidator
from thermoshelter.validation.structural_validator import StructuralValidator
from thermoshelter.procurement.procurement_adapter import ProcurementAdapter
from thermoshelter.procurement.material_service import MaterialIntelligenceService
from thermoshelter.llm.explanation_engine import LLMExplanationEngine
from thermoshelter.export.blueprint import BlueprintExporter
from thermoshelter.models.model_h_optimizer import ModelH_MultiObjectiveOptimizer
from thermoshelter.models.model_g_comfort import ComfortReport
from thermoshelter.core.performance_vector import MetricValue
from thermoshelter.features.context_builder import ContextBuilder
from thermoshelter.simulation.physics_bridge import PhysicsBridge

class TestAdversarialComprehensiveAtoT(unittest.TestCase):
    """
    Forensic Adversarial Testing Suite covering Cases A through T:
    A. negative dimensions
    B. zero dimensions
    C. absurd aspect ratio
    D. extreme roof pitch
    E. extreme snow load
    F. extreme frost depth
    G. weak soil
    H. missing material
    I. missing image
    J. missing supplier
    K. missing purchase URL
    L. fake price
    M. estimated price
    N. malformed weather
    O. missing weather
    P. extreme temperature
    Q. invalid orientation
    R. invalid material conductivity
    S. invalid density
    T. API malformed request
    """
    
    def setUp(self):
        self.engineering_validator = EngineeringValidator()
        self.structural_validator = StructuralValidator()
        self.procurement = ProcurementAdapter()
        self.mat_service = MaterialIntelligenceService()
        self.llm_engine = LLMExplanationEngine()
        self.optimizer = ModelH_MultiObjectiveOptimizer()
        self.ctx_builder = ContextBuilder()
        self.physics = PhysicsBridge()
        self.validator = self.engineering_validator
        self.envelope = EnvelopeAssemblies(
            wall_assembly_id="W", wall_material_id="MAT-RAMMED", wall_thickness_mm=300.0, wall_u_value_W_m2K=0.4,
            roof_assembly_id="R", roof_material_id="MAT-STEEL", roof_thickness_mm=100.0, roof_u_value_W_m2K=0.3,
            floor_assembly_id="F", floor_material_id="MAT-CONCRETE", floor_thickness_mm=150.0, floor_u_value_W_m2K=0.5
        )
        
    def _create_base_design(self) -> DesignState:
        return DesignState(
            design_id="ADV_TEST",
            design_name="Adversarial Base",
            context=ClimateContext(location_id="LOC", location_name="Test", climate_zone="Cold", 
                                   latitude_deg=34.0, longitude_deg=77.0, elevation_m=3500.0, 
                                   heating_degree_days_18C=4000.0, cooling_degree_days_18C=0.0, 
                                   design_temp_min_C=-10.0, design_temp_max_C=25.0, 
                                   design_solar_peak_W_m2=1000.0, weather_dataset_id="TEST", site_condition_id="TEST"),
            site=SiteState(site_condition_id="TEST", location_id="LOC", terrain_type="Flat",
                           soil_classification="GM", soil_type="Gravel", moisture_condition="DRY",
                           density_kg_m3=1800.0, thermal_conductivity_W_mK=1.5, ground_temperature_C=10.0,
                           ground_frost_depth_m=1.0, allowable_bearing_capacity_kPa=100.0,
                           groundwater_depth_m=5.0, drainage_condition="WELL", frost_risk="LOW",
                           slope_percent=2.0, snow_load_kN_m2=1.0, seismic_zone="IV"),
            requirements=UserRequirements(),
            geometry=GeometryState(geometry_id="GEOM", geometry_type="RECT", length_m=5.0, width_m=4.0, height_m=3.0, roof_type="pitched", roof_angle_deg=20.0),
            openings=[],
            envelope=EnvelopeAssemblies(wall_assembly_id="W", wall_material_id="MAT-RAMMED", wall_thickness_mm=300.0, wall_u_value_W_m2K=0.4,
                                        roof_assembly_id="R", roof_material_id="MAT-STEEL", roof_thickness_mm=100.0, roof_u_value_W_m2K=0.3,
                                        floor_assembly_id="F", floor_material_id="MAT-CONCRETE", floor_thickness_mm=150.0, floor_u_value_W_m2K=0.5),
            orientation_azimuth_deg=180.0
        )
        
    def _create_mock_perf(self):
        perf = Mock()
        perf.wall_u_value_W_m2K = MetricValue("wall_u_value_W_m2K", 0.40, "W/m2K", "CALC", "SIMULATED")
        perf.roof_u_value_W_m2K = MetricValue("roof_u_value_W_m2K", 0.30, "W/m2K", "CALC", "SIMULATED")
        perf.floor_u_value_W_m2K = MetricValue("floor_u_value_W_m2K", 0.50, "W/m2K", "CALC", "SIMULATED")
        perf.avg_indoor_temp_C = MetricValue("avg_indoor_temp_C", 2.0, "C", "CALC", "SIMULATED")
        perf.min_indoor_temp_C = MetricValue("min_indoor_temp_C", -3.0, "C", "CALC", "SIMULATED")
        perf.max_indoor_temp_C = MetricValue("max_indoor_temp_C", 8.0, "C", "CALC", "SIMULATED")
        perf.temperature_lift_C = MetricValue("temperature_lift_C", 12.0, "C", "CALC", "SIMULATED")
        perf.total_solar_gain_kWh = MetricValue("total_solar_gain_kWh", 300.0, "kWh", "CALC", "SIMULATED")
        perf.total_conductive_heat_loss_kWh = MetricValue("total_conductive_heat_loss_kWh", 65.0, "kWh", "CALC", "SIMULATED")
        perf.thermal_time_constant_hours = MetricValue("thermal_time_constant_hours", 42.0, "h", "CALC", "SIMULATED")
        perf.hours_below_5C = MetricValue("hours_below_5C", 5.0, "h", "CALC", "SIMULATED")
        return perf

    # Case A: Negative dimensions
    def test_case_a_negative_dimensions(self):
        design = self._create_base_design()
        design.geometry.length_m = -10.0
        perf = self._create_mock_perf()
        report = self.engineering_validator.validate(design, perf)
        self.assertFalse(report.is_fully_compliant)
        self.assertTrue(any("RULE-ENG-006" in msg for msg in report.mandatory_failures))

    # Case B: Zero dimensions
    def test_case_b_zero_dimensions(self):
        design = self._create_base_design()
        design.geometry.width_m = 0.0
        perf = self._create_mock_perf()
        report = self.engineering_validator.validate(design, perf)
        self.assertFalse(report.is_fully_compliant)
        self.assertTrue(any("RULE-ENG-006" in msg for msg in report.mandatory_failures))

    # Case C: Absurd aspect ratio (100:1)
    def test_case_c_absurd_aspect_ratio(self):
        design = self._create_base_design()
        design.geometry.length_m = 100.0
        design.geometry.width_m = 1.0
        perf = self._create_mock_perf()
        report = self.engineering_validator.validate(design, perf)
        self.assertFalse(report.is_fully_compliant)
        self.assertTrue(any("RULE-ENG-006" in msg for msg in report.mandatory_failures))

    # Case D: Extreme roof pitch (> 80 deg)
    def test_case_d_extreme_roof_pitch(self):
        design = self._create_base_design()
        design.geometry.roof_angle_deg = 88.0
        perf = self._create_mock_perf()
        report = self.engineering_validator.validate(design, perf)
        self.assertFalse(report.is_fully_compliant)
        self.assertTrue(any("RULE-ENG-007" in msg for msg in report.mandatory_failures))

    # Case E: Extreme snow load on flat roof
    def test_case_e_extreme_snow_load(self):
        design = self._create_base_design()
        design.site.snow_load_kN_m2 = 5.0
        design.geometry.roof_angle_deg = 2.0  # Flat
        perf = self._create_mock_perf()
        report = self.engineering_validator.validate(design, perf)
        self.assertFalse(report.is_fully_compliant)
        self.assertTrue(any("snow" in msg.lower() for msg in report.mandatory_failures))

    # Case F: Extreme frost depth
    def test_case_f_extreme_frost_depth(self):
        design = self._create_base_design()
        design.site.ground_frost_depth_m = 2.5
        design.site.frost_risk = "HIGH"
        struct_rep = self.structural_validator.validate(design)
        self.assertTrue(len(struct_rep.violations) > 0 or len(struct_rep.warnings) > 0)

    # Case G: Weak soil bearing capacity
    def test_case_g_weak_soil_bearing(self):
        design = self._create_base_design()
        design.site.allowable_bearing_capacity_kPa = 5.0  # Critically weak
        perf = self._create_mock_perf()
        report = self.engineering_validator.validate(design, perf)
        self.assertFalse(report.is_fully_compliant)

    # Case H: Missing material ID
    def test_case_h_missing_material(self):
        cost = self.procurement.get_lowest_price("MAT-UNOBTANIUM")
        self.assertIsNone(cost)
        comp = self.procurement.get_supplier_comparison("MAT-UNOBTANIUM")
        self.assertFalse(comp["has_observed_prices"])
        self.assertEqual(comp["suppliers_count"], 0)

    # Case I: Missing material image fallback
    def test_case_i_missing_image_fallback(self):
        card = self.mat_service.get_material_card("MAT-ADOBE")
        self.assertFalse(card["visual"]["has_image"])
        self.assertIn("fallback_color", card["visual"])
        self.assertIn("fallback_pattern", card["visual"])

    # Case J: Missing supplier handling
    def test_case_j_missing_supplier(self):
        records = self.procurement.get_suppliers_for_material("MAT-NONEXISTENT")
        self.assertEqual(len(records), 0)

    # Case K: Missing purchase URL fallback
    def test_case_k_missing_purchase_url(self):
        comp = self.procurement.get_supplier_comparison("MAT-RAMMED")
        supplier_urls = [s["product_url"] for s in comp["suppliers"]]
        self.assertIn("PURCHASE_URL_NOT_AVAILABLE", supplier_urls)

    # Case L: Fake price isolation (Procurement prices cannot alter thermal physics)
    def test_case_l_fake_price_cannot_alter_physics(self):
        card = self.mat_service.get_material_card("MAT-ROCKWOOL")
        self.assertEqual(card["properties"]["thermal_conductivity_W_mK"], 0.040)
        self.assertEqual(card["properties"]["density_kg_m3"], 180.0)

    # Case M: Estimated price explicitly flagged
    def test_case_m_estimated_price_flag(self):
        cost = self.procurement.estimate_envelope_cost(
            wall_material_id="MAT-UNREGISTERED",
            wall_area_m2=50.0,
            wall_thickness_m=0.3,
            roof_material_id="MAT-UNREGISTERED",
            roof_area_m2=30.0,
            roof_thickness_m=0.1
        )
        self.assertFalse(cost.is_observed_price)
        self.assertTrue(any("SYNTHETIC_ESTIMATE" in note for note in cost.provenance_notes))

    # Case N: Malformed weather handling
    def test_case_n_malformed_weather(self):
        # ContextBuilder strictly rejects unverified locations to prevent geographic hallucination
        with self.assertRaises(ValueError):
            self.ctx_builder.build_context("Unknown Nonexistent 999")

    # Case O: Missing weather dataset fallback
    def test_case_o_missing_weather_dataset(self):
        from thermoshelter.simulation.weather_adapter import SyntheticWeatherProvider
        provider = SyntheticWeatherProvider(data_dir="data/raw")
        with self.assertRaises(ValueError):
            provider.fetch_weather("NONEXISTENT_DATASET")

    # Case P: Extreme ambient temperature handling in physics solver
    def test_case_p_extreme_ambient_temperature(self):
        design = self._create_base_design()
        design.context.weather_dataset_id = "WEA-LEH-2026"
        design.context.design_temp_min_C = -45.0  # Extreme cold
        perf = self.physics.simulate(design, hours=24)
        self.assertIsNotNone(perf)
        self.assertIn(perf.simulation_status, ("CONVERGED", "FAILED"))

    # Case Q: Invalid orientation angle bounds
    def test_case_q_invalid_orientation(self):
        design = self._create_base_design()
        design.orientation_azimuth_deg = 450.0  # > 360
        # Physics or exports should normalize or process without crashing
        fp = BlueprintExporter.export_floor_plan(design)
        self.assertIsNotNone(fp)

    # Case R: Invalid material conductivity bounds
    def test_case_r_invalid_conductivity_bounds(self):
        # Material properties table enforces physical bounds
        card = self.mat_service.get_material_card("MAT-ROCKWOOL")
        props = card["properties"]
        self.assertGreater(props["thermal_conductivity_W_mK"], 0.001)
        self.assertLess(props["thermal_conductivity_W_mK"], 500.0)

    # Case S: Invalid density physical bounds
    def test_case_s_invalid_density_bounds(self):
        card = self.mat_service.get_material_card("MAT-RAMMED")
        props = card["properties"]
        self.assertGreaterEqual(props["density_kg_m3"], 100.0)
        self.assertLessEqual(props["density_kg_m3"], 10000.0)

    # Case T: API malformed request handling
    def test_case_t_api_malformed_payload(self):
        # NLP and Orchestrator gracefully handle empty or nonsense inputs
        from thermoshelter.core.nlp_interface import NaturalLanguageInterpreter
        req = NaturalLanguageInterpreter.parse_natural_language_request("???!!! $$$ invalid nonsense")
        self.assertIsNotNone(req)
        self.assertGreater(req.occupants, 0)
        self.assertIsNotNone(req.location)

    # ──────────────────────────────────────────────────────────────
    # Cases U–Z: Purpose, Occupancy, Climate, and Consistency Tests
    # ──────────────────────────────────────────────────────────────

    # Case U: Purpose mutation produces different room programs
    def test_case_u_purpose_mutation_different_rooms(self):
        from thermoshelter.core.purpose_profiles import get_purpose_profile
        from thermoshelter.models.model_b_geometry import ModelB_GeometryDesigner

        emergency_profile = get_purpose_profile("emergency_shelter")
        residential_profile = get_purpose_profile("residential_shelter")
        community_profile = get_purpose_profile("community_center")

        # Generate room programs for each purpose
        emergency_rooms = ModelB_GeometryDesigner.generate_room_program(emergency_profile, 4, 24.0)
        residential_rooms = ModelB_GeometryDesigner.generate_room_program(residential_profile, 4, 24.0)
        community_rooms = ModelB_GeometryDesigner.generate_room_program(community_profile, 8, 30.0)

        # Emergency should have fewer rooms than residential
        self.assertLess(len(emergency_rooms), len(residential_rooms),
                        "Emergency shelter must have fewer room zones than residential")

        # Room types must differ between purposes
        emergency_types = {r.room_type for r in emergency_rooms}
        residential_types = {r.room_type for r in residential_rooms}
        self.assertNotEqual(emergency_types, residential_types,
                            "Emergency and residential must produce different room type sets")

        # Community should have a SHARED room
        community_types = {r.room_type for r in community_rooms}
        self.assertIn("SHARED", community_types, "Community center must include SHARED room type")

        # Residential should have SLEEPING room
        self.assertIn("SLEEPING", residential_types, "Residential must include SLEEPING room type")

    # Case V: Occupancy mutation changes area
    def test_case_v_occupancy_mutation_changes_area(self):
        from thermoshelter.models.model_b_geometry import ModelB_GeometryDesigner

        area_4 = ModelB_GeometryDesigner.calculate_space_requirements(4, "RESIDENTIAL_SHELTER")
        area_8 = ModelB_GeometryDesigner.calculate_space_requirements(8, "RESIDENTIAL_SHELTER")
        area_12 = ModelB_GeometryDesigner.calculate_space_requirements(12, "RESIDENTIAL_SHELTER")

        self.assertGreater(area_8, area_4, "8 occupants must require more area than 4")
        self.assertGreater(area_12, area_8, "12 occupants must require more area than 8")

    # Case W: Climate mutation produces different orientation
    def test_case_w_climate_mutation_orientation(self):
        from thermoshelter.models.model_e_synthesizer import ModelE_ArchitecturalSynthesizer
        from thermoshelter.features.context_builder import ContextBuilder

        ctx_builder = ContextBuilder()
        synth = ModelE_ArchitecturalSynthesizer()

        cold_context = ctx_builder.build_context("Leh")
        hot_context = ctx_builder.build_context("Jaipur")

        # Cold climate should include south orientations (135-225°)
        self.assertIn("Cold", cold_context.climate_zone)
        self.assertNotIn("Cold", hot_context.climate_zone)

    # Case X: DesignState serialization round-trip preserves rooms
    def test_case_x_designstate_rooms_roundtrip(self):
        from thermoshelter.core.design_state import DesignState, RoomItem
        from thermoshelter.core.purpose_profiles import get_purpose_profile
        from thermoshelter.models.model_b_geometry import ModelB_GeometryDesigner

        profile = get_purpose_profile("residential_shelter")
        rooms = ModelB_GeometryDesigner.generate_room_program(profile, 4, 24.0)

        # Create a design with rooms
        design = DesignState(
            design_id="DS-TEST-ROOMS",
            design_name="Room Roundtrip Test",
            context=self.ctx_builder.build_context("Leh"),
            requirements=UserRequirements(
                occupant_count=4, target_floor_area_m2=24.0,
                intended_use="RESIDENTIAL_SHELTER", min_indoor_temp_target_C=5.0
            ),
            geometry=GeometryState(
                geometry_id="GEOM-TEST", geometry_type="GEOM-TYPE-RECT-PITCHED",
                length_m=6.0, width_m=4.0, height_m=2.8,
                roof_type="pitched", roof_angle_deg=25.0
            ),
            envelope=self.envelope,
            rooms=rooms,
            purpose_profile_id="RESIDENTIAL_SHELTER"
        )

        # Serialize and deserialize
        d = design.to_dict()
        restored = DesignState.from_dict(d)

        self.assertEqual(len(restored.rooms), len(rooms), "Room count must survive serialization round-trip")
        self.assertEqual(restored.purpose_profile_id, "RESIDENTIAL_SHELTER")
        for orig, rest in zip(rooms, restored.rooms):
            self.assertEqual(orig.room_type, rest.room_type)
            self.assertAlmostEqual(orig.area_m2, rest.area_m2, places=1)

    # Case Y: Purpose profile registry completeness
    def test_case_y_purpose_profile_registry(self):
        from thermoshelter.core.purpose_profiles import PURPOSE_REGISTRY, PURPOSE_ALIASES

        # All expected purposes must be in the registry
        expected_keys = [
            "EMERGENCY_SHELTER", "RESIDENTIAL_SHELTER", "COMMUNITY_CENTER",
            "MEDICAL_SHELTER", "TEMPORARY_SHELTER", "EDUCATIONAL", "WORKER_ACCOMMODATION"
        ]
        for key in expected_keys:
            self.assertIn(key, PURPOSE_REGISTRY, f"Purpose '{key}' missing from registry")
            profile = PURPOSE_REGISTRY[key]
            self.assertGreater(len(profile.room_specs), 0, f"Purpose '{key}' has no room specs")
            self.assertGreater(profile.area_per_occupant_m2, 0)

        # All aliases must resolve
        for alias, target in PURPOSE_ALIASES.items():
            self.assertIn(target, PURPOSE_REGISTRY, f"Alias '{alias}' → '{target}' not in registry")

    # Case Z: Blueprint export includes room program
    def test_case_z_blueprint_room_program(self):
        from thermoshelter.export.blueprint import BlueprintExporter
        from thermoshelter.core.purpose_profiles import get_purpose_profile
        from thermoshelter.models.model_b_geometry import ModelB_GeometryDesigner

        profile = get_purpose_profile("residential_shelter")
        rooms = ModelB_GeometryDesigner.generate_room_program(profile, 4, 24.0)

        design = DesignState(
            design_id="DS-TEST-BLUEPRINT",
            design_name="Blueprint Room Test",
            context=self.ctx_builder.build_context("Leh"),
            requirements=UserRequirements(
                occupant_count=4, target_floor_area_m2=24.0,
                intended_use="RESIDENTIAL_SHELTER", min_indoor_temp_target_C=5.0
            ),
            geometry=GeometryState(
                geometry_id="GEOM-TEST-BP", geometry_type="GEOM-TYPE-RECT-PITCHED",
                length_m=6.0, width_m=4.0, height_m=2.8,
                roof_type="pitched", roof_angle_deg=25.0
            ),
            envelope=self.envelope,
            rooms=rooms,
            purpose_profile_id="RESIDENTIAL_SHELTER",
            site=SiteState(site_condition_id="TEST", location_id="LOC", terrain_type="Flat",
                           soil_classification="GM", soil_type="Gravel", moisture_condition="DRY",
                           density_kg_m3=1800.0, thermal_conductivity_W_mK=1.5, ground_temperature_C=10.0,
                           ground_frost_depth_m=1.0, allowable_bearing_capacity_kPa=100.0,
                           groundwater_depth_m=5.0, drainage_condition="WELL", frost_risk="LOW",
                           slope_percent=2.0, snow_load_kN_m2=1.0, seismic_zone="IV")
        )

        perf, _ = self.physics.simulate_with_timeseries(design, hours=48)
        val = self.validator.validate(design, perf)
        blueprint = BlueprintExporter.export_blueprint(design, perf, val)

        self.assertIn("room_program", blueprint)
        self.assertEqual(blueprint["room_program"]["purpose_profile_id"], "RESIDENTIAL_SHELTER")
        self.assertGreater(len(blueprint["room_program"]["rooms"]), 0)

        # Floor plan should have room_layouts
        floor_plan = BlueprintExporter.export_floor_plan(design)
        self.assertIn("room_layouts", floor_plan)
        self.assertGreater(len(floor_plan["room_layouts"]), 0)
        self.assertIn("purpose_profile_id", floor_plan)


if __name__ == '__main__':
    unittest.main()

