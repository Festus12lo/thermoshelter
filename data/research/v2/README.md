# THERMOSHELTER V2 — Authoritative Material & Shelter Assembly Research

## Executive Overview

This dataset establishes an authoritative, source-backed foundation for **V2 high-altitude cold-region shelter design**, shifting the project from simple single-material thermal modeling toward **layered multi-component assembly modeling**:

$$\text{MATERIAL} \longrightarrow \text{LAYER} \longrightarrow \text{ASSEMBLY} \longrightarrow \text{SHELTER} \longrightarrow \text{CLIMATE} \longrightarrow \text{THERMAL PERFORMANCE}$$

Primary emphasis is placed on **Ladakh / Leh** (high altitude, sub-zero winter temperatures down to $-15^\circ\text{C}$, intense high-altitude solar radiation $>800\text{ W/m}^2$) and **Shimla** (cold mountain climate with high seasonal rainfall and humidity), with comparative benchmarks for **Jaipur** and **Karur**.

---

## Directory Architecture & Dataset Sitemap

All V2 research assets are strictly located in `data/research/v2/`:

```
data/research/v2/
├── README.md                  # This documentation file
├── source_registry.csv        # Master registry of primary & secondary authoritative sources
├── materials_v2.csv           # 16-material database with 26 physical & hygrothermal attributes
├── material_sources.csv       # Property-by-property traceability & measurement condition matrix
├── assemblies_v2.csv          # 6 realistic building envelope assemblies with U-values & design logic
├── assembly_layers_v2.csv     # Layer-by-layer breakdown (EXTERIOR to INTERIOR) per ISO 6946:2017
└── ladakh_requirements.csv    # 10 extracted requirements from Ladakh Building Regulations 2023
```

> [!IMPORTANT]
> **V1 Baseline Protection Statement**: All V1 baseline files (`data/raw/*.csv`, `data/materials/material_properties.csv`, `data/shelters/shelter_schema.json`, `data/thermal/*.py`, and UI/database files) remain **100% untouched**.

---

## Authoritative Source Hierarchy

Every property value and calculation in this dataset is fully traceable:

