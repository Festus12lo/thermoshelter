# V1 Thermal Physics Engine

## Model Objective
This is a **reduced-order transient hourly thermal model** intended for prototype design comparison in the ThermoShelter SIH26051 project. The model calculates approximate hourly indoor air temperature based on outdoor weather conditions, shelter geometry, material configuration, openings, orientation, ventilation, and occupancy.

**IMPORTANT LIMITATIONS**: 
- This is **NOT** a certified building-energy simulation (like EnergyPlus)
- This is **NOT** a computational fluid dynamics (CFD) model
- This is **NOT** a full thermal-comfort simulation meeting ASHRAE standards
- This is a **simplified engineering model** for comparing shelter designs under standardized conditions

The model is designed to be **transparent, deterministic, documented, and testable** for use in an internal hackathon prototype.

## Equations Implemented

### 1. Conduction Heat Transfer
For each building envelope component (walls, roof, floor):
```
R_value = R_si + (L / k) + R_se  [unit-area thermal resistance, m²·K/W]
R_total = R_value / A  [total thermal resistance, K/W]
Q_cond = (T_out - T_in) / R_total  [heat flow, W]
```
where:
- L = thickness (m)
- k = thermal conductivity (W/(m·K))
- A = net surface area (m²)
- R_si = interior surface film resistance (0.13 for walls, 0.10 for roofs, 0.17 for floors, m²·K/W per ISO 6946 / ASHRAE Fundamentals)
- R_se = exterior surface film resistance (0.04 m²·K/W per ISO 6946 / ASHRAE Fundamentals)
- T_out = outdoor temperature (°C)
- T_in = indoor temperature (°C)

For multiple layers in series: R_value = R_si + Σ(L_i / k_i) + R_se

### 2. Thermal Mass / Heat Capacitance
For each component:
```
C = ρ * V * cp  [thermal capacitance, J/K]
```
where:
- ρ = density (kg/m³)
- V = volume (m³)
- cp = specific heat (J/(kg·K))

Effective shelter thermal capacitance: C_eff = C_wall + C_roof + C_floor

Temperature update:
```
T_in_next = T_in + (Q_net * Δt) / C_eff
```
where Δt = 3600 seconds (1 hour)

### 3. Solar Gain
```
Q_solar = α * I * A_eff  [W]
```
where:
- α = solar absorptivity (dimensionless)
- I = incident shortwave radiation (W/m²)
- A_eff = effective area exposed to solar radiation (m²)

**V1 Simplification**: Uses same absorptivity for all exterior surfaces and assumes uniform radiation distribution (no directional/shading modeling).

### 4. Ventilation / Infiltration
```
Q_vent = m_dot * cp_air * (T_out - T_in)  [W]
m_dot = ρ_air * V_dot  [kg/s]
V_dot = ACH * V_room / 3600  [m³/s]
```
where:
- ACH = air changes per hour (1/h)
- V_room = indoor volume (m³)
- ρ_air = air density (1.225 kg/m³)
- cp_air = specific heat of air (1005 J/(kg·K))

**V1 Assumption**: Maps qualitative ventilation levels to ACH values:
- sealed: 0.1 ACH
- low: 0.5 ACH  
- medium: 1.0 ACH
- high: 2.0 ACH

### 5. Internal Gains
```
Q_people = N * q_person  [W]
```
where:
- N = number of occupants
- q_person = sensible heat per person (75 W/person - V1 assumption)

### 6. Long-wave Radiation (Simplified)
```
Q_lw = ε * σ * A_eff * (T_out^4 - T_in^4)  [W]
```
where:
- ε = effective emissivity (0.9 - V1 assumption)
- σ = Stefan-Boltzmann constant (5.67×10⁻⁸ W/(m²·K⁴))
- A_eff = effective radiating area (m²)
- T_out, T_in = absolute temperatures (K)

**V1 Assumption**: Uses air temperatures as surface temperature approximation and wall/roof area as effective radiating area.

## Variables and Units
All equations use **SI units consistently**:

- Temperature: °C (for calculations) / K (for radiation equations)
- Length/thickness: meters (m) or millimeters (mm) as specified
- Area: square meters (m²)
- Volume: cubic meters (m³)
- Thermal conductivity: W/(m·K)
- Density: kg/m³
- Specific heat: J/(kg·K)
- Thermal resistance: m²·K/W (R-value) or K/W (total resistance)
- Heat flow/power: Watts (W)
- Energy: Joules (J)
- Time: seconds (s) or hours (h)
- Air changes per hour: 1/h
- Solar radiation: W/m²
- Wind speed: km/h (from weather data)

## Key Assumptions and Simplifications

