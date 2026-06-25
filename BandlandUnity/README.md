# Bandland — Unity 2D

A 2D rhythm gig game ported from the web prototype. Play as **Benny** or **Lizzy**, perform at nightlife venues, hit beats on time, and build crowd hype.

## Requirements

- **Unity 2022.3 LTS** or newer (2022.3.50f1 recommended)
- 2D project template (or empty 3D — scripts use orthographic camera)

## First-Time Setup

1. Open the `BandlandUnity` folder in Unity Hub
2. Wait for packages to import (TextMeshPro will prompt to import essentials — accept)
3. Run menu: **Bandland → Setup Project (Run Once)**
4. Open `Assets/Bandland/Scenes/CharacterSelect.unity`
5. Press **Play**

## Game Flow

| Scene | Purpose |
|-------|---------|
| `CharacterSelect` | Pick Benny or Lizzy |
| `Hub` | Choose venue, view BandCash & Star Meter |
| `Gig` | Cutscene → rhythm gameplay → results |

## Gig Features

- **Cutscene transition** — fade in, "TONIGHT AT [VENUE]", performer walks to stage
- **Nightlife atmosphere** — dark stage, neon strips, sweeping spotlights pulsing to the beat
- **Rhythm gameplay** — tap on the beat; Perfect / Good / Miss timing windows
- **Crowd from behind** — audience sprites face the stage (you see the backs of their heads)
- **Crowd cheer** — hit 5+ beats in a row on time to trigger cheer SFX + bounce animation

## Venues & BPM

| Venue | Star Required | BPM |
|-------|---------------|-----|
| Street Corner | 0 | 100 |
| Local Tavern | 25 | 110 |
| Town Square | 60 | 115 |
| Local Talent Show | 100 | 120 |
| Small Concert Venue | 160 | 128 |

## Character Art

Benny and Lizzy use a **chunky cartoon monster** look inspired by *My Singing Monsters* — thick outlines, glossy eyes, fur tufts, and cel-shaded bodies. This applies to character design only; gameplay is original to Bandland.

Regenerate sprites after editing `tools/generate_sprites.py`:

```bash
cd BandlandUnity
python3 tools/generate_sprites.py
python3 tools/generate_audio.py
```

Then re-run **Bandland → Setup Project** in Unity to refresh imports.

## Project Structure

```
Assets/Bandland/
  Scripts/
    Core/       GameState, scene navigation
    Gig/        Rhythm, crowd, cutscene, nightlife
    UI/         Character select, hub
  Editor/       One-click scene setup
  Resources/    Sprites, audio, config
  Scenes/       Created by setup menu
```

For sprite loading at runtime, sprites must live under `Resources/Sprites/`. The setup menu copies and configures them automatically.

## Gig Gameplay Details

### Rhythm
- Each venue has its own **BPM** (100–128)
- Tap the instrument button on the beat
- **Perfect** (±0.12s) — best tips and crowd growth
- **Good** (±0.22s) — moderate reward
- **Miss** — breaks your combo

### Crowd Cheer
- Build a combo by hitting Perfect or Good beats in a row
- Every **5** consecutive on-beat hits triggers:
  - Crowd cheer sound effect
  - Crowd bounce animation (backs of heads toward the stage)
  - Bonus cheer meter progress

### Visual Layout
```
   [ Camera ]
       ↓
   Crowd row (backs of heads, facing down toward stage)
       ↓
   Performer (Benny / Lizzy on stage)
       ↓
   Neon strips + spotlights (nightlife ambience)
```

The original web prototype lives in `/bandland`. This Unity project adds cutscenes, rhythm timing, nightlife visuals, back-facing crowd, and cheer combos.

## Next Steps

- Replace placeholder sprites with hand-drawn 2D art
- Add shop / inventory from web version
- Band member recruitment
- Save system (PlayerPrefs or JSON)
- Input System support for mobile tap
