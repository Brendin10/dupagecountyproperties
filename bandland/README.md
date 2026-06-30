# Bandland

A 2D web game about building a band from a trash can lid to sold-out shows.

## Play Locally

```bash
cd bandland
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## Game Flow

1. **Pick your character** — Benny or Lizzy
2. **Find your first instrument** — tap the metal trash can lid
3. **Play gigs** — tap to perform, grow the crowd, earn BandCash and Star Meter
4. **Shop** — buy instruments, clothes, makeup, accessories, and band slots
5. **Unlock venues** — Street Corner → Local Tavern → Town Square → Local Talent Show → Small Concert Venue

## Progression

- **BandCash** — earned from tips during gigs; spent in the shop
- **Star Meter** — grows from crowd size, cheering, and tips; unlocks bigger venues
- **Band members** — recruited as your star power grows; requires purchased band slots

No build step required — vanilla HTML, CSS, and JavaScript.

## Audio Samples

Instrument and crowd audio uses hybrid playback: short WAV samples in `audio/instruments/` plus procedural Web Audio synthesis as fallback. Samples are procedurally generated in-repo (CC0) via `scripts/generate-instrument-samples.mjs`. Crowd cheer/boo clips live in `audio/`.
