# ThermoShelter V2 Source Verification — Consolidated Review

Date: 2026-08-27

## What was verified

- The six V2 assembly R-values and U-values are internally consistent with
  `assembly_layers_v2.csv`:
  `R_total = sum(layer R)` and `U = 1 / R_total`.
- `ASM-LADAKH-TRAD` is currently:
  R_total = 0.6284285714 m²K/W
  U = 1.5912707434 W/m²K
  The earlier reported 0.813 / 1.230 values were an audit/report error, not
  the current dataset values.
- ISO 6946:2017 is an appropriate source for layered thermal-resistance and
  transmittance calculation methodology.
- The official BIS Ladakh Regulations 2023 PDF is reachable through the BIS
  website.
- ASHRAE Handbook 2025 Chapter 26 is reachable and explicitly describes Table 1
  as representative generic material-property data at 24°C, with warnings to
  check footnotes and tested conditions.
- The NIST building-material thermal database is SRD 81, not SRD 100.

## Corrections made

1. `data/materials/material_properties.csv`
   - Restored byte-for-byte from Git HEAD.
   - This removes the accidental UTF-16 encoding change while preserving the
     frozen V1 data exactly.

2. `data/research/v2/source_registry.csv`
   - Corrected the NIST entry from SRD 100 to SRD 81.
   - Updated the official NIST URL and scope.

3. `data/research/v2/materials_v2.csv`
   - Corrected the bamboo source reference to NIST SRD 81.
   - Explicitly marked the exact bamboo value as not externally verified.

## Important evidence limitations

The following should NOT yet be described as source-verified merely because a
URL exists:

- Exact bamboo property value.
- Exact CSEB conductivity value attributed to the Ladakh regulations.
- Any material value whose exact row/record was not located in the cited source.
- Any claimed regulatory requirement whose exact wording/section was not
  inspected in the source document.

The dataset may remain useful for research, but these values require
record-level source verification before being treated as authoritative physics
inputs.

## No changes made to

- `data/raw/*`
- `data/shelters/*`
- V1 material values
- V1 weather values
- thermal test expectations

## Next action

Before V2 physics integration, perform a record-level verification of the
remaining V2 material properties and Ladakh requirements. Do not silently
upgrade unverified values to "High confidence".