### 1. **Material Properties**
- Homogeneous, isotropic materials
- Constant properties (no temperature dependence)
- No thermal bridging or interface effects
- Material properties sourced from `data/materials/material_properties.csv`

### 2. **Geometry**
- Simple rectangular shelter shape
- Uniform material thickness
- No complex geometries or thermal bridges
- Window and door areas subtracted from gross wall area
- Roof area adjusted for angle (simple gable assumption)

### 3. **Solar Radiation**
- Uses shortwave_radiation from weather data (W/m²)
- **V1 Limitation**: Does not model directional solar incidence, shading, or surface-specific irradiance
- Assumes uniform radiation on all exterior surfaces
- Uses material solar absorptivity for gain calculation
- Ignores window solar gain (would require SHGC - V2)

### 4. **Ventilation and Infiltration**
- **V1 Limitation**: Uses qualitative ventilation levels mapped to assumed ACH values
- Does not model wind-driven infiltration or stack effect
- Assumes perfect mixing of indoor air
- No HVAC or mechanical ventilation modeling
- Constant air properties (density, cp)

### 5. **Thermal Mass**
- Lumped capacitance approach (no spatial temperature distribution within components)
- Assumes uniform temperature throughout each material component
- No multi-layer finite difference modeling of walls
- Effective capacitance is sum of wall, roof, and floor components

### 6. **Long-wave Radiation**
- **V1 Limitation**: Simplified gray-body approximation
- Uses effective emissivity (0.9) for building envelope
- Assumes uniform surface temperatures equal to air temperatures
- Does not model wavelength-dependent emissivity or view factors
- Sky temperature approximation not implemented (uses outdoor air temperature)

### 7. **Initial Conditions**
- Initial indoor temperature = first hourly outdoor temperature
- Model then evolves dynamically based on hourly energy balance
- No warm-up period or equilibrium assumption

### 8. **Comfort/Risk Assessment**
- **V1 Limitation**: Simple temperature-based categories, not ASHRAE PMV/PPD
- Categories:
  - EXTREME_COLD: < -10°C
  - COLD: -10°C to 5°C
  - ACCEPTABLE: 5°C to 25°C
  - HOT: 25°C to 35°C
  - EXTREME_HOT: > 35°C
- These are engineering assumptions for prototype comparison only

## Input Data Sources

### Weather Data
- Hourly data from frozen CSV files in `data/raw/`:
  - `jaipur_weather_2026.csv`
  - `karur_weather_2026.csv`  
  - `leh_weather_2026.csv`
  - `shimla_weather_2026.csv`
- Variables used: temperature_2m, relativehumidity_2m, shortwave_radiation, windspeed_10m

### Material Properties
- Sourced from `data/materials/material_properties.csv`
- Referenced by material_id in shelter configuration
- Properties: thermal_conductivity_W_mK, density_kg_m3, specific_heat_J_kgK, thermal_emissivity, solar_absorptivity, solar_reflectivity

### Shelter Configuration
- Must conform to `data/shelters/shelter_schema.json`
- Uses material_id references (not duplicated properties)
- Includes geometry, openings, orientation, occupancy, ventilation, site conditions

## Numerical Implementation

### Time Stepping
- Fixed hourly timestep: Δt = 3600 seconds
- Explicit forward Euler integration for temperature update
- No adaptive time stepping

### Solution Procedure (per hour)
1. Calculate shelter geometry (constant for simulation)
2. Calculate thermal mass (constant for simulation)
3. For each weather hour:
   a. Extract weather variables
   b. Calculate conductive heat flows (walls, roof, floor)
   c. Calculate solar gain
   d. Calculate ventilation heat flow
   e. Calculate internal gains
   f. Calculate long-wave radiation
   g. Compute net heat flow
   h. Update indoor temperature using thermal capacitance
   i. Store results

### Validation and Safety Checks
- Input validation for all shelter parameters
- Material ID lookup validation
- Range checks for dimensions, thickness, angles, occupancy
- Division by zero prevention (infinite resistance handled gracefully)
- Physically plausible value checking

## Known Limitations (V1)

### Physical Simplifications
1. **No directional solar modeling**: Ignores sun angle, orientation effects, shading
2. **No moisture physics**: Does not calculate indoor humidity or latent loads
3. **Simplified ventilation**: Qualitative levels to fixed ACH, no wind/stack effects
4. **Lumped thermal mass**: No temperature gradients within building components
5. **Gray-body radiation**: Wavelength-independent emissivity approximation
6. **No thermal bridging**: Assumes uniform material properties throughout assemblies
7. **Simple geometry**: Rectangular prism only, no complex shapes
8. **Constant properties**: No temperature dependence of material properties
9. **No ground coupling**: Floor assumes same outdoor temperature as air
10. **No window thermal modeling**: Windows treated as simple area subtraction

