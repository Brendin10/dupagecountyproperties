# The Bandland Game

A **Unity 2D** rhythm gig game. Play as **Benny** or **Lizzy**, hit beats on a scrolling lane, grow the crowd, and unlock bigger venues.

## Requirements

- **Unity 2022.3 LTS** or newer
- Open this folder directly in **Unity Hub** (it is the project root)

## Quick Start

1. Open the project in Unity Hub
2. Import **TextMeshPro Essentials** when prompted
3. Menu: **Bandland → Setup Project (Run Once)**
4. Open `Assets/Bandland/Scenes/CharacterSelect.unity`
5. Press **Play**

## Gig Gameplay

### Beat Lane
- Notes scroll toward the **gold hit line**
- Tap **TAP ON BEAT!** when a note aligns with the line
- **Perfect** / **Good** / **Miss** timing windows per venue BPM

### Star Meter
- On-beat hits **gain** star power
- Missed taps **lose** star power (−0.75 ★)
- Notes that pass the line **lose** more star power (−1.0 ★)

### Crowd Volume
- A looping crowd murmur gets **louder** as your combo grows
- Misses **drop** the crowd volume
- 5-hit streaks trigger a **cheer** burst

## Venues

| Venue | Stars to unlock | BPM |
|-------|-----------------|-----|
| Street Corner | 0 | 100 |
| Local Tavern | 25 | 110 |
| Town Square | 60 | 115 |
| Local Talent Show | 100 | 120 |
| Small Concert Venue | 160 | 128 |

## Project Layout

```
Assets/Bandland/
  Scripts/     Game logic, rhythm, beat lane, crowd audio
  Editor/      Bandland → Setup Project menu
  Resources/   Sprites, audio, BandlandConfig
  Scenes/      Created by setup menu
tools/         Python scripts to regenerate art & audio
```

## Regenerate Assets

```bash
python3 tools/generate_sprites.py
python3 tools/generate_audio.py
```

Then run **Bandland → Setup Project** in Unity.

## Character Art

Benny and Lizzy use a chunky cartoon monster style inspired by *My Singing Monsters* (character design reference only).
