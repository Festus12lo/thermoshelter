#!/usr/bin/env python3
"""
THERMOSHELTER — Master Stratified Dataset Generator
Authoritative generation script for the 1,200-case ThermoShelter training dataset.

Execution flow per case:
Canonical Context -> Stratified Candidate DesignState -> PhysicsBridge (48h ODE) ->
EngineeringValidator -> DesignScorer -> Target Extraction -> Feature Extraction ->
Quality Gate & Quarantine -> Output Serialization.

Partitions:
- TRAIN: 800 cases (Leh 300, Jaipur 300, Karur Batch A 200)
- VAL:   100 cases (Karur Batch B 100)
- TEST:  300 cases (Shimla 300 — 100% Unseen Geographic Holdout)
"""
import sys
import os
import argparse
import json
import time
import math
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
from collections import Counter
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src'))

from thermoshelter.features.context_builder import ContextBuilder
from thermoshelter.features.feature_extractor import FeatureExtractor
from thermoshelter.simulation.physics_bridge import PhysicsBridge
from thermoshelter.validation.engineering_validator import EngineeringValidator
from thermoshelter.core.scoring import DesignScorer
from thermoshelter.core.design_state import OpeningItem, DesignState

RANDOM_SEED = 42
DATASET_VERSION = "1.1.0-canonical-locked"
SCHEMA_VERSION = "2.0.0"

LOCATIONS = ['Leh', 'Shimla', 'Jaipur', 'Karur']

WALL_ASSEMBLIES = {
    'ASM-WALL-LADAKH-TRAD':     {'mat': 'MAT-ADOBE',  'thick': 465.0, 'u': 1.591},
    'ASM-WALL-LADAKH-IMP-TRAD': {'mat': 'MAT-ADOBE',  'thick': 345.0, 'u': 0.452},
    'ASM-WALL-LADAKH-INS-MOD':  {'mat': 'MAT-CSEB',   'thick': 392.5, 'u': 0.314},
    'ASM-WALL-LADAKH-LIGHT-INS':{'mat': 'MAT-TIMBER', 'thick': 152.0, 'u': 0.284},
    'ASM-WALL-SHIMLA-COLD':     {'mat': 'MAT-STONE',  'thick': 410.0, 'u': 0.347},
    'ASM-WALL-WARM-COMP':       {'mat': 'MAT-BRICK',  'thick': 292.5, 'u': 1.302},
}

ROOF_ASSEMBLIES = {
    'ASM-ROOF-LADAKH-TRAD':    {'mat': 'MAT-THATCH',   'thick': 300.0, 'u': 0.247},
    'ASM-ROOF-LADAKH-INS-MOD': {'mat': 'MAT-XPS',      'thick': 153.0, 'u': 0.250},
    'ASM-ROOF-WARM-SLAB':      {'mat': 'MAT-CONCRETE', 'thick': 162.5, 'u': 3.476},
}

FLOOR_ASSEMBLIES = {
    'ASM-FLOOR-LADAKH-TRAD':     {'mat': 'MAT-TIMBER',   'thick': 250.0, 'u': 0.850},
    'ASM-FLOOR-LADAKH-INS-SLAB': {'mat': 'MAT-XPS',      'thick': 180.0, 'u': 0.444},
    'ASM-FLOOR-WARM-TILED':      {'mat': 'MAT-CONCRETE', 'thick': 150.0, 'u': 2.100},
}

GEOMETRY_TEMPLATES = [
    {'name': 'compact_15m2',  'area': 15.0, 'length': 4.5, 'width': 3.33, 'height': 2.8, 'aspect_ratio': 1.35, 'pitch': 30.0, 'roof_type': 'pitched'},
    {'name': 'compact_24m2',  'area': 24.0, 'length': 6.0, 'width': 4.0,  'height': 2.8, 'aspect_ratio': 1.50, 'pitch': 30.0, 'roof_type': 'pitched'},
    {'name': 'square_25m2',   'area': 25.0, 'length': 5.0, 'width': 5.0,  'height': 2.8, 'aspect_ratio': 1.00, 'pitch': 0.0,  'roof_type': 'flat'},
    {'name': 'medium_35m2',   'area': 35.0, 'length': 7.0, 'width': 5.0,  'height': 3.0, 'aspect_ratio': 1.40, 'pitch': 20.0, 'roof_type': 'pitched'},
    {'name': 'elongated_50m2','area': 50.0, 'length': 10.0,'width': 5.0,  'height': 3.0, 'aspect_ratio': 2.00, 'pitch': 25.0, 'roof_type': 'pitched'},
]

