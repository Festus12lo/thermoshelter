# PROCUREMENT & MARKET INTELLIGENCE AUDIT

## Data Contract
The `ProcurementAdapter` successfully parses `material_registry.csv` to expose:
- Supplier Name
- Product Price & Currency
- Availability
- Product URL & Image URL

## UI Requirements
- Prices are explicitly flagged as `OBSERVED` vs `ESTIMATED`.
- If an image is unavailable, the adapter returns `IMAGE_NOT_AVAILABLE` instead of generating a synthetic fake image.
- The schema supports multi-supplier comparison (`get_suppliers_for_material(mat_id)`).

## Verdict
PASS. Commercial procurement data is cleanly isolated from scientific thermal calculations.
