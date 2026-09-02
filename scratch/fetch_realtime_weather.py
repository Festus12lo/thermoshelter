import json
import urllib.request
import urllib.parse
from datetime import datetime

locations = {
    'leh': {'lat': 34.15, 'lon': 77.57},
    'shimla': {'lat': 31.10, 'lon': 77.17},
    'jaipur': {'lat': 26.91, 'lon': 75.78},
    'karur': {'lat': 10.96, 'lon': 78.08},
    'cherrapunji': {'lat': 25.27, 'lon': 91.73},
    'jaisalmer': {'lat': 26.91, 'lon': 70.90},
    'kanyakumari': {'lat': 8.08, 'lon': 77.53},
    'dras': {'lat': 34.43, 'lon': 75.76},
    'mumbai': {'lat': 19.07, 'lon': 72.87},
    'delhi': {'lat': 28.61, 'lon': 77.20}
}

data = {}

for loc_id, coords in locations.items():
    lat = coords['lat']
    lon = coords['lon']
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,shortwave_radiation&timezone=Asia/Kolkata&forecast_days=1"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        resp_data = json.loads(response.read().decode())
        
        hourly = resp_data['hourly']
        loc_data = []
        
        for i in range(24):
            # time string format: "2026-09-01T14:00"
            hour = int(hourly['time'][i].split('T')[1].split(':')[0])
            
            loc_data.append({
                'hour': hour,
                'temperature_2m': hourly['temperature_2m'][i],
                'shortwave_radiation': hourly['shortwave_radiation'][i],
                'windspeed_10m': hourly['wind_speed_10m'][i],
                'relativehumidity_2m': hourly['relative_humidity_2m'][i]
            })
            
        data[loc_id] = loc_data

with open('src/assets/weather_snapshots.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Real-time weather data fetched and saved to src/assets/weather_snapshots.json")
