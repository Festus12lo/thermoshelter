import requests
import os

images = {
    "eps.jpg": "https://acg-media.nyc3.cdn.digitaloceanspaces.com/assets/Styrofoam004/1K-JPG/Color.jpg",
    "low_e_alu.jpg": "https://acg-media.nyc3.cdn.digitaloceanspaces.com/assets/Metal046B/1K-JPG/Color.jpg",
    "cool_roof.jpg": "https://acg-media.nyc3.cdn.digitaloceanspaces.com/assets/Plaster001/1K-JPG/Color.jpg",
    "galvanized.jpg": "https://acg-media.nyc3.cdn.digitaloceanspaces.com/assets/CorrugatedSteel005/1K-JPG/Color.jpg",
    "green_roof.jpg": "https://acg-media.nyc3.cdn.digitaloceanspaces.com/assets/Grass001/1K-JPG/Color.jpg",
    "solar_absorbent.jpg": "https://acg-media.nyc3.cdn.digitaloceanspaces.com/assets/Plastic014/1K-JPG/Color.jpg"
}

headers = {"User-Agent": "Mozilla/5.0"}

for filename, url in images.items():
    print(f"Downloading {filename}...")
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            with open(f"public/materials/{filename}", "wb") as f:
                f.write(response.content)
            print(f"Saved {filename} ({len(response.content)} bytes)")
        else:
            print(f"Failed {filename}: HTTP {response.status_code}")
    except Exception as e:
        print(f"Error {filename}: {e}")
