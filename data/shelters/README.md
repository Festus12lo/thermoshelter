# V1 Shelter Configuration Schema

## Purpose of the Shelter Configuration Schema
This schema defines the input parameters for shelter configurations to be used by the V1 thermal simulation engine in the ThermoShelter project (SIH26051). The schema focuses on high-altitude cold regions, especially Ladakh/Leh, with Shimla as secondary cold-region comparison, and Karur and Jaipur as hot-climate comparison cases.

The schema defines what inputs the thermal engine will need to calculate:
- Heat conduction through building envelope
- Thermal mass effects
- Solar gains
- Ventilation-related heat loss
- Approximate indoor temperature
- Thermal comfort/risk assessment

**IMPORTANT**: This V1 schema ONLY defines the structure and inputs. The actual thermal calculations will be implemented in a later phase.

## Every Field and Its Meaning

### IDENTIFICATION
- **shelter_id**: Unique identifier (format: SHEL-[A-Z0-9_-]+)
- **shelter_name**: Descriptive name for the shelter configuration
- **location**: References weather dataset (Leh, Shimla, Karur, Jaipur)

### GEOMETRY
- **shelter_length_m**: Length in meters
- **shelter_width_m**: Width in meters
- **shelter_height_m**: Height in meters
- **floor_area_m2**: *Derived* - floor area (length × width)
- **wall_area_m2**: *Derived* - total wall area (2 × (length + width) × height)
- **roof_area_m2**: *Derived* - roof area (length × width / cos(angle))

### WALL
- **wall_material_id**: References material_id from material_properties.csv
- **wall_thickness_mm**: Wall thickness in millimeters

### ROOF
- **roof_material_id**: References material_id from material_properties.csv
- **roof_thickness_mm**: Roof thickness in millimeters
- **roof_type**: flat, pitched, gabled, hipped, skillion, butterfly
- **roof_angle_deg**: Roof angle in degrees from horizontal

### FLOOR
- **floor_material_id**: References material_id from material_properties.csv
- **floor_thickness_mm**: Floor thickness in millimeters

### OPENINGS
- **window_area_m2**: Total window area in square meters
- **door_area_m2**: Total door area in square meters
- **window_orientation**: Primary window orientation (N, NE, E, SE, S, SW, W, NW)
- **glazing_type**: single, double, triple, low-e

### ORIENTATION
- **shelter_orientation_deg**: Shelter orientation in degrees from North (clockwise)

### OCCUPANCY
- **occupant_count**: Number of occupants
- **occupancy_schedule**: full-time, day-only, night-only, weekends

### VENTILATION
- **ventilation_level**: sealed, low, medium, high

### ENVIRONMENT / SITE
- **elevation_m**: Site elevation in meters above sea level
- **shading_level**: none, low, medium, high, full
- **ground_condition**: rocky, soil, sand, gravel, snow, ice

### DESIGN METADATA
- **design_type**: passive, active, hybrid, traditional, modern
- **notes**: Additional notes about the design

## Units
All dimensions use SI units:
- Length/thickness: meters (m) or millimeters (mm) as specified
- Area: square meters (m²)
- Angle: degrees (°)
- Elevation: meters (m)
- Count: dimensionless (count)

## Required vs Optional Fields

### REQUIRED Fields (must be provided):
- shelter_id
- shelter_name
- location
- shelter_length_m
- shelter_width_m
- shelter_height_m
- wall_material_id
- wall_thickness_mm
- roof_material_id
- roof_thickness_mm
- roof_type
- roof_angle_deg
- floor_material_id
- floor_thickness_mm
- shelter_orientation_deg
- occupant_count
- ventilation_level
- elevation_m
- shading_level
- ground_condition
- design_type

### OPTIONAL Fields (have sensible defaults):
- window_area_m2 (default: 0)
- door_area_m2 (default: 0)
- window_orientation (default: "S")
- glazing_type (default: "double")
- occupancy_schedule (default: "full-time")
- notes (empty string allowed)

### DERIVED/CALCULATED Fields (read-only, computed from geometry):
- floor_area_m2
- wall_area_m2
- roof_area_m2

