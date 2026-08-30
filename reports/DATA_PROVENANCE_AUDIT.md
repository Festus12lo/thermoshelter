# DATA PROVENANCE AUDIT
**Date**: August 2026

## Core Principle
Every important physical quantity must have documented provenance. The UI and LLM must never represent a synthetic or estimated value as a "live" or "measured" reading.

## Classification Table

| Data Element | Source / Registry | Classification | Notes |
| ------------ | ----------------- | -------------- | ----- |
| **Material Thermal Conductivity** | `material_properties.csv` | DIRECTLY SOURCED | Based on ISO/ASHRAE tables. Values are deterministic. |
| **Material Density (Min/Max)** | `material_properties.csv` | DIRECTLY SOURCED | Bounded to prevent AI hallucination of impossible physics. |
| **Specific Heat Capacity** | `material_properties.csv` | DIRECTLY SOURCED | ISO/ASHRAE Standard references. |
| **Emissivity / Solar Absorptivity** | `material_properties.csv` | DIRECTLY SOURCED | Fixed parameters per material. |
| **Moisture Assumptions** | `material_properties.csv` | ESTIMATED | Soil/Earth assumptions use standard dry conditions. (Risk flagged for Ladakhi climates). |
| **Assembly Thickness** | `DesignState.EnvelopeAssemblies` | CALCULATED | Derived from geometry/ML constraints. |
| **R-Value / U-Value** | `EngineeringValidator` | CALCULATED | Strict ISO 6946 summation ($R = d/\lambda$). |
| **Solar Radiation** | `WeatherAdapter` / `weather_2026.csv` | SYNTHETIC | Currently a synthetic placeholder. **Must be replaced with real EPW data for production.** |
| **Snow Load (kN/m²)** | `SiteState` | ESTIMATED | Parameterized placeholder. Should map to IS 875 Zone definitions. |
| **Frost Depth / Bearing Capacity** | `SiteState` | ESTIMATED | General categorical heuristics. Should require geotechnical survey input in production. |
| **Material Price** | `material_registry.csv` | OBSERVED | Scraped from real-world suppliers (e.g., IndiaMART). Explicitly flagged as "OBSERVED" vs "ESTIMATED". |
| **Supplier Information** | `material_registry.csv` | DIRECTLY SOURCED | Links to real-world URLs. |
| **Availability / Image URL** | `material_registry.csv` | DIRECTLY SOURCED | Explicitly flagged as UNAVAILABLE if null. Never fabricated. |

## Conclusion
The system successfully delineates between physics facts and commercial estimates. Synthetic weather data is properly isolated inside the `WeatherAdapter` and not hard-coded into the `ThermalSimulationEngine`. No synthetic value is silently presented as authoritative in the core pipeline.
