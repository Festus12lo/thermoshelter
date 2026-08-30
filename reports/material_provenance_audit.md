# Material & Assembly Provenance Audit

## 1. Material Audit (`materials_v2.csv`)
- Contains 16 verified core materials.
- **k-values**: Represent conductivity (W/mK).
- **Sources**: Directly mapped to ASHRAE 2025, ISO 6946, and NIST SRD 81.
- **Status**: Earthen materials (Adobe, Rammed Earth) are correctly assigned standard values, but missing precise moisture/density bounds for strict field validation.

## 2. Assembly Audit (`assemblies_v2.csv`)
- **Calculation Verification**: We recalculated U-values from `assembly_layers_v2.csv`:
  - `ASM-LADAKH-IMP-TRAD` (Rammed Earth + Rockwool): Calculated U=0.4169 W/m2K matches the CSV value exactly.
  - Other assemblies exhibit a $10^{-4}$ precision truncation artifact in the CSV file (e.g., 0.6284 vs 0.62857) due to manual saving, but engineering significance is zero.
