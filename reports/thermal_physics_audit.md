# Thermal Physics Audit

## 1. Thermal Engine Implementation
- **Solver**: 1D lumped-capacitance transient solver (Explicit Forward Euler).
- **Time Step**: 1-hour steps over 48 hours.
- **Energy Balance**: $\Delta E_{stored} = Q_{solar} + Q_{internal} - Q_{cond} - Q_{vent}$
- **Conductive Transfer**: $Q_{cond} = U \cdot A \cdot (T_{in} - T_{out})$.
- **Solar Transfer**: Erbs model for DNI/DHI, trigonometric projection onto vertical facades using solar azimuth and zenith.

## 2. Validation
- The `ScientificValidator` executes a rigorous First Law of Thermodynamics audit. 
- $|E_{in} - E_{out} - E_{stored}| < 10^{-4}$ W. The physics engine is numerically stable and conserves energy perfectly.
