const BandAudio = (() => {
  let members = [];
  let song = null;
  let bpm = 88;
  let running = false;
  let lastBeat = -1;
  let lastSection = null;
  let onMemberPlay = null;

  const CHORD_PART_KEYS = ['ukulele', 'electric-guitar', 'Guitar', 'Keys'];
  const GHOST_PARTS = [
    { key: 'drum-kit', role: 'Drums', scale: 0.72 },
    { key: 'Bass', role: 'Bass', scale: 0.65 },
    { key: 'Keys', role: 'Keys', scale: 0.55 },
    { key: 'Guitar', role: 'Guitar', scale: 0.5 },
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
    for (const key of CHORD_PART_KEYS) {
      const part = song.parts[key];
      if (!part?.length) continue;
      let chord = 'C';
      for (const ev of part) {
        if (ev.beat > beat) break;
        if (ev.chord) chord = ev.chord;
      }
      return chord;
    }
    return 'C';
  }

  function sectionIntensity(secId) {
    if (secId === 'chorus') return 1;
    if (secId === 'verse') return 0.78;
    if (secId === 'intro') return 0.55;
    return 0.65;
  }

  function playLiveBacking(ac, now, beatIdx, sec, chord, intensity) {
    const isChorus = sec?.id === 'chorus';
    const isVerse = sec?.id === 'verse';

    if (sec?.id !== lastSection) {
      lastSection = sec?.id;
      const padVol = isChorus ? 0.13 : isVerse ? 0.1 : 0.07;
      AudioEngine.playSongPad(ac, now, chord, padVol * intensity);
      if (isChorus) AudioEngine.playCymbal(ac, now, 0.24);
    }

    if (isChorus && beatIdx % 4 === 2) {
      AudioEngine.playLiveShimmer(ac, now, chord, 0.055 * intensity);
    }

    if (beatIdx % 16 === 0 && (isChorus || isVerse)) {
      AudioEngine.playLiveStrum(ac, now, chord, 0.09 * intensity);
    }
  }

  function playGhostParts(ac, now, beatIdx, intensity) {
    const soloBoost = members.length === 0 ? 1.3 : 1;
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
    const bandVol = Math.min(1, 0.7 + members.length * 0.07);

    playLiveBacking(ac, now, beatIdx, sec, chord, intensity);
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
    lastSection = null;
  }

  function stop() {
    running = false;
    lastBeat = -1;
    lastSection = null;
  }

  return { setBand, setOnMemberPlay, start, stop, onBeat, get running() { return running; } };
})();
