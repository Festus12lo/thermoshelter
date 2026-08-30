# Dataset Audit

## 1. Datasets Used
- **Training Data**: Generated dynamically via `ModelETrainingGenerator` combining 1,200 valid geometry/material/orientation cases. 
- **Validation/Test Data**: Splitting handled via `GroupShuffleSplit` on `climate_zone`. Shimla is strictly held out.
- **Target Variables**:
  - Model A: `heat_loss_kwh` (float, kWh).
  - Model B: `aspect_ratio` (float), `roof_pitch` (float).
  - Model C: `solar_gain_kwh` (float, kWh).
  - Model D: Multi-output [T_indoor, Q_solar, Q_loss].

## 2. Leakage Analysis
- **Target Leakage**: ZERO. All ML features are pre-simulation architectural and climatic variables. No post-simulation values (e.g., thermal mass $C$) are leaked into feature extraction.
- **Geographic Leakage**: ZERO. The Shimla (Cold-Cloudy) region is held out across A, B, C, and D. Validated extensively in `test_recursive_ml_engine.py`.
