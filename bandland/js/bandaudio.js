const BandAudio = (() => {
  let members = [];
  let song = null;
  let bpm = 88;
  let running = false;
  let lastBeat = -1;
  let lastSection = null;
  let onMemberPlay = null;

  const CHORD_PART_KEYS = ['ukulele', 'electric-guitar', 'Guitar', 'Keys'];

  function setBand(bandMembers, songObj) {
    members = bandMembers || [];
    song = songObj;
  }

  function setOnMemberPlay(fn) {
    onMemberPlay = fn;
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

  function onBeat(beatIdx) {
    if (!running || !song || members.length === 0) return;
    if (beatIdx === lastBeat) return;
    if (beatIdx >= (song.totalBeats || 9999)) return;
    lastBeat = beatIdx;

    const ac = AudioEngine.getCtx();
    const now = ac.currentTime;
    const sec = sectionAt(song.sections, beatIdx);
    const bandVol = Math.min(0.95, 0.62 + members.length * 0.06);

    if (sec?.id !== lastSection) {
      lastSection = sec?.id;
      const padVol = sec?.id === 'chorus' ? 0.11 : sec?.id === 'verse' ? 0.08 : 0.06;
      AudioEngine.playSongPad(ac, now, getChordAtBeat(beatIdx), padVol);
    }

    if (beatIdx % 4 === 0 && sec?.id === 'chorus') {
      AudioEngine.playSongPad(ac, now, getChordAtBeat(beatIdx), 0.05 + members.length * 0.008);
    }

    if (beatIdx % 8 === 0 && sec?.id === 'verse') {
      AudioEngine.playSongPad(ac, now, getChordAtBeat(beatIdx), 0.04);
    }

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
