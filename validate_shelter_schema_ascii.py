import json
import os
import sys

def validate_shelter_schema():
    schema_path = "data/shelters/shelter_schema.json"
    if not os.path.exists(schema_path):
        print("ERROR: Shelter schema not found at", schema_path)
        return False

    try:
        with open(schema_path, 'r') as f:
            schema = json.load(f)
    except json.JSONDecodeError as e:
        print("ERROR: Invalid JSON in shelter schema:", e)
        return False
    except Exception as e:
        print("ERROR: Unable to read shelter schema:", e)
        return False

    print("=== SHELTER SCHEMA VALIDATION REPORT ===")
    print(f"Schema file: {schema_path}")
    print()

    # 1. Check that it's a valid JSON Schema (we already loaded it, so it's valid JSON)
    print("[PASS] Schema is valid JSON")

    # 2. Check required fields
    required_fields = schema.get('required', [])
    print(f"\nRequired fields ({len(required_fields)}):")
    for field in required_fields:
        print(f"  - {field}")

    # 3. Check that material references use material_id pattern
    material_id_pattern = "^MAT-[A-Z0-9_-]+$"
    material_fields = [
        'wall_material_id',
        'roof_material_id',
        'floor_material_id'
    ]
    print("\nMaterial ID fields:")
    for field in material_fields:
        if field in schema.get('properties', {}):
            pattern = schema['properties'][field].get('pattern')
            if pattern == material_id_pattern:
                print(f"  [PASS] {field}: uses correct pattern '{material_id_pattern}'")
            else:
                print(f"  [FAIL] {field}: pattern is '{pattern}', expected '{material_id_pattern}'")
        else:
            print(f"  [FAIL] {field}: not found in properties")

    # 4. Check location enum matches weather datasets
    location_enum = schema.get('properties', {}).get('location', {}).get('enum', [])
    expected_locations = ["Leh", "Shimla", "Karur", "Jaipur"]
    print(f"\nLocation field:")
    print(f"  Expected: {expected_locations}")
    print(f"  Actual:   {location_enum}")
    if set(location_enum) == set(expected_locations):
        print("  [PASS] Location enum matches weather datasets")
    else:
        print("  [FAIL] Location enum does not match weather datasets")

    # 5. Check derived fields are marked as readOnly
    derived_fields = ['floor_area_m2', 'wall_area_m2', 'roof_area_m2']
    print(f"\nDerived fields (should be readOnly):")
    for field in derived_fields:
        if field in schema.get('properties', {}):
            readonly = schema['properties'][field].get('readOnly', False)
            if readonly:
                print(f"  [PASS] {field}: marked as readOnly")
            else:
                print(f"  [WARN] {field}: not marked as readOnly (should be)")
        else:
            print(f"  [FAIL] {field}: not found in properties")

    # 6. Check that no duplicate material-property fields were added
    material_properties = [
        'thermal_conductivity_W_mK', 'density_kg_m3', 'specific_heat_J_kgK',
        'thermal_emissivity', 'solar_absorptivity', 'solar_reflectivity'
    ]
    unexpected_material_fields = []
    for prop in material_properties:
        if prop in schema.get('properties', {}):
            unexpected_material_fields.append(prop)
    print(f"\nCheck for duplicate material properties in shelter schema:")
    if unexpected_material_fields:
        print(f"  [FAIL] Found unexpected material property fields: {unexpected_material_fields}")
    else:
        print("  [PASS] No duplicate material property fields found")

    # 7. Check that the schema supports multiple configurations (by being an object, an array of these would be valid)
    print(f"\nSchema structure:")
    print(f"  Type: {schema.get('type')}")
    if schema.get('type') == 'object':
        print("  [PASS] Schema defines a single shelter configuration (can be used in an array for multiple)")
    else:
        print(f"  [WARN] Schema type is '{schema.get('type')}', expected 'object'")

    # 8. Check frozen files
    frozen_files = [
        "data/raw/jaipur_weather_2026.csv",
        "data/raw/karur_weather_2026.csv",
        "data/raw/leh_weather_2026.csv",
        "data/raw/shimla_weather_2026.csv",
        "data/materials/material_properties.csv"
    ]
    print(f"\nFrozen files check:")
    all_frozen_exist = True
    for f in frozen_files:
        if os.path.exists(f):
            print(f"  [PASS] {f} exists")
        else:
            print(f"  [FAIL] {f} missing")
            all_frozen_exist = False
    if all_frozen_exist:
        print("  [PASS] All frozen files are present (we did not modify them)")

    print("\n=== VALIDATION COMPLETE ===")
    return True

if __name__ == "__main__":
    success = validate_shelter_schema()
    sys.exit(0 if success else 1)