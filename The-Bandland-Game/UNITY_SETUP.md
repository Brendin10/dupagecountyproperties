# Unity Setup — Fix "No Unity project found"

## What went wrong

Your **https://github.com/Brendin10/Bandland** repo previously only had Python files (`Bandland.py`, `requirements.txt`). Unity Hub needs these folders **at the folder you open**:

```
Assets/
Packages/
ProjectSettings/
```

The game was nested inside another repo (`The-Bandland-Game/` or `BandlandUnity/`), so opening the repo root showed "no Unity project."

## Fix your Bandland repo (one time)

On your computer, in a terminal:

```bash
# 1. Clone your Bandland repo (or cd into your existing clone)
git clone https://github.com/Brendin10/Bandland.git
cd Bandland

# 2. Pull the Unity project from the development branch
git fetch https://github.com/Brendin10/dupagecountyproperties.git cursor/bandland-unity-e80e
git checkout cursor/bandland-unity-e80e -- The-Bandland-Game

# 3. Move Unity files to repo root (so Unity Hub finds them)
mv The-Bandland-Game/Assets .
mv The-Bandland-Game/Packages .
mv The-Bandland-Game/ProjectSettings .
mv The-Bandland-Game/tools .
mv The-Bandland-Game/.gitignore .
cp The-Bandland-Game/README.md .
rm -rf The-Bandland-Game

# 4. Commit and push
git add -A
git commit -m "Move Unity project to repo root for Unity Hub"
git push
```

## Open in Unity Hub

1. **Unity Hub → Open → Add project from disk**
2. Select the **Bandland** folder — the one that directly contains `Assets`, `Packages`, and `ProjectSettings`
3. Use **Unity 2022.3 LTS** or newer
4. When TMP prompts you, import **TextMeshPro Essentials**
5. Menu: **Bandland → Setup Project (Run Once)**
6. Open `Assets/Bandland/Scenes/CharacterSelect.unity` and press **Play**

## Quick check

You picked the right folder if you see all three at the same level:

- `Assets/`
- `Packages/manifest.json`
- `ProjectSettings/ProjectVersion.txt`

If you only see `bandland/` (web game) or `The-Bandland-Game/`, go **into** the Unity folder or run the fix above.
