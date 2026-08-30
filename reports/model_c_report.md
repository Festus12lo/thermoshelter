# ThermoShelter -- Model C (Solar & Orientation Learner) Benchmark Report

## 1. Model Overview & Purpose
Model C learns the physical relationship between geographic solar availability, building orientation azimuth ($0^\circ=\text{North}, 90^\circ=\text{East}, 180^\circ=\text{South}, 270^\circ=\text{West}$), trigonometric solar angle projections, and expected **total directional solar gain (kWh)** across the simulation period.

- **Champion Model**: `Ridge_Linear`
- **Feature Space**: 19 features (13 context features + `orientation_azimuth_deg`, `cos_azimuth`, `sin_azimuth`, `south_alignment`, `solar_aperture_potential`, `opening_area_m2`)
- **Holdout Strategy**: Strict geographic holdout on **Shimla** (300 cases, unseen montane cold climate).
- **Target Variable**: `total_solar_gain_kWh` (continuous physical energy metric)

---

## 2. Benchmark Results Across Candidate Regressors

| Algorithm | Train MAE (kWh) | Train R² | Val MAE (kWh) | Val R² | Test (Shimla) MAE (kWh) | Test (Shimla) R² |
|---|---|---|---|---|---|---|
| **Dummy_Mean** | 103.645 | 0.000 | 361.855 | -4.147 | 103.448 | -0.028 |
| **Ridge_Linear** | 54.332 | 0.722 | 150.190 | -0.013 | 73.480 | 0.521 |
| **Decision_Tree** | 48.544 | 0.764 | 205.070 | -0.984 | 48.594 | 0.760 |
| **Random_Forest** | 48.644 | 0.764 | 202.604 | -0.917 | 47.170 | 0.771 |
| **Gradient_Boosting** | 48.517 | 0.764 | 203.414 | -0.962 | 47.137 | 0.771 |

---

## 3. Physical Sanity & Directional Orientation Ranking
1. **Solar Noon Collector Alignment**: In the Northern Hemisphere ($15^\circ - 35^\circ\text{ N}$), True South ($180^\circ$) captures maximum solar irradiation during winter months due to the low solar altitude angle:
   $$\cos(\theta_{\text{incidence}}) = \sin(\alpha_s) \cos(\beta) + \cos(\alpha_s) \sin(\beta) \cos(\gamma_s - \gamma)$$
2. **Azimuth Canonical Convention**:
   - $0^\circ$: True North (0 kWh direct winter solar gain on vertical facade)
   - $90^\circ$: East (Morning solar gain, moderate winter capture)
   - $180^\circ$: True South (Peak winter solar noon collection, maximum solar lift)
   - $270^\circ$: West (Afternoon capture, potential summer overheating)
3. **Surrogate Role**: Model C accelerates initial orientation ranking across all candidate azimuths in $<1\text{ ms}$ before passing finalists to the full numerical solver.
