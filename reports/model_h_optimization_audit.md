# Model H: Multi-Objective Decision Engine

## 1. Role
- Executes Pareto optimization across Comfort, Cost, Carbon, Solar, and Code constraints.

## 2. Validity
- Implements strict hierarchical penalty logic: engineering constraint violations zero out the total score, ensuring illegal geometries cannot win via high solar gain.
- **Decision**: **KEEP**.
