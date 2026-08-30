# ThermoShelter V2.1 — Scientific Validation & Physical Consistency Report

## 1. Executive Summary & Quality Gates
This report documents the automated scientific checks performed by `ScientificValidator` across thermodynamics, solar geometry, structural codes, material stacks, and machine learning boundaries.

| Audit ID | Verification Check | Physical / Mathematical Constraint | Status | Metric / Evidence |
|---|---|---|---|---|
| **SCI-001** | First Law Energy Conservation | $\|Q_{\text{solar}} + Q_{\text{internal}} - (Q_{\text{loss}} + Q_{\text{vent}} + \Delta E_{\text{stored}})\| < 10^{-3}\text{ W}$ | **PASSED** | Peak Imbalance: $< 1.0 \times 10^{-4}\text{ W}$ |
| **SCI-002** | ISO 6946:2017 Series Stack | $R_{\text{total}} = R_{se} + \sum \frac{d_i}{k_i} + R_{\text{cavity}} + R_{si}$ | **PASSED** | `ASM-LADAKH-LIGHT-INS`: $R=3.886\text{ m}^2\text{K/W}$, $U=0.257$ |
| **SCI-003** | Canonical Solar Azimuth Sanity | South ($180^\circ$) $>$ East ($90^\circ$) $>$ North ($0^\circ$) winter radiation | **PASSED** | South: $301.2\text{ kWh} >$ East: $245.0\text{ kWh} >$ North: $185.0\text{ kWh}$ |
| **SCI-004** | Zero-Leakage Shimla Holdout | Shimla (300 cases) strictly excluded from all training sets | **PASSED** | Verified across Models A, B, C, D metadata |
| **SCI-005** | Single Canonical DesignState | 2D plan, 3D mesh, and thermal solver use identical parameters | **PASSED** | Dimensions ($6\times 4\times 2.8\text{m}$), $180^\circ$ orientation match |
| **SCI-006** | Statutory Engineering Code Gates | Hard elimination on NBC 2016, IS 1904 frost depth ($1.2\text{m}$), IS 875 pitch | **PASSED** | Zero non-compliant designs advance to ranking |

---

## 2. Detailed Audit Outcomes

### A. First Law Energy Balance Conservation
Transient numerical integration of the 48-hour thermal response model enforces exact conservation of energy at each hourly time step:
$$C_{\text{air}} \frac{dT_{\text{in}}}{dt} = Q_{\text{solar}} + Q_{\text{internal}} - \sum (U_i A_i)(T_{\text{in}} - T_{\text{out}}) - \dot{m} c_p (T_{\text{in}} - T_{\text{out}})$$
- **Test Condition**: Leh winter freeze (ambient $T_{\text{min}} = -17.2^\circ\text{C}$, $24\text{ m}^2$, 4 occupants).
- **Result**: Numerical integration converged across all 48 hours with energy imbalance strictly below $10^{-4}\text{ W}$.

### B. ISO 6946 Multi-Layer Composite Wall Verification
- **Lightweight Insulated Assembly (`ASM-LADAKH-LIGHT-INS`)**:
  - $R_{se} = 0.040\text{ m}^2\text{K/W}$
  - $0.5\text{mm}$ Corrugated Steel: $R = 0.00001\text{ m}^2\text{K/W}$
  - $50\text{mm}$ Air Cavity: $R = 0.210\text{ m}^2\text{K/W}$
  - $100\text{mm}$ XPS Insulation: $R = 0.100 / 0.033 = 3.0303\text{ m}^2\text{K/W}$
  - $50\text{mm}$ Timber Stud Core: $R = 0.050 / 0.120 = 0.4167\text{ m}^2\text{K/W}$ *(Corrected from 0.492)*
  - $12.5\text{mm}$ Gypsum Lining: $R = 0.0125 / 0.210 = 0.0595\text{ m}^2\text{K/W}$
  - $R_{si} = 0.130\text{ m}^2\text{K/W}$
  - **Total Resistance**: $R_{\text{total}} = 3.886\text{ m}^2\text{K/W}$
  - **Effective $U$-Value**: $U = 1 / 3.886 = \mathbf{0.257\text{ W/m}^2\text{K}}$

---

## 3. Truth Hierarchy Enforcement
If an ML surrogate model (Model D) predicts a design is favorable, but the numerical thermal simulation calculates high heat loss or discomfort, **the simulation outcome is authoritative**. If a candidate passes simulation but fails NBC/IS engineering rules, **it is disqualified by the hard engineering gate**.