### Primary Sources
1. **ASHRAE Handbook 2025 Chapter 26 (SI)** — [`SRC-ASHRAE-2025-CH26`](https://handbook.ashrae.org/Handbooks/F25/SI/F25_Ch26/F25_Ch26_si.aspx)
   - Generic reference thermophysical properties: thermal conductivity ($k$), density ($\rho$), specific heat ($c_p$), thermal emissivity ($\varepsilon$), solar absorptance ($\alpha$), and water vapor permeability.
2. **ISO 6946:2017** — [`SRC-ISO-6946-2017`](https://www.iso.org/standard/65708.html)
   - International calculation standard for thermal resistance ($R$) and transmittance ($U$-value) of building components, boundary air film resistances ($R_{si}=0.13\text{ m}^2\text{K/W}$ horizontal, $R_{se}=0.04\text{ m}^2\text{K/W}$ exterior), and unventilated air cavity thermal resistance ($R=0.210\text{ m}^2\text{K/W}$ for 50mm cavity).
3. **Ladakh Standardized Development and Building Regulations 2023** — [`SRC-LADAKH-REGS-2023`](https://www.bis.gov.in/wp-content/uploads/2024/02/20240115-Ladakh-Final-Standardized-Development-and-Building-Regulations.pdf)
   - Climatic design guidelines, passive solar orientation mandates (East-West long axis), double-glazing requirements, eco-friendly material usage ($\ge 50\%$ local stone/CSEB/earth), and thermal insulation targets.
4. **National Building Code of India 2016** — [`SRC-NBC-INDIA-2016`](https://www.bis.gov.in/standards/national-building-code/?lang=en)
   - Indian national standards for natural ventilation, window-to-wall ratios, air infiltration weather-sealing, and building envelope moisture protection.

### Secondary Sources
- **ISO 10456:2007** — Hygrothermal conversion factors for temperature and moisture.
- **NIST Building Materials Database SRD 100** — Wood and bamboo material reference properties.
- **Manufacturer Technical Datasheets** — Rockwool Group, EPS Industry Alliance, and Dow Chemical STYROFOAM XPS datasheets for specific insulation product properties.

---

## ISO 6946 Assembly Transmittance ($U$-Value) Methodology

Assembly thermal resistance and transmittance are calculated using standard ISO 6946 series resistance equations:

$$R_i = \frac{d_i}{\lambda_i} \quad [\text{m}^2\cdot\text{K/W}]$$

$$R_{\text{total}} = R_{se} + \sum_{i=1}^n R_i + R_{\text{cavity}} + R_{si} \quad [\text{m}^2\cdot\text{K/W}]$$

$$U = \frac{1}{R_{\text{total}}} \quad [\text{W/}(\text{m}^2\cdot\text{K})]$$

All layer thermal resistances are classified as either **`DIRECTLY SOURCED`** (e.g. boundary film $R_{si}$, $R_{se}$, or cavity $R$) or **`CALCULATED`** ($R = d / k$).

---

## Researched Building Envelope Assemblies

| Assembly ID | Assembly Name | Target Region | Total Thickness | $R_{\text{total}}$ (m²K/W) | Effective $U$-Value (W/m²K) | Core Strategy |
|---|---|---|---|---|---|---|
| **`ASM-LADAKH-TRAD`** | Ladakh Traditional Passive Shelter | Leh | 450.0 mm | `0.813` | **`1.230`** | Traditional high thermal mass ($C_{\text{wall}}=34.6\text{ MJ/K}$) using 450mm stone/adobe + thatch roof. |
| **`ASM-LADAKH-IMP-TRAD`** | Ladakh Improved Traditional Shelter | Leh | 400.0 mm | `2.400` | **`0.417`** | Rammed earth interior mass (300mm) + exterior Rockwool insulation (80mm) + mud plaster render. |
| **`ASM-LADAKH-INS-MOD`** | Ladakh Insulated Modern Shelter | Leh | 392.5 mm | `3.192` | **`0.313`** | CSEB block core (230mm) + Rockwool (100mm) + 50mm air cavity + Gypsum lining. Meets high-altitude energy codes. |
| **`ASM-LADAKH-LIGHT-INS`** | Ladakh Lightweight Insulated Shelter | Leh | 213.0 mm | `3.962` | **`0.252`** | Prefabricated corrugated steel cladding + 50mm air cavity + 100mm XPS rigid foam ($R=3.03$) + timber studs + gypsum. Rapid heating. |
| **`ASM-SHIMLA-COLD`** | Shimla Cold-Climate Mountain Shelter | Shimla | 432.5 mm | `3.560` | **`0.281`** | Stone masonry cladding (250mm) + 50mm drained cavity + 120mm hydrophobic Rockwool + gypsum lining. Moisture protected. |
| **`ASM-WARM-COMP`** | Warm Climate Comparison Shelter | Jaipur / Karur | 292.5 mm | `0.777` | **`1.287`** | Uninsulated double clay brick cavity wall (115mm brick + 50mm cavity + 115mm brick). Solar reflection focus. |

---

## Realistic Metal Shelter Assembly vs. Single-Layer Fallback

> [!CAUTION]
> In V1 baseline, metal was evaluated as a single $300\text{ mm}$ solid steel block, creating an unphysical $54.6\text{ MJ/K}$ thermal capacitance.

In V2, corrugated steel is accurately specified as **$0.5\text{ mm}$ total coated thickness (TCT)** per Indian standard IS 277. As shown in **`ASM-LADAKH-LIGHT-INS`**, steel sheet cladding is modeled as part of a multi-layer insulated assembly:

$$\text{Corrugated Steel (0.5mm)} \to \text{Air Cavity (50mm)} \to \text{XPS Insulation Board (100mm)} \to \text{Timber Framing Core} \to \text{Gypsum Lining (12.5mm)}$$

This yields a realistic high-performance assembly ($U = 0.252\text{ W/m}^2\text{K}$) where steel provides durable weather protection while XPS provides thermal resistance.

---

## Key Extracted Ladakh Regulatory Requirements

1. **Passive Solar Orientation (`REQ-LADAKH-001`)**: Long axis oriented East-West; south-facing exposure maximized.
2. **Double Glazing Mandate (`REQ-LADAKH-002`)**: Mandatory double-glazed units with uPVC/wooden thermal break frames for guest houses, commercial, and government residential units.
3. **Local Eco-Friendly Materials (`REQ-LADAKH-003`)**: Minimum 50% walling material from local eco-friendly sources (CSEB, rammed earth, adobe, local stone).
4. **Trombe Wall & Solar Rabsal (`REQ-LADAKH-004`)**: South wall features solar sun-room or 200–350mm masonry Trombe heat collector.
5. **North Wall Protection (`REQ-LADAKH-005`)**: North openings minimized or buffered by utility corridors to block cold winter winds.
6. **Roof Thermal Insulation Mandate (`REQ-LADAKH-006`)**: Continuous roof insulation ($R \ge 2.5\text{ m}^2\text{K/W}$) required.
7. **Perimeter & Sub-Slab Insulation (`REQ-LADAKH-007`)**: Slab edge insulation required to eliminate ground frost thermal bridging.
8. **Infiltration Control (`REQ-LADAKH-008`)**: Mandatory weather-stripping restricting uncontrolled infiltration ($\text{ACH} \le 0.5\text{ h}^{-1}$).

---

## Data Quality, Conflicting Values, and Limitations

1. **Generic vs. Manufacturer Data**: ASHRAE Handbook data are generic material benchmarks. Specific commercial products (e.g. Rockwool batts, Dow XPS) use manufacturer technical specifications.
2. **Conflicting Thermal Conductivity Values**:
   - *Adobe*: Ranges from $0.50$ to $1.00\text{ W/m}\cdot\text{K}$ depending on soil composition and density. Baseline value selected: $0.70\text{ W/m}\cdot\text{K}$ (at nominal 5% moisture per ASHRAE 2025).
   - *Stone/Granite*: Ranges from $1.70$ to $3.90\text{ W/m}\cdot\text{K}$ depending on mineral composition. Baseline selected: $2.50\text{ W/m}\cdot\text{K}$ (dry granite per ASHRAE 2025).
3. **Unsupported Properties**: Where property data could not be validated against authoritative literature (e.g. bamboo thermal expansion coefficient), the property is strictly recorded as `NOT_AVAILABLE`.

---

## Recommended Next Steps for V2 Engine Development

1. **Multi-Layer Wall Representation**: Implement multi-node 1D finite difference or lumped RC-network thermal model in `thermal_engine_v2.py` utilizing `assemblies_v2.csv` and `assembly_layers_v2.csv`.
2. **Component-Specific Solar Absorptivity**: Apply layer-specific exterior solar absorptivity ($\alpha$) and interior surface emissivity ($\varepsilon$).
3. **Directional Solar & Trombe Wall Model**: Integrate hourly solar incidence angles for south-facing Trombe walls and rabsal sun-rooms.
