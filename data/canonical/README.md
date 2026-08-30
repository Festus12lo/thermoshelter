# THERMOSHELTER — CANONICAL DATA FOUNDATION REFERENCE

## 1. System Vision & Architecture

The **ThermoShelter Canonical Data Foundation** is the unified, decoupled, and strictly traceable engineering data layer powering AI-assisted climate-responsive shelter design.

The system enforces a strict relational flow:

$$\begin{aligned}
\text{LOCATION} &\longrightarrow \text{WEATHER / CLIMATE} \\
&\longrightarrow \text{SITE CONDITIONS + SHELTER REQUIREMENTS} \\
&\longrightarrow \text{GEOMETRY + ORIENTATION + OPENINGS / SHADING} \\
&\longrightarrow \text{MATERIALS + MULTI-LAYER ASSEMBLIES} \\
&\longrightarrow \text{ENGINEERING / THERMAL RULES} \\
&\longrightarrow \text{DESIGN CASE} \\
&\longrightarrow \text{SIMULATION RUNS} \\
&\longrightarrow \text{ENGINEERING VALIDATION} \\
&\longrightarrow \text{STRUCTURED ML TRAINING EXAMPLES}
\end{aligned}$$

---

## 2. Directory Sitemap & Entity Catalog

All canonical data is stored under `data/canonical/`:

```
data/canonical/
├── provenance/
│   ├── sources.csv                      # Authoritative bibliography and citation registry
│   └── provenance_records.csv           # Property-by-property traceability matrix
├── locations/
│   └── locations.csv                    # Geographical, climatic, and degree-day metadata
├── weather/
│   ├── weather_datasets.csv             # Time-series dataset catalog and metadata
│   └── weather_observations_manifest.csv# Manifest mapping to hourly raw observations
├── site/
│   └── site_conditions.csv             # Terrain, soil, frost depth, snow, and seismic loads
├── requirements/
│   └── shelter_requirements.csv        # Statutory regulations and performance criteria
├── geometry/
│   ├── geometry_types.csv              # Classification (Known, User, Research, AI Candidate)
│   └── geometry_parameters.csv         # Parametric dimensions, areas, volumes, and constraints
├── orientation/
│   └── orientations.csv                # Azimuths, surface normal vectors, and solar logic
├── openings/
│   └── openings.csv                    # Windows, doors, rabsal sunspaces, U-values, and SHGC
├── passive_design/
│   ├── shading_strategies.csv          # Overhangs, fins, and seasonal shading factors
│   └── passive_design_strategies.csv   # Direct gain, thermal mass, Trombe walls, night purge
├── materials/
│   ├── materials.csv                   # Master catalog of 16 building materials
│   ├── material_properties.csv         # Physical, thermal, and hygrothermal properties
│   └── material_id_aliases.csv         # Backward-compatibility mapping (V1 numeric, MAT-*, MAT-V2-*)
├── assemblies/
│   ├── assemblies.csv                  # Wall, Roof, and Floor multi-layer composite assemblies
│   └── assembly_layers.csv             # Layer-by-layer sequence from exterior to interior
├── construction/
│   └── construction_methods.csv        # Structural systems, labor skill, and carbon ratings
├── engineering/
│   ├── engineering_rules.csv           # Pass/fail constraint expressions and severity tiers
│   └── thermal_rules.csv               # Climate-specific component U/R/Capacitance thresholds
├── design_cases/
│   └── design_cases.csv                # Central unified composite design cases
├── simulations/
│   ├── simulations.csv                 # Simulation run metadata, engines, and parameters
│   └── simulation_results.csv          # Aggregated thermal comfort, fluxes, and time constants
├── validation/
│   └── validation_results.csv          # Rule compliance evaluations (PASS/FAIL/WARNING)
├── training/
│   ├── training_examples.json          # High-dimensional supervised training records for ML
│   └── training_examples.csv           # Flattened summary table of training examples
├── schemas/                            # Draft-07 JSON Schemas for all entities
└── validation_summary.json             # Machine-readable 49-check audit report
```

---

## 3. Stable Identifier Standard

Every record possesses an immutable, namespaced identifier:

