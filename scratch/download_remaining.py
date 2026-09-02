import requests
import time

images = {
    "eps.jpg": "Styrofoam_packaging.jpg",
    "low_e_alu.jpg": "Metal_roof.jpg",
    "cool_roof.jpg": "White_roof_in_Bermuda.jpg",
    "green_roof.jpg": "Chicago_City_Hall_Green_Roof.jpg",
    "solar_absorbent.jpg": "Water_collectors.jpg"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ThermoshelterBot/1.0"
}

for filename, wiki_name in images.items():
    url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{wiki_name}"
    print(f"Downloading {filename} from {url}...")
    try:
        response = requests.get(url, headers=headers, allow_redirects=True)
        if response.status_code == 200:
            with open(f"public/materials/{filename}", "wb") as f:
                f.write(response.content)
            print(f"Saved {filename} ({len(response.content)} bytes)")
        else:
            print(f"Failed {filename}: HTTP {response.status_code}")
    except Exception as e:
        print(f"Error {filename}: {e}")
    time.sleep(1.5) # Prevent 429
