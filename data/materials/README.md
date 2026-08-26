# V1 Material Properties Dataset

## Purpose of the Dataset
This dataset contains thermal and physical properties for 12 construction materials to be used by the V1 thermal simulation engine in the ThermoShelter project (SIH26051). The properties will feed a physics-based thermal model for:
1. Shelter inside-temperature prediction
2. Solar thermal-energy calculation  
3. Heat-flow calculation
4. Comparison of shelter materials/designs

## Material Selection Rationale
The 12 materials were selected to represent:
- **High-priority Ladakh/Leh construction**: Adobe/mud brick, rammed earth, stone masonry, timber/wood, bamboo, thatch
- **General comparison materials**: Brick masonry, concrete, corrugated metal
- **Modern insulation materials**: Mineral wool/rock wool, EPS insulation, XPS insulation

Ladakh and Shimla are prioritized because:
1. Ladakh represents extreme high-altitude cold climate (primary use case)
2. Shimla provides secondary cold-region comparison (mid-altitude Himalayan)
3. Karur and Jaipur serve as hot-climate comparison cases for validation

## Source Hierarchy
Following the priority specified in the requirements:
1. **ASHRAE Handbook 2025 Chapter 26** - Primary source for most construction materials
2. **NIST** - Used for bamboo properties where available
3. **BIS / Indian Standards** - Consulted where applicable (specific values incorporated via ASHRAE which references international standards)
4. **Peer-reviewed academic research** - Particularly for Ladakh/Himalayan construction and passive cold-climate shelters (values cross-referenced where possible)
5. **Manufacturer technical datasheets** - Used for manufactured insulation materials (EPS, XPS, mineral wool)

## Units
All properties are in SI units:
- Thermal conductivity: W/(m·K)
- Density: kg/m³
- Specific heat: J/(kg·K)
- Thermal emissivity: dimensionless (0-1)
- Solar absorptivity: dimensionless (0-1)
- Solar reflectivity: dimensionless (0-1)
- Default thickness: mm
- Thermal resistance: m²·K/W

## Property Definitions
- **material_id**: Unique numeric identifier
- **material**: Common name of the material
- **material_category**: Broad classification (Earthen construction, Masonry, Wood, Organic, Metal, Insulation)
- **thermal_conductivity_W_mK**: Ability to conduct heat (lower = better insulator)
- **density_kg_m3**: Mass per unit volume
- **specific_heat_J_kgK**: Energy required to raise temperature of 1kg by 1K
- **thermal_emissivity**: Efficiency of thermal radiation emission (important for radiative heat transfer)
- **solar_absorptivity**: Fraction of incident solar radiation absorbed (important for solar heat gain)
- **solar_reflectivity**: Fraction of incident solar radiation reflected
- **default_thickness_mm**: Typical construction thickness used for thermal resistance calculation
- **thermal_resistance_m2K_W**: Calculated as thickness(mm)/1000 / thermal_conductivity (higher = better insulator)
- **source**: Primary source of the data
- **source_url**: URL to the source document
- **source_condition**: Conditions under which properties were measured (temperature, moisture, etc.)
- **confidence**: Assessment of data reliability (High/Medium/Low)
- **notes**: Additional context, assumptions, range information, or calculation details

## Essential Properties for V1
For the V1 thermal simulation engine, the following properties are essential:
- thermal_conductivity_W_mK
- density_kg_m3  
- specific_heat_J_kgK
- thermal_emissivity
- solar_absorptivity
- solar_reflectivity
- default_thickness_mm
- thermal_resistance_m2K_W

## Known Limitations
1. **Material variability**: Natural materials like adobe, rammed earth and adobe have significant variability based on local soil composition, stabilization methods, and moisture content
2. **Temperature dependence**: Some properties (particularly thermal conductivity) vary with temperature; values provided are typically at mean ambient temperature
3. **Age effects**: Long-term thermal performance may differ from initial values due to settling, moisture changes, or degradation
4. **Directional properties**: Anisotropic materials (like wood, bamboo) have different properties along different axes; values represent typical averages
5. **Surface properties**: Emissivity and absorptivity values depend on surface finish and treatment

## Missing Data and Verification Needs
All requested properties have been populated for each material based on available sources. However:

**Values requiring further verification**:
- Bamboo thermal conductivity: Significant variation by species, treatment, and moisture content
- Thatch properties: Highly dependent on straw type, packing density, and weathering
- Adobe/rammed earth: Values assume typical stabilization; local variations may differ

**Properties where ranges were noted but single values selected**:
- Adobe/mud brick thermal conductivity: 0.5-1.0 W/mK (selected 0.7 W/mK as typical)
- Rammed earth thermal conductivity: 1.2-2.0 W/mK (selected 1.5 W/mK for stabilized)
- Stone masonry: Varied significantly by rock type (selected granite as representative)

**Assumptions made**:
1. Where thermal resistance was not directly published, it was calculated as: thickness(m) / thermal_conductivity(W/mK)
2. Solar absorptivity + solar reflectivity ≈ 1.0 (assuming negligible transpiration for opaque materials)
3. Default thicknesses represent typical construction practices, not minimums or maximums
4. Material properties are for dry conditions unless otherwise noted in source_condition

## Files Created
- `data/materials/material_properties.csv` - Contains 12 materials × 17 properties = 204 data points
- `data/materials/README.md` - This documentation file

## Data Quality Summary
- **Total materials**: 12
- **Total properties per material**: 17
- **Populated properties**: 204/204 (100% completion)
- **Missing properties**: 0
- **Sources used**: ASHRAE Handbook 2025, NIST, Manufacturer datasheets
- **Confidence levels**: 10 High, 2 Medium (bamboo, thatch due to natural variability)