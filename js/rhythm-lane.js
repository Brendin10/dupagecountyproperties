const RhythmLane = (() => {
  const HIT_X = 18;
  const LOOKAHEAD = 2.8;

  function renderHtml(songName) {
    return `
      <div class="rhythm-highway" id="rhythm-highway">
        <div class="highway-glow"></div>
        <div class="highway-track">
          <div class="highway-grid"></div>
          <div class="hit-zone" id="hit-zone">
            <div class="hit-zone-core"></div>
            <div class="hit-zone-pulse" id="hit-zone-pulse"></div>
          </div>
          <div class="note-lane" id="note-lane"></div>
        </div>
        <div class="highway-footer">
          <span class="song-playing">♪ <span id="song-section-label">${songName}</span></span>
          <span class="combo-display" id="combo-display"></span>
        </div>
        <p class="rhythm-hint" id="rhythm-hint">Tap quick gems · hold long gems through the zone!</p>
      </div>`;
  }

  function noteEl(note, headPct, isMelodic) {
    const dur = note.dur || 1;
    const widthPct = Math.max(4, (dur / LOOKAHEAD) * (88 - HIT_X));
    const isHold = note.isHold || dur > 1.05;
    const cls = [
      'note-gem',
      note.melodic || isMelodic ? 'melodic' : 'percussion',
      isHold ? 'hold' : 'tap',
      note.active ? 'active' : '',
    ].filter(Boolean).join(' ');
    const shape = isHold ? '▬' : (note.melodic || isMelodic ? '◇' : '◆');
    return `<div class="${cls}" style="left:${headPct}%;width:${widthPct}%" data-beat="${note.beat}" data-dur="${dur}">
      <span class="gem-shape">${shape}</span>
      <span class="gem-label">${note.label}</span>
    </div>`;
  }

  function update(song, partKey, elapsed, bpm, isMelodic) {
    const lane = document.getElementById('note-lane');
    if (!lane) return;

    const notes = getUpcomingNotes(song, partKey, elapsed, bpm, LOOKAHEAD);
    const beatDur = 60 / bpm;
    const currentBeat = elapsed / beatDur;

    lane.innerHTML = notes.map((n) => {
      const pct = HIT_X + (n.dist / LOOKAHEAD) * (88 - HIT_X);
      return noteEl(n, Math.min(92, Math.max(HIT_X - 2, pct)), isMelodic);
    }).join('');

    const pulse = document.getElementById('hit-zone-pulse');
    if (pulse) {
      const near = notes.find((n) => Math.abs(n.beat - currentBeat) < 0.12 || n.active);
      pulse.classList.toggle('active', !!near);
    }

    const hitZone = document.getElementById('hit-zone');
    if (hitZone) {
      const inWindow = notes.some((n) => n.active || Math.abs(n.beat - currentBeat) < (isMelodic ? 0.22 : 0.18));
      hitZone.classList.toggle('ready', inWindow);
      hitZone.classList.toggle('holding', notes.some((n) => n.active && n.isHold));
    }

    const sectionEl = document.getElementById('song-section-label');
    if (sectionEl && song.sections) {
      const sec = getSongSection(song, elapsed, bpm);
      sectionEl.textContent = `${song.name} — ${sec?.name || ''}`;
    }
  }

  function flashHit(rating) {
    const zone = document.getElementById('hit-zone');
    if (!zone) return;
    zone.classList.remove('flash-perfect', 'flash-good', 'flash-miss');
    void zone.offsetWidth;
    zone.classList.add(`flash-${rating}`);
    setTimeout(() => zone.classList.remove(`flash-${rating}`), 280);
  }

  return { renderHtml, update, flashHit, HIT_X, LOOKAHEAD };
})();
