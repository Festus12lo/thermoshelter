# ML INTEGRITY AUDIT (MODELS A-D)

## Generalization & Leakage
- **Target Definition**: Targets strictly isolate geometric and thermal parameters.
- **Geographic Split**: The "Shimla Holdout" is rigorously enforced. No training, normalization, or model selection data contains Shimla records.
- **Monotonicity**: Model A explicitly obeys thermal monotonicity (greater R-value -> lower U-value).

## Surrogates vs Physics
Models A-D operate strictly as fast candidate synthesis and screening tools. They are **never** allowed to bypass the `ThermalSimulationEngine` or the `EngineeringValidator`.

## Verdict
PASS. The machine learning pipeline is free from target leakage and operates safely within the Truth Hierarchy.
