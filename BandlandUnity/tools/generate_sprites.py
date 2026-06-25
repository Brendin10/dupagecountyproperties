#!/usr/bin/env python3
"""Generate Bandland 2D sprites for Unity.

Character design inspired by My Singing Monsters:
chunky silhouettes, thick outlines, glossy eyes, fur tufts, cel-shading.
Gameplay and other assets are unrelated to that reference.
"""

from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "Assets" / "Bandland" / "Art" / "Sprites"
OUT.mkdir(parents=True, exist_ok=True)

OUTLINE = (28, 18, 48)
OUTLINE_W = 4


def save(img: Image.Image, name: str):
    img.save(OUT / name, "PNG")
    print(f"  {name}")


def outlined_ellipse(d, box, fill, outline=OUTLINE, width=OUTLINE_W):
    d.ellipse(box, fill=fill, outline=outline, width=width)


def outlined_polygon(d, pts, fill, outline=OUTLINE, width=OUTLINE_W):
    d.polygon(pts, fill=fill, outline=outline)


def outlined_rounded_rect(d, box, radius, fill, outline=OUTLINE, width=OUTLINE_W):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def msm_eye(d, cx, cy, radius=18, iris=(30, 160, 220)):
    """Large glossy MSM-style eye."""
    outlined_ellipse(d, [cx - radius, cy - radius + 2, cx + radius, cy + radius + 2], "white")
    ir = radius * 0.62
    outlined_ellipse(d, [cx - ir, cy - ir + 3, cx + ir, cy + ir + 3], iris, width=3)
    d.ellipse([cx - radius * 0.35, cy - radius * 0.45, cx - radius * 0.05, cy - radius * 0.05], fill="white")
    d.ellipse([cx + radius * 0.15, cy + radius * 0.05, cx + radius * 0.42, cy + radius * 0.32], fill="white")


def fur_tufts(d, cx, cy, count, spread, radius, color):
    """Small spiky fur bumps around head/body."""
    for i in range(count):
        ang = (i / count) * 6.28 - 1.57
        tx = cx + int(spread * __import__("math").cos(ang))
        ty = cy + int(spread * 0.7 * __import__("math").sin(ang))
        outlined_ellipse(d, [tx - radius, ty - radius, tx + radius, ty + radius], color, width=2)


