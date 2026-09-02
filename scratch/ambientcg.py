import requests

materials = ["foam", "metal", "roof", "corrugated", "green"]

for m in materials:
    try:
        url = f"https://ambientcg.com/api/v2/full_json?q={m}&limit=5"
        res = requests.get(url).json()
        print(f"--- {m} ---")
        for asset in res.get("foundAssets", []):
            asset_id = asset["assetId"]
            preview = f"https://acg-media.nyc3.cdn.digitaloceanspaces.com/assets/{asset_id}/1K-JPG/Color.jpg"
            print(f"{asset_id}: {preview}")
    except Exception as e:
        print(e)