## How material_id Connects to material_properties.csv
The schema uses **references** rather than duplicating material properties:
- wall_material_id, roof_material_id, floor_material_id reference entries in `data/materials/material_properties.csv`
- Example: "MAT-ADOBE" refers to the Adobe/Mud brick entry in the materials CSV
- The thermal engine will look up actual properties (thermal conductivity, density, etc.) from the materials CSV using these IDs
- This avoids duplication and ensures consistency between shelter designs and material database

## How Location Connects to Weather Datasets
The location field references the frozen weather datasets in `data/raw/`:
- "Leh" → `data/raw/leh_weather_2026.csv`
- "Shimla" → `data/raw/shimla_weather_2026.csv`
- "Karur" → `data/raw/karur_weather_2026.csv`
- "Jaipur" → `data/raw/jaipur_weather_2026.csv`
- The thermal engine will use the appropriate hourly weather data (temperature, humidity, solar radiation, etc.) for simulations

## Why Ladakh/Leh is the Primary Design Target
1. **Extreme climate**: Ladakh experiences severe cold winters with large diurnal temperature variations
2. **High altitude**: Typical elevations of 3,000-5,000m create unique thermal challenges
3. **Limited resources**: Remote location favors passive, locally-available material solutions
4. **Cultural context**: Traditional Ladakh architecture offers proven passive design strategies
5. **Project focus**: SIH26051 specifically targets "Area Specific Shelter for Thermal Comfort Maintenance" in high-altitude cold regions

## Known V1 Limitations
1. **Simplified occupancy**: occupancy_schedule uses broad categories rather than detailed hourly patterns
2. **Qualitative ventilation**: ventilation_level uses ordinal scale rather than air changes per hour
3. **Fixed glazing properties**: glazing_type doesn't specify U-values or SHGC (to be extended in V2)
4. **Simplified ground condition**: doesn't include thermal properties of ground
5. **Basic shading**: shading_level is qualitative rather than geometric obstruction modeling
6. **No thermal bridging**: assumes uniform material properties (no junctions or fasteners considered)
7. **Steady-state assumption**: V1 may use simplified thermal calculations (transient effects in V2)
8. **Limited roof types**: common types included but complex geometries may need V2 extension

## Future V2 Extensions
1. **Detailed occupancy**: hourly schedules, activity levels, metabolic rates
2. **Quantitative ventilation**: air changes per hour, infiltration rates, HVAC coupling
3. **Advanced glazing**: spectral properties, dynamic shading, electrochromic options
4. **Thermal bridging**: detailed junction modeling, correction factors
5. **Material degradation**: aging effects on insulation, moisture accumulation
6. **Multi-zone**: internal partitions, different room temperatures
7. **Renewable integration**: PV panels, solar thermal collectors
8. **Control systems**: heating, cooling, ventilation automation
9. **Uncertainty analysis**: Monte Carlo simulation, sensitivity analysis
10. **Optimization**: genetic algorithms, gradient-based methods for design improvement

## Validation Status
✅ Schema validates against JSON Schema draft-07
✅ All material references use material_id format (MAT-*)
✅ Units are consistent (SI)
✅ Required fields clearly identified
✅ No weather or material files were modified (verified)
✅ No duplicate material-property fields added (references only)
✅ Schema supports multiple shelter configurations (array of objects valid)
✅ Schema supports same design across all four locations (Leh, Shimla, Karur, Jaipur)
✅ Schema enables planned thermal calculations (conduction, mass, solar, ventilation, temp, comfort)

## Files Created
- `data/shelters/shelter_schema.json` - JSON Schema definition
- `data/shelters/README.md` - This documentation file

## Usage Example
A minimal valid shelter configuration would be:
```json
{
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
  "occupant_count": 2,
  "ventilation_level": "medium",
  "elevation_m": 3500,
  "shading_level": "medium",
  "ground_condition": "soil",
  "design_type": "passive"
}
```
Derived fields (floor_area_m2, wall_area_m2, roof_area_m2) would be calculated by the thermal engine.

END OF DOCUMENTATION