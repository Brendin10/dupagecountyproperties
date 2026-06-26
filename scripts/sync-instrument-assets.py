#!/usr/bin/env python3
"""Copy uploaded Title Case PNGs from assets/ into assets/instruments/{id}.png."""

from pathlib import Path

try:
    from PIL import Image
except ImportError:
    Image = None

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets"
DST = ROOT / "assets" / "instruments"

UPLOAD_MAP = {
    "Trash Can Lid.png": "trash-lid.png",
    "Tambourine.png": "tambourine.png",
    "Ukulele.png": "ukulele.png",
    "Electric Guitar.png": "electric-guitar.png",
    "Acoustic Guitar.png": "acoustic-guitar.png",
    "Bass Guitar.png": "bass-guitar.png",
    "Banjo.png": "banjo.png",
    "Piano.png": "piano.png",
    "Keyboard.png": "keyboard.png",
    "Organ.png": "organ.png",
    "Trumpet.png": "trumpet.png",
    "Trombone.png": "trombone.png",
    "Saxophone.png": "saxophone.png",
    "Violin.png": "violin.png",
    "Flute.png": "flute.png",
    "Harmonica.png": "harmonica.png",
    "Clarinet.png": "clarinet.png",
    "Accordion.png": "accordion.png",
    "Synth Lead.png": "synth-lead.png",
    "Triangle.png": "triangle.png",
    "Xylophone.png": "xylophone.png",
    "Cowbell.png": "cowbell.png",
    "Bongos.png": "bongo.png",
    "Drum Kit.png": "drum-kit.png",
}

MAX_EDGE = 1024
JPEG_QUALITY = 85


def optimize_png(src: Path, dst: Path) -> None:
    if Image is None:
        dst.write_bytes(src.read_bytes())
        return
    img = Image.open(src)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA")
    w, h = img.size
    if max(w, h) > MAX_EDGE:
        scale = MAX_EDGE / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, "PNG", optimize=True)


def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    synced = []
    for src_name, dst_name in UPLOAD_MAP.items():
        src = SRC / src_name
        if not src.is_file():
            continue
        dst = DST / dst_name
        optimize_png(src, dst)
        synced.append(dst_name)
    print(f"Synced {len(synced)} instrument(s): {', '.join(synced)}")


if __name__ == "__main__":
    main()
