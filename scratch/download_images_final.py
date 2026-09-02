import requests
import os

images = {
    "eps.jpg": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Styrofoam_packaging.jpg",
    "hollow_poly.jpg": "https://upload.wikimedia.org/wikipedia/commons/6/62/Lexan.svg",
    "low_e_alu.jpg": "https://upload.wikimedia.org/wikipedia/commons/3/30/Metal_roof.jpg",
    "cool_roof.jpg": "https://upload.wikimedia.org/wikipedia/commons/7/7b/White_roof_in_Bermuda.jpg",
    "galvanized.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/c8/MountLawleyRooftops_gobeirne.jpg",
    "terracotta.jpg": "https://upload.wikimedia.org/wikipedia/commons/1/18/Zakopane-schronisko-2.jpg",
    "green_roof.jpg": "https://upload.wikimedia.org/wikipedia/commons/4/41/British_Horse_Society_Head_Quarters_and_Green_Roof.jpg",
    "solar_absorbent.jpg": "https://upload.wikimedia.org/wikipedia/commons/f/f8/Water_collectors.jpg"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

os.makedirs("public/materials", exist_ok=True)

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
