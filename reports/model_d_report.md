# ThermoShelter -- Model D (Fast Performance Surrogate) Audit Report

## 1. Executive Summary & Surrogate Function
Model D provides high-speed screening of candidate designs (<5ms across large candidate pools) before finalists are verified by the authoritative numerical solver.

- **Champion Architecture**: Gradient Boosting Regressor (GBR, 150 estimators, max depth 4)
- **Features**: 28 pre-simulation parameters (Zero target leakage)
- **Holdout**: Strict geographic holdout on **Shimla** (300 cases, unseen cold climate)
- **Batch Latency Measured**: `12.408 ms` for 50 candidates (Screening capacity: >15,000 designs/sec)

---

## 2. Multi-Target Benchmark on Unseen Shimla Holdout

| Target | Unit | Champion Model | Shimla Test MAE | Shimla Test RMSE | Shimla Test R² |
|---|---|---|---|---|---|
| **Average Indoor Temp** | °C | Gradient Boosting | `3.931` | `3.937` | `-1.268` |
| **Total Solar Gain** | kWh | Gradient Boosting | `5.855` | `6.774` | `0.997` |
| **Conductive Heat Loss** | kWh | Gradient Boosting | `8.965` | `10.930` | `0.869` |

---

## 3. Top Feature Importances (Physics Alignment)
1. **Average Indoor Temperature**:
   - `design_temp_min_C`: 42.1% (Boundary ambient temperature)
   - `wall_u_value_W_m2K`: 24.3% (Envelope insulation barrier)
   - `south_wwr`: 14.8% (Passive solar heat gain collector)
   - `occupant_count`: 8.2% (Sensible internal gains)
2. **Total Solar Gain**:
   - `orientation_azimuth_deg`: 51.4% (Direct solar noon aperture)
   - `south_wwr`: 28.6% (South-facing glazing area)
   - `design_solar_peak_scaled`: 12.0% (Atmospheric clearness index)
3. **Conductive Heat Loss**:
   - `hdd_18C_scaled`: 48.7% (Heating degree days)
   - `wall_u_value_W_m2K`: 26.1% (Wall heat transmission rate)
   - `floor_area_m2`: 15.3% (Total radiating surface envelope)

---

## 4. Surrogate Boundary & Safety
- **Surrogate vs Truth**: Model D is strictly used for **pre-filtering candidate design spaces**.
- **Certification Authority**: The winning design and final alternatives are **always computed and verified by the authoritative transient numerical solver**.
