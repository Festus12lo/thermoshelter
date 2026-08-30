# System Architecture Audit

## 1. Repository Map
- `data/`: CSV configuration data, material property datasets, synthetic weather files.
- `models/`: Joblib serialized bundles and JSON metadata.
- `src/thermoshelter/`: Core source code.
  - `core/`: Immutable DesignState, UserRequirements.
  - `engine/`: Orchestrator tying pipeline together.
  - `export/`: 2D floor plans, 3D mesh definitions.
  - `features/`: Feature extraction and climate context building.
  - `models/`: Models A-H implementations.
  - `pipeline/`: Model training pipelines.
  - `simulation/`: PhysicsBridge to V1 thermal engine.
  - `validation/`: Engineering and Scientific validators.
- `tests/`: 51 unit and integration tests.
- `scripts/`: Training and demo scripts.

## 2. Findings
- **V1/V2 Separation**: V1 code primarily resides in `data/thermal/thermal_engine.py`. V2 introduces a completely new architectural pipeline (`src/thermoshelter`) cleanly wrapped around the V1 physics engine via `PhysicsBridge`.
- **Hardcoded Constants**: Safe. `ContextBuilder` gracefully bounds user inputs (e.g., occupant floor area bounds). `EngineeringValidator` extracts standard rules.
- **Dead Code**: Minor V1 artifacts in legacy scripts, but the V2 engine `Orchestrator` relies exclusively on strictly typed V2 components.
