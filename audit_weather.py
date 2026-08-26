import pandas as pd
import os
from pathlib import Path

def audit_csv(filepath):
    print(f"\n=== Auditing {filepath.name} ===")
    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    # Basic info
    print(f"Row count: {len(df)}")
    print(f"Column names: {list(df.columns)}")

    # Check datetime column
    if 'datetime' not in df.columns:
        print("ERROR: No 'datetime' column found")
        return

    # Convert datetime to pandas datetime
    df['datetime'] = pd.to_datetime(df['datetime'])

    # Timestamp range
    min_ts = df['datetime'].min()
    max_ts = df['datetime'].max()
    print(f"Timestamp range: {min_ts} to {max_ts}")

    # Check for duplicate timestamps
    dup_count = df['datetime'].duplicated().sum()
    print(f"Duplicate timestamps: {dup_count}")

    # Check hourly interval completeness
    # Expect hourly frequency
    expected_freq = pd.Timedelta(hours=1)
    # Sort by datetime
    df_sorted = df.sort_values('datetime').reset_index(drop=True)
    # Compute differences
    diffs = df_sorted['datetime'].diff().dropna()
    # Expected difference is 1 hour; allow small tolerance due to possible timezone issues?
    # We'll consider gaps where diff != 1 hour
    gap_mask = diffs != expected_freq
    gap_count = gap_mask.sum()
    if gap_count > 0:
        print(f"Non-hourly intervals found: {gap_count} gaps")
        # Show where gaps are
        gap_indices = diffs[gap_mask].index
        for idx in gap_indices[:5]:  # show first 5 gaps
            print(f"  Gap between {df_sorted.loc[idx-1, 'datetime']} and {df_sorted.loc[idx, 'datetime']} -> diff = {diffs.loc[idx]}")
    else:
        print("Hourly intervals: Complete (no gaps)")

    # Missing values per column (excluding datetime)
    print("\nMissing values per column:")
    for col in df.columns:
        if col == 'datetime':
            continue
        missing = df[col].isna().sum()
        # Also count empty strings? but pandas read_csv will treat empty as NaN if numeric?
        # We'll just report NaN
        print(f"  {col}: {missing}")

    # Min and max for numeric columns
    print("\nNumeric variable ranges:")
    numeric_cols = df.select_dtypes(include=['number']).columns
    for col in numeric_cols:
        min_val = df[col].min()
        max_val = df[col].max()
        print(f"  {col}: min = {min_val}, max = {max_val}")

    # Optionally show data types
    print("\nData types:")
    print(df.dtypes.to_string())


def main():
    data_dir = Path("data/raw")
    if not data_dir.exists():
        print("Data directory not found!")
        return

    csv_files = list(data_dir.glob("*.csv"))
    if not csv_files:
        print("No CSV files found in data/raw")
        return

    for csv_file in sorted(csv_files):
        audit_csv(csv_file)

if __name__ == "__main__":
    main()