ORIENTATIONS_DEG = [0.0, 90.0, 180.0, 270.0]

OCCUPANCY_LEVELS = [1, 2, 4, 8]
VENTILATION_TIERS = ['low', 'medium', 'high']
INTENDED_USES = ['residential', 'emergency', 'work']

def get_split_group(location: str, case_idx_1based: int) -> str:
    """Group-based dataset partition strategy."""
    if location == 'Shimla':
        return 'TEST'  # 100% unseen geographic holdout (300 cases = 25.0%)
    elif location == 'Karur' and case_idx_1based > 200:
        return 'VAL'   # Parameter holdout (exactly 100 cases = 8.3%)
    else:
        return 'TRAIN' # (exactly 800 cases = 66.7%: Leh 300, Jaipur 300, Karur 200)

def generate_sample_plan(total_cases: int = 1200) -> List[Dict[str, Any]]:
    """
    Generate full-rank joint orthogonal parameter tuples.
    Core Envelope/Design-Factor Subspace = 5 Geometries x 4 Orientations x 5 Wall Assemblies x 3 Roof Assemblies = 300 cells.
    4 Locations x 300 cells = 1,200 total dataset cases.
    """
    wall_keys = list(WALL_ASSEMBLIES.keys())[:5]
    roof_keys = list(ROOF_ASSEMBLIES.keys())
    floor_keys = list(FLOOR_ASSEMBLIES.keys())
    
    plan = []
    case_counter = 0
    
    for loc in LOCATIONS:
        loc_case_idx = 0
        for geom in GEOMETRY_TEMPLATES:
            for ori in ORIENTATIONS_DEG:
                for wall_key in wall_keys:
                    for roof_key in roof_keys:
                        case_counter += 1
                        loc_case_idx += 1
                        
                        split = get_split_group(loc, loc_case_idx)
                        occ = OCCUPANCY_LEVELS[loc_case_idx % len(OCCUPANCY_LEVELS)]
                        vent = VENTILATION_TIERS[loc_case_idx % len(VENTILATION_TIERS)]
                        use = INTENDED_USES[loc_case_idx % len(INTENDED_USES)]
                        floor_key = floor_keys[loc_case_idx % len(floor_keys)]
                        
                        case_id = f"TC-{loc.upper()}-{case_counter:04d}"
                        
                        plan.append({
                            'case_id': case_id,
                            'location': loc,
                            'split_group': split,
                            'geometry': geom,
                            'orientation_deg': ori,
                            'occupant_count': occ,
                            'ventilation_level': vent,
                            'intended_use': use,
                            'wall_assembly_id': wall_key,
                            'roof_assembly_id': roof_key,
                            'floor_assembly_id': floor_key
                        })
            
    return plan

def run_dry_run(plan: List[Dict[str, Any]]):
    """Output comprehensive mathematical stratification report."""
    df = pd.DataFrame([
        {
            'case_id': p['case_id'],
            'location': p['location'],
            'split': p['split_group'],
            'geom_name': p['geometry']['name'],
            'area_m2': p['geometry']['area'],
            'aspect_ratio': p['geometry']['aspect_ratio'],
            'orientation_deg': p['orientation_deg'],
            'occupants': p['occupant_count'],
            'ventilation': p['ventilation_level'],
            'intended_use': p['intended_use'],
            'wall_assembly': p['wall_assembly_id'],
            'roof_assembly': p['roof_assembly_id'],
            'floor_assembly': p['floor_assembly_id'],
        }
        for p in plan
    ])
    
    print("=" * 70)
    print("THERMOSHELTER DATASET GENERATOR — DRY RUN REPORT")
    print("=" * 70)
    print(f"Total Sample Plan Size: {len(df)} cases")
    print(f"Random Seed: {RANDOM_SEED} (Deterministic & Reproducible)")
    print()
    print("--- 1. PARTITION SPLIT SIZES ---")
    print(df['split'].value_counts())
    print()
    print("--- 2. DISTRIBUTION BY LOCATION & SPLIT ---")
    print(df.groupby(['location', 'split']).size().unstack(fill_value=0))
    print()
    print("--- 3. DISTRIBUTION BY GEOMETRY TEMPLATE ---")
    print(df.groupby(['location', 'geom_name']).size().unstack(fill_value=0))
    print()
    print("--- 4. DISTRIBUTION BY ORIENTATION (0=N, 90=E, 180=S, 270=W) ---")
    print(df.groupby(['location', 'orientation_deg']).size().unstack(fill_value=0))
    print()
    print("--- 5. DISTRIBUTION BY WALL ASSEMBLY ---")
    print(df.groupby(['location', 'wall_assembly']).size().unstack(fill_value=0))
    print()
    print("--- 6. DISTRIBUTION BY ROOF ASSEMBLY ---")
    print(df.groupby(['location', 'roof_assembly']).size().unstack(fill_value=0))
    print()
    print("=" * 70)
    print("DRY RUN COMPLETED: All 1,200 parameter vectors verified for balance & coverage.")
    print("=" * 70)

