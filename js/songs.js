const BPM_BOOST = 15;
const GIG_DURATION_SEC = 60;

function buildSections(totalBeats) {
  const introLen = Math.round(totalBeats * 0.15);
  const outroLen = Math.round(totalBeats * 0.15);
  const verseLen = Math.round((totalBeats - introLen - outroLen) / 2);
  const chorusLen = totalBeats - introLen - verseLen - outroLen;
  const v1Start = introLen;
  const chorusStart = v1Start + verseLen;
  const outroStart = chorusStart + chorusLen;
  return [
    { id: 'intro', name: 'Intro', start: 0, end: introLen },
    { id: 'verse', name: 'Verse 1', start: v1Start, end: chorusStart },
    { id: 'chorus', name: 'Chorus', start: chorusStart, end: outroStart },
    { id: 'outro', name: 'Outro', start: outroStart, end: totalBeats },
  ];
}

function sectionAt(sections, beat) {
  return sections.find((s) => beat >= s.start && beat < s.end) || sections[sections.length - 1];
}

function getSongSection(song, elapsed, bpm) {
  const beat = (elapsed / (60 / bpm));
  return sectionAt(song.sections, Math.min(beat, song.totalBeats - 1));
}

function everyN(start, end, n, fn) {
  const ev = [];
  for (let b = start; b < end; b += n) ev.push(fn(b));
  return ev;
}

function chordPattern(start, end, chords, beatsPer = 4) {
  const ev = [];
  for (let b = start; b < end; b += beatsPer) {
    const idx = Math.floor((b - start) / beatsPer) % chords.length;
    ev.push({ beat: b, chord: chords[idx] });
  }
  return ev;
}

function notePattern(start, end, notes, beatsPer = 4) {
  const ev = [];
  for (let b = start; b < end; b += beatsPer) {
    const idx = Math.floor((b - start) / beatsPer) % notes.length;
    ev.push({ beat: b, note: notes[idx] });
  }
  return ev;
}

function drumVerse(start, end, density = 1) {
  const ev = [];
  for (let b = start; b < end; b++) {
    if (b % 4 === 0) ev.push({ beat: b, hit: 'kick' });
    if (b % 4 === 2) ev.push({ beat: b, hit: 'snare' });
    if (density > 0.5 && b % 2 === 1) ev.push({ beat: b, hit: 'hihat' });
  }
  return ev;
}

function drumChorus(start, end) {
  const ev = [];
  for (let b = start; b < end; b++) {
    if (b % 4 === 0) ev.push({ beat: b, hit: 'kick' });
    if (b % 4 === 2) ev.push({ beat: b, hit: 'snare' });
    if (b % 2 === 1) ev.push({ beat: b, hit: 'hihat' });
  }
  return ev;
}

function drumIntro(start, end) {
  return everyN(start, end, 2, (b) => ({ beat: b, hit: 'hihat' }));
}

function drumOutro(start, end) {
  const ev = [];
  for (let b = start; b < end; b++) {
    if (b % 4 === 0) ev.push({ beat: b, hit: 'kick' });
    if (b % 8 === 4) ev.push({ beat: b, hit: 'cymbal' });
  }
  return ev;
}

function sparseCymbal(start, end, step = 8) {
  return everyN(start, end, step, (b) => ({ beat: b, hit: 'cymbal' }));
}

function sparseShake(start, end, step = 2) {
  return everyN(start, end, step, (b) => ({ beat: b, hit: 'shake' }));
}

function vocalPattern(start, end, style = 'ooh', step = 4) {
  return everyN(start, end, step, (b) => ({ beat: b, hit: style }));
}

function buildSongParts(sections, config) {
  const parts = {};
  const roles = Object.keys(config);
  for (const role of roles) {
    const events = [];
    for (const sec of sections) {
      const gen = config[role][sec.id];
      if (gen) events.push(...gen(sec.start, sec.end));
    }
    parts[role] = events.sort((a, b) => a.beat - b.beat);
  }
  return parts;
}

