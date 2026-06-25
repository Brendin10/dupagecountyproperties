#!/usr/bin/env python3
"""Generate Bandland 2D sprites for Unity."""

from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "Assets" / "Bandland" / "Art" / "Sprites"
OUT.mkdir(parents=True, exist_ok=True)


def save(img: Image.Image, name: str):
    img.save(OUT / name, "PNG")
    print(f"  {name}")


def draw_benny(size=256):
    img = Image.new("RGBA", (size, int(size * 1.35)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2 + 10
    purple = (155, 107, 255)
    purple_l = (196, 156, 255)
    brown = (107, 62, 30)
    brown_l = (139, 90, 43)

    # shadow
    d.ellipse([cx - 50, size - 28, cx + 50, size - 8], fill=(0, 0, 0, 60))
    # legs
    d.rounded_rectangle([cx - 38, cy + 55, cx - 14, cy + 95], radius=10, fill=purple)
    d.rounded_rectangle([cx + 14, cy + 55, cx + 38, cy + 95], radius=10, fill=purple)
    # body
    d.ellipse([cx - 58, cy - 10, cx + 58, cy + 70], fill=purple)
    d.ellipse([cx - 48, cy, cx + 48, cy + 58], fill=purple_l)
    # jacket
    d.polygon([(cx - 55, cy - 5), (cx, cy - 28), (cx + 55, cy - 5),
               (cx + 50, cy + 52), (cx, cy + 62), (cx - 50, cy + 52)], fill=brown)
    d.polygon([(cx - 42, cy + 2), (cx, cy - 12), (cx + 42, cy + 2),
               (cx + 38, cy + 45), (cx, cy + 52), (cx - 38, cy + 45)], fill=brown_l)
    d.rectangle([cx - 8, cy - 18, cx + 8, cy + 48], fill=(93, 52, 24))
    # arms
    d.ellipse([cx - 72, cy + 8, cx - 38, cy + 48], fill=purple)
    d.ellipse([cx + 38, cy + 8, cx + 72, cy + 48], fill=purple)
    # head
    d.ellipse([cx - 52, cy - 78, cx + 52, cy + 18], fill=purple)
    d.ellipse([cx - 44, cy - 70, cx + 44, cy + 10], fill=purple_l)
    # horns
    d.polygon([(cx - 32, cy - 68), (cx - 38, cy - 98), (cx - 18, cy - 78)], fill=(201, 160, 108))
    d.polygon([(cx + 32, cy - 68), (cx + 38, cy - 98), (cx + 18, cy - 78)], fill=(201, 160, 108))
    # eyes
    for ex in (cx - 22, cx + 22):
        d.ellipse([ex - 14, cy - 42, ex + 14, cy - 14], fill="white")
        d.ellipse([ex - 8, cy - 36, ex + 8, cy - 20], fill=(45, 27, 105))
        d.ellipse([ex - 4, cy - 34, ex + 2, cy - 28], fill="white")
    # brows
    d.arc([cx - 36, cy - 52, cx - 8, cy - 36], 200, 340, fill=(90, 53, 204), width=4)
    d.arc([cx + 8, cy - 52, cx + 36, cy - 36], 200, 340, fill=(90, 53, 204), width=4)
    # mouth + fangs
    d.arc([cx - 18, cy - 18, cx + 18, cy + 2], 10, 170, fill=(74, 45, 145), width=3)
    d.polygon([(cx - 10, cy - 10), (cx - 6, cy - 2), (cx - 14, cy - 4)], fill="white")
    d.polygon([(cx + 10, cy - 10), (cx + 14, cy - 4), (cx + 6, cy - 2)], fill="white")
    # blush
    d.ellipse([cx - 40, cy - 22, cx - 24, cy - 10], fill=(255, 142, 200, 90))
    d.ellipse([cx + 24, cy - 22, cx + 40, cy - 10], fill=(255, 142, 200, 90))
    # skull patch
    d.ellipse([cx - 38, cy + 8, cx - 22, cy + 24], fill=(245, 240, 232))
    d.text((cx - 33, cy + 10), "☠", fill=(50, 50, 50))
    return img


def draw_lizzy(size=256):
    img = Image.new("RGBA", (size, int(size * 1.35)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2 + 10
    purple = (155, 107, 255)
    purple_l = (196, 156, 255)
    pink = (255, 126, 185)
    pink_l = (255, 175, 210)

    d.ellipse([cx - 50, size - 28, cx + 50, size - 8], fill=(0, 0, 0, 60))
    # ponytail
    d.ellipse([cx - 22, cy - 108, cx + 22, cy - 58], fill=(208, 80, 255))
    d.polygon([(cx - 18, cy - 88), (cx - 30, cy - 30), (cx - 10, cy - 50)], fill=(224, 112, 255))
    d.polygon([(cx + 18, cy - 88), (cx + 30, cy - 30), (cx + 10, cy - 50)], fill=(192, 64, 238))
    # legs & body
    d.rounded_rectangle([cx - 38, cy + 55, cx - 14, cy + 95], radius=10, fill=purple)
    d.rounded_rectangle([cx + 14, cy + 55, cx + 38, cy + 95], radius=10, fill=purple)
    d.ellipse([cx - 56, cy - 8, cx + 56, cy + 68], fill=purple)
    d.ellipse([cx - 46, cy + 2, cx + 46, cy + 56], fill=purple_l)
    # pink jacket
    d.polygon([(cx - 52, cy - 2), (cx, cy - 24), (cx + 52, cy - 2),
               (cx + 48, cy + 50), (cx, cy + 58), (cx - 48, cy + 50)], fill=pink)
    d.polygon([(cx - 40, cy + 6), (cx, cy - 8), (cx + 40, cy + 6),
               (cx + 36, cy + 42), (cx, cy + 48), (cx - 36, cy + 42)], fill=pink_l)
    d.rectangle([cx - 8, cy - 16, cx + 8, cy + 44], fill=(255, 94, 168))
    d.ellipse([cx + 38, cy + 8, cx + 52, cy + 22], fill=(45, 27, 105))
    # arms & head
    d.ellipse([cx - 70, cy + 10, cx - 36, cy + 46], fill=purple)
    d.ellipse([cx + 36, cy + 10, cx + 70, cy + 46], fill=purple)
    d.ellipse([cx - 50, cy - 74, cx + 50, cy + 16], fill=purple)
    d.ellipse([cx - 42, cy - 66, cx + 42, cy + 8], fill=purple_l)
    d.polygon([(cx - 28, cy - 62), (cx - 32, cy - 82), (cx - 16, cy - 72)], fill=(201, 160, 108))
    d.polygon([(cx + 28, cy - 62), (cx + 32, cy - 82), (cx + 16, cy - 72)], fill=(201, 160, 108))
    for ex in (cx - 22, cx + 22):
        d.ellipse([ex - 15, cy - 40, ex + 15, cy - 12], fill="white")
        d.ellipse([ex - 8, cy - 34, ex + 8, cy - 18], fill=(45, 27, 105))
        d.ellipse([ex - 4, cy - 32, ex + 2, cy - 26], fill="white")
    d.arc([cx - 20, cy - 16, cx + 20, cy + 4], 10, 170, fill=(74, 45, 145), width=3)
    d.polygon([(cx - 8, cy - 8), (cx - 4, cy), (cx - 12, cy - 2)], fill="white")
    d.polygon([(cx + 8, cy - 8), (cx + 12, cy - 2), (cx + 4, cy)], fill="white")
    d.ellipse([cx - 42, cy - 20, cx - 26, cy - 8], fill=(255, 142, 200, 100))
    d.ellipse([cx + 26, cy - 20, cx + 42, cy - 8], fill=(255, 142, 200, 100))
    return img


def draw_crowd_back(size=64, hair=(80, 60, 140)):
    img = Image.new("RGBA", (size, int(size * 1.2)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = size // 2
    # shoulders
    d.ellipse([cx - 22, size - 30, cx + 22, size - 4], fill=(60, 50, 80))
    # head back
    d.ellipse([cx - 18, 8, cx + 18, 44], fill=(180, 150, 200))
    # hair from behind
    d.ellipse([cx - 20, 4, cx + 20, 40], fill=hair)
    d.rectangle([cx - 16, 20, cx + 16, 48], fill=hair)
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
    # neon strip
    for x in range(0, w, 120):
        d.rectangle([x, h - 180, x + 60, h - 160], fill=(255, 50, 120))
        d.rectangle([x + 60, h - 180, x + 120, h - 160], fill=(50, 200, 255))
    # stage floor
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
