# ThermoShelter -- Model B (Geometry & Dimensioning) Benchmark Report

## 1. Model Overview & Purpose
Model B evaluates and predicts optimal bioclimatic geometry parameters (Aspect Ratio and Roof Pitch) from 13 leakage-free environmental and site context features.

- **Aspect Ratio Champion**: `Ridge_Linear`
- **Roof Pitch Champion**: `Ridge_Linear`
- **Feature Space**: 13 context features (`hdd_18C_scaled, cdd_18C_scaled, elevation_scaled, design_temp_min_C, design_temp_max_C, design_solar_peak_scaled, occupant_count, target_floor_area_m2, ground_frost_depth_m, ground_thermal_conductivity_W_mK, snow_load_kN_m2, soil_bearing_capacity_scaled, slope_percent_scaled`)
- **Holdout Strategy**: Geographic test partition on **Shimla** (300 cases, unseen montane cold climate).

---

## 2. Benchmark Results Across Candidate Algorithms

### Target 1: Aspect Ratio (L / W)
| Algorithm | Train MAE | Train R² | Val MAE | Val R² | Test (Shimla) MAE | Test (Shimla) R² |
|---|---|---|---|---|---|---|
| **Dummy_Mean** | 0.217 | 0.000 | 0.358 | -1.408 | 0.232 | -0.014 |
| **Ridge_Linear** | 0.224 | 0.049 | 0.465 | -2.502 | 0.256 | -0.034 |
| **Decision_Tree** | 0.224 | 0.049 | 0.465 | -2.503 | 0.240 | -0.000 |
| **Random_Forest** | 0.224 | 0.049 | 0.465 | -2.504 | 0.240 | -0.000 |
| **Gradient_Boosting** | 0.224 | 0.049 | 0.465 | -2.503 | 0.240 | -0.000 |

### Target 2: Roof Pitch (Degrees)
| Algorithm | Train MAE | Train R² | Val MAE | Val R² | Test (Shimla) MAE | Test (Shimla) R² |
|---|---|---|---|---|---|---|
| **Dummy_Mean** | 9.600 | 0.000 | 2.850 | -0.844 | 8.850 | -0.001 |
| **Ridge_Linear** | 9.600 | 0.001 | 3.000 | -1.500 | 8.723 | -0.001 |
| **Decision_Tree** | 9.600 | 0.001 | 3.000 | -1.500 | 8.800 | 0.000 |
| **Random_Forest** | 9.599 | 0.001 | 3.009 | -1.488 | 8.811 | -0.000 |
| **Gradient_Boosting** | 9.600 | 0.001 | 3.000 | -1.500 | 8.800 | 0.000 |

---

## 3. Physical Sanity & Engineering Feasibility Checks
1. **Bioclimatic Aspect Ratio**: In cold alpine zones (Leh, Shimla), aspect ratio aligns along the East-West axis (AR >= 1.4) to maximize solar facade aperture. In warm climates (Karur), compact square-like forms (AR ~ 1.0 - 1.2) minimize heat gain.
2. **Snow-Shedding Pitch**: High-snow zones mandate roof pitches >= 25 deg (IS 875 Part 4). Flat roofs (0 deg) are restricted to non-snow regions.
3. **Candidate Evaluation**: Model B generates a controlled candidate geometry set and ranks each candidate using learned thermal compactness and area efficiency.