function createSong({ id, name, emoji, cost, baseBpm, config }) {
  const bpm = baseBpm + BPM_BOOST;
  const totalBeats = bpm;
  const sections = buildSections(totalBeats);
  return {
    id, name, emoji, cost, bpm,
    totalBeats,
    durationSec: GIG_DURATION_SEC,
    sections,
    parts: buildSongParts(sections, config),
  };
}

const SONGS = {
  'street-jam': createSong({
    id: 'street-jam', name: 'Street Jam', emoji: '🎶', cost: 0, baseBpm: 88,
    config: {
      'trash-lid': {
        intro: (s, e) => sparseCymbal(s, e, 8),
        verse: (s, e) => sparseCymbal(s, e, 4),
        chorus: (s, e) => everyN(s, e, 4, (b) => ({ beat: b, hit: 'cymbal' })),
        outro: (s, e) => sparseCymbal(s, e, 8),
      },
      tambourine: {
        intro: () => [],
        verse: (s, e) => sparseShake(s, e, 2),
        chorus: (s, e) => sparseShake(s, e, 1),
        outro: (s, e) => sparseShake(s, e, 4),
      },
      'drum-kit': {
        intro: drumIntro,
        verse: (s, e) => drumVerse(s, e, 1),
        chorus: drumChorus,
        outro: drumOutro,
      },
      ukulele: {
        intro: (s, e) => chordPattern(s, e, ['C'], 8),
        verse: (s, e) => chordPattern(s, e, ['C', 'G', 'Am', 'F']),
        chorus: (s, e) => chordPattern(s, e, ['C', 'G', 'Am', 'F'], 2),
        outro: (s, e) => chordPattern(s, e, ['C', 'F'], 8),
      },
      'electric-guitar': {
        intro: (s, e) => chordPattern(s, e, ['E'], 8),
        verse: (s, e) => chordPattern(s, e, ['E', 'B', 'C#m', 'A']),
        chorus: (s, e) => chordPattern(s, e, ['E', 'B', 'C#m', 'A'], 2),
        outro: (s, e) => chordPattern(s, e, ['E', 'A'], 8),
      },
      Guitar: {
        intro: () => [],
        verse: (s, e) => chordPattern(s, e, ['E', 'B', 'C#m', 'A'], 4),
        chorus: (s, e) => chordPattern(s, e, ['E', 'B', 'C#m', 'A'], 2),
        outro: () => [],
      },
      Bass: {
        intro: (s, e) => notePattern(s, e, ['E2'], 8),
        verse: (s, e) => notePattern(s, e, ['E2', 'B1', 'C#2', 'A1']),
        chorus: (s, e) => notePattern(s, e, ['E2', 'B1', 'C#2', 'A1'], 2),
        outro: (s, e) => notePattern(s, e, ['E2'], 4),
      },
      Drums: {
        intro: drumIntro,
        verse: (s, e) => everyN(s, e, 2, (b) => ({ beat: b, hit: 'hihat' })),
        chorus: (s, e) => everyN(s, e, 1, (b) => ({ beat: b, hit: 'hihat' })),
        outro: (s, e) => everyN(s, e, 4, (b) => ({ beat: b, hit: 'hihat' })),
      },
      Keys: {
        intro: () => [],
        verse: (s, e) => chordPattern(s, e, ['C', 'Am'], 8),
        chorus: (s, e) => chordPattern(s, e, ['C', 'G', 'Am', 'F'], 4),
        outro: (s, e) => chordPattern(s, e, ['C'], 8),
      },
      Vocals: {
        intro: () => [],
        verse: (s, e) => vocalPattern(s, e, 'ooh', 8),
        chorus: (s, e) => vocalPattern(s, e, 'ah', 4),
        outro: (s, e) => vocalPattern(s, e, 'ooh', 8),
      },
      Horns: {
        intro: () => [],
        verse: () => [],
        chorus: (s, e) => notePattern(s, e, ['G4', 'A4', 'B4', 'A4'], 4),
        outro: (s, e) => everyN(s, e, 8, (b) => ({ beat: b, note: 'E4' })),
      },
    },
  }),

  'tavern-blues': createSong({
    id: 'tavern-blues', name: 'Tavern Blues', emoji: '🍺', cost: 120, baseBpm: 92,
    config: {
      'trash-lid': {
        intro: (s, e) => sparseCymbal(s, e, 16),
        verse: (s, e) => sparseCymbal(s, e, 8),
        chorus: (s, e) => everyN(s, e, 4, (b) => ({ beat: b, hit: 'cymbal' })),
        outro: (s, e) => sparseCymbal(s, e, 16),
      },
      tambourine: {
        verse: (s, e) => sparseShake(s, e, 4),
        chorus: (s, e) => sparseShake(s, e, 2),
        outro: (s, e) => sparseShake(s, e, 8),
      },
      'drum-kit': {
        intro: drumIntro,
        verse: (s, e) => drumVerse(s, e, 0.5),
        chorus: drumChorus,
        outro: drumOutro,
      },
      ukulele: {
        intro: (s, e) => chordPattern(s, e, ['Am'], 8),
        verse: (s, e) => chordPattern(s, e, ['Am', 'F', 'C', 'G']),
        chorus: (s, e) => chordPattern(s, e, ['Am', 'F', 'C', 'G'], 2),
        outro: (s, e) => chordPattern(s, e, ['Am'], 8),
      },
      'electric-guitar': {
        intro: (s, e) => chordPattern(s, e, ['Am'], 8),
        verse: (s, e) => chordPattern(s, e, ['Am', 'F', 'C', 'G']),
        chorus: (s, e) => chordPattern(s, e, ['Am', 'F', 'C', 'G'], 2),
        outro: (s, e) => chordPattern(s, e, ['Am'], 8),
      },
      Guitar: {
        verse: (s, e) => chordPattern(s, e, ['Am', 'F', 'C', 'G'], 4),
        chorus: (s, e) => chordPattern(s, e, ['Am', 'F', 'C', 'G'], 2),
      },
      Bass: {
        intro: (s, e) => notePattern(s, e, ['A1'], 8),
        verse: (s, e) => notePattern(s, e, ['A1', 'F1', 'C2', 'G1']),
        chorus: (s, e) => notePattern(s, e, ['A1', 'F1', 'C2', 'G1'], 2),
        outro: (s, e) => notePattern(s, e, ['A1'], 4),
      },
      Drums: {
        intro: drumIntro,
        verse: (s, e) => everyN(s, e, 2, (b) => ({ beat: b, hit: 'hihat' })),
        chorus: drumChorus,
        outro: (s, e) => everyN(s, e, 4, (b) => ({ beat: b, hit: 'hihat' })),
      },
      Keys: {
        verse: (s, e) => chordPattern(s, e, ['Am', 'G'], 8),
        chorus: (s, e) => chordPattern(s, e, ['Am', 'F', 'C', 'G'], 4),
      },
      Vocals: {
        verse: (s, e) => vocalPattern(s, e, 'ooh', 8),
        chorus: (s, e) => vocalPattern(s, e, 'ah', 4),
        outro: (s, e) => vocalPattern(s, e, 'ooh', 8),
      },
      Horns: {
        chorus: (s, e) => notePattern(s, e, ['E4', 'F4', 'G4', 'F4'], 4),
        outro: (s, e) => everyN(s, e, 8, (b) => ({ beat: b, note: 'A4' })),
      },
    },
  }),

  'square-anthem': createSong({
    id: 'square-anthem', name: 'Square Anthem', emoji: '🏛️', cost: 280, baseBpm: 100,
    config: {
      'trash-lid': {
        verse: (s, e) => sparseCymbal(s, e, 4),
        chorus: (s, e) => everyN(s, e, 4, (b) => ({ beat: b, hit: 'cymbal' })),
        outro: (s, e) => sparseCymbal(s, e, 8),
      },
      tambourine: {
        verse: (s, e) => sparseShake(s, e, 2),
        chorus: (s, e) => sparseShake(s, e, 1),
      },
      'drum-kit': {
        intro: drumIntro,
        verse: (s, e) => drumVerse(s, e, 1),
        chorus: drumChorus,
        outro: drumOutro,
      },
      ukulele: {
        intro: (s, e) => chordPattern(s, e, ['G'], 8),
        verse: (s, e) => chordPattern(s, e, ['G', 'D', 'Em', 'C'], 2),
        chorus: (s, e) => chordPattern(s, e, ['G', 'D', 'Em', 'C'], 1),
        outro: (s, e) => chordPattern(s, e, ['G', 'C'], 8),
      },
      'electric-guitar': {
        intro: (s, e) => chordPattern(s, e, ['G'], 8),
        verse: (s, e) => chordPattern(s, e, ['G', 'D', 'Em', 'C']),
        chorus: (s, e) => chordPattern(s, e, ['G', 'D', 'Em', 'C'], 2),
        outro: (s, e) => chordPattern(s, e, ['G'], 8),
      },
      Guitar: {
        verse: (s, e) => chordPattern(s, e, ['G', 'D', 'Em', 'C'], 2),
        chorus: (s, e) => chordPattern(s, e, ['G', 'D', 'Em', 'C'], 1),
      },
      Bass: {
        verse: (s, e) => notePattern(s, e, ['G1', 'D2', 'E2', 'C2'], 2),
        chorus: (s, e) => notePattern(s, e, ['G1', 'D2', 'E2', 'C2'], 1),
      },
      Drums: {
        intro: drumIntro,
        verse: (s, e) => everyN(s, e, 2, (b) => ({ beat: b, hit: 'hihat' })),
        chorus: (s, e) => everyN(s, e, 1, (b) => ({ beat: b, hit: 'hihat' })),
        outro: drumOutro,
      },
      Keys: {
        verse: (s, e) => chordPattern(s, e, ['G', 'D', 'Em', 'C'], 4),
        chorus: (s, e) => chordPattern(s, e, ['G', 'D', 'Em', 'C'], 2),
      },
      Vocals: {
        verse: (s, e) => vocalPattern(s, e, 'ah', 8),
        chorus: (s, e) => vocalPattern(s, e, 'ah', 4),
      },
      Horns: {
        chorus: (s, e) => notePattern(s, e, ['D4', 'E4', 'G4', 'E4'], 4),
        outro: (s, e) => everyN(s, e, 4, (b) => ({ beat: b, note: 'G4' })),
      },
    },
  }),

  'spotlight': createSong({
    id: 'spotlight', name: 'Spotlight', emoji: '✨', cost: 500, baseBpm: 104,
    config: {
      'trash-lid': {
        verse: (s, e) => sparseCymbal(s, e, 4),
        chorus: (s, e) => everyN(s, e, 2, (b) => ({ beat: b, hit: 'cymbal' })),
        outro: (s, e) => everyN(s, e, 8, (b) => ({ beat: b, hit: 'cymbal' })),
      },
      tambourine: {
        verse: (s, e) => sparseShake(s, e, 2),
        chorus: (s, e) => sparseShake(s, e, 1),
      },
      'drum-kit': {
        intro: drumIntro,
        verse: (s, e) => drumVerse(s, e, 1),
        chorus: drumChorus,
        outro: drumOutro,
      },
      ukulele: {
        intro: (s, e) => chordPattern(s, e, ['F'], 8),
        verse: (s, e) => chordPattern(s, e, ['F', 'Am', 'Dm', 'C']),
        chorus: (s, e) => chordPattern(s, e, ['F', 'Am', 'Dm', 'C'], 2),
        outro: (s, e) => chordPattern(s, e, ['F'], 8),
      },
      'electric-guitar': {
        intro: (s, e) => chordPattern(s, e, ['F'], 8),
        verse: (s, e) => chordPattern(s, e, ['F', 'Am', 'Dm', 'C']),
        chorus: (s, e) => chordPattern(s, e, ['F', 'Am', 'Dm', 'C'], 2),
        outro: (s, e) => chordPattern(s, e, ['F'], 8),
      },
      Guitar: {
        verse: (s, e) => chordPattern(s, e, ['F', 'Am', 'Dm', 'C'], 2),
        chorus: (s, e) => chordPattern(s, e, ['F', 'Am', 'Dm', 'C'], 1),
      },
      Bass: {
        verse: (s, e) => notePattern(s, e, ['F1', 'A1', 'D2', 'C2'], 2),
        chorus: (s, e) => notePattern(s, e, ['F1', 'A1', 'D2', 'C2'], 1),
      },
      Drums: {
        intro: drumIntro,
        verse: (s, e) => everyN(s, e, 2, (b) => ({ beat: b, hit: 'hihat' })),
        chorus: drumChorus,
        outro: drumOutro,
      },
      Keys: {
        verse: (s, e) => chordPattern(s, e, ['F', 'Am', 'Dm', 'C'], 4),
        chorus: (s, e) => chordPattern(s, e, ['F', 'Am', 'Dm', 'C'], 2),
      },
      Vocals: {
        verse: (s, e) => vocalPattern(s, e, 'ooh', 8),
        chorus: (s, e) => vocalPattern(s, e, 'ah', 2),
        outro: (s, e) => vocalPattern(s, e, 'ooh', 8),
      },
      Horns: {
        chorus: (s, e) => notePattern(s, e, ['A4', 'C5', 'D5', 'F5'], 2),
        outro: (s, e) => everyN(s, e, 4, (b) => ({ beat: b, note: 'A4' })),
      },
    },
  }),
};

