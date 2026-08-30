# Model G: Comfort Evaluator

## 1. Role
- Calculates ASHRAE 55 Adaptive Comfort and Thermal Buffer Index (TBI).

## 2. Validity
- Correctly bounds the neutral temperature based on running mean monthly outdoor temperature.
- TBI formula strictly bounds $[0.0, 1.0]$.
- **Decision**: **KEEP**.