def draw_benny(size=256):
    img = Image.new("RGBA", (size, int(size * 1.35)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2 + 8

    fur = (142, 88, 255)
    fur_light = (188, 148, 255)
    fur_shadow = (98, 52, 188)
    belly = (210, 178, 255)
    jacket = (118, 68, 38)
    jacket_hi = (168, 108, 58)

    # Ground shadow
    d.ellipse([cx - 54, size - 30, cx + 54, size - 10], fill=(0, 0, 0, 50))

    # Stubby feet
    outlined_rounded_rect(d, [cx - 42, cy + 72, cx - 16, cy + 108], 14, fur_shadow)
    outlined_rounded_rect(d, [cx + 16, cy + 72, cx + 42, cy + 108], 14, fur_shadow)
    outlined_ellipse(d, [cx - 38, cy + 100, cx - 18, cy + 114], fur)
    outlined_ellipse(d, [cx + 18, cy + 100, cx + 38, cy + 114], fur)

    # Chunky body blob
    outlined_ellipse(d, [cx - 62, cy + 8, cx + 62, cy + 88], fur)
    outlined_ellipse(d, [cx - 50, cy + 18, cx + 50, cy + 78], fur_light)
    outlined_ellipse(d, [cx - 34, cy + 32, cx + 34, cy + 72], belly)

    # Biker jacket (simplified chunky shapes)
    outlined_polygon(d, [
        (cx - 58, cy + 14), (cx, cy - 2), (cx + 58, cy + 14),
        (cx + 52, cy + 68), (cx, cy + 78), (cx - 52, cy + 68),
    ], jacket)
    outlined_polygon(d, [
        (cx - 44, cy + 22), (cx, cy + 10), (cx + 44, cy + 22),
        (cx + 38, cy + 58), (cx, cy + 64), (cx - 38, cy + 58),
    ], jacket_hi)
    outlined_rounded_rect(d, [cx - 10, cy + 8, cx + 10, cy + 62], 4, (88, 48, 24))
    # Skull patch
    outlined_ellipse(d, [cx - 40, cy + 28, cx - 18, cy + 48], (248, 242, 230), width=2)
    d.line([(cx - 34, cy + 34), (cx - 26, cy + 42)], fill=OUTLINE, width=2)
    d.ellipse([cx - 32, cy + 32, cx - 30, cy + 34], fill=OUTLINE)
    d.ellipse([cx - 28, cy + 32, cx - 26, cy + 34], fill=OUTLINE)

    # Stub arms with fur cuffs
    outlined_ellipse(d, [cx - 78, cy + 26, cx - 42, cy + 62], fur)
    outlined_ellipse(d, [cx + 42, cy + 26, cx + 78, cy + 62], fur)
    outlined_ellipse(d, [cx - 86, cy + 48, cx - 68, cy + 68], fur_light)
    outlined_ellipse(d, [cx + 68, cy + 48, cx + 86, cy + 68], fur_light)

    # Big round head (MSM proportions — head ~ body width)
    outlined_ellipse(d, [cx - 58, cy - 72, cx + 58, cy + 18], fur)
    outlined_ellipse(d, [cx - 48, cy - 62, cx + 48, cy + 8], fur_light)
    fur_tufts(d, cx, cy - 30, 9, 54, 7, fur)

    # Chunky spiral horns
    outlined_polygon(d, [(cx - 34, cy - 58), (cx - 42, cy - 98), (cx - 18, cy - 78)], (214, 168, 96))
    outlined_polygon(d, [(cx + 34, cy - 58), (cx + 42, cy - 98), (cx + 18, cy - 78)], (214, 168, 96))
    d.line([(cx - 36, cy - 72), (cx - 30, cy - 88)], fill=(240, 210, 150), width=3)
    d.line([(cx + 36, cy - 72), (cx + 30, cy - 88)], fill=(240, 210, 150), width=3)

    # MSM glossy eyes
    msm_eye(d, cx - 24, cy - 28, 20, (20, 120, 200))
    msm_eye(d, cx + 24, cy - 28, 20, (20, 120, 200))

    # Goofy confident grin + little tusks
    d.arc([cx - 22, cy - 6, cx + 22, cy + 16], 15, 165, fill=OUTLINE, width=OUTLINE_W)
    outlined_polygon(d, [(cx - 12, cy + 4), (cx - 6, cy + 16), (cx - 16, cy + 12)], "white", width=2)
    outlined_polygon(d, [(cx + 12, cy + 4), (cx + 16, cy + 12), (cx + 6, cy + 16)], "white", width=2)

    # Rosy cheek spots
    d.ellipse([cx - 46, cy - 14, cx - 30, cy + 2], fill=(255, 120, 180, 110))
    d.ellipse([cx + 30, cy - 14, cx + 46, cy + 2], fill=(255, 120, 180, 110))

    return img


def draw_lizzy(size=256):
    img = Image.new("RGBA", (size, int(size * 1.35)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2 + 8

    fur = (148, 92, 255)
    fur_light = (194, 154, 255)
    fur_shadow = (102, 56, 192)
    belly = (218, 188, 255)
    jacket = (255, 108, 178)
    jacket_hi = (255, 158, 208)

    d.ellipse([cx - 54, size - 30, cx + 54, size - 10], fill=(0, 0, 0, 50))

    # Big bouncy ponytail (MSM hair puff)
    outlined_ellipse(d, [cx - 28, cy - 118, cx + 28, cy - 58], (220, 72, 255))
    outlined_ellipse(d, [cx - 20, cy - 108, cx + 20, cy - 68], (248, 130, 255))
    outlined_polygon(d, [(cx - 22, cy - 90), (cx - 38, cy - 28), (cx - 8, cy - 48)], (200, 60, 240))
    outlined_polygon(d, [(cx + 22, cy - 90), (cx + 38, cy - 28), (cx + 8, cy - 48)], (200, 60, 240))
    fur_tufts(d, cx, cy - 88, 6, 30, 6, (230, 90, 255))

    outlined_rounded_rect(d, [cx - 40, cy + 72, cx - 14, cy + 108], 14, fur_shadow)
    outlined_rounded_rect(d, [cx + 14, cy + 72, cx + 40, cy + 108], 14, fur_shadow)
    outlined_ellipse(d, [cx - 36, cy + 100, cx - 16, cy + 114], fur)
    outlined_ellipse(d, [cx + 16, cy + 100, cx + 36, cy + 114], fur)

    outlined_ellipse(d, [cx - 58, cy + 10, cx + 58, cy + 86], fur)
    outlined_ellipse(d, [cx - 46, cy + 20, cx + 46, cy + 74], fur_light)
    outlined_ellipse(d, [cx - 30, cy + 34, cx + 30, cy + 68], belly)

    # Pink rocker jacket
    outlined_polygon(d, [
        (cx - 56, cy + 16), (cx, cy), (cx + 56, cy + 16),
        (cx + 50, cy + 66), (cx, cy + 74), (cx - 50, cy + 66),
    ], jacket)
    outlined_polygon(d, [
        (cx - 42, cy + 24), (cx, cy + 12), (cx + 42, cy + 24),
        (cx + 36, cy + 56), (cx, cy + 62), (cx - 36, cy + 56),
    ], jacket_hi)
    outlined_rounded_rect(d, [cx - 10, cy + 10, cx + 10, cy + 60], 4, (230, 70, 150))
    outlined_ellipse(d, [cx + 30, cy + 30, cx + 48, cy + 46], (40, 22, 60), width=2)
    d.line([(cx + 36, cy + 34), (cx + 42, cy + 42)], fill="white", width=2)

    outlined_ellipse(d, [cx - 76, cy + 28, cx - 40, cy + 64], fur)
    outlined_ellipse(d, [cx + 40, cy + 28, cx + 76, cy + 64], fur)
    outlined_ellipse(d, [cx - 84, cy + 50, cx - 66, cy + 70], fur_light)
    outlined_ellipse(d, [cx + 66, cy + 50, cx + 84, cy + 70], fur_light)

    outlined_ellipse(d, [cx - 56, cy - 68, cx + 56, cy + 16], fur)
    outlined_ellipse(d, [cx - 46, cy - 58, cx + 46, cy + 6], fur_light)
    fur_tufts(d, cx, cy - 28, 10, 52, 7, fur)

    # Small cute horns
    outlined_polygon(d, [(cx - 30, cy - 54), (cx - 34, cy - 78), (cx - 18, cy - 64)], (214, 168, 96))
    outlined_polygon(d, [(cx + 30, cy - 54), (cx + 34, cy - 78), (cx + 18, cy - 64)], (214, 168, 96))

    # Eyes with lashes — MSM glossy style
    msm_eye(d, cx - 24, cy - 26, 21, (200, 60, 180))
    msm_eye(d, cx + 24, cy - 26, 21, (200, 60, 180))
    for side in (-1, 1):
        ex = cx + side * 24
        d.line([(ex - side * 20, cy - 38), (ex - side * 26, cy - 48)], fill=OUTLINE, width=3)
        d.line([(ex - side * 14, cy - 40), (ex - side * 16, cy - 50)], fill=OUTLINE, width=2)

    # Happy open smile
    d.arc([cx - 24, cy - 4, cx + 24, cy + 18], 15, 165, fill=OUTLINE, width=OUTLINE_W)
    outlined_ellipse(d, [cx - 10, cy + 2, cx + 10, cy + 12], (180, 80, 120), width=2)
    outlined_polygon(d, [(cx - 10, cy + 2), (cx - 6, cy + 12), (cx - 14, cy + 8)], "white", width=2)
    outlined_polygon(d, [(cx + 10, cy + 2), (cx + 14, cy + 8), (cx + 6, cy + 12)], "white", width=2)

    d.ellipse([cx - 48, cy - 12, cx - 30, cy + 4], fill=(255, 120, 180, 120))
    d.ellipse([cx + 30, cy - 12, cx + 48, cy + 4], fill=(255, 120, 180, 120))

    return img


def draw_crowd_back(size=64, hair=(80, 60, 140)):
    img = Image.new("RGBA", (size, int(size * 1.2)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = size // 2
    outlined_ellipse(d, [cx - 24, size - 32, cx + 24, size - 6], (60, 50, 80))
    outlined_ellipse(d, [cx - 20, 6, cx + 20, 42], (190, 160, 210))
    outlined_ellipse(d, [cx - 22, 2, cx + 22, 38], hair)
    outlined_rounded_rect(d, [cx - 18, 18, cx + 18, 50], 6, hair)
    return img


def draw_stage_bg(w=1920, h=1080):
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        r = int(10 + t * 20)
        g = int(5 + t * 15)
        b = int(30 + t * 40)
        d.line([(0, y), (w, y)], fill=(r, g, b))
    for x in range(0, w, 120):
        d.rectangle([x, h - 180, x + 60, h - 160], fill=(255, 50, 120))
        d.rectangle([x + 60, h - 180, x + 120, h - 160], fill=(50, 200, 255))
    d.rectangle([0, h - 160, w, h], fill=(25, 18, 40))
    d.rectangle([0, h - 165, w, h - 158], fill=(255, 209, 102))
    return img


if __name__ == "__main__":
    print("Generating sprites...")
    save(draw_benny(), "benny.png")
    save(draw_lizzy(), "lizzy.png")
    colors = [(80, 60, 140), (200, 80, 120), (60, 120, 200), (180, 140, 60), (100, 180, 100)]
    for i, c in enumerate(colors):
        save(draw_crowd_back(hair=c), f"crowd_back_{i}.png")
    save(draw_stage_bg(), "stage_nightlife_bg.png")
    print("Done.")
