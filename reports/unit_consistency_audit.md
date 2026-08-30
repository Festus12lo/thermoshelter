# Unit & Dimension Consistency Audit

## 1. Physical Units
- **Energy**: kWh used for cumulative metrics ($Q_{solar}$, $Q_{loss}$). 
- **Power**: W used for instantaneous transient calculations ($Q(t)$).
- **Temperature**: $^\circ$C used for indoor/outdoor tracking and reporting. Transient solver $\Delta T$ differences natively apply.
- **Resistance**: m2K/W strictly maintained across ISO 6946.
- **Transmittance**: W/m2K used for U-values.

## 2. Transformations
- Conversions between mm (in CSVs) and m (in physics) are strictly handled: $d(m) = d(mm) / 1000$.
- Energy accumulations correctly sum Watts over 1-hour timesteps and divide by 1000 for kWh tracking.
