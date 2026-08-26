import requests
import csv
import os
from datetime import datetime, timedelta

# Configuration
CITIES = {
    "Karur": {"latitude": 10.9570, "longitude": 78.0811},
    "Leh": {"latitude": 34.1526, "longitude": 77.5771},
    "Shimla": {"latitude": 31.1048, "longitude": 77.1734},
    "Jaipur": {"latitude": 26.9124, "longitude": 75.7873}
}

# Variables to fetch from Open-Meteo API
VARIABLES = [
    "temperature_2m",
    "relativehumidity_2m",
    "apparent_temperature",
    "shortwave_radiation",  # solar radiation
    "windspeed_10m",
    "precipitation",
    "pressure_msl"
]

# Note: Open-Meteo does not provide 'solar temperature' variable.
# We are using shortwave_radiation for solar radiation as requested.

def fetch_weather_data(city_name, lat, lon, start_date, end_date):
    """Fetch hourly weather data for a given location and date range."""
    base_url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ",".join(VARIABLES),
        "timezone": "Asia/Kolkata"  # IST for all Indian cities
    }

    print(f"Fetching data for {city_name}...")
    response = requests.get(base_url, params=params)

    if response.status_code != 200:
        raise Exception(f"API request failed for {city_name}: {response.status_code} - {response.text}")

    data = response.json()

    # Check if we have hourly data
    if "hourly" not in data:
        raise Exception(f"No hourly data returned for {city_name}")

    return data["hourly"]

def save_to_csv(city_name, hourly_data, output_dir):
    """Save hourly weather data to CSV file."""
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Prepare CSV file path
    filename = f"{city_name.lower()}_weather_2026.csv"
    filepath = os.path.join(output_dir, filename)

    # Prepare header and rows
    header = ["datetime"] + VARIABLES
    rows = []

    # Extract time and weather variables
    times = hourly_data["time"]
    for i, time_str in enumerate(times):
        row = [time_str]
        for var in VARIABLES:
            # Handle missing values (API might return None for some variables)
            value = hourly_data[var][i] if var in hourly_data and hourly_data[var][i] is not None else ""
            row.append(value)
        rows.append(row)

    # Write to CSV
    with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(header)
        writer.writerows(rows)

    print(f"Saved {len(rows)} hourly records to {filepath}")
    return filepath

def main():
    """Main function to fetch weather data for all cities."""
    # Define date range for 2026 (up to current date)
    start_date = "2026-01-01"
    # Using current date from system context: 2026-08-26
    end_date = "2026-08-26"

    output_dir = "data/raw"

    print(f"Fetching weather data from {start_date} to {end_date}")
    print(f"Saving to directory: {output_dir}")
    print("-" * 50)

    for city_name, coords in CITIES.items():
        try:
            hourly_data = fetch_weather_data(
                city_name,
                coords["latitude"],
                coords["longitude"],
                start_date,
                end_date
            )

            save_to_csv(city_name, hourly_data, output_dir)

        except Exception as e:
            print(f"Error processing {city_name}: {str(e)}")
            continue

    print("-" * 50)
    print("Data ingestion completed!")

if __name__ == "__main__":
    main()