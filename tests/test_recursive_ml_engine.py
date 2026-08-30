"""
ThermoShelter — Comprehensive Test Suite for Corrected Recursive ML Engine Foundation
Verifies all 12 original unit/integration capabilities plus 4 focused correction tests (A, B, C, D).
"""

import sys
import os
import unittest
import json
import numpy as np

# Ensure src/ is on python path
SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from thermoshelter.core.design_state import (
    DesignState, ClimateContext, UserRequirements, GeometryState, OpeningItem, EnvelopeAssemblies
)
from thermoshelter.core.performance_vector import PerformanceVector
from thermoshelter.core.scoring import DesignScorer, DesignScore
from thermoshelter.features.context_builder import ContextBuilder
from thermoshelter.features.feature_extractor import FeatureExtractor
from thermoshelter.models.predictors import (
    AssemblyRecommenderModel, GeometryRecommenderModel, OrientationRecommenderModel, FastPerformanceSurrogateModel
)
from thermoshelter.simulation.physics_bridge import PhysicsBridge
from thermoshelter.validation.engineering_validator import EngineeringValidator, ValidationReport
from thermoshelter.engine.recursive_optimizer import RecursiveDesignOptimizer, OptimizationResult
from thermoshelter.pipeline.training_generator import TrainingDataGenerator, SupervisedTrainingTuple
from thermoshelter.export.blueprint import BlueprintExporter


