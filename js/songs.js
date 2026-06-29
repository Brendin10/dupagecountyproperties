const INSTRUMENT_STEM_MAP = {
  'trash-lid': 'Drums',
  drums: 'Drums',
  bass: 'Bass',
  'electric-guitar': 'Lead',
  keys: 'Keys',
};

function buildSections(totalBeats) {
  const introLen = Math.round(totalBeats * 0.12);
  const outroLen = Math.round(totalBeats * 0.12);
  const verseLen = Math.round((totalBeats - introLen - outroLen) * 0.42);
  const chorusLen = totalBeats - introLen - verseLen - outroLen;
  const v1Start = introLen;
  const chorusStart = v1Start + verseLen;
  const outroStart = chorusStart + chorusLen;
  return [
    { id: 'intro', name: 'Intro', start: 0, end: introLen },
    { id: 'verse', name: 'Verse', start: v1Start, end: chorusStart },
    { id: 'chorus', name: 'Chorus', start: chorusStart, end: outroStart },
    { id: 'outro', name: 'Outro', start: outroStart, end: totalBeats },
  ];
}

function sectionAt(sections, beat) {
  if (!sections?.length) return { id: 'verse', name: 'Verse', start: 0, end: 9999 };
  return sections.find((s) => beat >= s.start && beat < s.end) || sections[sections.length - 1];
}

function getSongSection(song, elapsed, bpm) {
  const beat = elapsed / (60 / bpm);
  return sectionAt(song.sections, Math.min(beat, song.totalBeats - 1));
}

function getPlayerPartKey(instrument) {
  return INSTRUMENT_STEM_MAP[instrument?.id] || 'Drums';
}

function getPlayerStemKey(instrument) {
  return getPlayerPartKey(instrument);
}

function filterPartForInstrument(part, instrument) {
  if (!part?.length || !instrument) return part || [];
  if (getPlayerPartKey(instrument) === 'Drums') {
    return part.filter((ev) => !ev.hit || ev.hit === 'kick' || ev.hit === 'snare');
  }
  return part;
}

function getPartEvents(song, partKey, beat, instrument = null) {
  const raw = song.parts?.[partKey];
  const part = instrument ? filterPartForInstrument(raw, instrument) : raw;
  if (!part || beat < 0 || beat >= song.totalBeats) return [];
  return part.filter((e) => e.beat === Math.floor(beat));
}

function eventLabel(ev) { return ev.chord || ev.note || ev.hit || '•'; }

function getUpcomingNotes(song, partKey, elapsed, bpm, lookAhead, hitBeats, missedBeats, leadInBeat = 0, instrument = null) {
  const la = lookAhead ?? 3;
  const beatDur = 60 / bpm;
  const rawPart = song.parts?.[partKey] || [];
  const part = instrument ? filterPartForInstrument(rawPart, instrument) : (
    partKey === 'Drums' ? rawPart.filter((ev) => !ev.hit || ev.hit === 'kick' || ev.hit === 'snare') : rawPart
  );
  const currentBeat = elapsed / beatDur;
  const notes = [];
  for (const ev of part) {
    if (ev.beat < leadInBeat) continue;
    const key = noteKey(ev);
    if (hitBeats?.has(key) || missedBeats?.has(key)) continue;
    const dur = ev.dur || 1;
    const endBeat = ev.beat + dur;
    const dist = ev.beat - currentBeat;
    if (dist > la) continue;
    if (currentBeat > endBeat + 0.15) continue;
    const sec = sectionAt(song.sections, ev.beat);
    notes.push({
      ...ev,
      beat: ev.beat,
      dur,
      endBeat,
      dist,
      active: currentBeat >= ev.beat && currentBeat < endBeat,
      section: sec?.name,
      label: eventLabel(ev),
      melodic: !!ev.chord || !!ev.note,
      isHold: dur > 1.05,
    });
  }
  return notes.sort((a, b) => a.beat - b.beat);
}