### Accuracy and Applicability
- Intended for **relative comparison** of shelter designs, not absolute prediction
- Best suited for **similar configurations** under same weather conditions
- Quantitative accuracy not guaranteed for absolute temperature prediction
- Should not be used for code compliance or certification purposes
- Appropriate for early-stage design exploration and concept validation

## V2 Improvements Planned

### Enhanced Physics
1. **Directional solar modeling**: Solar incidence angle, shading, surface-specific irradiance
2. **Moisture transport**: Humidity calculations, latent loads, dew point considerations
3. **Advanced ventilation**: Wind-driven infiltration, stack effect, mechanical ventilation
4. **Distributed thermal mass**: Multi-layer finite difference for walls/roofs/floors
5. **Spectral radiation**: Wavelength-dependent emissivity/absorptivity, sky temperature models
6. **Thermal bridging**: Junction correction factors, detailed framing effects
7. **Complex geometry**: Arbitrary shapes, multiple zones, internal partitions
8. **Temperature-dependent properties**: Material property variation with temperature
9. **Ground coupling**: Separate ground temperature model, slab-on-grade effects
10. **Window performance**: U-values, SHGC, frame effects, operable window ventilation

### Enhanced Usability
1. **Automatic unit conversion**: Flexible input units with automatic conversion
2. **Weather data interpolation**: Sub-hourly timesteps, data gap filling
3. **Uncertainty analysis**: Sensitivity analysis, Monte Carlo capabilities
4. **Optimization interface**: Gradient-free and gradient-based design optimization
5. **Visualization tools**: Built-in plotting and result visualization
6. **Export formats**: CSV, JSON, Excel output options
7. **Integration capabilities**: API for coupling with other simulation tools

### Enhanced Validation
1. **Experimental validation**: Comparison with measured data from test shelters
2. **Benchmarking**: Comparison with established tools (EnergyPlus, TRNSYS, etc.)
3. **Code compliance checks**: Integration with building code rule checking
4. **Uncertainty quantification**: Propagation of input uncertainties to outputs

## V1.1 Physics Refinements & Diagnostics

In V1.1, the engine underwent physical consistency, diagnostic transparency, and numerical robustness refinements:

### 1. Boundary Surface Film Thermal Resistance (ISO 6946 / ASHRAE Fundamentals)
Standard interior and exterior air surface film thermal resistances are included for all envelope components:
```
R_assembly = R_si + (L / k) + R_se  [m²·K/W]
```
where:
- Walls: $R_{si} = 0.13\text{ m}^2\text{K/W}$, $R_{se} = 0.04\text{ m}^2\text{K/W}$ ($R_{\text{surf\_total}} = 0.17\text{ m}^2\text{K/W}$)
- Roofs: $R_{si} = 0.10\text{ m}^2\text{K/W}$, $R_{se} = 0.04\text{ m}^2\text{K/W}$ ($R_{\text{surf\_total}} = 0.14\text{ m}^2\text{K/W}$)
- Floors: $R_{si} = 0.17\text{ m}^2\text{K/W}$, $R_{se} = 0.04\text{ m}^2\text{K/W}$ ($R_{\text{surf\_total}} = 0.21\text{ m}^2\text{K/W}$)

This resolves the zero-resistance numerical anomaly for thin/high-conductivity metal walls ($R_{\text{assembly}} \ge 0.17\text{ m}^2\text{K/W}$), ensuring numerical stability without ad-hoc output clipping.

### 2. Full Diagnostic Output Surface
Every hourly simulation result includes rich, transparent diagnostic fields:
- Material conductive resistance: `wall_material_r_value_m2K_W` ($L/k$)
- Assembly air-to-air thermal resistance: `wall_r_value_m2K_W` ($R_{\text{assembly}}$)
- Effective U-value: `wall_u_value_W_m2K` ($U = 1/R_{\text{assembly}}$)
- Component total thermal resistance: `wall_r_total_K_W` ($R / A$)
- Envelope component volume ($V$), density ($\rho$), specific heat ($c_p$), and heat capacity ($C = \rho V c_p$)
- Envelope total effective thermal capacitance: `effective_capacitance_J_K`
- Thermal time constant: `thermal_time_constant_s` and `thermal_time_constant_hours` ($\tau = R_{\text{eq}} \cdot C_{\text{eff}}$)
- Numerical stability indicator: `numerical_stability_status` ("STABLE" if $\Delta t < 2\tau$)
- Hourly energy balance audit: `energy_balance_error_W` ($|Q_{\text{net}} - \sum Q_{\text{components}}|$, strictly $< 10^{-5}\text{ W}$)

