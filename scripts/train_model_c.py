#!/usr/bin/env python3
"""
ThermoShelter — Model C (Orientation & Passive Solar Potential Learner)
Predicts directional solar radiation potential (total_solar_gain_kWh) from geographic context,
trigonometric solar alignment, and building aperture parameters.

Architecture:
- Input: 13 context features + trigonometric orientation features (cos/sin azimuth, south alignment, solar aperture)
- Target: total_solar_gain_kWh (continuous directional solar gain captured over simulation period)
- Split: Strict Geographic Holdout (Train: 800 [Leh, Jaipur, Karur A], Val: 100 [Karur B], Test: 300 [Shimla Unseen])
- Models Benchmarked:
  1. Dummy / Mean Predictor
  2. Ridge Linear Regression
  3. Decision Tree Regressor
  4. Random Forest Regressor
  5. Gradient Boosting Regressor
- Output:
  - Saved model bundle: models/model_c/model_c_bundle.joblib
  - Saved metadata: models/model_c/metadata.json
  - Markdown report: reports/model_c_report.md
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


def load_dataset_for_model_c(dataset_path: str = 'data/datasets/thermoshelter_dataset_1200.csv'):
    """Load dataset, compute trigonometric solar alignment features, extract targets, and partition."""
    df = pd.read_csv(dataset_path)
    base_features = FeatureExtractor.CONTEXT_FEATURE_NAMES
    
    # Trigonometric and physical solar orientation features
    azimuth = df['orientation_azimuth_deg'].values if 'orientation_azimuth_deg' in df.columns else df['feat_d_orientation_azimuth_deg'].values
    az_rad = np.radians(azimuth)
    cos_az = np.cos(az_rad)
    sin_az = np.sin(az_rad)
    south_alignment = np.cos(np.radians(azimuth - 180.0)) # 1.0 at South (180 deg), -1.0 at North (0 deg)
    
    solar_peak = df['feat_d_design_solar_peak_scaled'].values if 'feat_d_design_solar_peak_scaled' in df.columns else np.ones(len(df))
    solar_aperture = np.maximum(0.0, south_alignment) * solar_peak
    
    opening_area = df['feat_d_total_opening_area_m2'].values if 'feat_d_total_opening_area_m2' in df.columns else (df['total_opening_area_m2'].values if 'total_opening_area_m2' in df.columns else np.ones(len(df)) * 5.0)
    
    engineered_feature_names = [
        "orientation_azimuth_deg",
        "cos_azimuth",
        "sin_azimuth",
        "south_alignment",
        "solar_aperture_potential",
        "opening_area_m2"
    ]
    all_feature_names = base_features + engineered_feature_names
    
    X_raw = np.zeros((len(df), len(all_feature_names)), dtype=np.float32)
    for idx, fn in enumerate(base_features):
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

    offset = len(base_features)
    X_raw[:, offset + 0] = azimuth
    X_raw[:, offset + 1] = cos_az
    X_raw[:, offset + 2] = sin_az
    X_raw[:, offset + 3] = south_alignment
    X_raw[:, offset + 4] = solar_aperture
    X_raw[:, offset + 5] = opening_area

    y_solar = df['total_solar_gain_kWh'].values

    train_mask = (df['split_group'] == 'TRAIN').values
    val_mask = (df['split_group'] == 'VAL').values
    test_mask = (df['split_group'] == 'TEST').values

    X_train = X_raw[train_mask]
    y_train_solar = y_solar[train_mask]

    X_val = X_raw[val_mask]
    y_val_solar = y_solar[val_mask]

    X_test = X_raw[test_mask]
    y_test_solar = y_solar[test_mask]

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    return (df, X_train, X_train_scaled, y_train_solar,
            X_val, X_val_scaled, y_val_solar,
            X_test, X_test_scaled, y_test_solar,
            all_feature_names, scaler)


def benchmark_model_c():
    """Train candidate regressors for Directional Solar Gain."""
    print("=" * 72)
    print("  MODEL C: ORIENTATION & PASSIVE SOLAR POTENTIAL TRAINING & BENCHMARK")
    print("=" * 72)

    (df, X_train, X_train_scaled, y_train,
     X_val, X_val_scaled, y_val,
     X_test, X_test_scaled, y_test,
     feature_names, scaler) = load_dataset_for_model_c()

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

    results = {}
    trained_models = {}
    best_val_mae = 1e9
    best_algo = None

    for name, algo_fn in algorithms.items():
        model = algo_fn()
        X_tr = X_train_scaled if "Ridge" in name else X_train
        X_v = X_val_scaled if "Ridge" in name else X_val
        X_te = X_test_scaled if "Ridge" in name else X_test

        model.fit(X_tr, y_train)

        p_tr = model.predict(X_tr)
        p_val = model.predict(X_v)
        p_test = model.predict(X_te)

        tr_mae = mean_absolute_error(y_train, p_tr)
        tr_rmse = mean_squared_error(y_train, p_tr) ** 0.5
        tr_r2 = r2_score(y_train, p_tr)

        v_mae = mean_absolute_error(y_val, p_val)
        v_rmse = mean_squared_error(y_val, p_val) ** 0.5
        v_r2 = r2_score(y_val, p_val)

        te_mae = mean_absolute_error(y_test, p_test)
        te_rmse = mean_squared_error(y_test, p_test) ** 0.5
        te_r2 = r2_score(y_test, p_test)

        results[name] = {
            "train": {"mae": float(tr_mae), "rmse": float(tr_rmse), "r2": float(tr_r2)},
            "val": {"mae": float(v_mae), "rmse": float(v_rmse), "r2": float(v_r2)},
            "test_shimla": {"mae": float(te_mae), "rmse": float(te_rmse), "r2": float(te_r2)}
        }
        trained_models[name] = model

        print(f"  [{name:18s}] Val MAE: {v_mae:.3f} kWh, R2: {v_r2:.3f} | Test (Shimla) MAE: {te_mae:.3f} kWh, R2: {te_r2:.3f}")

        if v_mae < best_val_mae and name != "Dummy_Mean":
            best_val_mae = v_mae
            best_algo = name

    if best_algo is None:
        best_algo = "Gradient_Boosting"

    print()
    print(f"  Selected Champion Model: {best_algo} (Val MAE = {best_val_mae:.3f} kWh)")

    champion_model = trained_models[best_algo]

    # Save Bundle
    os.makedirs('models/model_c', exist_ok=True)
    bundle = {
        "version": "2.1.0",
        "model_name": "ModelC_PassiveSolarLearner",
        "algorithm": best_algo,
        "feature_names": feature_names,
        "scaler": scaler,
        "model": champion_model
    }
    joblib.dump(bundle, 'models/model_c/model_c_bundle.joblib')
    print("  Saved model bundle: models/model_c/model_c_bundle.joblib")

    # Save Metadata
    metadata = {
        "model_name": "ModelC_PassiveSolarLearner",
        "version": "2.1.0",
        "random_seed": RANDOM_SEED,
        "feature_count": len(feature_names),
        "features": feature_names,
        "champion_algorithm": best_algo,
        "benchmark_metrics": results,
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "holdout_location": "LOC-IN-SHIMLA",
        "target": "total_solar_gain_kWh"
    }
    with open('models/model_c/metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    print("  Saved metadata: models/model_c/metadata.json")

    # Generate Markdown Report
    os.makedirs('reports', exist_ok=True)
    report_content = f"""# ThermoShelter -- Model C (Solar & Orientation Learner) Benchmark Report

