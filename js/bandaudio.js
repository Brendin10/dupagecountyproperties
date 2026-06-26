const BandAudio = (() => {
  let members = [];
  let song = null;
  let bpm = 88;
  let running = false;
  let lastBeat = -1;
  let onMemberPlay = null;

  const GHOST_PARTS = [
    { key: 'drum-kit', role: 'Drums', scale: 0.12 },
    { key: 'Bass', role: 'Bass', scale: 0.1 },
    { key: 'Keys', role: 'Keys', scale: 0.08 },
  ];

  function setBand(bandMembers, songObj) {
    members = bandMembers || [];
    song = songObj;
  }

  function setOnMemberPlay(fn) {
    onMemberPlay = fn;
  }

  function hasRole(role) {
    return members.some((m) => m.role === role);
  }

  function getChordAtBeat(beat) {
    if (!song?.parts) return 'C';
    const keys = ['ukulele', 'electric-guitar', 'Guitar', 'Keys', 'piano', 'keyboard'];
    for (const key of keys) {
      const part = song.parts[key];
      if (!part?.length) continue;
      let chord = 'C';
      for (const ev of part) {
        if (ev.beat > beat) break;
        if (ev.chord) chord = ev.chord;
      }
      return chord;
    }
    return song.meta?.chords?.verse?.[0] || 'C';
  }

  function sectionIntensity(secId) {
    if (secId === 'chorus') return 1;
    if (secId === 'verse') return 0.82;
    if (secId === 'intro') return 0.62;
    return 0.7;
  }

  function playDanceBacking(ac, now, beatIdx, sec, chord, intensity) {
    const danceStyle = song?.meta?.danceStyle || 'funk-house';
    const drumStyle = song?.meta?.drumStyle || 'rock';
    AudioEngine.playDanceBeat(ac, now, beatIdx, danceStyle, chord, sec?.id, intensity, drumStyle);
  }

  function playGhostParts(ac, now, beatIdx, intensity) {
    const soloBoost = members.length === 0 ? 1.15 : 1;
    for (const ghost of GHOST_PARTS) {
      if (hasRole(ghost.role)) continue;
      const events = getPartEvents(song, ghost.key, beatIdx);
      events.forEach((ev) => {
        AudioEngine.playPartEvent(ev, ghost.key, ghost.scale * intensity * soloBoost);
      });
    }
  }

  function onBeat(beatIdx) {
    if (!running || !song) return;
    if (beatIdx === lastBeat) return;
    if (beatIdx >= (song.totalBeats || 9999)) return;
    lastBeat = beatIdx;

    const ac = AudioEngine.getCtx();
    const now = ac.currentTime;
    const sec = sectionAt(song.sections, beatIdx);
    const chord = getChordAtBeat(beatIdx);
    const intensity = sectionIntensity(sec?.id);
    const bandVol = Math.min(0.45, 0.22 + members.length * 0.04);

    playDanceBacking(ac, now, beatIdx, sec, chord, intensity);
    playGhostParts(ac, now, beatIdx, intensity);

    members.forEach((m, i) => {
      const events = getPartEvents(song, m.role, beatIdx);
      events.forEach((ev) => {
        setTimeout(() => {
          AudioEngine.playPartEvent(ev, m.role, bandVol);
          onMemberPlay?.(m, i);
        }, i * 25);
      });
    });
  }

  function start(bpmVal) {
    bpm = bpmVal;
    running = true;
    lastBeat = -1;
  }

  function stop() {
    running = false;
    lastBeat = -1;
  }

  function syncToBeat(beatIdx) {
    lastBeat = beatIdx - 1;
  }

  return { setBand, setOnMemberPlay, start, stop, syncToBeat, onBeat, get running() { return running; } };
})();