function rateNotePress(notes, elapsed, bpm, isMelodic, hitBeats) {
  const beatDur = 60 / bpm;
  const currentBeat = elapsed / beatDur;
  const tapLate = isMelodic ? 0.24 : 0.2;
  const tapEarly = isMelodic ? 0.14 : 0.12;
  const holdLate = isMelodic ? 0.5 : 0.45;
  const holdEarly = isMelodic ? 0.42 : 0.38;
  const perfect = isMelodic ? 0.14 : 0.12;
  let best = null;
  let bestDist = Infinity;
  let bestPhase = 'press';
  let bestFromBody = false;

  for (const n of notes) {
    const key = noteKey(n);
    if (hitBeats?.has(key)) continue;

    const dist = n.beat - currentBeat;

    if (n.isHold) {
      const inBody = currentBeat >= n.beat && currentBeat < n.endBeat;
      const inStartWindow = dist >= -holdLate && dist <= holdEarly;
      const bodyGraceLimit = Math.max(holdLate, (n.dur || 1) * 0.55);
      const inBodyGrace = inBody && (currentBeat - n.beat) <= bodyGraceLimit;
      if (!inStartWindow && !inBodyGrace) continue;

      const fromBody = inBodyGrace && dist <= 0;
      const startDist = fromBody ? currentBeat - n.beat : Math.abs(dist);
      if (startDist < bestDist) {
        bestDist = startDist;
        best = n;
        bestPhase = 'hold-start';
        bestFromBody = fromBody;
      }
      continue;
    }

    if (dist > tapEarly || dist < -tapLate) continue;
    const d = Math.abs(dist);
    if (d < bestDist) {
      bestDist = d;
      best = n;
      bestPhase = 'tap';
    }
  }

  if (!best) return { rating: 'miss', note: null, phase: 'press' };

  if (best.isHold) {
    if (!bestFromBody && bestDist > holdLate) return { rating: 'miss', note: null, phase: 'press' };
    const rating = bestDist <= perfect ? 'perfect' : 'good';
    return { rating, note: best, phase: bestPhase };
  }

  if (bestDist > tapLate) return { rating: 'miss', note: null, phase: 'press' };
  const rating = bestDist <= perfect ? 'perfect' : 'good';
  return { rating, note: best, phase: bestPhase };
}

function rateHoldRelease(activeNote, elapsed, bpm) {
  if (!activeNote) return { rating: 'miss', note: null };
  const held = elapsed / (60 / bpm) - activeNote.beat;
  const required = activeNote.dur || 1;
  if (held >= required * 0.7) return { rating: 'perfect', note: activeNote };
  if (held >= required * 0.45) return { rating: 'good', note: activeNote };
  return { rating: 'miss', note: activeNote };
}

function rateNoteHit(notes, elapsed, bpm, isMelodic, hitBeats) { return rateNotePress(notes, elapsed, bpm, isMelodic, hitBeats); }
function noteKey(note) { return `${note.beat}:${note.chord || ''}:${note.note || ''}:${note.hit || ''}`; }

function getSong(id) {
  if (typeof SongLoader !== 'undefined') {
    const cached = SongLoader.getCached(id);
    if (cached) return cached;
    const catalog = typeof SongLoader.loadSongCatalog === 'function' ? SongLoader.loadSongCatalog() : [];
    const entry = catalog.find((s) => s.id === id) || catalog[0];
    if (entry) {
      return {
        id: entry.id,
        name: entry.name,
        emoji: entry.emoji,
        cost: entry.cost ?? 0,
        bpm: entry.bpm ?? 118,
        totalBeats: entry.beatCount ?? 118,
        durationSec: entry.durationSec ?? 60,
        sections: buildSections(entry.beatCount ?? 118),
        parts: {},
        stems: {},
        stemBacked: true,
      };
    }
  }
  return {
    id: 'rebel-pulse',
    name: 'Rebel Pulse',
    emoji: '⚡',
    cost: 0,
    bpm: 120,
    totalBeats: 120,
    durationSec: 60,
    sections: buildSections(120),
    parts: {},
    stems: {},
    stemBacked: true,
  };
}
