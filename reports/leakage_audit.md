# ThermoShelter V2.1 — Data & Target Leakage Audit Report

## 1. Scope of Forensic Leakage Audit
To guarantee that the machine learning models (A, B, C, D) are genuine, reproducible, and scientifically defensible, a forensic audit was conducted across 4 potential leakage vectors:
1. **Target Leakage**: Features derived from simulation or optimization targets.
2. **Geographic Contamination**: Data from the unseen test location (**Shimla**) leaking into training.
3. **Preprocessing Contamination**: Scalers fit on the entire dataset rather than training folds only.
4. **Duplicate & Near-Duplicate Case Contamination**.

---

## 2. Forensic Audit Findings

| Audit Dimension | Investigation Method | Result | Status |
|---|---|---|---|
| **Target Leakage** | Feature schema inspection (`FeatureExtractor.CONTEXT_FEATURE_NAMES` and `DESIGN_FEATURE_NAMES`) | All 28 features are strictly **pre-simulation** design variables and geographic context. Zero simulation outputs (`avg_indoor_temp_C`, `total_solar_gain_kWh`, `total_score`) exist in $X$. | **PASSED (ZERO LEAKAGE)** |
| **Geographic Isolation** | Group-based splitting on `location_id` | **Train**: Leh ($n=400$), Jaipur ($n=400$), Karur Group A ($n=100$).<br>**Val**: Karur Group B ($n=100$).<br>**Test**: Shimla ($n=300$, unseen cold montane climate). | **PASSED (STRICT HOLDOUT)** |
| **Preprocessing Isolation** | `StandardScaler.fit()` verification in all `train_model_*.py` scripts | All feature scalers are fit **exclusively on `X_train`** and applied via `.transform()` to `X_val` and `X_test`. | **PASSED (NO CONTAMINATION)** |
| **Duplicate Prevention** | State signature hashing & cycle checks | Hashing of `(floor_area, aspect_ratio, orientation, wall_assembly, roof_assembly, floor_assembly)` prevents duplicate candidate evaluation. | **PASSED** |

---

## 3. Verified Artifact Metadata
Every model metadata JSON file records its exact split configuration and holdout location:
- `models/model_a/metadata.json`: `holdout_location = "LOC-IN-SHIMLA"`
- `models/model_b/metadata.json`: `holdout_location = "LOC-IN-SHIMLA"`
- `models/model_c/metadata.json`: `holdout_location = "LOC-IN-SHIMLA"`
- `models/model_d/model_d_metadata.json`: `holdout_location = "LOC-IN-SHIMLA"`
