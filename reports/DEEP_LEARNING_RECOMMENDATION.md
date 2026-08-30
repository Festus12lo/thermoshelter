# THERMOSHELTER V2 — DEEP LEARNING ARCHITECTURE RECOMMENDATION

## 1. Executive Summary

As the Senior AI/ML Architect and Building Physics Engineer, I have evaluated the current machine learning architecture (Models A-D) against the theoretical adoption of Deep Learning (DL) neural surrogates (e.g., PyTorch/TensorFlow).

**Verdict**: Deep Learning is **NOT JUSTIFIED** for the current thermal envelope and conceptual geometry prediction tasks. The existing interpretable ensemble models (Random Forests, Gradient Boosting) should be retained for V2 production.

## 2. Scientific & Computational Analysis

### A. Data Efficiency vs. Complexity
- **Current State**: ThermoShelter operates on tabular physical parameters (U-values, R-values, Geometry Aspect Ratios, Solar Gains).
- **DL Requirement**: Deep Neural Networks (DNNs) are notoriously data-hungry and prone to catastrophic overfitting on structured, low-dimensional physical datasets.
- **Conclusion**: Tree-based ensembles perform identically or better on low-dimensional physics tabular data while requiring 100x less training data.

### B. Traceability & Engineering Validation
- **The Core Mandate**: `AI/ML PROPOSES -> PHYSICS PROVES -> ENGINEERING VALIDATES`.
- **DL Risk**: DNNs are "black boxes." In civil and structural engineering, a model proposing an invalid wall thickness due to latent space hallucination is a critical safety risk.
- **Current Advantage**: Current models provide exact feature importance. We know *why* a material was selected (e.g., "Model A heavily weighted external temperature").

### C. Target Leakage & Boundary Conditions
- **DL Risk**: Neural networks are exceptionally skilled at discovering and exploiting data leakage (e.g., implicitly learning the target from highly correlated physical bounds).
- **Mitigation**: The current system enforces strict separation of variables (e.g., U-value vs Material ID).

## 3. Future Deep Learning Roadmap (V3)

While DL is rejected for basic parametric surrogates, it is highly recommended for the following future V3 modules:

1. **CFD Neural Surrogates**: Training Graph Neural Networks (GNNs) or 3D CNNs to predict interior airflow and wind pressure coefficients around complex topographies, replacing computationally expensive OpenFOAM simulations.
2. **Computer Vision for Procurement**: Processing raw satellite imagery or site photographs to automatically classify soil types or detect local vernacular materials.
3. **Generative 3D Design**: Using Diffusion Models or VAEs to generate complex mesh topologies that are then constrained by our existing `StructuralValidator`.

## 4. Final Recommendation for V2 Hackathon Submission

Retain the current surrogate architecture (Models A-D). It is scientifically robust, strictly adheres to the truth hierarchy, prevents target leakage, and runs fast enough for real-time edge deployment in emergency shelter scenarios. Focus all remaining V2 efforts on ensuring the Engineering Validator strictly gates all ML proposals.
