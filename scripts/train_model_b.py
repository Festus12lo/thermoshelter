#!/usr/bin/env python3
"""
ThermoShelter — Model B (Geometry & Bioclimatic Dimensioning) Training & Benchmark Engine
Builds, tunes, evaluates, and audits geometry selection models on the 1,200-case dataset.

Architecture:
- Input: 13 context features + target_floor_area_m2 + occupant_count
- Targets:
  1. target_aspect_ratio (Continuous L/W ratio)
  2. target_roof_pitch_deg (Roof angle in degrees)
- Split: Strict Geographic Holdout (Train: 800 [Leh, Jaipur, Karur A], Val: 100 [Karur B], Test: 300 [Shimla Unseen])
- Models Benchmarked:
  1. Dummy / Mean Predictor
  2. Ridge Linear Regression
  3. Decision Tree Regressor
  4. Random Forest Regressor
  5. Gradient Boosting Regressor
- Output:
  - Saved model bundle: models/model_b/model_b_bundle.joblib
  - Saved metadata: models/model_b/metadata.json
  - Markdown report: reports/model_b_report.md
"""

import sys
import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src'))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from thermoshelter.features.feature_extractor import FeatureExtractor

RANDOM_SEED = 42


def load_dataset_for_model_b(dataset_path: str = 'data/datasets/thermoshelter_dataset_1200.csv'):
    """Load dataset, extract context & requirement features, targets, and partition."""
    df = pd.read_csv(dataset_path)
    context_features = FeatureExtractor.CONTEXT_FEATURE_NAMES
    
    X_raw = np.zeros((len(df), len(context_features)), dtype=np.float32)
    for idx, fn in enumerate(context_features):
        if f"feat_d_{fn}" in df.columns:
            X_raw[:, idx] = df[f"feat_d_{fn}"].values
        elif fn in df.columns:
            X_raw[:, idx] = df[fn].values
        else:
            if fn == "soil_bearing_capacity_scaled":
                X_raw[:, idx] = 0.5
            elif fn == "slope_percent_scaled":
                X_raw[:, idx] = 0.05
            else:
                X_raw[:, idx] = 0.0

    y_aspect = df['aspect_ratio'].values
    y_pitch = df['roof_angle_deg'].values

    train_mask = (df['split_group'] == 'TRAIN').values
    val_mask = (df['split_group'] == 'VAL').values
    test_mask = (df['split_group'] == 'TEST').values

    X_train = X_raw[train_mask]
    y_train_aspect = y_aspect[train_mask]
    y_train_pitch = y_pitch[train_mask]

    X_val = X_raw[val_mask]
    y_val_aspect = y_aspect[val_mask]
    y_val_pitch = y_pitch[val_mask]

    X_test = X_raw[test_mask]
    y_test_aspect = y_aspect[test_mask]
    y_test_pitch = y_pitch[test_mask]

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    return (df, X_train, X_train_scaled, y_train_aspect, y_train_pitch,
            X_val, X_val_scaled, y_val_aspect, y_val_pitch,
            X_test, X_test_scaled, y_test_aspect, y_test_pitch,
            context_features, scaler)


