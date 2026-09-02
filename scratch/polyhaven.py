import requests
import json
import os

url = "https://api.polyhaven.com/assets?t=textures"
headers = {"User-Agent": "Mozilla/5.0"}
try:
    data = requests.get(url, headers=headers).json()
    # Find matching textures
    for name, info in data.items():
        if "roof" in name or "metal" in name or "wall" in name or "green" in name or "foam" in name:
            print(f"{name}: {info['categories']}")
except Exception as e:
    print(e)
