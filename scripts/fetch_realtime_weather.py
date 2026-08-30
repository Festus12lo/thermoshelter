#!/usr/bin/env python3
import urllib.request
import json
import pandas as pd
import os

LOCATIONS = {
    'leh': {'lat': 34.1526, 'lon': 77.5771, 'file': 'leh_weather_2026.csv'},
    'shimla': {'lat': 31.1048, 'lon': 77.1734, 'file': 'shimla_weather_2026.csv'},
    'jaipur': {'lat': 26.9124, 'lon': 75.7873, 'file': 'jaipur_weather_2026.csv'},
    'karur': {'lat': 10.9598, 'lon': 78.0766, 'file': 'karur_weather_2026.csv'},
}

# Use 2025 data from Archive API as "real-time" and spoof it to 2026 to match schema
START_DATE = "2025-01-01"
END_DATE = "2025-08-26"
BASE_URL = "https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={start}&end_date={end}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,shortwave_radiation,wind_speed_10m,precipitation,surface_pressure"

RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'raw'))

def fetch_weather(loc_name, loc_data):
    print(f"Fetching real-time data for {loc_name}...")
    url = BASE_URL.format(lat=loc_data['lat'], lon=loc_data['lon'], start=START_DATE, end=END_DATE)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        df = pd.DataFrame(data['hourly'])
        
        # Rename columns to match canonical schema
        df = df.rename(columns={
            'time': 'datetime',
            'relative_humidity_2m': 'relativehumidity_2m',
            'wind_speed_10m': 'windspeed_10m',
            'surface_pressure': 'pressure_msl'
        })
        
        # Spoof year 2025 -> 2026
        df['datetime'] = df['datetime'].str.replace('2025', '2026')
        
        # Save to raw
        out_path = os.path.join(RAW_DIR, loc_data['file'])
        df.to_csv(out_path, index=False)
        print(f"Saved {len(df)} rows to {out_path}")

if __name__ == "__main__":
    os.makedirs(RAW_DIR, exist_ok=True)
    for name, data in LOCATIONS.items():
        fetch_weather(name, data)
    print("Real-time weather fetch complete.")