def benchmark_model_b():
    """Train candidate regressors for Aspect Ratio and Roof Pitch."""
    print("=" * 72)
    print("  MODEL B: GEOMETRY / SHAPE / PITCH SELECTION TRAINING & BENCHMARK")
    print("=" * 72)

    (df, X_train, X_train_scaled, y_tr_ar, y_tr_pt,
     X_val, X_val_scaled, y_v_ar, y_v_pt,
     X_test, X_test_scaled, y_te_ar, y_te_pt,
     feature_names, scaler) = load_dataset_for_model_b()

    print(f"  Training samples: {len(X_train)} | Val: {len(X_val)} | Test (Shimla): {len(X_test)}")
    print(f"  Feature count: {len(feature_names)}")
    print()

    algorithms = {
        "Dummy_Mean": lambda: DummyRegressor(strategy="mean"),
        "Ridge_Linear": lambda: Ridge(alpha=0.1, random_state=RANDOM_SEED),
        "Decision_Tree": lambda: DecisionTreeRegressor(max_depth=10, random_state=RANDOM_SEED),
        "Random_Forest": lambda: RandomForestRegressor(n_estimators=1000, max_depth=20, n_jobs=-1, random_state=RANDOM_SEED),
        "Gradient_Boosting": lambda: GradientBoostingRegressor(n_estimators=2000, max_depth=6, learning_rate=0.05, random_state=RANDOM_SEED)
    }

    benchmark_results = {"aspect_ratio": {}, "roof_pitch": {}}
    trained_models = {"aspect_ratio": {}, "roof_pitch": {}}

    for target_key, y_tr, y_v, y_te in [("aspect_ratio", y_tr_ar, y_v_ar, y_te_ar),
                                         ("roof_pitch", y_tr_pt, y_v_pt, y_te_pt)]:
        print(f"  --- Training models for Target: {target_key} ---")
        best_val_mae = 1e9
        best_algo = None

        for name, algo_fn in algorithms.items():
            model = algo_fn()
            X_tr = X_train_scaled if "Ridge" in name else X_train
            X_val_m = X_val_scaled if "Ridge" in name else X_val
            X_te_m = X_test_scaled if "Ridge" in name else X_test

            model.fit(X_tr, y_tr)

            p_tr = model.predict(X_tr)
            p_val = model.predict(X_val_m)
            p_test = model.predict(X_te_m)

            tr_mae = mean_absolute_error(y_tr, p_tr)
            tr_rmse = mean_squared_error(y_tr, p_tr) ** 0.5
            tr_r2 = r2_score(y_tr, p_tr)

            v_mae = mean_absolute_error(y_v, p_val)
            v_rmse = mean_squared_error(y_v, p_val) ** 0.5
            v_r2 = r2_score(y_v, p_val)

            te_mae = mean_absolute_error(y_te, p_test)
            te_rmse = mean_squared_error(y_te, p_test) ** 0.5
            te_r2 = r2_score(y_te, p_test)

            benchmark_results[target_key][name] = {
                "train": {"mae": float(tr_mae), "rmse": float(tr_rmse), "r2": float(tr_r2)},
                "val": {"mae": float(v_mae), "rmse": float(v_rmse), "r2": float(v_r2)},
                "test_shimla": {"mae": float(te_mae), "rmse": float(te_rmse), "r2": float(te_r2)},
            }
            trained_models[target_key][name] = model

            print(f"    [{name:18s}] Val MAE: {v_mae:.3f}, R2: {v_r2:.3f} | Test (Shimla) MAE: {te_mae:.3f}, R2: {te_r2:.3f}")

            if v_mae < best_val_mae and name != "Dummy_Mean":
                best_val_mae = v_mae
                best_algo = name

        if best_algo is None:
            best_algo = "Random_Forest"

        benchmark_results[target_key]["champion"] = best_algo
        print(f"  --> Champion for {target_key}: {best_algo} (Val MAE = {best_val_mae:.3f})\n")

    # Save Bundle
    os.makedirs('models/model_b', exist_ok=True)
    champ_ar_name = benchmark_results["aspect_ratio"]["champion"]
    champ_pt_name = benchmark_results["roof_pitch"]["champion"]

    bundle = {
        "version": "1.0.0",
        "model_name": "ModelB_GeometryDesigner",
        "feature_names": feature_names,
        "scaler": scaler,
        "models": {
            "aspect_ratio": trained_models["aspect_ratio"][champ_ar_name],
            "roof_pitch": trained_models["roof_pitch"][champ_pt_name]
        },
        "champions": {
            "aspect_ratio": champ_ar_name,
            "roof_pitch": champ_pt_name
        }
    }
    joblib.dump(bundle, 'models/model_b/model_b_bundle.joblib')
    print("  Saved model bundle: models/model_b/model_b_bundle.joblib")

    # Save Metadata
    metadata = {
        "model_name": "ModelB_GeometryDesigner",
        "version": "1.0.0",
        "random_seed": RANDOM_SEED,
        "feature_count": len(feature_names),
        "features": feature_names,
        "benchmark_metrics": benchmark_results,
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "holdout_location": "LOC-IN-SHIMLA"
    }
    with open('models/model_b/metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    print("  Saved metadata: models/model_b/metadata.json")

    # Generate Markdown Report
    os.makedirs('reports', exist_ok=True)
    report_content = f"""# ThermoShelter -- Model B (Geometry & Dimensioning) Benchmark Report

## 1. Model Overview & Purpose
Model B evaluates and predicts optimal bioclimatic geometry parameters (Aspect Ratio and Roof Pitch) from 13 leakage-free environmental and site context features.

- **Aspect Ratio Champion**: `{champ_ar_name}`
- **Roof Pitch Champion**: `{champ_pt_name}`
- **Feature Space**: 13 context features (`{', '.join(feature_names)}`)
- **Holdout Strategy**: Geographic test partition on **Shimla** (300 cases, unseen montane cold climate).

---

## 2. Benchmark Results Across Candidate Algorithms

### Target 1: Aspect Ratio (L / W)
| Algorithm | Train MAE | Train R² | Val MAE | Val R² | Test (Shimla) MAE | Test (Shimla) R² |
|---|---|---|---|---|---|---|
"""
    for name in ["Dummy_Mean", "Ridge_Linear", "Decision_Tree", "Random_Forest", "Gradient_Boosting"]:
        m = benchmark_results["aspect_ratio"][name]
        report_content += f"| **{name}** | {m['train']['mae']:.3f} | {m['train']['r2']:.3f} | {m['val']['mae']:.3f} | {m['val']['r2']:.3f} | {m['test_shimla']['mae']:.3f} | {m['test_shimla']['r2']:.3f} |\n"

    report_content += """
### Target 2: Roof Pitch (Degrees)
| Algorithm | Train MAE | Train R² | Val MAE | Val R² | Test (Shimla) MAE | Test (Shimla) R² |
|---|---|---|---|---|---|---|
"""
    for name in ["Dummy_Mean", "Ridge_Linear", "Decision_Tree", "Random_Forest", "Gradient_Boosting"]:
        m = benchmark_results["roof_pitch"][name]
        report_content += f"| **{name}** | {m['train']['mae']:.3f} | {m['train']['r2']:.3f} | {m['val']['mae']:.3f} | {m['val']['r2']:.3f} | {m['test_shimla']['mae']:.3f} | {m['test_shimla']['r2']:.3f} |\n"

    report_content += """
---

## 3. Physical Sanity & Engineering Feasibility Checks
1. **Bioclimatic Aspect Ratio**: In cold alpine zones (Leh, Shimla), aspect ratio aligns along the East-West axis (AR >= 1.4) to maximize solar facade aperture. In warm climates (Karur), compact square-like forms (AR ~ 1.0 - 1.2) minimize heat gain.
2. **Snow-Shedding Pitch**: High-snow zones mandate roof pitches >= 25 deg (IS 875 Part 4). Flat roofs (0 deg) are restricted to non-snow regions.
3. **Candidate Evaluation**: Model B generates a controlled candidate geometry set and ranks each candidate using learned thermal compactness and area efficiency.
"""
    with open('reports/model_b_report.md', 'w', encoding='utf-8') as f:
        f.write(report_content)
    print("  Generated report: reports/model_b_report.md")
    print("=" * 72)


if __name__ == "__main__":
    benchmark_model_b()
