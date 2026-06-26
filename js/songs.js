const BPM_BOOST = 30;
const GIG_DURATION_SEC = 60;

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
  return sections.find((s) => beat >= s.start && beat < s.end) || sections[sections.length - 1];
}

function getSongSection(song, elapsed, bpm) {
  const beat = elapsed / (60 / bpm);
  return sectionAt(song.sections, Math.min(beat, song.totalBeats - 1));
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function rngFor(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function chordsFor(meta, secId) {
  return meta.chords[secId] || meta.chords.verse || meta.chords.chorus || ['C'];
}

function holdChance(meta, secId) {
  return meta.holdChance?.[secId] ?? meta.holdChance?.default ?? 0.25;
}

function stepFor(meta, secId) {
  return meta.step?.[secId] ?? meta.step?.default ?? 2;
}

function buildMelodicPart(inst, meta, sections) {
  const rng = rngFor(hashStr(`${meta.songId}-${inst.id}`));
  const events = [];
  for (const sec of sections) {
    const chords = chordsFor(meta, sec.id);
    const hc = holdChance(meta, sec.id);
    const step = stepFor(meta, sec.id);
    let b = sec.start;
    while (b < sec.end) {
      const ci = Math.floor((b - sec.start) / Math.max(step, 1)) % chords.length;
      const chord = chords[ci];
      const isHold = rng() < hc && (sec.id === 'chorus' || sec.id === 'verse');
      const dur = isHold ? (meta.holdLens[rng() < 0.5 ? 0 : 1] || 2) : 1;
      events.push({ beat: b, chord, dur });
      b += isHold ? dur : step;
    }
  }
  return events;
}

function buildNotePart(inst, meta, sections, notes) {
  const rng = rngFor(hashStr(`${meta.songId}-${inst.id}-n`));
  const events = [];
  for (const sec of sections) {
    const hc = holdChance(meta, sec.id) * 0.6;
    const step = stepFor(meta, sec.id);
    let b = sec.start;
    let ni = 0;
    while (b < sec.end) {
      const note = notes[ni % notes.length];
      const isHold = rng() < hc;
      const dur = isHold ? 2 : 1;
      events.push({ beat: b, note, dur });
      b += isHold ? dur : step;
      ni += 1;
    }
  }
  return events;
}

function drumPattern(style, start, end, intensity) {
  const ev = [];
  const inten = intensity ?? 1;
  for (let b = start; b < end; b++) {
    if (style === 'ska') {
      if (b % 4 === 0) ev.push({ beat: b, hit: 'kick' });
      if (b % 4 === 2) ev.push({ beat: b, hit: 'snare' });
      if (b % 2 === 1) ev.push({ beat: b, hit: 'hihat' });
    } else if (style === 'swing') {
      if (b % 4 === 0) ev.push({ beat: b, hit: 'kick' });
      if (b % 4 === 2) ev.push({ beat: b, hit: 'snare' });
      if (b % 4 === 3) ev.push({ beat: b, hit: 'hihat' });
    } else if (style === 'latin') {
      if (b % 4 === 0) ev.push({ beat: b, hit: 'kick' });
      if (b % 4 === 1) ev.push({ beat: b, hit: 'snare' });
      if (b % 2 === 0) ev.push({ beat: b, hit: 'hihat' });
    } else if (style === 'drive') {
      if (b % 4 === 0) ev.push({ beat: b, hit: 'kick' });
      if (b % 4 === 2) ev.push({ beat: b, hit: 'snare' });
      if (inten > 0.7 && b % 2 === 1) ev.push({ beat: b, hit: 'hihat' });
    } else {
      if (b % 4 === 0) ev.push({ beat: b, hit: 'kick' });
      if (b % 4 === 2) ev.push({ beat: b, hit: 'snare' });
      if (inten > 0.5 && b % 2 === 1) ev.push({ beat: b, hit: 'hihat' });
    }
  }
  return ev;
}

function buildPercPart(inst, meta, sections) {
  const events = [];
  const style = meta.drumStyle || 'rock';
  for (const sec of sections) {
    const intensity = sec.id === 'chorus' ? 1 : sec.id === 'verse' ? 0.75 : 0.5;
    if (inst.subtype === 'cymbal') {
      const step = sec.id === 'chorus' ? 4 : 8;
      for (let b = sec.start; b < sec.end; b += step) {
        events.push({ beat: b, hit: 'cymbal', dur: sec.id === 'chorus' && b % 8 === 0 ? 2 : 1 });
      }
    } else if (inst.subtype === 'shake') {
      const step = sec.id === 'chorus' ? 1 : 2;
      for (let b = sec.start; b < sec.end; b += step) {
        events.push({ beat: b, hit: 'shake', dur: 1 });
      }
    } else if (inst.subtype === 'bell' || inst.subtype === 'triangle') {
      for (let b = sec.start; b < sec.end; b += sec.id === 'chorus' ? 2 : 4) {
        events.push({ beat: b, hit: 'cymbal', dur: 1 });
      }
    } else if (inst.subtype === 'bongo') {
      for (let b = sec.start; b < sec.end; b += 2) {
        events.push({ beat: b, hit: b % 4 === 0 ? 'kick' : 'snare', dur: 1 });
      }
    } else if (inst.subtype === 'drums') {
      events.push(...drumPattern(style, sec.start, sec.end, intensity));
    }
  }
  return events;
}

function buildPlayerPart(inst, meta, sections) {
  if (inst.type === 'percussion') return buildPercPart(inst, meta, sections);
  if (inst.subtype === 'bass') {
    return buildNotePart(inst, meta, sections, meta.bassNotes || ['E2', 'B1', 'C#2', 'A1']);
  }
  return buildMelodicPart(inst, meta, sections);
}

function buildBandParts(meta, sections) {
  const parts = {};
  parts.Guitar = buildMelodicPart({ id: 'guitar', subtype: 'electric' }, meta, sections);
  parts.Bass = buildNotePart({ id: 'bass' }, meta, sections, meta.bassNotes || ['E2', 'B1', 'C#2', 'A1']);
  parts.Drums = [];
  for (const sec of sections) {
    parts.Drums.push(...drumPattern(meta.drumStyle || 'rock', sec.start, sec.end, sec.id === 'chorus' ? 1 : 0.7));
  }
  parts.Keys = buildMelodicPart({ id: 'keys', subtype: 'piano' }, { ...meta, holdChance: { ...meta.holdChance, default: (meta.holdChance?.default || 0.2) * 0.7 } }, sections);
  parts.Vocals = [];
  for (const sec of sections) {
    const step = sec.id === 'chorus' ? 4 : 8;
    for (let b = sec.start; b < sec.end; b += step) {
      parts.Vocals.push({ beat: b, hit: sec.id === 'chorus' ? 'ah' : 'ooh', dur: sec.id === 'chorus' ? 2 : 1 });
    }
  }
  parts.Horns = buildNotePart({ id: 'horns' }, meta, sections, meta.hornNotes || ['G4', 'A4', 'B4', 'A4']);
  return parts;
}

function createSong(def) {
  const { id, name, emoji, cost, baseBpm, meta } = def;
  const bpm = baseBpm + BPM_BOOST;
  const totalBeats = bpm;
  const sections = buildSections(totalBeats);
  const fullMeta = { ...meta, songId: id };
  const parts = buildBandParts(fullMeta, sections);
  if (typeof INSTRUMENTS !== 'undefined') {
    for (const inst of Object.values(INSTRUMENTS)) {
      parts[inst.id] = buildPlayerPart(inst, fullMeta, sections);
    }
  }
  return { id, name, emoji, cost, bpm, totalBeats, durationSec: GIG_DURATION_SEC, sections, parts, meta: fullMeta };
}

const SONGS = {
  'street-jam': createSong({ id: 'street-jam', name: 'Street Jam', emoji: '🎶', cost: 0, baseBpm: 88, meta: { drumStyle: 'ska', danceStyle: 'funk-house', chords: { intro: ['C'], verse: ['C', 'G', 'Am', 'F'], chorus: ['C', 'G', 'Am', 'F'], outro: ['C', 'F'] }, holdChance: { intro: 0, verse: 0.2, chorus: 0.5, outro: 0.1, default: 0.2 }, step: { intro: 4, verse: 2, chorus: 1, outro: 4, default: 2 }, holdLens: [2, 3], bassNotes: ['C2', 'G1', 'A1', 'F1'], hornNotes: ['G4', 'C5', 'E4', 'G4'] } }),
  'tavern-blues': createSong({ id: 'tavern-blues', name: 'Tavern Blues', emoji: '🍺', cost: 120, baseBpm: 82, meta: { drumStyle: 'swing', danceStyle: 'deep-house', chords: { intro: ['Am'], verse: ['Am', 'F', 'C', 'G'], chorus: ['Am', 'F', 'C', 'E'], outro: ['Am'] }, holdChance: { intro: 0.1, verse: 0.35, chorus: 0.55, outro: 0.2, default: 0.3 }, step: { intro: 8, verse: 4, chorus: 2, outro: 8, default: 4 }, holdLens: [3, 4], bassNotes: ['A1', 'F1', 'C2', 'E2'], hornNotes: ['E4', 'F4', 'G4', 'E4'] } }),
  'square-anthem': createSong({ id: 'square-anthem', name: 'Square Anthem', emoji: '🏛️', cost: 280, baseBpm: 100, meta: { drumStyle: 'drive', danceStyle: 'euro', chords: { intro: ['G'], verse: ['G', 'D', 'Em', 'C'], chorus: ['G', 'D', 'Em', 'C'], outro: ['G', 'C'] }, holdChance: { intro: 0, verse: 0.15, chorus: 0.4, outro: 0.1, default: 0.15 }, step: { intro: 4, verse: 2, chorus: 1, outro: 4, default: 2 }, holdLens: [2, 2], bassNotes: ['G1', 'D2', 'E2', 'C2'], hornNotes: ['D4', 'E4', 'G4', 'D5'] } }),
  'spotlight': createSong({ id: 'spotlight', name: 'Spotlight', emoji: '✨', cost: 500, baseBpm: 96, meta: { drumStyle: 'rock', danceStyle: 'disco', chords: { intro: ['F'], verse: ['F', 'Am', 'Dm', 'C'], chorus: ['F', 'Am', 'Bb', 'C'], outro: ['F', 'C'] }, holdChance: { intro: 0.2, verse: 0.4, chorus: 0.65, outro: 0.3, default: 0.35 }, step: { intro: 8, verse: 4, chorus: 2, outro: 8, default: 4 }, holdLens: [3, 4], bassNotes: ['F1', 'A1', 'D2', 'C2'], hornNotes: ['A4', 'C5', 'D5', 'F5'] } }),
  'neon-pulse': createSong({ id: 'neon-pulse', name: 'Neon Pulse', emoji: '💜', cost: 350, baseBpm: 108, meta: { drumStyle: 'drive', danceStyle: 'techno', chords: { intro: ['Em'], verse: ['Em', 'C', 'G', 'D'], chorus: ['Em', 'C', 'G', 'B'], outro: ['Em'] }, holdChance: { intro: 0, verse: 0.25, chorus: 0.45, outro: 0.1, default: 0.2 }, step: { intro: 4, verse: 1, chorus: 1, outro: 4, default: 1 }, holdLens: [2, 3], bassNotes: ['E2', 'C2', 'G1', 'D2'], hornNotes: ['E4', 'G4', 'B4', 'D5'] } }),
  'river-folk': createSong({ id: 'river-folk', name: 'River Folk', emoji: '🌊', cost: 650, baseBpm: 94, meta: { drumStyle: 'latin', danceStyle: 'tropical', chords: { intro: ['D'], verse: ['D', 'G', 'A', 'Bm'], chorus: ['G', 'A', 'D', 'Bm'], outro: ['D', 'A'] }, holdChance: { intro: 0.15, verse: 0.3, chorus: 0.5, outro: 0.2, default: 0.25 }, step: { intro: 4, verse: 2, chorus: 2, outro: 4, default: 2 }, holdLens: [2, 4], bassNotes: ['D2', 'G1', 'A1', 'B1'], hornNotes: ['D5', 'E5', 'F#5', 'A4'] } }),
};

const SONG_LIST = Object.values(SONGS);

function getSong(id) { return SONGS[id] || SONGS['street-jam']; }
function getPlayerPartKey(instrument) { return instrument?.id || 'trash-lid'; }

function getPartEvents(song, partKey, beat) {
  const part = song.parts[partKey];
  if (!part || beat < 0 || beat >= song.totalBeats) return [];
  return part.filter((e) => e.beat === Math.floor(beat));
}

function eventLabel(ev) { return ev.chord || ev.note || ev.hit || '•'; }

function getUpcomingNotes(song, partKey, elapsed, bpm, lookAhead, hitBeats, missedBeats) {
  const la = lookAhead ?? 3;
  const beatDur = 60 / bpm;
  const part = song.parts[partKey] || [];
  const currentBeat = elapsed / beatDur;
  const notes = [];
  for (const ev of part) {
    const key = noteKey(ev);
    if (hitBeats?.has(key) || missedBeats?.has(key)) continue;
    const dur = ev.dur || 1;
    const endBeat = ev.beat + dur;
    const dist = ev.beat - currentBeat;
    if (dist > la) continue;
    if (currentBeat > endBeat + 0.15) continue;
    const sec = sectionAt(song.sections, ev.beat);
    notes.push({ ...ev, beat: ev.beat, dur, endBeat, dist, active: currentBeat >= ev.beat && currentBeat < endBeat, section: sec?.name, label: eventLabel(ev), melodic: !!ev.chord || !!ev.note, isHold: dur > 1.05 });
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

function ensureSongInstrumentParts() {
  if (typeof INSTRUMENTS === 'undefined') return;
  for (const song of SONG_LIST) {
    if (!song.meta) continue;
    for (const inst of Object.values(INSTRUMENTS)) {
      song.parts[inst.id] = buildPlayerPart(inst, song.meta, song.sections);
    }
  }
}
