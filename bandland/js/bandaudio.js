const BandAudio = (() => {
  let members = [];
  let song = null;
  let bpm = 88;
  let running = false;
  let lastBeat = -1;
  let onMemberPlay = null;

  function setBand(bandMembers, songObj) {
    members = bandMembers || [];
    song = songObj;
  }

  function setOnMemberPlay(fn) {
    onMemberPlay = fn;
  }

  function onBeat(beatIdx) {
    if (!running || !song || members.length === 0) return;
    if (beatIdx === lastBeat) return;
    if (beatIdx >= (song.totalBeats || 9999)) return;
    lastBeat = beatIdx;

    members.forEach((m, i) => {
      const events = getPartEvents(song, m.role, beatIdx);
      events.forEach((ev) => {
        setTimeout(() => {
          AudioEngine.playPartEvent(ev, m.role, 0.55);
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

  return { setBand, setOnMemberPlay, start, stop, onBeat, get running() { return running; } };
})();
