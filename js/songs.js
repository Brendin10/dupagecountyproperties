const INSTRUMENT_STEM_MAP = {
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

function getPartEvents(song, partKey, beat) {
  const part = song.parts?.[partKey];
  if (!part || beat < 0 || beat >= song.totalBeats) return [];
  return part.filter((e) => e.beat === Math.floor(beat));
}

function eventLabel(ev) { return ev.chord || ev.note || ev.hit || '•'; }

function getUpcomingNotes(song, partKey, elapsed, bpm, lookAhead) {
  const la = lookAhead ?? 3;
  const beatDur = 60 / bpm;
  const total = song.totalBeats || 16;
  const part = song.parts?.[partKey] || [];
  const currentBeat = elapsed / beatDur;
  const notes = [];
  for (const ev of part) {
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

function rateNotePress(notes, elapsed, bpm, isMelodic) {
  const beatDur = 60 / bpm;
  const currentBeat = elapsed / beatDur;
  const window = isMelodic ? 0.24 : 0.2;
  const perfect = isMelodic ? 0.1 : 0.08;
  let best = null;
  let bestDist = Infinity;
  for (const n of notes) {
    if (n.active && n.isHold) return { rating: 'perfect', note: n, phase: 'hold-continue' };
    const d = Math.abs(n.beat - currentBeat);
    if (d < bestDist) { bestDist = d; best = n; }
  }
  if (!best || bestDist > window) return { rating: 'miss', note: null, phase: 'press' };
  return { rating: bestDist <= perfect ? 'perfect' : 'good', note: best, phase: best.isHold ? 'hold-start' : 'tap' };
}

function rateHoldRelease(activeNote, elapsed, bpm) {
  if (!activeNote) return { rating: 'miss', note: null };
  const held = elapsed / (60 / bpm) - activeNote.beat;
  const required = activeNote.dur || 1;
  if (held >= required * 0.88) return { rating: 'perfect', note: activeNote };
  if (held >= required * 0.62) return { rating: 'good', note: activeNote };
  return { rating: 'miss', note: activeNote };
}

function rateNoteHit(notes, elapsed, bpm, isMelodic) { return rateNotePress(notes, elapsed, bpm, isMelodic); }
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
    id: 'street-jam',
    name: 'Street Jam',
    emoji: '🎶',
    cost: 0,
    bpm: 118,
    totalBeats: 118,
    durationSec: 60,
    sections: buildSections(118),
    parts: {},
    stems: {},
    stemBacked: true,
  };
}
