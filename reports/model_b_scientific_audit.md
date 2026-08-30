# Model B: Geometry Dimensioning Learner

## 1. Role
- **Target**: Aspect Ratio (L/W) and Roof Pitch (degrees).
- **Features**: Floor area, occupants, climate zone, snow loads.

## 2. Performance & Validity
- **Algorithm**: Ridge Regression.
- **Metrics**: AR MAE = 0.25, Pitch MAE = 8.7 degrees.
- **Validity**: Correctly forces high roof pitch in snowy climates (Ladakh) and compact aspect ratios in extreme cold.
- **Decision**: **KEEP**. Reliable geometric constraint synthesis.
