# Model D: Fast Performance Surrogate

## 1. Role
- **Target**: Multi-target $[T_{indoor}, Q_{solar}, Q_{loss}]$.
- **Features**: 28 strictly pre-simulation structural and climatic variables.

## 2. Performance & Validity
- **Algorithm**: Gradient Boosting Regressor (MultiOutput).
- **Metrics**: MAE = $3.02^\circ$C on unseen Shimla.
- **Latency**: $0.559$ ms per 50 candidates.
- **Decision**: **KEEP**. This is the core enabler of the pipeline, turning hours of physics simulation into sub-millisecond screening.
