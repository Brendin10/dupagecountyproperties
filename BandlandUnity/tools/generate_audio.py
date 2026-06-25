#!/usr/bin/env python3
"""Generate placeholder WAV audio for Bandland Unity."""

import math
import struct
import wave
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "Assets" / "Bandland" / "Audio"
OUT.mkdir(parents=True, exist_ok=True)

SR = 44100


def write_wav(path: Path, samples):
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = b"".join(struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in samples)
        w.writeframes(frames)


def cymbal_crash():
    n = int(SR * 0.35)
    samples = []
    for i in range(n):
        t = i / SR
        env = (1 - i / n) ** 2
        noise = (hash(i) % 1000 / 500 - 1) * env * 0.6
        ring = math.sin(2 * math.pi * (800 - 400 * t) * t) * env * 0.2
        samples.append(noise + ring)
    write_wav(OUT / "cymbal_crash.wav", samples)


def crowd_cheer():
    n = int(SR * 1.2)
    samples = []
    for i in range(n):
        t = i / SR
        env = min(1, t * 8) * max(0, 1 - (t - 0.8) * 3)
        noise = (hash(i * 7) % 1000 / 500 - 1) * env * 0.15
        tone = sum(math.sin(2 * math.pi * f * t) for f in (300, 450, 600)) / 3 * env * 0.12
        samples.append(noise + tone)
    write_wav(OUT / "crowd_cheer.wav", samples)


def beat_tick():
    n = int(SR * 0.05)
    samples = [math.sin(2 * math.pi * 1000 * i / SR) * (1 - i / n) * 0.3 for i in range(n)]
    write_wav(OUT / "beat_tick.wav", samples)


if __name__ == "__main__":
    cymbal_crash()
    crowd_cheer()
    beat_tick()
    print("Audio generated in", OUT)
