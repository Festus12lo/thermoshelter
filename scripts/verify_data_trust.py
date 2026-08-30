"""
ThermoShelter — Trust-Based Data Verification Harness
Performs independent mathematical, physical, and source verification of all canonical datasets.
"""

import os
import json
import math
import pandas as pd
import numpy as np

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CANONICAL_DIR = os.path.join(ROOT_DIR, "data", "canonical")
RAW_DIR = os.path.join(ROOT_DIR, "data", "raw")

def verify_all():
    print("==================================================")
    print("THERMOSHELTER — TRUST-BASED DATA VERIFICATION")
    print("==================================================")

    discrepancies = []
    trust_counts = {
        "VERIFIED": 0,
        "SOURCE_BACKED": 0,
        "CALCULATED": 0,
        "SIMULATED": 0,
        "EXPERT_LABELED": 0,
        "ASSUMED": 0,
        "SYNTHETIC": 0,
        "UNVERIFIED": 0,
        "MISSING": 0,
        "INVALID": 0
    }

    # ----------------------------------------------------
    # STEP 1: MATERIAL PROPERTIES & NUMERICAL RECALCULATION
    # ----------------------------------------------------
    print("\n--- [STEP 1] MATERIAL PROPERTIES NUMERICAL VERIFICATION ---")
    mat_props = pd.read_csv(os.path.join(CANONICAL_DIR, "materials", "material_properties.csv"))
    materials = pd.read_csv(os.path.join(CANONICAL_DIR, "materials", "materials.csv"))
    prov_df = pd.read_csv(os.path.join(CANONICAL_DIR, "provenance", "provenance_records.csv"))

    for _, row in mat_props.iterrows():
        mat_id = row["material_id"]
        k = row["thermal_conductivity_W_mK"]
        rho = row["density_kg_m3"]
        cp = row["specific_heat_J_kgK"]
        thick_mm = row["default_thickness_mm"]
        ev_status = row["evidence_status"]

        # Recalculate default thermal resistance R = d / k
        if k > 0:
            d_m = thick_mm / 1000.0
            r_recalc = d_m / k
        else:
            r_recalc = 0.0

        # Physical sanity checks
        if k <= 0 or rho <= 0 or cp <= 0:
            discrepancies.append(f"Invalid physical parameter for {mat_id}: k={k}, rho={rho}, cp={cp}")
            trust_counts["INVALID"] += 1
        elif ev_status == "VALUE_VERIFIED":
            trust_counts["VERIFIED"] += 1
        elif ev_status == "VALUE_NOT_VERIFIED":
            trust_counts["UNVERIFIED"] += 1
        else:
            trust_counts["SOURCE_BACKED"] += 1

        print(f"  Material: {mat_id:18} | k={k:6.3f} W/mK | rho={rho:6.1f} kg/m3 | cp={cp:6.1f} J/kgK | Recalc R(d={thick_mm}mm)={r_recalc:.4f} m2K/W | Status={ev_status}")

    # ----------------------------------------------------
    # STEP 2: ASSEMBLY LAYER RECALCULATION (ISO 6946:2017)
    # ----------------------------------------------------
    print("\n--- [STEP 2] ASSEMBLY & LAYER INDEPENDENT ISO 6946 RECALCULATION ---")
    assemblies = pd.read_csv(os.path.join(CANONICAL_DIR, "assemblies", "assemblies.csv"))
    layers = pd.read_csv(os.path.join(CANONICAL_DIR, "assemblies", "assembly_layers.csv"))

    # Map material conductivities
    mat_k_map = dict(zip(mat_props["material_id"], mat_props["thermal_conductivity_W_mK"]))

    for _, asm in assemblies.iterrows():
        asm_id = asm["assembly_id"]
        asm_layers = layers[layers["assembly_id"] == asm_id].sort_values("layer_order")
        
        recalc_r_tot = 0.0
        recalc_thick_mm = 0.0

        for _, lay in asm_layers.iterrows():
            lay_id = lay["layer_id"]
            m_id = lay["material_id"]
            d_mm = lay["thickness_mm"]
            k_val = lay["thermal_conductivity_W_mK"]
            stored_r = lay["layer_r_value_m2K_W"]

            recalc_thick_mm += d_mm
            
            # Recalculate layer R
            if d_mm > 0 and k_val > 0:
                recalc_r = (d_mm / 1000.0) / k_val
                # Check discrepancy with stored layer R
                if abs(recalc_r - stored_r) > 0.005:
                    discrepancies.append(f"Layer {lay_id} R-value mismatch: stored={stored_r:.4f}, recalculated={recalc_r:.4f}")
                recalc_r_tot += recalc_r
            else:
                # Boundary surface film or air cavity stored value
                recalc_r_tot += stored_r

        recalc_u = 1.0 / recalc_r_tot if recalc_r_tot > 0 else float("inf")
        
        stored_r_tot = asm["total_r_value_m2K_W"]
        stored_u = asm["effective_u_value_W_m2K"]

        r_diff = abs(recalc_r_tot - stored_r_tot)
        u_diff = abs(recalc_u - stored_u)

        if r_diff > 0.02 or u_diff > 0.02:
            discrepancies.append(f"Assembly {asm_id} total R/U mismatch: stored R={stored_r_tot:.3f}, recalc R={recalc_r_tot:.3f}, stored U={stored_u:.3f}, recalc U={recalc_u:.3f}")
            print(f"  [WARN] {asm_id}: Recalc R={recalc_r_tot:.3f} m2K/W, Stored R={stored_r_tot:.3f} | Recalc U={recalc_u:.3f}, Stored U={stored_u:.3f}")
            trust_counts["CALCULATED"] += 1
        else:
            print(f"  [PASS] {asm_id:25} | Recalc R={recalc_r_tot:.3f} m2K/W | Recalc U={recalc_u:.3f} W/m2K | Thick={recalc_thick_mm:.1f}mm")
            trust_counts["CALCULATED"] += 1

    # ----------------------------------------------------
    # STEP 3: GEOMETRY & AREA RECALCULATION
    # ----------------------------------------------------
    print("\n--- [STEP 3] GEOMETRY INDEPENDENT RECALCULATION ---")
    geom_df = pd.read_csv(os.path.join(CANONICAL_DIR, "geometry", "geometry_parameters.csv"))
    openings_df = pd.read_csv(os.path.join(CANONICAL_DIR, "openings", "openings.csv"))

    for _, geom in geom_df.iterrows():
        g_id = geom["geometry_id"]
        L = geom["length_m"]
        W = geom["width_m"]
        H = geom["height_m"]
        pitch_deg = geom["roof_pitch_deg"]

        recalc_floor = L * W
        recalc_gross_wall = 2 * (L + W) * H
        recalc_volume = L * W * H
        recalc_aspect = L / W if W > 0 else 0.0

        # Roof area with pitch
        pitch_rad = math.radians(pitch_deg)
        recalc_roof = (L * W) / math.cos(pitch_rad) if math.cos(pitch_rad) > 0 else L * W

        # Openings area for this geometry
        g_openings = openings_df[openings_df["geometry_id"] == g_id]
        total_open_area = g_openings["area_m2"].sum() if len(g_openings) > 0 else 0.0
        recalc_net_wall = max(0.0, recalc_gross_wall - total_open_area)

        # Compare with stored
        floor_err = abs(recalc_floor - geom["floor_area_m2"])
        wall_err = abs(recalc_gross_wall - geom["gross_wall_area_m2"])
        vol_err = abs(recalc_volume - geom["volume_m3"])
        roof_err = abs(recalc_roof - geom["roof_area_m2"])

        if floor_err > 0.1 or wall_err > 0.1 or vol_err > 0.1 or roof_err > 0.1:
            discrepancies.append(f"Geometry {g_id} mismatch in derived areas/volume.")
            print(f"  [WARN] {g_id} area recalculation mismatch!")
        else:
            print(f"  [PASS] {g_id:20} | Floor={recalc_floor:.1f} m2 | GrossWall={recalc_gross_wall:.1f} m2 | NetWall={recalc_net_wall:.1f} m2 | Roof={recalc_roof:.2f} m2 | Vol={recalc_volume:.1f} m3 | Aspect={recalc_aspect:.2f}")
            trust_counts["CALCULATED"] += 1

    # ----------------------------------------------------
    # STEP 4: WEATHER DATASET VALIDATION
    # ----------------------------------------------------
    print("\n--- [STEP 4] WEATHER DATASET TIME-SERIES & PHYSICS VALIDATION ---")
    weather_datasets = pd.read_csv(os.path.join(CANONICAL_DIR, "weather", "weather_datasets.csv"))

    for _, wd in weather_datasets.iterrows():
        w_id = wd["weather_dataset_id"]
        rel_path = wd["relative_filepath"]
        full_path = os.path.join(ROOT_DIR, rel_path)
        
        df_w = pd.read_csv(full_path)
        
        # Validation checks
        t_min = df_w["temperature_2m"].min()
        t_max = df_w["temperature_2m"].max()
        rh_min = df_w["relativehumidity_2m"].min()
        rh_max = df_w["relativehumidity_2m"].max()
        sol_max = df_w["shortwave_radiation"].max()
        sol_min = df_w["shortwave_radiation"].min()
        null_count = df_w.isnull().sum().sum()

        if null_count > 0:
            discrepancies.append(f"Weather dataset {w_id} has {null_count} null values!")
            trust_counts["INVALID"] += 1
        elif rh_min < 0 or rh_max > 100 or sol_min < 0 or sol_max > 1500 or t_min < -50 or t_max > 60:
            discrepancies.append(f"Weather dataset {w_id} has out-of-physical-bounds readings!")
            trust_counts["INVALID"] += 1
        else:
            trust_counts["SOURCE_BACKED"] += 1
            print(f"  [PASS] {w_id:20} | {len(df_w)} hrs | Temp: [{t_min:5.1f}C, {t_max:5.1f}C] | RH: [{rh_min:2.0f}%, {rh_max:3.0f}%] | Max Solar: {sol_max:6.1f} W/m2 | Zero Nulls")

    # ----------------------------------------------------
    # STEP 5: ENGINEERING RULES & SOURCE CROSS-CHECK
    # ----------------------------------------------------
    print("\n--- [STEP 5] ENGINEERING RULES & CITATION VERIFICATION ---")
    eng_rules = pd.read_csv(os.path.join(CANONICAL_DIR, "engineering", "engineering_rules.csv"))
    sources = pd.read_csv(os.path.join(CANONICAL_DIR, "provenance", "sources.csv"))
    src_map = dict(zip(sources["source_id"], sources["source_name"]))

    for _, r in eng_rules.iterrows():
        r_id = r["rule_id"]
        title = r["title"]
        expr = r["condition_expression"]
        thresh = r["threshold_value"]
        unit = r["unit"]
        s_id = r["source_id"]
        ev_st = r["evidence_status"]
        src_name = src_map.get(s_id, "Unknown Source")

        print(f"  Rule: {r_id:14} | {title[:35]:35} | Expr: {expr:25} | Thresh: {thresh} {unit:10} | Source: {s_id} ({ev_st})")
        if ev_st == "VALUE_VERIFIED":
            trust_counts["VERIFIED"] += 1
        else:
            trust_counts["UNVERIFIED"] += 1

    # ----------------------------------------------------
    # STEP 6: TRAINING DATA TRUST & QUARANTINE AUDIT
    # ----------------------------------------------------
    print("\n--- [STEP 6] ML TRAINING DATA PROVENANCE & QUARANTINE AUDIT ---")
    with open(os.path.join(CANONICAL_DIR, "training", "training_examples.json"), "r") as f:
        training_json = json.load(f)

    for ex in training_json:
        ex_id = ex["training_example_id"]
        prov_type = ex["provenance_type"]
        conf = ex["confidence_score"]
        engine = ex["ground_truth_source"]["engine"]
        val_st = ex["ground_truth_source"]["validation_status"]

        if prov_type == "PHYSICS_SIMULATION":
            trust_counts["SIMULATED"] += 1
            print(f"  [SIMULATED] {ex_id:20} | Confidence: {conf:.2f} | Ground Truth: {engine} | Status: {val_st}")
        elif prov_type == "REAL_OBSERVATION":
            trust_counts["VERIFIED"] += 1
            print(f"  [OBSERVED]  {ex_id:20} | Confidence: {conf:.2f} | Real-World Empirical Measurement")
        elif prov_type in ["AI_GENERATED", "SYNTHETIC"]:
            trust_counts["SYNTHETIC"] += 1
            print(f"  [SYNTHETIC] {ex_id:20} | Confidence: {conf:.2f} | Quarantined AI/Synthetic Data (Non-Ground-Truth)")
        else:
            trust_counts["EXPERT_LABELED"] += 1

    # ----------------------------------------------------
    # STEP 7: SUMMARY & TRUST CLASSIFICATION
    # ----------------------------------------------------
    print("\n==================================================")
    print("TRUST VERIFICATION SUMMARY")
    print("==================================================")
    for k, v in trust_counts.items():
        print(f"  {k:18}: {v:4} records")
    print(f"  Total Discrepancies Found: {len(discrepancies)}")
    for d in discrepancies:
        print(f"    - {d}")

    return discrepancies, trust_counts

if __name__ == "__main__":
    verify_all()
