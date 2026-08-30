# Model A: Envelope Performance Learner

## 1. Role
- **Target**: Conductive Heat Loss ($Q_{loss}$ in kWh).
- **Features**: U-values, envelope area, temperature extremes.

## 2. Performance & Validity
- **Algorithm**: Ridge Regression.
- **Metrics**: MAE = 16.77 kWh on unseen Shimla.
- **Validity**: Physically monotonic. Increases in U-value uniformly increase predicted $Q_{loss}$.
- **Decision**: **KEEP**. Effectively screens assemblies.
