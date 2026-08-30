# ThermoShelter V2.1 — Core Intelligence Engine Architecture

## 1. High-Level Architecture & Truth Hierarchy

ThermoShelter operates on a foundational truth hierarchy that guarantees physical and structural safety:

$$\mathbf{AI/ML\ Proposes} \longrightarrow \mathbf{Physics\ Proves} \longrightarrow \mathbf{Civil\ Engineering\ Validates} \longrightarrow \mathbf{Optimizer\ Decides} \longrightarrow \mathbf{LLM\ Explains}$$

```
                          USER BRIEF
             (Location, Occupants, Purpose, ...)
                              │
                              ▼
                       CLIMATE CONTEXT
                              │
      ┌───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼
   MODEL A                 MODEL B                 MODEL C
Envelope Performance    Geometry Performance    Passive Solar &
Learner (Conductive     Learner (Aspect Ratio   Orientation Learner
Loss: kWh)              & Pitch)                (Solar Capture: kWh)
      │                       │                       │
      └───────────────────────┼───────────────────────┘
                              │
                              ▼
                           MODEL E
             Architectural Candidate Synthesizer
                 (Generates 30–50 Candidates)
                              │
                              ▼
                           MODEL D
               Fast ML Surrogate (< 5ms Total)
                (Shortlists 6–10 Finalists)
                              │
                              ▼
                   THERMAL PHYSICS SOLVER
                (48h Transient Energy Balance)
                              │
                              ▼
                  CIVIL ENGINEERING GATES
               (NBC 2016 / IS 1904 / IS 875)
                              │
                              ▼
                     MODELS G & H
             Adaptive Comfort & Pareto MCDA
                              │
      ┌───────────────────────┴───────────────────────┐
      ▼                                               ▼
🥇 RECOMMENDED DESIGN                           5 DISTINCT ARCHETYPES
  • 2D Architectural Floor Plan                   • Low-Cost Modular
  • 3D Bounding Mesh Primitives                   • Vernacular Local Heritage
  • 48h Thermal Time-Series                       • High-Performance Passive Solar
  • Heat Flow Decomposition                       • Rapid Emergency
  • Controlled Material Comparison                • Balanced Constructability
```

---

## 2. Component Directory Structure
- `src/thermoshelter/core/`: `DesignState` (immutable single source of truth), `UserRequirements`, `PerformanceVector`, `ScoringLayer`, `NaturalLanguageInterpreter`.
- `src/thermoshelter/features/`: `ContextBuilder`, `FeatureExtractor` (28 tabular leakage-free features).
- `src/thermoshelter/models/`: `ModelA_EnvelopeSelector`, `ModelB_GeometryDesigner`, `ModelC_PassiveSolarDesigner`, `ModelD` (Surrogate), `ModelE_Synthesizer`, `ModelF_Alternatives`, `ModelG_Comfort`, `ModelH_Optimizer`.
- `src/thermoshelter/simulation/`: `PhysicsBridge`, `ThermalEngine` (ISO 6946 transient solver).
- `src/thermoshelter/validation/`: `EngineeringValidator` (statutory codes), `ScientificValidator` (physics checks).
- `src/thermoshelter/export/`: `BlueprintExporter` (2D floor plan, elevation, 3D bounding mesh), `ReportExporter`.
- `src/thermoshelter/engine/`: `ShelterDesignOrchestrator`, `RecursiveDesignOptimizer`.

---

## 3. Data Contracts & Canonical Conventions
- **Canonical Orientation**: $0^\circ = \text{North}, 90^\circ = \text{East}, 180^\circ = \text{South}, 270^\circ = \text{West}$.
- **ISO 6946:2017 Resistance**: $R_{\text{total}} = R_{se} + \sum \frac{d_i}{k_i} + R_{\text{cavity}} + R_{si}$.
- **Civil Engineering Codes**: NBC 2016 minimum habitability ($3.5\text{ m}^2/\text{person}$), IS 1904 frost depth ($1.20\text{ m}$ isolation), IS 875 snow clearance ($\ge 25^\circ$ roof pitch).