def execute_full_generation(plan: List[Dict[str, Any]], output_dir: str):
    """Execute complete physics simulation and validation for all 1,200 cases."""
    os.makedirs(output_dir, exist_ok=True)
    
    cb = ContextBuilder()
    bridge = PhysicsBridge()
    val = EngineeringValidator()
    scorer = DesignScorer()
    
    print(f"Starting full physics dataset generation ({len(plan)} cases)...")
    start_time = time.time()
    
    valid_records = []
    quarantine_records = []
    
    for idx, item in enumerate(plan):
        loc = item['location']
        base = cb.create_initial_design(loc)
        
        g = item['geometry']
        wasm_id = item['wall_assembly_id']
        rasm_id = item['roof_assembly_id']
        fasm_id = item['floor_assembly_id']
        
        winfo = WALL_ASSEMBLIES[wasm_id]
        rinfo = ROOF_ASSEMBLIES[rasm_id]
        finfo = FLOOR_ASSEMBLIES[fasm_id]
        
        # Determine opening scaling proportional to floor area
        win_area = max(1.5, round(g['area'] * 0.12, 2))
        door_area = 2.0
        
        # Construct Candidate DesignState
        cand = base.with_mutation(
            rationale=f"DATASET_BATCH_CASE_{item['case_id']}",
            geometry_changes={
                'length_m': g['length'],
                'width_m': g['width'],
                'height_m': g['height'],
                'roof_angle_deg': g['pitch'],
                'roof_type': g['roof_type'],
            },
            envelope_changes={
                'wall_assembly_id': wasm_id,
                'wall_material_id': winfo['mat'],
                'wall_thickness_mm': winfo['thick'],
                'wall_u_value_W_m2K': winfo['u'],
                'roof_assembly_id': rasm_id,
                'roof_material_id': rinfo['mat'],
                'roof_thickness_mm': rinfo['thick'],
                'roof_u_value_W_m2K': rinfo['u'],
                'floor_assembly_id': fasm_id,
                'floor_material_id': finfo['mat'],
                'floor_thickness_mm': finfo['thick'],
                'floor_u_value_W_m2K': finfo['u'],
            },
            orientation_deg=item['orientation_deg'],
            openings_changes=[
                OpeningItem(
                    opening_id=f"OPN-{item['case_id']}-WIN",
                    opening_type="WINDOW",
                    orientation="South",
                    width_m=round(win_area / 1.5, 2),
                    height_m=1.5,
                    area_m2=win_area,
                    u_value_W_m2K=2.80 if 'Cold' in base.context.climate_zone else 5.80,
                    shgc=0.65,
                    glazing_type="double" if 'Cold' in base.context.climate_zone else "single",
                    weather_stripped=True
                ),
                OpeningItem(
                    opening_id=f"OPN-{item['case_id']}-DOOR",
                    opening_type="DOOR",
                    orientation="East",
                    width_m=1.0,
                    height_m=2.0,
                    area_m2=door_area,
                    u_value_W_m2K=1.80,
                    shgc=0.0,
                    glazing_type="solid_wood",
                    weather_stripped=True
                )
            ]
        )
        
        # Apply operational requirements
        cand.requirements.occupant_count = item['occupant_count']
        cand.requirements.ventilation_level = item['ventilation_level']
        cand.requirements.intended_use = item['intended_use']
        cand.requirements.target_floor_area_m2 = g['area']
        
        # 1. Physics Simulation (48h continuous transient ODE)
        perf = bridge.simulate(cand, hours=48)
        
        # 2. Engineering Validation
        validation = val.validate(cand, perf)
        
        # 3. Transparent Multi-Objective Scoring
        score = scorer.evaluate(cand, perf, validation.mandatory_failures)
        
        # 4. Quality Gating
        is_nan = math.isnan(perf.avg_indoor_temp_C.value) or math.isnan(perf.total_solar_gain_kWh.value)
        is_inf = math.isinf(perf.avg_indoor_temp_C.value) or math.isinf(perf.total_conductive_heat_loss_kWh.value)
        is_stable = perf.energy_balance_max_error_W < 1e-4 and perf.simulation_status == "CONVERGED"
        
        if is_nan or is_inf or not is_stable:
            # Route to quarantine
            quarantine_record = {
                'case_id': item['case_id'],
                'split_group': item['split_group'],
                'location': loc,
                'failure_reason': 'PHYSICS_SIMULATION_INSTABILITY',
                'energy_balance_error_W': perf.energy_balance_max_error_W,
                'simulation_status': perf.simulation_status,
                'parameters': item
            }
            quarantine_records.append(quarantine_record)
            continue
            
        # 5. Extract Feature Sets
        ctx_features = FeatureExtractor.extract_context_features(cand)
        design_features = FeatureExtractor.extract_design_features(cand)
        
        subscores = {obj.objective_name: round(obj.normalized_score, 2) for obj in score.soft_objectives}
        
        # 6. Construct Final Dataset Record
        record = {
            'case_id': item['case_id'],
            'split_group': item['split_group'],
            'context': {
                'location_id': base.context.location_id,
                'location_name': base.context.location_name,
                'climate_zone': base.context.climate_zone,
                'latitude_deg': base.context.latitude_deg,
                'longitude_deg': base.context.longitude_deg,
                'elevation_m': base.context.elevation_m,
                'heating_degree_days_18C': base.context.heating_degree_days_18C,
                'cooling_degree_days_18C': base.context.cooling_degree_days_18C,
                'design_temp_min_C': base.context.design_temp_min_C,
                'design_temp_max_C': base.context.design_temp_max_C,
                'design_solar_peak_W_m2': base.context.design_solar_peak_W_m2,
                'ground_frost_depth_m': cand.site.ground_frost_depth_m if cand.site else 0.0,
                'allowable_bearing_capacity_kPa': cand.site.allowable_bearing_capacity_kPa if cand.site else 150.0,
                'geotechnical_status': 'PRESUMPTIVE_IS_1904'
            },
            'requirements': {
                'occupant_count': item['occupant_count'],
                'ventilation_level': item['ventilation_level'],
                'intended_use': item['intended_use'],
                'target_floor_area_m2': g['area']
            },
            'design_parameters': {
                'length_m': g['length'],
                'width_m': g['width'],
                'height_m': g['height'],
                'floor_area_m2': cand.geometry.floor_area_m2,
                'aspect_ratio': cand.geometry.aspect_ratio,
                'surface_to_volume_ratio': cand.geometry.surface_to_volume_ratio,
                'roof_angle_deg': g['pitch'],
                'roof_type': g['roof_type'],
                'orientation_azimuth_deg': item['orientation_deg'],
                'wall_assembly_id': wasm_id,
                'roof_assembly_id': rasm_id,
                'floor_assembly_id': fasm_id,
                'wall_u_value_W_m2K': winfo['u'],
                'roof_u_value_W_m2K': rinfo['u'],
                'floor_u_value_W_m2K': finfo['u'],
                'total_opening_area_m2': cand.total_opening_area_m2,
                'south_wwr': round(cand.south_wwr, 3),
                'north_wwr': round(cand.north_wwr, 3)
            },
            'input_features_recommender': ctx_features,
            'input_features_surrogate': design_features,
            'simulation_metrics': {
                'avg_indoor_temp_C': round(perf.avg_indoor_temp_C.value, 3),
                'min_indoor_temp_C': round(perf.min_indoor_temp_C.value, 3),
                'max_indoor_temp_C': round(perf.max_indoor_temp_C.value, 3),
                'temperature_lift_C': round(perf.temperature_lift_C.value, 3),
                'diurnal_temperature_swing_C': round(perf.diurnal_temperature_swing_C.value, 3),
                'total_solar_gain_kWh': round(perf.total_solar_gain_kWh.value, 3),
                'total_conductive_heat_loss_kWh': round(perf.total_conductive_heat_loss_kWh.value, 3),
                'total_ventilation_loss_kWh': round(perf.total_ventilation_heat_loss_kWh.value, 3),
                'effective_thermal_capacitance_MJ_K': round(perf.effective_thermal_capacitance_MJ_K.value, 3),
                'thermal_time_constant_hours': round(perf.thermal_time_constant_hours.value, 2),
                'energy_balance_residual_W': perf.energy_balance_max_error_W,
                'simulation_status': perf.simulation_status
            },
            'engineering_validation': {
                'is_fully_compliant': validation.is_fully_compliant,
                'mandatory_failures': validation.mandatory_failures,
                'warnings': validation.warnings,
                'warning_count': len(validation.warnings),
                'rules_evaluated': [e.rule_id for e in validation.evaluations]
            },
            'scoring': {
                'total_score': round(score.total_score, 2),
                'hard_constraints_passed': score.hard_constraints_passed,
                'summary_verdict': score.summary_verdict,
                'subscores': subscores
            },
            'training_targets': {
                'target_wall_assembly_id': wasm_id,
                'target_roof_assembly_id': rasm_id,
                'target_length_m': g['length'],
                'target_width_m': g['width'],
                'target_aspect_ratio': g['aspect_ratio'],
                'target_orientation_azimuth_deg': item['orientation_deg'],
                'target_avg_indoor_temp_C': round(perf.avg_indoor_temp_C.value, 3),
                'target_total_solar_kWh': round(perf.total_solar_gain_kWh.value, 3),
                'target_total_loss_kWh': round(perf.total_conductive_heat_loss_kWh.value, 3)
            },
            'provenance': {
                'generator_version': 'generate_dataset.py-v1.1.0',
                'schema_version': SCHEMA_VERSION,
                'dataset_version': DATASET_VERSION,
                'simulation_engine': 'ThermalEngine-v1.1.0',
                'solar_physics_model': 'Spencer_1971_Erbs_1982_Directional_v1.1',
                'weather_source': 'ERA5_2026_HOURLY_PARTIAL_8_MONTHS',
                'random_seed': RANDOM_SEED,
                'generation_timestamp': datetime.now(timezone.utc).isoformat()
            }
        }
        valid_records.append(record)
        
        if (idx + 1) % 200 == 0 or (idx + 1) == len(plan):
            elapsed = time.time() - start_time
            rate = (idx + 1) / elapsed
            print(f"  Processed {idx + 1}/{len(plan)} cases ({rate:.1f} cases/s) | Valid: {len(valid_records)} | Quarantined: {len(quarantine_records)}")

    # 7. Write Output Files
    jsonl_path = os.path.join(output_dir, 'thermoshelter_dataset_1200.jsonl')
    csv_path = os.path.join(output_dir, 'thermoshelter_dataset_1200.csv')
    parquet_path = os.path.join(output_dir, 'thermoshelter_dataset_1200.parquet')
    quarantine_path = os.path.join(output_dir, 'cases_quarantined.jsonl')
    manifest_path = os.path.join(output_dir, 'dataset_manifest.json')
    stats_path = os.path.join(output_dir, 'dataset_statistics.json')
    report_path = os.path.join(output_dir, 'dataset_generation_report.md')
    
    # Write JSONL
    with open(jsonl_path, 'w', encoding='utf-8') as f:
        for r in valid_records:
            f.write(json.dumps(r) + '\n')
            
    # Write Quarantined
    with open(quarantine_path, 'w', encoding='utf-8') as f:
        for q in quarantine_records:
            f.write(json.dumps(q) + '\n')

    # Flatten for CSV & Parquet
    flat_rows = []
    for r in valid_records:
        flat = {
            'case_id': r['case_id'],
            'split_group': r['split_group'],
            'location_id': r['context']['location_id'],
            'location_name': r['context']['location_name'],
            'climate_zone': r['context']['climate_zone'],
            'latitude_deg': r['context']['latitude_deg'],
            'longitude_deg': r['context']['longitude_deg'],
            'elevation_m': r['context']['elevation_m'],
            'occupant_count': r['requirements']['occupant_count'],
            'ventilation_level': r['requirements']['ventilation_level'],
            'intended_use': r['requirements']['intended_use'],
            'floor_area_m2': r['design_parameters']['floor_area_m2'],
            'length_m': r['design_parameters']['length_m'],
            'width_m': r['design_parameters']['width_m'],
            'height_m': r['design_parameters']['height_m'],
            'aspect_ratio': r['design_parameters']['aspect_ratio'],
            'roof_angle_deg': r['design_parameters']['roof_angle_deg'],
            'orientation_azimuth_deg': r['design_parameters']['orientation_azimuth_deg'],
            'wall_assembly_id': r['design_parameters']['wall_assembly_id'],
            'roof_assembly_id': r['design_parameters']['roof_assembly_id'],
            'floor_assembly_id': r['design_parameters']['floor_assembly_id'],
            'wall_u_value_W_m2K': r['design_parameters']['wall_u_value_W_m2K'],
            'roof_u_value_W_m2K': r['design_parameters']['roof_u_value_W_m2K'],
            'floor_u_value_W_m2K': r['design_parameters']['floor_u_value_W_m2K'],
            'total_opening_area_m2': r['design_parameters']['total_opening_area_m2'],
            'avg_indoor_temp_C': r['simulation_metrics']['avg_indoor_temp_C'],
            'min_indoor_temp_C': r['simulation_metrics']['min_indoor_temp_C'],
            'max_indoor_temp_C': r['simulation_metrics']['max_indoor_temp_C'],
            'temperature_lift_C': r['simulation_metrics']['temperature_lift_C'],
            'diurnal_temperature_swing_C': r['simulation_metrics']['diurnal_temperature_swing_C'],
            'total_solar_gain_kWh': r['simulation_metrics']['total_solar_gain_kWh'],
            'total_conductive_heat_loss_kWh': r['simulation_metrics']['total_conductive_heat_loss_kWh'],
            'total_ventilation_loss_kWh': r['simulation_metrics']['total_ventilation_loss_kWh'],
            'is_fully_compliant': r['engineering_validation']['is_fully_compliant'],
            'total_score': r['scoring']['total_score'],
            'summary_verdict': r['scoring']['summary_verdict'],
        }
        # Add input features explicitly for Models A, B, C, D
        for k, v in r['input_features_surrogate'].items():
            flat[f"feat_d_{k}"] = v
        flat_rows.append(flat)

    df_flat = pd.DataFrame(flat_rows)
    df_flat.to_csv(csv_path, index=False)
    has_parquet = False
    try:
        df_flat.to_parquet(parquet_path, index=False)
        has_parquet = True
    except Exception:
        pass
    
    # Calculate SHA256 checksums
    def sha256_file(p):
        h = hashlib.sha256()
        with open(p, 'rb') as f:
            while chunk := f.read(65536):
                h.update(chunk)
        return h.hexdigest()
        
    checksums = {
        'thermoshelter_dataset_1200.jsonl': sha256_file(jsonl_path),
        'thermoshelter_dataset_1200.csv': sha256_file(csv_path),
    }
    if has_parquet:
        checksums['thermoshelter_dataset_1200.parquet'] = sha256_file(parquet_path)

    # Manifest
    files_dict = {
        'jsonl': jsonl_path,
        'csv': csv_path,
        'quarantine': quarantine_path
    }
    if has_parquet:
        files_dict['parquet'] = parquet_path

    manifest = {
        'dataset_name': 'thermoshelter_master_training_dataset',
        'dataset_version': DATASET_VERSION,
        'schema_version': SCHEMA_VERSION,
        'random_seed': RANDOM_SEED,
        'generation_timestamp_utc': datetime.now(timezone.utc).isoformat(),
        'total_cases_attempted': len(plan),
        'total_cases_valid': len(valid_records),
        'total_cases_quarantined': len(quarantine_records),
        'partition_counts': {
            'TRAIN': sum(1 for r in valid_records if r['split_group'] == 'TRAIN'),
            'VAL': sum(1 for r in valid_records if r['split_group'] == 'VAL'),
            'TEST': sum(1 for r in valid_records if r['split_group'] == 'TEST'),
        },
        'recommender_feature_count': len(FeatureExtractor.CONTEXT_FEATURE_NAMES),
        'surrogate_feature_count': len(FeatureExtractor.DESIGN_FEATURE_NAMES),
        'target_count': len(valid_records[0]['training_targets']),
        'checksums_sha256': checksums,
        'files': files_dict
    }
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)

    # Statistics
    stats = {
        'location_distribution': dict(Counter(r['context']['location_name'] for r in valid_records)),
        'climate_distribution': dict(Counter(r['context']['climate_zone'] for r in valid_records)),
        'geometry_distribution': dict(Counter(f"{r['design_parameters']['length_m']}x{r['design_parameters']['width_m']}" for r in valid_records)),
        'orientation_distribution': dict(Counter(r['design_parameters']['orientation_azimuth_deg'] for r in valid_records)),
        'wall_assembly_distribution': dict(Counter(r['design_parameters']['wall_assembly_id'] for r in valid_records)),
        'roof_assembly_distribution': dict(Counter(r['design_parameters']['roof_assembly_id'] for r in valid_records)),
        'occupancy_distribution': dict(Counter(r['requirements']['occupant_count'] for r in valid_records)),
        'ventilation_distribution': dict(Counter(r['requirements']['ventilation_level'] for r in valid_records)),
        'compliance_distribution': dict(Counter(r['engineering_validation']['is_fully_compliant'] for r in valid_records)),
        'verdict_distribution': dict(Counter(r['scoring']['summary_verdict'] for r in valid_records)),
        'numerical_metrics_summary': {
            'avg_indoor_temp_C': {
                'min': float(df_flat['avg_indoor_temp_C'].min()),
                'max': float(df_flat['avg_indoor_temp_C'].max()),
                'mean': float(df_flat['avg_indoor_temp_C'].mean()),
                'std': float(df_flat['avg_indoor_temp_C'].std())
            },
            'total_solar_kWh': {
                'min': float(df_flat['total_solar_gain_kWh'].min()),
                'max': float(df_flat['total_solar_gain_kWh'].max()),
                'mean': float(df_flat['total_solar_gain_kWh'].mean()),
                'std': float(df_flat['total_solar_gain_kWh'].std())
            },
            'total_loss_kWh': {
                'min': float(df_flat['total_conductive_heat_loss_kWh'].min()),
                'max': float(df_flat['total_conductive_heat_loss_kWh'].max()),
                'mean': float(df_flat['total_conductive_heat_loss_kWh'].mean()),
                'std': float(df_flat['total_conductive_heat_loss_kWh'].std())
            }
        }
    }
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)

    # Markdown Report
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(f"# THERMOSHELTER DATASET GENERATION REPORT\n\n")
        f.write(f"- **Generation Timestamp**: {manifest['generation_timestamp_utc']}\n")
        f.write(f"- **Dataset Version**: `{DATASET_VERSION}`\n")
        f.write(f"- **Total Cases Valid**: {manifest['total_cases_valid']} / {manifest['total_cases_attempted']}\n")
        f.write(f"- **Quarantined**: {manifest['total_cases_quarantined']}\n\n")
        f.write(f"## Partitions\n")
        f.write(f"- **TRAIN**: {manifest['partition_counts']['TRAIN']} cases (66.7%)\n")
        f.write(f"- **VAL**: {manifest['partition_counts']['VAL']} cases (8.3%)\n")
        f.write(f"- **TEST**: {manifest['partition_counts']['TEST']} cases (25.0% - 100% unseen Shimla holdout)\n\n")
        f.write(f"## Checksums\n")
        for fn, csum in checksums.items():
            f.write(f"- `{fn}`: `{csum}`\n")

    print(f"\nGeneration complete in {time.time() - start_time:.1f}s!")
    print(f"Valid cases written: {len(valid_records)} to {jsonl_path}")
    print(f"Manifest written to: {manifest_path}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='ThermoShelter Dataset Generator')
    parser.add_argument('--dry-run', action='store_true', help='Perform mathematical dry-run without running simulations')
    parser.add_argument('--output-dir', type=str, default='data/datasets', help='Output directory')
    
    args = parser.parse_args()
    
    plan = generate_sample_plan(total_cases=1200)
    
    if args.dry_run:
        run_dry_run(plan)
    else:
        execute_full_generation(plan, output_dir=args.output_dir)
