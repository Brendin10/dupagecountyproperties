#!/usr/bin/env python3
"""Copy uploaded Bandland Logo.png into assets/brand/bandland-logo.png."""

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "Bandland Logo.png"
DST = ROOT / "assets" / "brand" / "bandland-logo.png"


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"Missing source logo: {SRC}")
    DST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SRC, DST)
    print(f"Copied {SRC.name} -> {DST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