## 1. Model Overview & Purpose
Model C learns the physical relationship between geographic solar availability, building orientation azimuth ($0^\\circ=\\text{{North}}, 90^\\circ=\\text{{East}}, 180^\\circ=\\text{{South}}, 270^\\circ=\\text{{West}}$), trigonometric solar angle projections, and expected **total directional solar gain (kWh)** across the simulation period.

- **Champion Model**: `{best_algo}`
- **Feature Space**: {len(feature_names)} features (13 context features + `orientation_azimuth_deg`, `cos_azimuth`, `sin_azimuth`, `south_alignment`, `solar_aperture_potential`, `opening_area_m2`)
- **Holdout Strategy**: Strict geographic holdout on **Shimla** (300 cases, unseen montane cold climate).
- **Target Variable**: `total_solar_gain_kWh` (continuous physical energy metric)

---

## 2. Benchmark Results Across Candidate Regressors

| Algorithm | Train MAE (kWh) | Train R² | Val MAE (kWh) | Val R² | Test (Shimla) MAE (kWh) | Test (Shimla) R² |
|---|---|---|---|---|---|---|
"""
    for name, m in results.items():
        report_content += f"| **{name}** | {m['train']['mae']:.3f} | {m['train']['r2']:.3f} | {m['val']['mae']:.3f} | {m['val']['r2']:.3f} | {m['test_shimla']['mae']:.3f} | {m['test_shimla']['r2']:.3f} |\n"

    report_content += """
---

## 3. Physical Sanity & Directional Orientation Ranking
1. **Solar Noon Collector Alignment**: In the Northern Hemisphere ($15^\\circ - 35^\\circ\\text{ N}$), True South ($180^\\circ$) captures maximum solar irradiation during winter months due to the low solar altitude angle:
   $$\\cos(\\theta_{\\text{incidence}}) = \\sin(\\alpha_s) \\cos(\\beta) + \\cos(\\alpha_s) \\sin(\\beta) \\cos(\\gamma_s - \\gamma)$$
2. **Azimuth Canonical Convention**:
   - $0^\\circ$: True North (0 kWh direct winter solar gain on vertical facade)
   - $90^\\circ$: East (Morning solar gain, moderate winter capture)
   - $180^\\circ$: True South (Peak winter solar noon collection, maximum solar lift)
   - $270^\\circ$: West (Afternoon capture, potential summer overheating)
3. **Surrogate Role**: Model C accelerates initial orientation ranking across all candidate azimuths in $<1\\text{ ms}$ before passing finalists to the full numerical solver.
"""
    with open('reports/model_c_report.md', 'w', encoding='utf-8') as f:
        f.write(report_content)
    print("  Generated report: reports/model_c_report.md")
    print("=" * 72)


if __name__ == "__main__":
    benchmark_model_c()
