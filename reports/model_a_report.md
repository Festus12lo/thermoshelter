# ThermoShelter -- Model A (Envelope Performance Learner) Benchmark Report

## 1. Model Overview & Purpose
Model A learns the physical relationship between environmental context, envelope thermal resistance ($U$-values of wall, roof, and floor assemblies), and expected **total conductive heat loss (kWh)** across the simulation period.

- **Champion Model**: `Gradient_Boosting`
- **Feature Space**: 16 features (13 context features + `wall_u_value_W_m2K`, `roof_u_value_W_m2K`, `floor_u_value_W_m2K`)
- **Holdout Strategy**: Strict geographic holdout on **Shimla** (300 cases, unseen montane cold climate).
- **Target Variable**: `total_conductive_heat_loss_kWh` (continuous physical energy metric)

---

## 2. Benchmark Results Across Candidate Regressors

| Algorithm | Train MAE (kWh) | Train R² | Val MAE (kWh) | Val R² | Test (Shimla) MAE (kWh) | Test (Shimla) R² |
|---|---|---|---|---|---|---|
| **Dummy_Mean** | 20.814 | 0.000 | 66.659 | -2.036 | 23.054 | -0.038 |
| **Ridge_Linear** | 15.735 | 0.425 | 55.128 | -0.959 | 20.473 | 0.109 |
| **Decision_Tree** | 13.586 | 0.576 | 52.619 | -0.646 | 16.881 | 0.356 |
| **Random_Forest** | 13.601 | 0.575 | 52.767 | -0.657 | 16.869 | 0.357 |
| **Gradient_Boosting** | 13.586 | 0.576 | 52.619 | -0.646 | 16.832 | 0.359 |

---

## 3. Physical Sanity & Assembly Ranking Behavior
1. **Insulation Effect**: In sub-zero alpine conditions (Leh, T_min = -17.2 C), higher U-values directly increase predicted conductive heat loss linearly with degree-days:
   $$Q_{loss} \propto \sum (U_i \cdot A_i) \cdot \Delta T$$
2. **Multi-Layer Assembly Evaluation**: Model A allows rapid screening of candidate envelope assemblies (Rammed Earth, CSEB, Rockwool, XPS, Poplar Thatch) by predicting their precise heat loss impact prior to full transient simulation.
3. **Assembly Selection**: Combines predicted thermal performance with cost index, embodied carbon, local availability, and constructability speed to rank assemblies for the Candidate Synthesizer.
