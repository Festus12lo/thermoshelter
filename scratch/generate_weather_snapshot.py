import csv
import json
import os
from collections import defaultdict

# The date we want to snapshot (24 hours)
TARGET_DATE = '2026-01-15'

RAW_DIR = 'data/raw'
OUTPUT_FILE = 'src/assets/weather_snapshots.json'

locations_map = {
    'leh': 'leh_weather_2026.csv',
    'shimla': 'shimla_weather_2026.csv',
    'jaipur': 'jaipur_weather_2026.csv',
    'karur': 'karur_weather_2026.csv'
}

data = defaultdict(list)

for loc_id, filename in locations_map.items():
    filepath = os.path.join(RAW_DIR, filename)
    if not os.path.exists(filepath):
        print(f"Warning: {filepath} not found.")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['datetime'].startswith(TARGET_DATE):
                data[loc_id].append({
                    'hour': int(row['datetime'].split('T')[1].split(':')[0]),
                    'temperature_2m': float(row['temperature_2m']),
                    'shortwave_radiation': float(row['shortwave_radiation']),
                    'windspeed_10m': float(row['windspeed_10m']),
                    'relativehumidity_2m': float(row['relativehumidity_2m']),
                })

# Sort each location by hour just in case
for loc_id in data:
    data[loc_id] = sorted(data[loc_id], key=lambda x: x['hour'])

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Successfully generated {OUTPUT_FILE} with 24h snapshot for {len(data)} locations.")
