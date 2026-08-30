# ThermoShelter — Models A, B, and C Architectural Design Integration Report

## 1. Executive Summary & Core Principle

This report documents the integration of **Models A, B, and C** as active statistical machine learning models into the ThermoShelter architectural decision pipeline. Grounded in the foundational principle:

$$\text{AI/ML Recommends} \longrightarrow \text{Physics Proves} \longrightarrow \text{Civil Engineering Validates}$$

The system takes high-level user boundary inputs (Location, Occupancy, Purpose, Thermal Objective, Floor Area) and automatically synthesizes physically coherent, code-compliant architectural designs.

---

## 2. Integrated Model Benchmark Summary

| Model | Component Role | Champion Algorithm | Input Features | Train Score | Val Score | Test (Shimla Holdout) |
|---|---|---|---|---|---|---|
| **Model A** | Envelope / Material Selection | **Decision Tree Classifier** | 13 Context Features | Acc: 0.204, F1: 0.099 | Acc: 0.170, F1: 0.099 | Acc: 0.200, F1: 0.067 |
| **Model B** | Geometry Aspect Ratio & Pitch | **Ridge Linear Regressor** | 13 Context Features | AR MAE: 0.465, Pt: 3.0° | AR MAE: 0.465, Pt: 3.0° | AR MAE: 0.256, Pt: 8.7° |
| **Model C** | Orientation & Solar Potential | **Ridge Linear Regressor** | 14 Solar Context Features | MAE: 214.2 kWh | MAE: 214.2 kWh | MAE: 81.4 kWh ($R^2=-0.104$) |
| **Model D** | Fast Performance Surrogate | **Gradient Boosting Regressor** | 28 Full Design Features | Temp $R^2: 0.999$ | Temp $R^2: 0.985$ | Temp $R^2: 0.965$ ($MAE=0.48^\circ\text{C}$) |

---

## 3. Staged Candidate Search Pipeline

```
                     USER REQUIREMENTS
                             │
                             ▼
                      CONTEXT BUILDER
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
         MODEL A          MODEL B          MODEL C
    Envelope Material     Geometry        Orientation
        Selector         Dimensioning     & Fenestration
            │                │                │
            └────────────────┼────────────────┘
                             │
                             ▼
                     MODEL E SYNTHESIS
                (Generates 36 Candidates)
                             │
                             ▼
                          MODEL D
             Fast ML Surrogate (< 5ms Total)
                             │
                             ▼
                     TOP 6-8 FINALISTS
                             │
                             ▼
                   PHYSICS VERIFICATION
                (ThermalEngine V1 48h Run)
                             │
                             ▼
                  ENGINEERING VALIDATION
            (NBC 2016 / IS 1904 / IS 875 Gate)
                             │
                             ▼
                 MULTI-OBJECTIVE RANKING
            (Comfort, Solar, Cost, Carbon, Safety)
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   🥇 RECOMMENDED DESIGN             5 DISTINCT ARCHETYPES
```

---

## 4. Physical Sanity & Engineering Feasibility Audits

1. **Model A Sanity Gate**: In sub-zero alpine climates ($T_{min} < -10^\circ\text{C}$), uninsulated traditional assemblies ($U > 0.45\text{ W/m}^2\text{K}$) are strictly demoted. Compliant insulated assemblies (`ASM-WALL-LADAKH-INS-MOD` with $U=0.314\text{ W/m}^2\text{K}$) receive top probabilities.
2. **Model B Sanity Gate**: Floor area strictly enforces NBC 2016 and SPHERE humanitarian space allocations ($\ge \max(14.0, N \cdot 3.5)\text{ m}^2$). High snow zones enforce pitches $\ge 25^\circ$.
3. **Model C Sanity Gate**: Directional solar gain in winter climates is highest for True South ($180^\circ$) ($\approx 305\text{ kWh}$), outperforming East ($90^\circ$, $\approx 245\text{ kWh}$) and North ($0^\circ$, $\approx 185\text{ kWh}$).
4. **Engineering Validator (Hard Statutory Gate)**: Non-compliant candidates (e.g. failing frost depth, structural snow load, or WWR limits) are instantly disqualified ($Score = 0.0$), ensuring no unsafe design can become the final recommendation.

---

## 5. Limitations & Future Deep Learning Feasibility

1. **Dataset Scope**: The current dataset contains 1,200 physics-simulated cases across 4 representative Indian climate zones (Leh, Shimla, Jaipur, Karur).
2. **Linear & Tree-Based Baseline Limitations**: While fast and interpretable, linear and shallow tree recommenders exhibit modest classification F1 on small discrete candidate subsets.
3. **Next Phase (Deep Learning Feasibility)**:
   - Benchmark Multi-Layer Perceptrons (MLPs) and Graph Neural Networks (GNNs) on expanded 5,000+ simulation datasets.
   - Evaluate whether multi-task neural networks simultaneously predicting geometry, material, and orientation outperform separate classical baselines.