| Entity | ID Format | Example |
|---|---|---|
| Sources | `SRC-<PUBLISHER>-<YEAR>-<CODE>` | `SRC-ASHRAE-2025-CH26`, `SRC-LADAKH-REGS-2023` |
| Provenance | `PROV-<NUM>` | `PROV-001` |
| Locations | `LOC-<COUNTRY>-<CITY>` | `LOC-IN-LEH`, `LOC-IN-SHIMLA` |
| Weather Datasets | `WEA-<COUNTRY>-<CITY>-<YEAR>` | `WEA-IN-LEH-2026` |
| Site Conditions | `SITE-<CITY>-<CONTEXT>` | `SITE-LEH-HIGH-VALLEY` |
| Requirements | `REQ-<REGION>-<NUM>` | `REQ-LADAKH-001` |
| Geometry Types | `GEOM-TYPE-<NAME>` | `GEOM-TYPE-RECT-PITCHED` |
| Geometry Parameters| `GEOM-<REGION>-<NAME>-<NUM>` | `GEOM-LEH-PASSIVE-01` |
| Orientations | `ORI-<NAME>` | `ORI-SOLAR-OPTIMAL-SOUTH` |
| Openings | `OPN-<LOCATION>-<FACADE>-<TYPE>`| `OPN-LEH-SOUTH-WIN` |
| Shading | `SHD-<NAME>` | `SHD-OVERHANG-SOUTH-01` |
| Passive Strategies | `PAS-STRAT-<NAME>` | `PAS-STRAT-DIRECT-GAIN` |
| Materials | `MAT-<NAME>` | `MAT-ADOBE`, `MAT-CSEB`, `MAT-ROCKWOOL` |
| Material Properties| `PROP-MAT-<NAME>` | `PROP-MAT-ADOBE` |
| Assemblies | `ASM-<COMPONENT>-<REGION>-<NAME>`| `ASM-WALL-LADAKH-IMP-TRAD`, `ASM-ROOF-LADAKH-TRAD` |
| Assembly Layers | `LAY-<ASM_ABBR>-<ORDER>` | `LAY-WIMP-3` |
| Construction Methods| `CONST-<NAME>` | `CONST-EARTHEN-MASONRY` |
| Engineering Rules | `RULE-ENG-<NUM>` | `RULE-ENG-001` |
| Thermal Rules | `TH-RULE-<CLIMATE>-<COMP>` | `TH-RULE-COLD-WALL` |
| Design Cases | `CASE-<LOCATION>-<NAME>` | `CASE-LEH-PASSIVE-V1` |
| Simulations | `SIM-RUN-<CASE>-<NUM>` | `SIM-RUN-LEH-PASSIVE-01` |
| Simulation Results | `RES-SIM-<CASE>-<NUM>` | `RES-SIM-LEH-PASSIVE-01` |
| Validations | `VAL-<LOCATION>-<NUM>` | `VAL-LEH-001` |
| Training Examples | `TRAIN-EX-<LOCATION>-<NUM>` | `TRAIN-EX-LEH-001` |

---

## 4. Workflows for Extending Canonical Datasets

### A. How to Add a New Material
1. Open `data/canonical/materials/materials.csv` and add a new row with stable ID `MAT-<NAME>`, category, availability, local sourcing classification (`LOCAL_PRIMARY`, `IMPORTED`, or `HYBRID`), and fire classification.
2. In `data/canonical/materials/material_properties.csv`, insert the property record with `PROP-MAT-<NAME>`, citing an authoritative source ID from `sources.csv`.
3. If a property is unknown, record it explicitly as `NOT_AVAILABLE`. **Never guess or invent conductivity, density, or specific heat.**
4. In `data/canonical/provenance/provenance_records.csv`, log a verification status (`VALUE_VERIFIED` or `VALUE_NOT_VERIFIED`).
5. Run `python scripts/validate_canonical_data.py` to confirm referential integrity.

### B. How to Add a New Multi-Layer Assembly
1. Register the assembly in `data/canonical/assemblies/assemblies.csv` with `ASM-<WALL|ROOF|FLOOR>-<REGION>-<NAME>`.
2. Compute the total thermal resistance $R_{total} = R_{se} + \sum (d_i / k_i) + R_{cavity} + R_{si}$ per ISO 6946:2017 and U-factor $U = 1/R_{total}$.
3. In `data/canonical/assemblies/assembly_layers.csv`, list all layers from exterior (Layer 1) to interior (Layer $N$) referencing valid `material_id`s.
4. Run validation checks.

### C. How to Create a Design Case & Generate ML Training Examples
1. In `data/canonical/design_cases/design_cases.csv`, assemble references to:
   - `location_id`
   - `weather_dataset_id`
   - `site_condition_id`
   - `geometry_id`
   - `orientation_id`
   - `wall_assembly_id`
   - `roof_assembly_id`
   - `floor_assembly_id`
   - `construction_method_id`
2. Execute the simulation engine to generate `simulations.csv` and `simulation_results.csv`.
3. Run the engineering rule checker to evaluate compliance (`validation_results.csv`).
4. Package the resulting feature vector (Climate + Site + Target Requirements $\longrightarrow$ Recommended Design + Validated Thermal Performance) into `training/training_examples.json`.
5. Specify `provenance_type` as `PHYSICS_SIMULATION`, `REAL_OBSERVATION`, or `SYNTHETIC`.

---

## 5. Scientific Provenance & Non-Fabrication Rules

1. **Explicit Missing State**: If empirical research has not produced a validated property (e.g. bamboo moisture permeability), the field must strictly be set to `NOT_AVAILABLE`.
2. **Synthetic Data Quarantine**: Any AI-generated synthetic sample must be explicitly labeled `provenance_type = SYNTHETIC` with a confidence penalty and must never be merged into baseline ground truth.
3. **No Uncalibrated Engineering Certification**: Validation results indicate compliance with specific codified rules (`RULE-ENG-001` etc.), not licensed professional engineer certification.
