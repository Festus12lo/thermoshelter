import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from thermoshelter.llm.explanation_engine import LLMExplanationEngine
from thermoshelter.core.design_state import (
    DesignState, ClimateContext, SiteState, UserRequirements, GeometryState, EnvelopeAssemblies
)
from thermoshelter.core.performance_vector import PerformanceVector
from thermoshelter.validation.engineering_validator import ValidationReport
from thermoshelter.models.model_g_comfort import ComfortReport
from thermoshelter.models.model_h_optimizer import MultiObjectiveVector

class TestLLMExplanationEngine(unittest.TestCase):
    
    def test_deterministic_traceability(self):
        engine = LLMExplanationEngine()
        
        design = DesignState(
            design_id="TEST",
            design_name="TEST",
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
        
        from unittest.mock import Mock
        
        perf = Mock()
        perf.total_solar_gain_kWh.value = 250.0
        perf.temperature_lift_C.value = 8.5
        perf.wall_u_value_W_m2K.value = 0.4
        perf.roof_u_value_W_m2K.value = 0.3
        
        val = ValidationReport(is_fully_compliant=True, mandatory_failures=[], warnings=["Test Warning"], evaluations=[])
        comf = Mock()
        comf.thermal_buffer_index = 0.8
        comf.comfort_hours_percent = 75.0
        comf.hours_below_0C = 10
        mcda = MultiObjectiveVector(comfort_score=75.0, solar_efficiency_score=80.0, economic_cost_score=90.0, embodied_carbon_score=95.0, safety_compliance_score=100.0, composite_utility_score=85.0, is_pareto_optimal=True)
        
        est_cost = {
            "total_cost": 25000.0,
            "currency": "INR",
            "is_observed_price": True
        }
        
        report = engine.generate_explanation(design, perf, val, comf, mcda, est_cost)
        
        self.assertIn("MAT-RAMMED", report.material_rationale)
        self.assertIn("ultra-low embodied carbon", report.material_rationale)
        self.assertIn("180.0°", report.orientation_rationale)
        self.assertIn("25000.00 INR", report.cost_rationale)
        self.assertIn("OBSERVED MARKET PRICES", report.cost_rationale)
        self.assertIn("Test Warning", report.safety_warnings)
        
if __name__ == '__main__':
    unittest.main()