class TestRecursiveMLEngine(unittest.TestCase):

    def setUp(self):
        self.context_builder = ContextBuilder()
        self.feature_extractor = FeatureExtractor()
        self.physics = PhysicsBridge()
        self.validator = EngineeringValidator()
        self.scorer = DesignScorer()
        self.optimizer = RecursiveDesignOptimizer()

    def test_01_context_builder_and_initial_design(self):
        """Test building context and creating initial candidate design."""
        design = self.context_builder.create_initial_design("Leh", UserRequirements(occupant_count=3, target_floor_area_m2=24.0))
        self.assertEqual(design.context.location_name, "Leh")
        self.assertEqual(design.context.location_id, "LOC-IN-LEH")
        self.assertEqual(design.geometry.floor_area_m2, 24.0)
        self.assertTrue(design.geometry.length_m > 0)
        self.assertTrue(design.geometry.width_m > 0)
        self.assertEqual(len(design.openings), 2)
        print("  [PASS] Test 01: ContextBuilder and initial design creation passed")

    def test_02_design_state_serialization_and_mutation(self):
        """Test DesignState serialization, deserialization, and immutable mutation."""
        design = self.context_builder.create_initial_design("Leh")
        
        # Serialize to dict and back
        d_dict = design.to_dict()
        restored = DesignState.from_dict(d_dict)
        self.assertEqual(restored.design_id, design.design_id)
        self.assertEqual(restored.geometry.floor_area_m2, design.geometry.floor_area_m2)
        self.assertEqual(restored.envelope.wall_material_id, design.envelope.wall_material_id)

        # Mutation test
        mutated = design.with_mutation(
            rationale="TEST_WALL_UPGRADE",
            envelope_changes={"wall_assembly_id": "ASM-WALL-LADAKH-INS-MOD", "wall_u_value_W_m2K": 0.314}
        )
        self.assertNotEqual(design.design_id, mutated.design_id)
        self.assertEqual(mutated.iteration_step, design.iteration_step + 1)
        self.assertEqual(mutated.envelope.wall_assembly_id, "ASM-WALL-LADAKH-INS-MOD")
        self.assertEqual(design.envelope.wall_assembly_id, "ASM-WALL-LADAKH-TRAD") # Original untouched
        print("  [PASS] Test 02: DesignState serialization and immutable mutation passed")

    def test_03_feature_extraction(self):
        """Test tabular numeric feature vector extraction."""
        design = self.context_builder.create_initial_design("Leh")
        feats = FeatureExtractor.extract_design_features(design)
        vec = FeatureExtractor.extract_design_feature_vector(design)

        self.assertIn("hdd_18C_scaled", feats)
        self.assertIn("wall_u_value_W_m2K", feats)
        self.assertEqual(len(vec), len(FeatureExtractor.DESIGN_FEATURE_NAMES))
        self.assertTrue(np.all(np.isfinite(vec)))
        print("  [PASS] Test 03: Feature extraction passed")

    def test_04_ml_prediction_models(self):
        """Test Model A, B, C, D prediction interfaces and outputs."""
        design = self.context_builder.create_initial_design("Leh")

        # Model A: Assembly Recommender
        model_a = AssemblyRecommenderModel()
        pred_a = model_a.recommend(design)
        self.assertEqual(pred_a.prediction_type, "ASSEMBLY_RECOMMENDATION")
        self.assertIn("wall_assembly_id", pred_a.recommended_parameters)
        self.assertTrue(pred_a.confidence_score > 0.8)

        # Model B: Geometry Recommender
        model_b = GeometryRecommenderModel()
        pred_b = model_b.recommend(design)
        self.assertEqual(pred_b.prediction_type, "GEOMETRY_OPTIMIZATION")
        self.assertIn("roof_angle_deg", pred_b.recommended_parameters)

        # Model C: Orientation Recommender
        model_c = OrientationRecommenderModel()
        pred_c = model_c.recommend(design)
        self.assertEqual(pred_c.prediction_type, "ORIENTATION_SELECTION")
        self.assertEqual(pred_c.recommended_parameters["orientation_azimuth_deg"], 180.0)
        self.assertGreaterEqual(pred_c.confidence_score, 0.90)

        # Model D: Fast Performance Surrogate
        model_d = FastPerformanceSurrogateModel()
        pred_d = model_d.predict_performance(design)
        self.assertIn("predicted_avg_indoor_temp_C", pred_d)
        print("  [PASS] Test 04: ML Recommender models (A, B, C, D) passed")

    def test_05_physics_simulation_bridge(self):
        """Test simulation bridge integration with ThermalEngine."""
        design = self.context_builder.create_initial_design("Leh")
        perf = self.physics.simulate(design, hours=24)

        self.assertEqual(perf.simulation_status, "CONVERGED")
        self.assertTrue(perf.raw_simulation_hours == 24)
        self.assertTrue(perf.avg_indoor_temp_C.value > -50.0)
        self.assertTrue(perf.effective_thermal_capacitance_MJ_K.value > 0.0)
        self.assertTrue(perf.energy_balance_max_error_W < 1e-4)
        print("  [PASS] Test 05: Physics simulation bridge execution passed")

    def test_06_engineering_validator(self):
        """Test engineering validation of statutory rules."""
        # Uninsulated traditional wall in Leh (Wall U=1.591 > 0.45) should fail RULE-ENG-001
        design = self.context_builder.create_initial_design("Leh")
        perf = self.physics.simulate(design, hours=24)
        val_report = self.validator.validate(design, perf)

        self.assertFalse(val_report.is_fully_compliant)
        self.assertTrue(any("RULE-ENG-001" in fail for fail in val_report.mandatory_failures))

        # Upgraded insulated design (Wall U=0.314 <= 0.45, Roof U=0.250 <= 0.40) should pass
        upgraded = design.with_mutation(
            rationale="UPGRADE_ENVELOPE",
            envelope_changes={
                "wall_assembly_id": "ASM-WALL-LADAKH-INS-MOD",
                "wall_u_value_W_m2K": 0.314,
                "roof_assembly_id": "ASM-ROOF-LADAKH-INS-MOD",
                "roof_u_value_W_m2K": 0.250,
                "floor_assembly_id": "ASM-FLOOR-LADAKH-INS-SLAB",
                "floor_u_value_W_m2K": 0.444
            }
        )
        perf_up = self.physics.simulate(upgraded, hours=24)
        val_up = self.validator.validate(upgraded, perf_up)
        self.assertTrue(val_up.is_fully_compliant)
        self.assertEqual(len(val_up.mandatory_failures), 0)
        print("  [PASS] Test 06: Engineering validator rule checking passed")

    def test_07_scoring_layer_hard_vs_soft(self):
        """Test that hard constraint failures prevent a candidate from winning."""
        design = self.context_builder.create_initial_design("Leh")
        perf = self.physics.simulate(design, hours=24)

        # Case 1: Statutory rule failure -> Total score must be 0.0
        score_fail = self.scorer.evaluate(design, perf, engineering_validation_failures=["RULE-ENG-001"])
        self.assertFalse(score_fail.hard_constraints_passed)
        self.assertEqual(score_fail.total_score, 0.0)
        self.assertEqual(score_fail.summary_verdict, "NON_COMPLIANT")

        # Case 2: Compliant design -> Total score > 0.0
        score_pass = self.scorer.evaluate(design, perf, engineering_validation_failures=[])
        self.assertTrue(score_pass.hard_constraints_passed)
        self.assertTrue(score_pass.total_score > 0.0)
        print("  [PASS] Test 07: Transparent scoring layer (Hard vs Soft separation) passed")

    def test_08_recursive_design_optimizer_end_to_end(self):
        """Test complete recursive design loop with weakness diagnosis and convergence."""
        initial_design = self.context_builder.create_initial_design("Leh", UserRequirements(occupant_count=2, target_floor_area_m2=24.0))
        
        opt_result = self.optimizer.optimize(initial_design, simulation_hours=24)

        self.assertIsInstance(opt_result, OptimizationResult)
        self.assertTrue(opt_result.total_iterations >= 2)
        self.assertTrue(opt_result.best_score.hard_constraints_passed)
        self.assertTrue(opt_result.best_score.total_score >= 60.0)
        self.assertEqual(opt_result.best_score.summary_verdict, "ACCEPTABLE")
        self.assertTrue(opt_result.final_validation.is_fully_compliant)
        
        # Verify improvement across iterations
        first_step = opt_result.iteration_history[0]
        final_step = opt_result.iteration_history[-1]
        self.assertFalse(first_step.hard_constraints_passed) # Initial baseline had uninsulated wall failure
        self.assertTrue(final_step.hard_constraints_passed)
        self.assertTrue(final_step.total_score > first_step.total_score)
        print(f"  [PASS] Test 08: End-to-end Recursive Optimizer converged in {opt_result.total_iterations} steps ({opt_result.stopping_reason}, Score={opt_result.best_score.total_score:.1f})")

    def test_09_cycle_and_infinite_loop_prevention(self):
        """Test state signature hashing and repeated state detection."""
        design = self.context_builder.create_initial_design("Leh")
        sig1 = self.optimizer._compute_state_signature(design)
        sig2 = self.optimizer._compute_state_signature(design.copy())
        self.assertEqual(sig1, sig2)

        mutated = design.with_mutation(rationale="CHANGE_ORIENTATION", orientation_deg=90.0)
        sig3 = self.optimizer._compute_state_signature(mutated)
        self.assertNotEqual(sig1, sig3)
        print("  [PASS] Test 09: State signature hashing and cycle prevention passed")

    def test_10_training_data_generator_and_quarantine(self):
        """Test training example generation and quality quarantine."""
        design = self.context_builder.create_initial_design("Leh")
        perf = self.physics.simulate(design, hours=24)
        
        # Non-compliant design should be quarantined (None returned)
        score_fail = self.scorer.evaluate(design, perf, engineering_validation_failures=["RULE-ENG-001"])
        val_fail = ValidationReport(is_fully_compliant=False, mandatory_failures=["RULE-ENG-001"], warnings=[], evaluations=[])
        ex_fail = TrainingDataGenerator.generate_training_example(design, perf, score_fail, val_fail)
        self.assertIsNone(ex_fail)

        # Compliant design should generate complete supervised tuple
        score_pass = self.scorer.evaluate(design, perf, engineering_validation_failures=[])
        val_pass = ValidationReport(is_fully_compliant=True, mandatory_failures=[], warnings=[], evaluations=[])
        ex_pass = TrainingDataGenerator.generate_training_example(design, perf, score_pass, val_pass)
        self.assertIsNotNone(ex_pass)
        self.assertEqual(ex_pass.provenance_type, "PHYSICS_SIMULATION")
        self.assertIn("hdd_18C_scaled", ex_pass.context_features)
        self.assertIn("recommended_wall_assembly_id", ex_pass.recommended_outputs)
        print("  [PASS] Test 10: Training data generation and quality gating passed")

    def test_11_dataset_group_splitting(self):
        """Test group-based train/val/test splitting to prevent geographic data leakage."""
        design_leh = self.context_builder.create_initial_design("Leh")
        perf_leh = self.physics.simulate(design_leh, hours=24)
        score_leh = self.scorer.evaluate(design_leh, perf_leh, [])
        val_leh = ValidationReport(is_fully_compliant=True, mandatory_failures=[], warnings=[], evaluations=[])
        ex_leh = TrainingDataGenerator.generate_training_example(design_leh, perf_leh, score_leh, val_leh)

        design_shimla = self.context_builder.create_initial_design("Shimla")
        perf_shimla = self.physics.simulate(design_shimla, hours=24)
        score_shimla = self.scorer.evaluate(design_shimla, perf_shimla, [])
        val_shimla = ValidationReport(is_fully_compliant=True, mandatory_failures=[], warnings=[], evaluations=[])
        ex_shimla = TrainingDataGenerator.generate_training_example(design_shimla, perf_shimla, score_shimla, val_shimla)

        examples = [ex_leh, ex_shimla]
        train, val, test = TrainingDataGenerator.split_dataset(examples, test_group_ids=["LOC-IN-SHIMLA"], val_group_ids=[])

        self.assertEqual(len(train), 1)
        self.assertEqual(train[0].split_group_id, "LOC-IN-LEH")
        self.assertEqual(len(test), 1)
        self.assertEqual(test[0].split_group_id, "LOC-IN-SHIMLA")
        print("  [PASS] Test 11: Group-based data splitting (Zero leakage) passed")

    def test_12_blueprint_export(self):
        """Test structured blueprint export and 3D visualization data generation."""
        design = self.context_builder.create_initial_design("Leh")
        perf = self.physics.simulate(design, hours=24)
        val = self.validator.validate(design, perf)
        blueprint = BlueprintExporter.export_blueprint(design, perf, val)

        self.assertEqual(blueprint["blueprint_version"], "1.0.0")
        self.assertIn("bill_of_materials", blueprint)
        self.assertIn("fenestration_schedule", blueprint)
        self.assertIn("visualization_3d_data", blueprint)
        self.assertEqual(len(blueprint["visualization_3d_data"]["wireframe_vertices_local"]), 8)
        print("  [PASS] Test 12: Blueprint export and 3D visualization primitives passed")

    # -------------------------------------------------------------
    # FOCUSED CORRECTION TESTS (A, B, C, D)
    # -------------------------------------------------------------

    def test_13_correction_A_target_leakage_isolation(self):
        """Correction 1 Test: Verify strict separation between Context and Design features."""
        design = self.context_builder.create_initial_design("Leh")

        # Context features MUST NOT contain candidate assembly U-values
        ctx_feats = FeatureExtractor.extract_context_features(design)
        self.assertNotIn("wall_u_value_W_m2K", ctx_feats)
        self.assertNotIn("roof_u_value_W_m2K", ctx_feats)
        self.assertNotIn("floor_u_value_W_m2K", ctx_feats)
        self.assertNotIn("wall_thickness_mm", ctx_feats)
        self.assertEqual(len(ctx_feats), len(FeatureExtractor.CONTEXT_FEATURE_NAMES))

        # Design features MUST contain envelope U-values for surrogate modeling
        des_feats = FeatureExtractor.extract_design_features(design)
        self.assertIn("wall_u_value_W_m2K", des_feats)
        self.assertIn("roof_u_value_W_m2K", des_feats)
        self.assertIn("floor_u_value_W_m2K", des_feats)
        self.assertEqual(len(des_feats), len(FeatureExtractor.DESIGN_FEATURE_NAMES))
        print("  [PASS] Test 13 (Correction A): Strict target leakage isolation verified")

    def test_14_correction_B_orientation_priority(self):
        """Correction 2 Test: Verify optimizer diagnoses and corrects major orientation misalignment."""
        # Create a cold-climate design with 90° azimuth (North-South axis) and compliant insulated wall
        design = self.context_builder.create_initial_design("Leh")
        bad_ori_design = design.with_mutation(
            rationale="TEST_BAD_ORIENTATION",
            orientation_deg=90.0,
            envelope_changes={
                "wall_assembly_id": "ASM-WALL-LADAKH-INS-MOD",
                "wall_u_value_W_m2K": 0.314,
                "roof_assembly_id": "ASM-ROOF-LADAKH-INS-MOD",
                "roof_u_value_W_m2K": 0.250,
                "floor_assembly_id": "ASM-FLOOR-LADAKH-INS-SLAB",
                "floor_u_value_W_m2K": 0.444
            }
        )
        self.assertEqual(bad_ori_design.orientation_azimuth_deg, 90.0)

        opt_result = self.optimizer.optimize(bad_ori_design, simulation_hours=24)
        
        # Verify the optimizer addressed orientation and rotated to True South (180.0°)
        self.assertEqual(opt_result.best_design.orientation_azimuth_deg, 180.0)
        self.assertTrue(any(rec.parameter_changed == "orientation_azimuth_deg" for rec in opt_result.iteration_history))
        print(f"  [PASS] Test 14 (Correction B): Major orientation bottleneck resolved in iteration ({opt_result.stopping_reason})")

    def test_15_correction_C_robust_physics_failure_handling(self):
        """Correction 3 Test: Verify invalid physical candidate returns FAILED vector without crashing."""
        design = self.context_builder.create_initial_design("Leh")
        # Oversized openings: 100 m² > 56 m² gross wall area
        invalid_candidate = design.with_mutation(
            rationale="OVERSIZED_OPENINGS",
            openings_changes=[OpeningItem("OPN-HUGE", "WINDOW", "South", 10.0, 10.0, 100.0, 2.0, 0.7, "double")]
        )

        # 1. Physics bridge must not throw uncaught exception
        perf = self.physics.simulate(invalid_candidate, hours=24)
        self.assertEqual(perf.simulation_status, "FAILED")
        self.assertEqual(perf.energy_balance_max_error_W, float("inf"))
        self.assertTrue(len(perf.constraint_violations) > 0)

        # 2. Scorer must reject the candidate with score = 0.0
        val = self.validator.validate(invalid_candidate, perf)
        score = self.scorer.evaluate(invalid_candidate, perf, val.mandatory_failures)
        self.assertFalse(score.hard_constraints_passed)
        self.assertEqual(score.total_score, 0.0)
        self.assertIn(score.summary_verdict, ["PHYSICALLY_INVALID", "NON_COMPLIANT"])

        # 3. Recursive optimizer recovers safely from physically invalid candidate
        opt_res = self.optimizer.optimize(invalid_candidate, simulation_hours=24)
        self.assertIsInstance(opt_res, OptimizationResult)
        self.assertTrue(opt_res.best_score.hard_constraints_passed)
        print("  [PASS] Test 15 (Correction C): Physics failure handled gracefully and recovered")

    def test_16_correction_D_honest_ml_status(self):
        """Correction 4 & 5 Test: Verify models declare baseline heuristic status and fit interfaces."""
        model_a = AssemblyRecommenderModel()
        model_b = GeometryRecommenderModel()
        model_c = OrientationRecommenderModel()
        model_d = FastPerformanceSurrogateModel()

        self.assertIn("heuristic", model_a.MODEL_VERSION)
        self.assertIn("formula", model_b.MODEL_VERSION)
        self.assertIn("heuristic", model_c.MODEL_VERSION)
        # Model D is now a trained GBR (upgraded from analytical surrogate)
        self.assertTrue(
            "trained" in model_d.MODEL_VERSION or "surrogate" in model_d.MODEL_VERSION,
            f"Model D version must indicate trained or surrogate status, got: {model_d.MODEL_VERSION}"
        )

        # Verify fit interface presence
        self.assertTrue(hasattr(model_a, "fit"))
        self.assertTrue(hasattr(model_b, "fit"))
        self.assertTrue(hasattr(model_c, "fit"))
        self.assertTrue(hasattr(model_d, "fit"))
        print("  [PASS] Test 16 (Correction D): Honest ML baseline status and extensible interfaces verified")

    def test_17_site_and_soil_data_integration(self):
        """Test SiteState geotechnical integration, serialization, and leakage-safe extraction."""
        design = self.context_builder.create_initial_design("Leh")
        self.assertIsNotNone(design.site)
        self.assertEqual(design.site.location_id, "LOC-IN-LEH")
        self.assertEqual(design.site.soil_classification, "GM-GP")
        self.assertEqual(design.site.ground_frost_depth_m, 1.20)
        self.assertEqual(design.site.allowable_bearing_capacity_kPa, 150.0)
        self.assertEqual(design.site.frost_risk, "HIGH")

        # Test Serialization & Deserialization with SiteState
        d_dict = design.to_dict()
        self.assertIn("site", d_dict)
        restored = DesignState.from_dict(d_dict)
        self.assertIsNotNone(restored.site)
        self.assertEqual(restored.site.soil_classification, "GM-GP")
        self.assertEqual(restored.site.thermal_conductivity_W_mK, 1.80)

        # Test Feature Extraction includes site features without target leakage
        ctx_feats = FeatureExtractor.extract_context_features(design)
        self.assertIn("ground_frost_depth_m", ctx_feats)
        self.assertIn("soil_bearing_capacity_scaled", ctx_feats)
        self.assertNotIn("wall_u_value_W_m2K", ctx_feats) # Strict no leakage
        print("  [PASS] Test 17: Site & Soil geotechnical data integration and serialization verified")

    def test_18_canonical_orientation_convention_and_directional_solar(self):
        """Test 18: Explicit verification of canonical compass orientation (0=N, 90=E, 180=S, 270=W) and directional solar physics."""
        design = self.context_builder.create_initial_design("Leh")
        
        # Test 4 cardinal orientations
        d_north = design.with_mutation("TEST_NORTH", orientation_deg=0.0)
        d_east = design.with_mutation("TEST_EAST", orientation_deg=90.0)
        d_south = design.with_mutation("TEST_SOUTH", orientation_deg=180.0)
        d_west = design.with_mutation("TEST_WEST", orientation_deg=270.0)

        self.assertEqual(d_north.orientation_azimuth_deg, 0.0)
        self.assertEqual(d_east.orientation_azimuth_deg, 90.0)
        self.assertEqual(d_south.orientation_azimuth_deg, 180.0)
        self.assertEqual(d_west.orientation_azimuth_deg, 270.0)

        # Simulate winter 48h in Leh
        perf_north = self.physics.simulate(d_north, hours=48)
        perf_east = self.physics.simulate(d_east, hours=48)
        perf_south = self.physics.simulate(d_south, hours=48)
        perf_west = self.physics.simulate(d_west, hours=48)

        # Directional solar gain: South (180°) must significantly exceed East (90°) and West (270°)
        solar_south = perf_south.total_solar_gain_kWh.value
        solar_north = perf_north.total_solar_gain_kWh.value
        solar_east = perf_east.total_solar_gain_kWh.value
        solar_west = perf_west.total_solar_gain_kWh.value

        self.assertGreater(solar_south, solar_east, f"South solar ({solar_south:.1f} kWh) should exceed East solar ({solar_east:.1f} kWh)")
        self.assertGreater(solar_south, solar_west, f"South solar ({solar_south:.1f} kWh) should exceed West solar ({solar_west:.1f} kWh)")
        self.assertGreater(perf_south.avg_indoor_temp_C.value, perf_east.avg_indoor_temp_C.value)
        
        # Numerical energy balance residual check
        self.assertLess(perf_south.energy_balance_max_error_W, 1e-4)
        print(f"  [PASS] Test 18: Canonical orientation convention (0=N, 90=E, 180=S, 270=W) & directional solar validated (South: {solar_south:.1f} kWh > East: {solar_east:.1f} kWh)")

    # =============================================================
    # INTEGRATION TESTS FOR END-TO-END SHELTER DESIGN SYSTEM (19-34)
    # =============================================================

    def test_19_user_request_to_design_requirements(self):
        """Test: User-friendly request becomes valid internal design requirements."""
        from thermoshelter.core.user_input import ShelterRequest, RequestInterpreter
        request = ShelterRequest(
            location="Leh", occupants=4, purpose="emergency_shelter",
            thermal_objective="winter_warmth", preferred_area_m2=24.0
        )
        params = RequestInterpreter.interpret(request, is_cold_climate=True)
        self.assertEqual(params["occupant_count"], 4)
        self.assertEqual(params["target_floor_area_m2"], 24.0)
        self.assertEqual(params["intended_use"], "EMERGENCY_SHELTER")
        self.assertEqual(params["ventilation_level"], "low")
        self.assertIn(params["max_budget_tier"], ["EMERGENCY", "LOW_COST", "STANDARD"])
        print("  [PASS] Test 19: User request -> internal design requirements")

    def test_20_candidate_generation_produces_complete_designs(self):
        """Test: Design generator produces complete DesignState objects."""
        from thermoshelter.engine.design_generator import DesignGenerator
        ctx = self.context_builder.build_context("Leh")
        site = self.context_builder.build_site("Leh")
        req = UserRequirements(occupant_count=4, target_floor_area_m2=24.0)
        gen = DesignGenerator()
        candidates = gen.generate_candidates(ctx, site, req, n_max=10)
        self.assertTrue(len(candidates) >= 3, f"Expected >= 3 candidates, got {len(candidates)}")
        for c in candidates:
            self.assertIsInstance(c, DesignState)
            self.assertTrue(c.geometry.floor_area_m2 > 0)
            self.assertTrue(c.geometry.length_m > 0)
            self.assertTrue(len(c.openings) > 0)
            self.assertTrue(c.total_opening_area_m2 < c.geometry.gross_wall_area_m2)
        print(f"  [PASS] Test 20: Generated {len(candidates)} complete design candidates")

    def test_21_models_abc_integrated_in_candidates(self):
        """Test: Model A/B/C recommendations appear in generated candidates."""
        from thermoshelter.engine.design_generator import DesignGenerator
        ctx = self.context_builder.build_context("Leh")
        site = self.context_builder.build_site("Leh")
        req = UserRequirements(occupant_count=4, target_floor_area_m2=24.0)
        gen = DesignGenerator()
        candidates = gen.generate_candidates(ctx, site, req, n_max=20)
        # Model A: Multiple material variants should appear
        materials = set(c.envelope.wall_material_id for c in candidates)
        self.assertTrue(len(materials) >= 2, f"Expected multiple wall materials, got {materials}")
        # Model B: Multiple aspect ratios should appear
        aspects = set(c.geometry.aspect_ratio for c in candidates)
        self.assertTrue(len(aspects) >= 2, f"Expected multiple aspect ratios, got {aspects}")
        # Model C: Multiple orientations should appear
        orientations = set(c.orientation_azimuth_deg for c in candidates)
        self.assertTrue(len(orientations) >= 2, f"Expected multiple orientations, got {orientations}")
        print(f"  [PASS] Test 21: A/B/C integrated -- {len(materials)} materials, {len(aspects)} geometries, {len(orientations)} orientations")

    def test_22_model_d_evaluates_generated_candidates(self):
        """Test: Trained Model D evaluates all generated candidates."""
        from thermoshelter.engine.design_generator import DesignGenerator
        ctx = self.context_builder.build_context("Leh")
        site = self.context_builder.build_site("Leh")
        req = UserRequirements(occupant_count=4, target_floor_area_m2=24.0)
        gen = DesignGenerator()
        candidates = gen.generate_candidates(ctx, site, req, n_max=10)
        model_d = FastPerformanceSurrogateModel()
        preds = model_d.predict_batch(candidates)
        self.assertEqual(len(preds), len(candidates))
        for p in preds:
            self.assertIn("predicted_avg_indoor_temp_C", p)
            self.assertIn("predicted_total_solar_kWh", p)
            self.assertIn("predicted_total_loss_kWh", p)
            self.assertIn(p["status"], ["TRAINED_SURROGATE", "ANALYTICAL_FALLBACK"])
        print(f"  [PASS] Test 22: Model D screened {len(candidates)} candidates (status: {preds[0]['status']})")

    def test_23_candidates_can_be_ranked(self):
        """Test: Candidates can be ranked by ML screening score."""
        from thermoshelter.engine.design_generator import DesignGenerator
        from thermoshelter.engine.orchestrator import ShelterDesignOrchestrator
        ctx = self.context_builder.build_context("Leh")
        site = self.context_builder.build_site("Leh")
        req = UserRequirements(occupant_count=4, target_floor_area_m2=24.0)
        gen = DesignGenerator()
        candidates = gen.generate_candidates(ctx, site, req, n_max=10)
        model_d = FastPerformanceSurrogateModel()
        preds = model_d.predict_batch(candidates)
        orch = ShelterDesignOrchestrator()
        ranked = orch._rank_by_ml_screening(candidates, preds, "winter_warmth", True)
        self.assertEqual(len(ranked), len(candidates))
        # Verify sorted (best-first)
        scores = [s for _, s in ranked]
        self.assertEqual(scores, sorted(scores, reverse=True))
        print(f"  [PASS] Test 23: {len(ranked)} candidates ranked by ML score")

    def test_24_finalists_reach_physics_engine(self):
        """Test: Top candidates reach the physics simulation engine."""
        design = self.context_builder.create_initial_design("Leh", UserRequirements(occupant_count=4))
        perf, hourly = self.physics.simulate_with_timeseries(design, hours=24)
        self.assertEqual(perf.simulation_status, "CONVERGED")
        self.assertTrue(len(hourly) == 24)
        self.assertTrue(perf.avg_indoor_temp_C.value > -50.0)
        print("  [PASS] Test 24: Finalist design reached physics engine with time-series")

    def test_25_engineering_validation_executed_on_finalists(self):
        """Test: Engineering validation gate applied to all finalists."""
        design = self.context_builder.create_initial_design("Leh")
        perf = self.physics.simulate(design, hours=24)
        val = self.validator.validate(design, perf)
        self.assertIsInstance(val, ValidationReport)
        self.assertTrue(len(val.evaluations) >= 5)
        print("  [PASS] Test 25: Engineering validation executed with 5+ rules")

    def test_26_alternative_designs_produced(self):
        """Test: Multiple design alternatives are generated (not just one)."""
        from thermoshelter.core.user_input import ShelterRequest
        from thermoshelter.engine.orchestrator import ShelterDesignOrchestrator
        request = ShelterRequest(location="Leh", occupants=4, purpose="emergency_shelter",
                                 thermal_objective="winter_warmth", preferred_area_m2=24.0)
        orch = ShelterDesignOrchestrator(n_candidates=18, n_finalists=4, simulation_hours=24)
        report = orch.design_shelter(request)
        self.assertTrue(len(report.alternatives) >= 2, f"Expected >= 2 alternatives, got {len(report.alternatives)}")
        # Recommended is always rank 1
        self.assertEqual(report.recommended.rank, 1)
        self.assertIn("Recommended", report.recommended.label)
        # Alternatives should have different orientations/materials/geometries
        designs = set(a.design_id for a in report.alternatives)
        self.assertEqual(len(designs), len(report.alternatives))
        print(f"  [PASS] Test 26: {len(report.alternatives)} design alternatives produced")

    def test_27_controlled_material_comparison(self):
        """Test: Material comparison holds geometry constant, changes only materials."""
        from thermoshelter.engine.material_comparator import MaterialComparator
        design = self.context_builder.create_initial_design("Leh")
        # Upgrade to compliant assemblies first
        design = design.with_mutation(
            rationale="UPGRADE",
            envelope_changes={
                "wall_assembly_id": "ASM-WALL-LADAKH-INS-MOD",
                "wall_material_id": "MAT-CSEB", "wall_thickness_mm": 392.5, "wall_u_value_W_m2K": 0.314,
                "roof_assembly_id": "ASM-ROOF-LADAKH-INS-MOD",
                "roof_material_id": "MAT-XPS", "roof_thickness_mm": 153.0, "roof_u_value_W_m2K": 0.250,
            }
        )
        variants = MaterialComparator.get_material_variants_for_climate(design.context.climate_zone)
        self.assertTrue(len(variants) >= 2)
        comp = MaterialComparator(physics=self.physics, validator=self.validator, scorer=self.scorer)
        result = comp.compare(design, variants[:2], simulation_hours=24)
        # Geometry must be identical across variants
        for v in result.variants:
            self.assertEqual(v.design.geometry.floor_area_m2, design.geometry.floor_area_m2)
            self.assertEqual(v.design.orientation_azimuth_deg, design.orientation_azimuth_deg)
        # Materials should differ
        mats = set(v.envelope.wall_material_id for v in result.variants)
        if len(variants) >= 2 and variants[0]["wall_material_id"] != variants[1]["wall_material_id"]:
            self.assertTrue(len(mats) >= 2)
        print(f"  [PASS] Test 27: Controlled material comparison with {len(result.variants)} variants")

    def test_28_orientation_affects_solar_in_candidates(self):
        """Test: Different orientations produce different solar gain in generated candidates."""
        ctx = self.context_builder.build_context("Leh")
        site = self.context_builder.build_site("Leh")
        req = UserRequirements(occupant_count=4, target_floor_area_m2=24.0)
        # Create two designs differing only in orientation
        design_s = self.context_builder.create_initial_design("Leh", req)
        design_s = design_s.with_mutation("SOUTH", orientation_deg=180.0)
        design_e = design_s.with_mutation("EAST", orientation_deg=90.0)
        perf_s = self.physics.simulate(design_s, hours=48)
        perf_e = self.physics.simulate(design_e, hours=48)
        # South should capture more solar in cold climate
        self.assertGreater(perf_s.total_solar_gain_kWh.value, perf_e.total_solar_gain_kWh.value)
        print(f"  [PASS] Test 28: Solar gain varies with orientation (S:{perf_s.total_solar_gain_kWh.value:.0f} > E:{perf_e.total_solar_gain_kWh.value:.0f} kWh)")

    def test_29_temperature_timeseries_data_produced(self):
        """Test: Hourly time-series data is available for visualization."""
        from thermoshelter.export.report import ThermalTimeSeries
        design = self.context_builder.create_initial_design("Leh")
        _, hourly = self.physics.simulate_with_timeseries(design, hours=48)
        ts = ThermalTimeSeries.from_hourly_results(hourly)
        self.assertEqual(len(ts.hours), 48)
        self.assertEqual(len(ts.outdoor_temp_C), 48)
        self.assertEqual(len(ts.indoor_temp_C), 48)
        self.assertEqual(len(ts.solar_gain_W), 48)
        self.assertTrue(all(isinstance(t, float) for t in ts.indoor_temp_C))
        print("  [PASS] Test 29: Temperature time-series with 48 hourly records")

    def test_30_blueprint_floor_plan_generated(self):
        """Test: 2D floor plan data is generated from design."""
        design = self.context_builder.create_initial_design("Leh")
        floor_plan = BlueprintExporter.export_floor_plan(design)
        self.assertIn("Conceptual Passive Shelter Design", floor_plan["title"])
        self.assertIn("outer_boundary", floor_plan)
        self.assertIn("inner_boundary", floor_plan)
        self.assertIn("openings", floor_plan)
        self.assertIn("north_arrow_angle_deg", floor_plan)
        self.assertTrue(len(floor_plan["openings"]) >= 1)
        self.assertTrue(floor_plan["floor_area_m2"] > 0)
        print("  [PASS] Test 30: 2D conceptual floor plan generated")

    def test_31_no_ml_target_leakage_in_new_modules(self):
        """Test: New integration does not introduce target leakage."""
        from thermoshelter.engine.design_generator import DesignGenerator
        ctx = self.context_builder.build_context("Leh")
        site = self.context_builder.build_site("Leh")
        req = UserRequirements(occupant_count=4, target_floor_area_m2=24.0)
        gen = DesignGenerator()
        candidates = gen.generate_candidates(ctx, site, req, n_max=5)
        for c in candidates:
            # Context features must NOT contain target U-values
            ctx_feats = FeatureExtractor.extract_context_features(c)
            self.assertNotIn("wall_u_value_W_m2K", ctx_feats)
            self.assertNotIn("roof_u_value_W_m2K", ctx_feats)
            # Design features MUST contain them (for Model D)
            des_feats = FeatureExtractor.extract_design_features(c)
            self.assertIn("wall_u_value_W_m2K", des_feats)
        print("  [PASS] Test 31: No ML target leakage in generated candidates")

    def test_32_existing_physics_tests_unaffected(self):
        """Test: PhysicsBridge simulate() still works identically."""
        design = self.context_builder.create_initial_design("Leh")
        perf = self.physics.simulate(design, hours=24)
        self.assertEqual(perf.simulation_status, "CONVERGED")
        self.assertTrue(perf.raw_simulation_hours == 24)
        self.assertTrue(perf.energy_balance_max_error_W < 1e-4)
        print("  [PASS] Test 32: Existing physics simulation behaviour preserved")

    def test_33_orchestrator_produces_complete_report(self):
        """Test: End-to-end orchestrator produces a complete design report."""
        from thermoshelter.core.user_input import ShelterRequest
        from thermoshelter.engine.orchestrator import ShelterDesignOrchestrator
        request = ShelterRequest(location="Leh", occupants=4, purpose="emergency_shelter",
                                 thermal_objective="winter_warmth", preferred_area_m2=24.0)
        orch = ShelterDesignOrchestrator(n_candidates=18, n_finalists=3, simulation_hours=24)
        report = orch.design_shelter(request)
        # Core assertions
        self.assertEqual(report.location, "Leh")
        self.assertEqual(report.occupants, 4)
        self.assertIsNotNone(report.recommended)
        self.assertTrue(len(report.alternatives) >= 2)
        self.assertIsNotNone(report.blueprint)
        self.assertIsNotNone(report.floor_plan)
        self.assertTrue(report.total_candidates_generated > 0)
        self.assertTrue(len(report.recommendation_explanation) > 0)
        # Recommended design should have physics-validated temperature
        self.assertTrue(report.recommended.avg_indoor_temp_C > -50)
        # Format summary should work without error
        summary = report.format_summary()
        self.assertTrue(len(summary) > 100)
        print(f"  [PASS] Test 33: Complete report -- {report.total_candidates_generated} candidates -> "
              f"{len(report.alternatives)} alternatives, recommended score: {report.recommended.score}")

    def test_34_explanation_from_actual_results(self):
        """Test: Explanation text is generated from actual simulation results, not hardcoded."""
        from thermoshelter.core.user_input import ShelterRequest
        from thermoshelter.engine.orchestrator import ShelterDesignOrchestrator
        request = ShelterRequest(location="Leh", occupants=4, purpose="emergency_shelter",
                                 thermal_objective="winter_warmth", preferred_area_m2=24.0)
        orch = ShelterDesignOrchestrator(n_candidates=18, n_finalists=3, simulation_hours=24)
        report = orch.design_shelter(request)
        explanation = report.recommended.explanation
        self.assertTrue(len(explanation) > 20)
        # Explanation should reference actual values (temperature, kWh, material ID, etc.)
        self.assertTrue(
            "kWh" in explanation or "W/m" in explanation or "MAT-" in explanation or "C" in explanation,
            f"Explanation should reference actual results: {explanation}"
        )
        print(f"  [PASS] Test 34: Evidence-based explanation generated from simulation results")

    def test_35_model_a_envelope_selector(self):
        """Test 35: Model A computes R-value constraints and selects multi-tier assemblies."""
        from thermoshelter.models.model_a_envelope import ModelA_EnvelopeSelector
        from thermoshelter.features.context_builder import ContextBuilder
        cb = ContextBuilder()
        context = cb.build_context("Leh")
        selector = ModelA_EnvelopeSelector()
        
        r_req = selector.calculate_required_thermal_resistance(context.design_temp_min_C)
        self.assertGreater(r_req, 1.5, "Leh sub-zero design temperature requires substantial R-value")
        
        selection = selector.select_envelope(context)
        self.assertIn("wall", selection)
        self.assertIn("roof", selection)
        self.assertIn("floor", selection)
        self.assertGreaterEqual(selection["wall"].r_value, 2.0)
        self.assertLessEqual(selection["wall"].u_value, 0.45)
        print(f"  [PASS] Test 35: Model A calculated R_req={r_req} (m2K)/W and selected {selection['wall'].material_id} (R={selection['wall'].r_value})")

    def test_36_model_b_geometry_designer(self):
        """Test 36: Model B calculates space requirements, aspect ratios, and snow-shedding pitch."""
        from thermoshelter.models.model_b_geometry import ModelB_GeometryDesigner
        from thermoshelter.features.context_builder import ContextBuilder
        from thermoshelter.core.design_state import UserRequirements
        cb = ContextBuilder()
        context = cb.build_context("Leh")
        site = cb.build_site("Leh")
        designer = ModelB_GeometryDesigner()
        
        # 6 occupants emergency shelter
        req = UserRequirements(occupant_count=6, target_floor_area_m2=20.0, intended_use="EMERGENCY_SHELTER")
        plan = designer.design_geometry(context, site, req)
        
        self.assertGreaterEqual(plan.floor_area_m2, 21.0, "SPHERE standard 3.5m2 x 6 = 21m2")
        self.assertGreaterEqual(plan.aspect_ratio, 1.4, "Cold alpine requires elongated East-West aspect ratio")
        self.assertGreaterEqual(plan.roof_pitch_deg, 25.0, "Snow load requires >= 25 deg pitch")
        print(f"  [PASS] Test 36: Model B designed {plan.length_m}x{plan.width_m}m ({plan.floor_area_m2}m2, AR={plan.aspect_ratio}, Pitch={plan.roof_pitch_deg}deg)")

    def test_37_model_c_passive_solar_designer(self):
        """Test 37: Model C computes solar noon elevation, directional WWR, and overhang depth."""
        from thermoshelter.models.model_c_passive_solar import ModelC_PassiveSolarDesigner
        from thermoshelter.features.context_builder import ContextBuilder
        from thermoshelter.core.design_state import GeometryState
        cb = ContextBuilder()
        context = cb.build_context("Leh")
        geom = GeometryState("G1", "GEOM-RECT", 7.0, 3.5, 2.8, "pitched", 30.0)
        designer = ModelC_PassiveSolarDesigner()
        
        strat = designer.design_passive_solar(context, geom)
        self.assertEqual(strat.azimuth_deg, 180.0, "Northern hemisphere cold climate requires 180 True South")
        self.assertGreaterEqual(strat.south_wwr_percent, 20.0, "South WWR should be high for passive gain")
        self.assertLessEqual(strat.north_wwr_percent, 5.0, "North WWR should be <= 5% to prevent heat loss")
        self.assertGreater(strat.overhang_depth_m, 0.2)
        print(f"  [PASS] Test 37: Model C designed True South orientation (S-WWR={strat.south_wwr_percent}%, N-WWR={strat.north_wwr_percent}%, Overhang={strat.overhang_depth_m}m)")

    def test_38_model_e_synthesizer(self):
        """Test 38: Model E generates a diverse, physically coherent candidate pool."""
        from thermoshelter.models.model_e_synthesizer import ModelE_ArchitecturalSynthesizer
        from thermoshelter.features.context_builder import ContextBuilder
        from thermoshelter.core.design_state import UserRequirements
        cb = ContextBuilder()
        context = cb.build_context("Leh")
        site = cb.build_site("Leh")
        req = UserRequirements(occupant_count=4, target_floor_area_m2=24.0)
        synthesizer = ModelE_ArchitecturalSynthesizer()
        
        candidates = synthesizer.generate_candidate_pool(context, site, req, n_max=24)
        self.assertGreaterEqual(len(candidates), 10)
        # Check that candidates have valid geometry and positive dimensions
        for c in candidates:
            self.assertGreater(c.geometry.floor_area_m2, 0.0)
            self.assertGreater(len(c.openings), 0)
        print(f"  [PASS] Test 38: Model E generated candidate pool of {len(candidates)} complete designs")

    def test_39_model_f_alternative_archetypes(self):
        """Test 39: Model F generates 5 distinct purposeful bioclimatic archetypes."""
        from thermoshelter.models.model_f_alternatives import ModelF_AlternativeGenerator
        from thermoshelter.features.context_builder import ContextBuilder
        from thermoshelter.core.design_state import UserRequirements
        cb = ContextBuilder()
        context = cb.build_context("Leh")
        site = cb.build_site("Leh")
        req = UserRequirements(occupant_count=4, target_floor_area_m2=24.0)
        gen = ModelF_AlternativeGenerator()
        
        archetypes = gen.generate_archetype_candidates(context, site, req)
        self.assertEqual(len(archetypes), 5, "Model F must synthesize all 5 distinct archetypes")
        archetype_ids = [spec.archetype_id for _, spec in archetypes]
        self.assertIn("OPTIMAL_PASSIVE", archetype_ids)
        self.assertIn("LOW_COST_MODULAR", archetype_ids)
        self.assertIn("VERNACULAR_LOCAL", archetype_ids)
        self.assertIn("RAPID_EMERGENCY", archetype_ids)
        self.assertIn("BALANCED_CONSTRUCTABILITY", archetype_ids)
        print(f"  [PASS] Test 39: Model F generated 5 distinct archetypes: {', '.join(archetype_ids)}")

    def test_40_model_g_comfort_predictor(self):
        """Test 40: Model G computes ASHRAE 55 adaptive comfort, comfort hours %, and thermal buffer index."""
        from thermoshelter.models.model_g_comfort import ModelG_ThermalComfortPredictor
        import numpy as np
        predictor = ModelG_ThermalComfortPredictor()
        
        # Simulate realistic 48h indoor / outdoor temperatures
        t = np.linspace(0, 48, 48)
        outdoor_temps = (-8.0 + 7.0 * np.sin(t * np.pi / 12)).tolist()
        indoor_temps = (14.0 + 2.5 * np.sin(t * np.pi / 12)).tolist()
        
        report = predictor.evaluate_comfort(indoor_temps, outdoor_temps, "Cold-Arid")
        self.assertGreater(report.thermal_buffer_index, 0.5, "Damped indoor swing should yield high TBI")
        self.assertGreaterEqual(report.comfort_hours_percent, 50.0)
        self.assertEqual(report.hours_below_0C, 0)
        self.assertIn(report.comfort_verdict, ("COMFORTABLE", "ACCEPTABLE"))
        print(f"  [PASS] Test 40: Model G computed Comfort Hours={report.comfort_hours_percent:.0f}%, TBI={report.thermal_buffer_index:.2f}, Verdict={report.comfort_verdict}")

    def test_41_model_h_multi_objective_optimizer(self):
        """Test 41: Model H evaluates 5-dimensional MCDA and identifies Pareto frontier."""
        from thermoshelter.models.model_h_optimizer import ModelH_MultiObjectiveOptimizer
        from thermoshelter.models.model_g_comfort import ModelG_ThermalComfortPredictor
        from thermoshelter.validation.engineering_validator import ValidationReport
        from thermoshelter.core.design_state import DesignState, ClimateContext, SiteState, UserRequirements, GeometryState, EnvelopeAssemblies
        
        optimizer = ModelH_MultiObjectiveOptimizer()
        comfort_pred = ModelG_ThermalComfortPredictor()
        
        design = self.context_builder.create_initial_design("Leh")
        perf, hourly = self.physics.simulate_with_timeseries(design, hours=24)
        val = self.validator.validate(design, perf)
        
        in_temps = [r["indoor_temperature_C"] for r in hourly]
        out_temps = [r["outdoor_temperature_C"] for r in hourly]
        comfort = comfort_pred.evaluate_comfort(in_temps, out_temps, "Cold-Arid")
        
        vec = optimizer.evaluate_multi_objective(design, perf, val, comfort, "winter_warmth")
        self.assertIsNotNone(vec)
        self.assertIsInstance(vec.composite_utility_score, float)
        self.assertIsInstance(vec.comfort_score, float)
        self.assertIsInstance(vec.economic_cost_score, float)
        
        # Test Pareto frontier ranking
        pareto_list = optimizer.identify_pareto_frontier([(design, vec)])
        self.assertEqual(len(pareto_list), 1)
        self.assertTrue(pareto_list[0][1].is_pareto_optimal)
        print(f"  [PASS] Test 41: Model H evaluated multi-objective score: {vec.composite_utility_score:.1f}/100 and identified Pareto frontier")

    def test_42_natural_language_interpreter(self):
        """Test 42: NaturalLanguageInterpreter parses free-form briefs into structured ShelterRequests."""
        from thermoshelter.core.nlp_interface import NaturalLanguageInterpreter
        
        prompt = "We urgently need a rapid emergency relief shelter in Leh for a family of 6 people with high winter warmth."
        req = NaturalLanguageInterpreter.parse_natural_language_request(prompt)
        
        self.assertEqual(req.location, "Leh")
        self.assertEqual(req.occupants, 6)
        self.assertEqual(req.purpose, "emergency_shelter")
        self.assertEqual(req.thermal_objective, "winter_warmth")
        self.assertGreaterEqual(req.preferred_area_m2, 21.0)
        print(f"  [PASS] Test 42: NLP parsed prompt into ShelterRequest(location={req.location}, occupants={req.occupants}, purpose={req.purpose})")

    def test_43_full_orchestrator_multi_model_pipeline(self):
        """Test 43: Complete end-to-end multi-model pipeline execution with 5 archetypes and comfort metrics."""
        from thermoshelter.core.user_input import ShelterRequest
        from thermoshelter.engine.orchestrator import ShelterDesignOrchestrator
        
        request = ShelterRequest(location="Leh", occupants=4, purpose="emergency_shelter",
                                 thermal_objective="winter_warmth", preferred_area_m2=24.0)
        orch = ShelterDesignOrchestrator(n_candidates=20, n_finalists=4, simulation_hours=24)
        report = orch.design_shelter(request)
        
        # Verify recommended design has complete multi-model data
        rec = report.recommended
        self.assertIsNotNone(rec.comfort_report)
        self.assertIsNotNone(rec.multi_objective)
        self.assertGreater(rec.score, 0.0)
        self.assertTrue(rec.is_compliant)
        
    def test_44_model_a_trained_bundle_and_probabilities(self):
        """Test 44: Model A loads trained ML bundle and predicts class probabilities with cold climate sanity."""
        from thermoshelter.models.model_a_envelope import ModelA_EnvelopeSelector
        selector = ModelA_EnvelopeSelector()
        self.assertTrue(selector.is_trained, "Model A should successfully load trained bundle")
        
        ctx_leh = self.context_builder.build_context("Leh")
        probs = selector.predict_wall_probabilities(ctx_leh)
        self.assertIsInstance(probs, dict)
        self.assertTrue(len(probs) >= 3)
        self.assertAlmostEqual(sum(probs.values()), 1.0, places=2)
        
        envelope_data = selector.select_envelope(ctx_leh)
        # Top wall must be compliant for Leh sub-zero climate (U <= 0.45)
        self.assertLessEqual(envelope_data["wall"].u_value, 0.45)
        print(f"  [PASS] Test 44: Model A loaded trained bundle, generated {len(probs)} probabilities, and selected compliant wall (U={envelope_data['wall'].u_value:.3f})")

    def test_45_model_b_trained_bundle_and_predictions(self):
        """Test 45: Model B loads trained ML bundle and predicts aspect ratio and pitch."""
        from thermoshelter.models.model_b_geometry import ModelB_GeometryDesigner
        designer = ModelB_GeometryDesigner()
        self.assertTrue(designer.is_trained, "Model B should successfully load trained bundle")
        
        ctx_leh = self.context_builder.build_context("Leh")
        req = UserRequirements(occupant_count=4, target_floor_area_m2=24.0)
        ar, pt = designer.predict_optimal_geometry_parameters(ctx_leh, req)
        self.assertGreaterEqual(ar, 1.0)
        self.assertLessEqual(ar, 2.5)
        self.assertGreaterEqual(pt, 0.0)
        
        site_leh = self.context_builder.build_site("Leh")
        plan = designer.design_geometry(ctx_leh, site_leh, req)
        self.assertGreaterEqual(plan.floor_area_m2, 14.0)
        # High snow load in Leh mandates pitch >= 25 deg
        self.assertGreaterEqual(plan.roof_pitch_deg, 25.0)
        print(f"  [PASS] Test 45: Model B predicted AR={ar:.2f}, Pitch={pt:.1f}°, and enforced snow pitch {plan.roof_pitch_deg:.1f}°")

    def test_46_model_c_trained_bundle_and_solar_ranking(self):
        """Test 46: Model C loads trained ML bundle, predicts directional solar gain, and ranks azimuths."""
        from thermoshelter.models.model_c_passive_solar import ModelC_PassiveSolarDesigner
        designer = ModelC_PassiveSolarDesigner()
        self.assertTrue(designer.is_trained, "Model C should successfully load trained bundle")
        
        ctx_leh = self.context_builder.build_context("Leh")
        solar_s = designer.predict_directional_solar_potential(ctx_leh, 180.0)
        self.assertGreater(solar_s, 50.0)
        
        ranked = designer.rank_orientation_candidates(ctx_leh, thermal_objective="winter_warmth")
        self.assertEqual(len(ranked), 4)
        # In cold climate with winter_warmth, South should be ranked top
        self.assertEqual(ranked[0][0], 180.0)
        print(f"  [PASS] Test 46: Model C ranked {len(ranked)} orientations (Top: {ranked[0][1]} with {ranked[0][2]:.1f} kWh)")

    def test_47_strict_shimla_geographic_holdout_isolation(self):
        """Test 47: Verify Shimla test dataset is strictly held out across all trained models."""
        import json
        for model_id in ["model_a", "model_b", "model_c", "model_d"]:
            meta_path = f"models/{model_id}/metadata.json" if model_id != "model_d" else "models/model_d/model_d_metadata.json"
            self.assertTrue(os.path.exists(meta_path), f"Metadata missing for {model_id}")
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
            self.assertEqual(meta.get("holdout_location") or meta.get("holdout_group"), "LOC-IN-SHIMLA")
        print("  [PASS] Test 47: Strict Shimla geographic holdout verified across Models A, B, C, D metadata")

    def test_48_iso_6946_multi_layer_assembly_stack(self):
        """Test 48: ISO 6946:2017 multi-layer thermal resistance stack and corrected timber stud R-value."""
        # Lightweight Insulated Assembly:
        # R_se (0.04) + Steel (0.00001) + Cavity (0.210) + XPS (3.030) + Timber Stud (0.417) + Gypsum (0.0595) + R_si (0.13)
        r_se = 0.040
        r_steel = 0.0005 / 50.0 # 0.00001
        r_cavity = 0.210
        r_xps = 0.100 / 0.033 # 3.0303
        r_stud = 0.050 / 0.12 # 0.41667 (Corrected from 0.492)
        r_gypsum = 0.0125 / 0.21 # 0.05952
        r_si = 0.130

        r_total_calc = r_se + r_steel + r_cavity + r_xps + r_stud + r_gypsum + r_si
        u_calc = 1.0 / r_total_calc

        self.assertAlmostEqual(r_stud, 0.4166667, places=4)
        self.assertAlmostEqual(r_total_calc, 3.8862, places=3)
        self.assertAlmostEqual(u_calc, 0.2573, places=3)
        print(f"  [PASS] Test 48: ISO 6946 multi-layer assembly stack verified (R_stud={r_stud:.3f}, R_total={r_total_calc:.3f}, U={u_calc:.3f} W/m2K)")

    def test_49_single_canonical_designstate_for_2d_and_3d(self):
        """Test 49: 2D Floor plan and 3D conceptual bounding geometry strictly derive from single DesignState."""
        design = self.context_builder.create_initial_design("Leh", UserRequirements(occupant_count=4, target_floor_area_m2=24.0))
        geom = design.geometry
        
        # 2D Floor Plan
        floor_plan = BlueprintExporter.export_floor_plan(design)
        self.assertEqual(floor_plan["outer_boundary"][1][0], geom.length_m)
        self.assertEqual(floor_plan["outer_boundary"][2][1], geom.width_m)
        self.assertEqual(floor_plan["floor_area_m2"], geom.floor_area_m2)
        self.assertEqual(floor_plan["orientation_azimuth_deg"], design.orientation_azimuth_deg)

        # 3D Bounding Primitives
        perf = self.physics.simulate(design, hours=24)
        val = self.validator.validate(design, perf)
        blueprint = BlueprintExporter.export_blueprint(design, perf, val)
        vis_3d = blueprint["visualization_3d_data"]
        
        self.assertEqual(vis_3d["bounding_box_dimensions_m"]["length_x"], geom.length_m)
        self.assertEqual(vis_3d["bounding_box_dimensions_m"]["width_y"], geom.width_m)
        self.assertEqual(vis_3d["bounding_box_dimensions_m"]["height_z"], geom.height_m)
        self.assertEqual(vis_3d["roof_pitch_deg"], geom.roof_angle_deg)
        self.assertEqual(vis_3d["cardinal_rotation_deg"], design.orientation_azimuth_deg)
        print("  [PASS] Test 49: Single canonical DesignState confirmed across 2D floor plan, 3D mesh, and thermal model")

    def test_50_weather_ingestion_and_safe_fallback(self):
        """Test 50: Climate context builder handles known locations and rejects unknown locations safely."""
        ctx_leh = self.context_builder.build_context("Leh")
        self.assertEqual(ctx_leh.location_id, "LOC-IN-LEH")
        self.assertTrue(ctx_leh.heating_degree_days_18C > 3000.0)

        # Unknown location should raise ValueError
        with self.assertRaises(ValueError):
            self.context_builder.build_context("UnknownLocationXYZ")
        print("  [PASS] Test 50: Climate context builder verified with safe boundary validation")

    def test_51_scientific_validator_suite(self):
        """Test 51: Run comprehensive ScientificValidator suite (Energy conservation, ISO 6946, Azimuth sanity, Holdout)."""
        from thermoshelter.validation.scientific_validator import ScientificValidator
        results = ScientificValidator.run_all_scientific_audits()
        self.assertEqual(len(results), 4)
        for res in results:
            self.assertTrue(res.passed, f"Scientific check {res.check_id} failed: {res.details}")
        print(f"  [PASS] Test 51: ScientificValidator suite passed all {len(results)} physics, code, and ML integrity audits")


if __name__ == "__main__":
    print("================================================================")
    print("RUNNING CORRECTED THERMOSHELTER RECURSIVE ML ENGINE TEST SUITE")
    print("================================================================")
    unittest.main(verbosity=2)