const SONG_LIST = Object.values(SONGS);

function getSong(id) {
  return SONGS[id] || SONGS['street-jam'];
}

function getPlayerPartKey(instrument) {
  return instrument?.id || 'trash-lid';
}

function getPartEvents(song, partKey, beat) {
  const part = song.parts[partKey];
  if (!part || beat < 0 || beat >= song.totalBeats) return [];
  return part.filter((e) => e.beat === beat);
}

function getUpcomingNotes(song, partKey, elapsed, bpm, lookAhead = 3) {
  const beatDur = 60 / bpm;
  const total = song.totalBeats || song.loopBeats || 16;
  const part = song.parts[partKey] || [];
  const currentBeat = elapsed / beatDur;
  const notes = [];

  for (let b = Math.floor(currentBeat); b <= Math.ceil(currentBeat + lookAhead); b += 1) {
    if (b >= total) continue;
    const events = part.filter((e) => e.beat === b);
    const sec = sectionAt(song.sections, b);
    for (const ev of events) {
      const dist = b - currentBeat;
      if (dist >= -0.15 && dist <= lookAhead) {
        notes.push({
          ...ev,
          beat: b,
          dist,
          section: sec?.name,
          label: ev.chord || ev.note || ev.hit || '•',
          melodic: !!ev.chord || !!ev.note,
        });
      }
    }
  }
  return notes.sort((a, b) => a.dist - b.dist);
}

function rateNoteHit(notes, elapsed, bpm, isMelodic) {
  const beatDur = 60 / bpm;
  const currentBeat = elapsed / beatDur;
  const window = isMelodic ? 0.22 : 0.18;
  const perfect = isMelodic ? 0.1 : 0.08;

  let best = null;
  let bestDist = Infinity;
  for (const n of notes) {
    const d = Math.abs(n.beat - currentBeat);
    if (d < bestDist) {
      bestDist = d;
      best = n;
    }
  }
  if (!best || bestDist > window) return { rating: 'miss', note: null };
  if (bestDist <= perfect) return { rating: 'perfect', note: best };
  return { rating: 'good', note: best };
}
