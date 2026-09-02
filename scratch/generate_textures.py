from PIL import Image, ImageDraw, ImageFilter
import random
import math

def generate_noise(width, height, base_color, noise_color, scale, intensity):
    img = Image.new('RGB', (width, height), base_color)
    pixels = img.load()
    for x in range(width):
        for y in range(height):
            # Simple noise
            val = random.random()
            if val < intensity:
                # Add noise color variation
                r = min(255, max(0, base_color[0] + int((noise_color[0] - base_color[0]) * val * scale)))
                g = min(255, max(0, base_color[1] + int((noise_color[1] - base_color[1]) * val * scale)))
                b = min(255, max(0, base_color[2] + int((noise_color[2] - base_color[2]) * val * scale)))
                pixels[x, y] = (r, g, b)
    return img

def generate_eps():
    img = generate_noise(800, 600, (240, 240, 240), (200, 200, 200), 1.5, 0.8)
    img = img.filter(ImageFilter.GaussianBlur(1))
    img.save("public/materials/eps.jpg")

def generate_metal(filename, base, stripe):
    img = Image.new('RGB', (800, 600), base)
    draw = ImageDraw.Draw(img)
    for x in range(0, 800, 40):
        draw.rectangle([x, 0, x+20, 600], fill=stripe)
    img = img.filter(ImageFilter.GaussianBlur(2))
    # Add noise on top
    noise = generate_noise(800, 600, (0,0,0), (255,255,255), 1.0, 0.2).convert('L')
    img = Image.blend(img, Image.merge('RGB', (noise, noise, noise)), 0.1)
    img.save(f"public/materials/{filename}")

def generate_cool_roof():
    img = generate_noise(800, 600, (255, 255, 255), (240, 245, 255), 1.0, 0.5)
    img.save("public/materials/cool_roof.jpg")

def generate_green_roof():
    img = generate_noise(800, 600, (34, 139, 34), (0, 100, 0), 2.0, 0.9)
    # Add some brown patches
    draw = ImageDraw.Draw(img)
    for i in range(50):
        x = random.randint(0, 800)
        y = random.randint(0, 600)
        r = random.randint(10, 40)
        draw.ellipse([x, y, x+r, y+r], fill=(101, 67, 33))
    img = img.filter(ImageFilter.GaussianBlur(1))
    img.save("public/materials/green_roof.jpg")

if __name__ == "__main__":
    import os
    os.makedirs("public/materials", exist_ok=True)
    generate_eps()
    generate_metal("low_e_alu.jpg", (200, 210, 220), (170, 180, 190))
    generate_cool_roof()
    generate_green_roof()
    print("Generated 4 unique textures.")