### 3. Multi-Climate & Comparative Utilities
- Supports frozen weather datasets across 4 distinct climate zones: Leh (cold/high-altitude solar), Shimla (cold mountain), Jaipur (hot-arid), and Karur (warm-humid).
- Controlled material comparative utility: `compare_materials(shelter_config, location="Leh", hours=24)` evaluates performance metrics across Adobe, Stone, Timber, EPS, and Metal.

### 4. 20-Test Unit Suite
The engine is verified by a 20-test automated suite (`test_thermal_engine.py` and `run_tests_ascii.py`):
1. Very cold Leh conditions
2. Hot Jaipur conditions
3. Same shelter with thin vs thick walls
4. Low-conductivity insulation vs high-conductivity metal
5. No solar vs significant solar radiation
6. Low vs high ventilation
7. Different thermal mass materials
8. Material-property lookup failure handling
9. Metal-wall numerical stability regression test
10. Geometry and opening area validation
11. Thermal resistance and U-value diagnostics
12. Thermal mass capacitance transparency
13. Hourly energy balance accounting audit
14. Radiation numerical safety and non-finite temperature rejection
15. Thermal time constant calculation and numerical stability check
16. Extreme cold climate simulation in Leh
17. Cold mountain climate simulation in Shimla and Leh comparison
18. Hot climate simulation in Jaipur
19. Warm/hot climate simulation in Karur and Jaipur comparison
20. Controlled material performance comparison utility

## Usage Example

```python
from thermal_engine import ThermalEngine, run_v1_simulation, compare_materials

# Define shelter configuration (must match shelter_schema.json)
shelter_config = {
    "shelter_id": "SHEL-LEH-001",
    "shelter_name": "Ladakh Passive Shelter V1",
    "location": "Leh",
    "shelter_length_m": 5.0,
    "shelter_width_m": 4.0,
    "shelter_height_m": 2.8,
    "wall_material_id": "MAT-ADOBE",
    "wall_thickness_mm": 300,
    "roof_material_id": "MAT-THATCH",
    "roof_thickness_mm": 200,
    "roof_type": "pitched",
    "roof_angle_deg": 30,
    "floor_material_id": "MAT-STONE",
    "floor_thickness_mm": 150,
    "shelter_orientation_deg": 0,
    "window_area_m2": 2.0,
    "door_area_m2": 2.0,
    "window_orientation": "S",
    "glazing_type": "double",
    "occupant_count": 2,
    "occupancy_schedule": "full-time",
    "ventilation_level": "medium",
    "elevation_m": 3500,
    "shading_level": "medium",
    "ground_condition": "soil",
    "design_type": "passive"
}

# Run simulation for 24 hours
results = run_v1_simulation(shelter_config, "Leh", hours=24)

# Access diagnostic outputs
for hour_result in results:
    print(f"Hour {hour_result['timestamp']}:")
    print(f"  Indoor Temp: {hour_result['indoor_temperature_C']:.1f}°C")
    print(f"  Wall R-Value: {hour_result['wall_r_value_m2K_W']:.3f} m²K/W, U-Value: {hour_result['wall_u_value_W_m2K']:.3f} W/m²K")
    print(f"  Thermal Time Constant: {hour_result['thermal_time_constant_hours']:.1f} hours ({hour_result['numerical_stability_status']})")
    print(f"  Energy Balance Audit Error: {hour_result['energy_balance_error_W']:.6f} W")

# Compare performance across materials
mat_comparison = compare_materials(shelter_config, location="Leh", hours=24)
for mat in mat_comparison:
    print(f"Material {mat['material_id']}: U={mat['wall_u_value_W_m2K']:.2f} W/m²K, Avg Temp={mat['avg_indoor_temp_C']:.1f}°C")
```

## Files in This Directory
- `thermal_engine.py` - Main V1.1 thermal physics engine implementation
- `README.md` - Technical documentation and reference guide
- `test_thermal_engine.py` - Complete 20-test suite with UTF-8 support
- `run_tests_ascii.py` - Complete 20-test suite with ASCII safety formatting for Windows consoles

## Validation Statement
This V1.1 thermal physics engine has been implemented according to standard building physics principles (ISO 6946 / ASHRAE Fundamentals). It adheres strictly to the frozen datasets in `data/raw/`, `data/materials/material_properties.csv`, and `data/shelters/shelter_schema.json`. It passes 20/20 automated unit tests verifying physical consistency, opening validation, diagnostic outputs, energy balance accounting, radiation safety, thermal time constant calculation, multi-climate performance, and material ranking.

**Remember**: This is a reduced-order transient hourly thermal model intended for prototype design comparison, not a certified building-energy or thermal-comfort simulation.