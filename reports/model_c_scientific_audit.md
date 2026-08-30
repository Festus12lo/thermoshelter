# Model C: Passive Solar Learner

## 1. Role
- **Target**: Directional Solar Potential ($Q_{solar}$ in kWh).
- **Features**: Trigonometric solar alignment ($cos(Azimuth - 180^\circ)$), window areas.

## 2. Performance & Validity
- **Algorithm**: Ridge Regression.
- **Metrics**: MAE = 39.81 kWh on Shimla ($R^2 = 0.68$).
- **Validity**: Correctly ranks South > East > North. However, the model learns a proxy of the exact deterministic solar algorithm.
- **Decision**: **REDEFINE**. ML is redundant when a precise deterministic solar projection exists.
