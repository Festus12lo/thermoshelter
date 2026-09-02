import requests
import json
import time

queries = {
    "eps": "Expanded_polystyrene",
    "hollow_polymer": "Polycarbonate",
    "low_e_alu": "Standing_seam_metal_roof",
    "cool_roof": "Reflective_surfaces_(climate_engineering)",
    "galvanized": "Corrugated_galvanised_iron",
    "terracotta": "Roof_shingle",
    "green_roof": "Green_roof",
    "solar_absorbent": "Solar_water_heating"
}

headers = {
    "User-Agent": "ThermoShelterBot/1.0 (https://thermoshelter.test; dev@thermoshelter.test) python-requests/2.31.0"
}

results = {}

for key, title in queries.items():
    print(f"Fetching images for {title}...")
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={title}"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            pages = data.get("query", {}).get("pages", {})
            for page_id, page_data in pages.items():
                if "original" in page_data:
                    results[key] = page_data["original"]["source"]
                    print(f"Found: {results[key]}")
                else:
                    print("No image found.")
        else:
            print(f"Failed with status: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(1.5)

print("Downloading images...")
import os
os.makedirs("public/materials/downloaded", exist_ok=True)
for key, img_url in results.items():
    try:
        ext = img_url.split('.')[-1]
        filepath = f"public/materials/downloaded/{key}.{ext}"
        print(f"Downloading {key} to {filepath}...")
        img_data = requests.get(img_url, headers=headers).content
        with open(filepath, "wb") as f:
            f.write(img_data)
        print("Success.")
    except Exception as e:
        print(f"Failed to download {key}: {e}")

print("Done")
