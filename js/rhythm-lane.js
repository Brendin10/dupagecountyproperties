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
          <div class="gem-fx-layer" id="gem-fx-layer"></div>
        </div>
        <div class="highway-footer">
          <span class="song-playing">♪ <span id="song-section-label">${songName}</span></span>
          <span class="combo-display" id="combo-display"></span>
        </div>
        <p class="rhythm-hint" id="rhythm-hint">Tap quick gems · hold long gems through the zone!</p>
      </div>`;
  }

  function noteEl(note, headPct, isMelodic, holdingKey) {
    const dur = note.dur || 1;
    const widthPct = Math.max(4, (dur / LOOKAHEAD) * (88 - HIT_X));
    const isHold = note.isHold || dur > 1.05;
    const key = `${note.beat}:${note.chord || ''}:${note.note || ''}:${note.hit || ''}`;
    const isHeld = holdingKey && holdingKey === key;
    const cls = [
      'note-gem',
      note.melodic || isMelodic ? 'melodic' : 'percussion',
      isHold ? 'hold' : 'tap',
      note.active ? 'active' : '',
      isHeld ? 'holding' : '',
    ].filter(Boolean).join(' ');
    const shape = isHold ? '▬' : (note.melodic || isMelodic ? '◇' : '◆');
    return `<div class="${cls}" style="left:${headPct}%;width:${widthPct}%" data-beat="${note.beat}" data-dur="${dur}" data-key="${key}">
      <span class="gem-shape">${shape}</span>
      <span class="gem-label">${note.label}</span>
    </div>`;
  }

  function spawnBurst(xPct, rating, isMelodic) {
    const layer = document.getElementById('gem-fx-layer');
    if (!layer) return;
    const colors = rating === 'perfect'
      ? ['#ffd166', '#fff', '#ff6b9d']
      : isMelodic ? ['#ff6b9d', '#ffb347', '#fff'] : ['#6bcbff', '#7ee8ff', '#fff'];
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('div');
      p.className = `gem-particle burst-${rating}`;
      const ang = (i / 10) * Math.PI * 2;
      const dist = 28 + Math.random() * 36;
      p.style.left = `${xPct}%`;
      p.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
      p.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
      p.style.background = colors[i % colors.length];
      layer.appendChild(p);
      setTimeout(() => p.remove(), 520);
    }
    const ring = document.createElement('div');
    ring.className = `gem-burst-ring burst-${rating}`;
    ring.style.left = `${xPct}%`;
    layer.appendChild(ring);
    setTimeout(() => ring.remove(), 480);
  }

  function explodeGem(note, rating, isMelodic) {
    if (!note) return;
    const lane = document.getElementById('note-lane');
    if (!lane) return;
    const key = `${note.beat}:${note.chord || ''}:${note.note || ''}:${note.hit || ''}`;
    const gem = lane.querySelector(`[data-key="${key}"]`) || lane.querySelector(`[data-beat="${note.beat}"]`);
    if (!gem) {
      spawnBurst(HIT_X, rating, isMelodic);
      return;
    }
    const xPct = parseFloat(gem.style.left) || HIT_X;
    gem.classList.add('gem-exploding', `burst-${rating}`);
    spawnBurst(xPct, rating, isMelodic);
    setTimeout(() => gem.remove(), 300);
  }

  function update(song, partKey, elapsed, bpm, isMelodic, hitBeats, missedBeats, holdingKey, leadInBeat = 0) {
    const lane = document.getElementById('note-lane');
    if (!lane) return;

    const notes = getUpcomingNotes(song, partKey, elapsed, bpm, LOOKAHEAD, hitBeats, missedBeats, leadInBeat);
    const beatDur = 60 / bpm;
    const currentBeat = elapsed / beatDur;

    lane.innerHTML = notes.map((n) => {
      const pct = HIT_X + (n.dist / LOOKAHEAD) * (88 - HIT_X);
      return noteEl(n, Math.min(92, Math.max(HIT_X - 2, pct)), isMelodic, holdingKey);
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
      if (!holdingKey) hitZone.classList.remove('holding');
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
    zone.classList.add('hit-pop');
    setTimeout(() => {
      zone.classList.remove(`flash-${rating}`);
      zone.classList.remove('hit-pop');
    }, 280);
  }

  return { renderHtml, update, flashHit, explodeGem, HIT_X, LOOKAHEAD };
})();
