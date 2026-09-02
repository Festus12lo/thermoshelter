import json
from duckduckgo_search import DDGS
import time
import requests
import os

materials = [
    "EPS composite insulation material macro",
    "polycarbonate twin wall hollow core",
    "low-e aluminum standing seam roof",
    "white elastomeric cool roof coating",
    "corrugated galvanized steel roof",
    "terracotta roof tiles macro",
    "extensive green roof sedum",
    "solar absorbent matte black roof"
]

results = {}

with DDGS() as ddgs:
    for mat in materials:
        print(f"Searching for {mat}...")
        try:
            # Get 5 image results
            images = list(ddgs.images(mat, max_results=3))
            if images:
                # Let's save the top 3 image URLs
                results[mat] = [img['image'] for img in images]
            else:
                results[mat] = []
        except Exception as e:
            print(f"Error searching {mat}: {e}")
        time.sleep(2) # avoid ratelimit

with open('image_urls.json', 'w') as f:
    json.dump(results, f, indent=2)

print("Done. Saved to image_urls.json")
