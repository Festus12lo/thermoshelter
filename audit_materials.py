import pandas as pd
import os
from pathlib import Path

def audit_material_properties(filepath):
    print(f"\n=== Auditing Material Properties: {filepath.name} ===")
    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    # Basic info
    print(f"Row count (materials): {len(df)}")
    print(f"Column names: {list(df.columns)}")
    print(f"Number of properties: {len(df.columns)}")

    # Check for material_id uniqueness and sequence
    if 'material_id' in df.columns:
        id_unique = df['material_id'].is_unique
        id_sequential = (df['material_id'].max() == len(df)) and (df['material_id'].min() == 1)
        print(f"Material IDs unique: {id_unique}")
        print(f"Material IDs sequential 1-{len(df)}: {id_sequential}")
        if not id_unique:
            print(f"Duplicate IDs found: {df['material_id'][df['material_id'].duplicated()].tolist()}")
        if not id_sequential:
            print(f"ID range: {df['material_id'].min()} to {df['material_id'].max()}")

    # Missing values per column
    print("\nMissing values per column:")
    missing_cols = []
    for col in df.columns:
        missing = df[col].isna().sum()
        if missing > 0:
            missing_cols.append((col, missing))
            print(f"  {col}: {missing}")

    if not missing_cols:
        print("  No missing values in any column")

    # Check for empty strings in text columns (treated as missing for our purposes)
    text_columns = ['material', 'material_category', 'source', 'source_url', 'source_condition', 'confidence', 'notes']
    print("\nEmpty strings in text columns:")
    empty_found = False
    for col in text_columns:
        if col in df.columns:
            empty_count = (df[col].astype(str).str.strip() == '').sum()
            if empty_count > 0:
                empty_found = True
                print(f"  {col}: {empty_count} empty strings")
    if not empty_found:
        print("  No empty strings found in text columns")

    # Numeric ranges for key thermal properties
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) > 0:
        print("\nNumeric property ranges:")
        key_props = ['thermal_conductivity_W_mK', 'density_kg_m3', 'specific_heat_J_kgK',
                     'thermal_emissivity', 'solar_absorptivity', 'solar_reflectivity',
                     'default_thickness_mm', 'thermal_resistance_m2K_W']

        for prop in key_props:
            if prop in df.columns:
                min_val = df[prop].min()
                max_val = df[prop].max()
                mean_val = df[prop].mean()
                print(f"  {prop}:")
                print(f"    Min: {min_val:.6f}")
                print(f"    Max: {max_val:.6f}")
                print(f"    Mean: {mean_val:.6f}")
                # Basic sanity checks
                if prop == 'thermal_emissivity' or prop == 'solar_absorptivity' or prop == 'solar_reflectivity':
                    if min_val < 0 or max_val > 1:
                        print(f"    WARNING: Values outside expected range [0,1]")
                elif prop == 'thermal_conductivity_W_mK' and min_val <= 0:
                    print(f"    WARNING: Non-positive thermal conductivity")
                elif prop == 'density_kg_m3' and min_val <= 0:
                    print(f"    WARNING: Non-positive density")
                elif prop == 'specific_heat_J_kgK' and min_val <= 0:
                    print(f"    WARNING: Non-positive specific heat")

    # Source analysis
    if 'source' in df.columns:
        print("\nSource distribution:")
        source_counts = df['source'].value_counts()
        for source, count in source_counts.items():
            print(f"  {source}: {count} materials")

    # Confidence analysis
    if 'confidence' in df.columns:
        print("\nConfidence distribution:")
        confidence_counts = df['confidence'].value_counts()
        for confidence, count in confidence_counts.items():
            print(f"  {confidence}: {count} materials")

    # Sample of notes field to check for documentation
    if 'notes' in df.columns:
        print("\nNotes field sample (first 3 non-empty):")
        non_empty_notes = df[df['notes'].astype(str).str.strip() != '']['notes'].head(3)
        for i, note in enumerate(non_empty_notes, 1):
            print(f"  {i}. {str(note)[:100]}{'...' if len(str(note)) > 100 else ''}")

    # Cross-check: verify thermal resistance calculation where possible
    print("\nThermal resistance verification (where calculable):")
    verification_issues = []
    for idx, row in df.iterrows():
        k = row.get('thermal_conductivity_W_mK')
        thickness_mm = row.get('default_thickness_mm')
        tr = row.get('thermal_resistance_m2K_W')
        material = row.get('material', f'Row {idx}')

        if pd.notna(k) and pd.notna(thickness_mm) and pd.notna(tr) and k > 0:
            # Convert thickness to meters and calculate expected TR
            expected_tr = (thickness_mm / 1000) / k
            # Allow 1% tolerance for rounding
            tolerance = 0.01
            if abs(tr - expected_tr) > (tolerance * expected_tr):
                verification_issues.append({
                    'material': material,
                    'reported_tr': tr,
                    'calculated_tr': expected_tr,
                    'difference_pct': abs(tr - expected_tr) / expected_tr * 100
                })

    if verification_issues:
        print(f"  Found {len(verification_issues)} potential calculation discrepancies:")
        for issue in verification_issues[:5]:  # Show first 5
            print(f"    {issue['material']}: reported={issue['reported_tr']:.6f}, calculated={issue['calculated_tr']:.6f} ({issue['difference_pct']:.2f}% diff)")
    else:
        print("  All calculable thermal resistance values consistent with thickness/conductivity (within 1% tolerance)")

def main():
    data_dir = Path("data/materials")
    csv_file = data_dir / "material_properties.csv"

    if not csv_file.exists():
        print("Material properties CSV not found!")
        return

    audit_material_properties(csv_file)

    # Final summary
    print("\n" + "="*60)
    print("AUDIT SUMMARY")
    print("="*60)
    df = pd.read_csv(csv_file)
    total_cells = df.size
    missing_cells = df.isna().sum().sum()
    print(f"File: {csv_file.name}")
    print(f"Materials: {len(df)}")
    print(f"Properties per material: {len(df.columns)}")
    print(f"Total data points: {total_cells}")
    print(f"Missing data points: {missing_cells}")
    print(f"Data completeness: {((total_cells - missing_cells) / total_cells * 100):.1f}%")

    if missing_cells == 0:
        print("✅ NO MISSING VALUES")
    else:
        print(f"⚠️  {missing_cells} missing values found")

    print("\nNote: This audit only inspects the dataset - no files were modified.")

if __name__ == "__main__":
    main()