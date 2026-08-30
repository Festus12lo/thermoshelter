# Geometry Consistency Audit

## 1. Canonical State
- There is only ONE source of truth: `DesignState.geometry`.
- The 2D export (`BlueprintExporter`) and the 1D lumped physics (`ThermalEngine`) pull dimensions from the exact same variables ($L$, $W$, $H_{ridge}$).
- **Status**: PASS. Zero dimensional duplication.
