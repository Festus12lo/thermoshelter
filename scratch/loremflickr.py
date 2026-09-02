import requests

images = {
    "eps.jpg": "https://loremflickr.com/800/600/foam,texture/all",
    "low_e_alu.jpg": "https://loremflickr.com/800/600/metal,roof/all",
    "cool_roof.jpg": "https://loremflickr.com/800/600/white,plaster/all",
    "green_roof.jpg": "https://loremflickr.com/800/600/green,plants,texture/all"
}

headers = {
    "User-Agent": "Mozilla/5.0"
}

for filename, url in images.items():
    print(f"Downloading {filename}...")
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
