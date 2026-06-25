const SONGS = {
  'street-jam': {
    id: 'street-jam',
    name: 'Street Jam',
    emoji: '🎶',
    cost: 0,
    bpm: 88,
    loopBeats: 16,
    parts: {
      'trash-lid': [
        { beat: 0, hit: 'cymbal' }, { beat: 4, hit: 'cymbal' },
        { beat: 8, hit: 'cymbal' }, { beat: 12, hit: 'cymbal' },
      ],
      tambourine: [
        { beat: 0, hit: 'shake' }, { beat: 2, hit: 'shake' },
        { beat: 4, hit: 'shake' }, { beat: 6, hit: 'shake' },
        { beat: 8, hit: 'shake' }, { beat: 10, hit: 'shake' },
        { beat: 12, hit: 'shake' }, { beat: 14, hit: 'shake' },
      ],
      'drum-kit': [
        { beat: 0, hit: 'kick' }, { beat: 2, hit: 'snare' },
        { beat: 4, hit: 'kick' }, { beat: 6, hit: 'snare' },
        { beat: 8, hit: 'kick' }, { beat: 10, hit: 'snare' },
        { beat: 12, hit: 'kick' }, { beat: 14, hit: 'snare' },
      ],
      ukulele: [
        { beat: 0, chord: 'C' }, { beat: 4, chord: 'G' },
        { beat: 8, chord: 'Am' }, { beat: 12, chord: 'F' },
      ],
      'electric-guitar': [
        { beat: 0, chord: 'E' }, { beat: 4, chord: 'B' },
        { beat: 8, chord: 'C#m' }, { beat: 12, chord: 'A' },
      ],
      Guitar: [
        { beat: 2, chord: 'E' }, { beat: 6, chord: 'B' },
        { beat: 10, chord: 'C#m' }, { beat: 14, chord: 'A' },
      ],
      Bass: [
        { beat: 0, note: 'E2' }, { beat: 4, note: 'B1' },
        { beat: 8, note: 'C#2' }, { beat: 12, note: 'A1' },
      ],
      Drums: [
        { beat: 1, hit: 'hihat' }, { beat: 3, hit: 'hihat' },
        { beat: 5, hit: 'hihat' }, { beat: 7, hit: 'hihat' },
        { beat: 9, hit: 'hihat' }, { beat: 11, hit: 'hihat' },
        { beat: 13, hit: 'hihat' }, { beat: 15, hit: 'hihat' },
      ],
      Keys: [
        { beat: 0, chord: 'C' }, { beat: 8, chord: 'Am' },
      ],
      Vocals: [
        { beat: 4, hit: 'ooh' }, { beat: 12, hit: 'ooh' },
      ],
      Horns: [
        { beat: 7, note: 'G4' }, { beat: 15, note: 'A4' },
      ],
    },
  },
  'tavern-blues': {
    id: 'tavern-blues',
    name: 'Tavern Blues',
    emoji: '🍺',
    cost: 120,
    bpm: 92,
    loopBeats: 16,
    parts: {
      'trash-lid': [
        { beat: 0, hit: 'cymbal' }, { beat: 8, hit: 'cymbal' },
      ],
      tambourine: [
        { beat: 2, hit: 'shake' }, { beat: 6, hit: 'shake' },
        { beat: 10, hit: 'shake' }, { beat: 14, hit: 'shake' },
      ],
      'drum-kit': [
        { beat: 0, hit: 'kick' }, { beat: 3, hit: 'snare' },
        { beat: 4, hit: 'kick' }, { beat: 7, hit: 'snare' },
        { beat: 8, hit: 'kick' }, { beat: 11, hit: 'snare' },
        { beat: 12, hit: 'kick' }, { beat: 15, hit: 'snare' },
      ],
      ukulele: [
        { beat: 0, chord: 'Am' }, { beat: 4, chord: 'F' },
        { beat: 8, chord: 'C' }, { beat: 12, chord: 'G' },
      ],
      'electric-guitar': [
        { beat: 0, chord: 'Am' }, { beat: 4, chord: 'F' },
        { beat: 8, chord: 'C' }, { beat: 12, chord: 'G' },
      ],
      Guitar: [
        { beat: 2, chord: 'Am' }, { beat: 6, chord: 'F' },
        { beat: 10, chord: 'C' }, { beat: 14, chord: 'G' },
      ],
      Bass: [
        { beat: 0, note: 'A1' }, { beat: 4, note: 'F1' },
        { beat: 8, note: 'C2' }, { beat: 12, note: 'G1' },
      ],
      Drums: [
        { beat: 1, hit: 'hihat' }, { beat: 2, hit: 'hihat' },
        { beat: 5, hit: 'hihat' }, { beat: 6, hit: 'hihat' },
        { beat: 9, hit: 'hihat' }, { beat: 10, hit: 'hihat' },
        { beat: 13, hit: 'hihat' }, { beat: 14, hit: 'hihat' },
      ],
      Keys: [
        { beat: 0, chord: 'Am' }, { beat: 8, chord: 'G' },
      ],
      Vocals: [
        { beat: 4, hit: 'ooh' }, { beat: 8, hit: 'ah' }, { beat: 12, hit: 'ooh' },
      ],
      Horns: [
        { beat: 6, note: 'E4' }, { beat: 14, note: 'F4' },
      ],
    },
  },
  'square-anthem': {
    id: 'square-anthem',
    name: 'Square Anthem',
    emoji: '🏛️',
    cost: 280,
    bpm: 100,
    loopBeats: 16,
    parts: {
      'trash-lid': [
        { beat: 0, hit: 'cymbal' }, { beat: 4, hit: 'cymbal' },
        { beat: 8, hit: 'cymbal' }, { beat: 12, hit: 'cymbal' },
      ],
      tambourine: [
        { beat: 1, hit: 'shake' }, { beat: 3, hit: 'shake' },
        { beat: 5, hit: 'shake' }, { beat: 7, hit: 'shake' },
        { beat: 9, hit: 'shake' }, { beat: 11, hit: 'shake' },
        { beat: 13, hit: 'shake' }, { beat: 15, hit: 'shake' },
      ],
      'drum-kit': [
        { beat: 0, hit: 'kick' }, { beat: 2, hit: 'snare' },
        { beat: 4, hit: 'kick' }, { beat: 6, hit: 'snare' },
        { beat: 8, hit: 'kick' }, { beat: 10, hit: 'snare' },
        { beat: 12, hit: 'kick' }, { beat: 14, hit: 'snare' },
      ],
      ukulele: [
        { beat: 0, chord: 'G' }, { beat: 2, chord: 'D' },
        { beat: 4, chord: 'Em' }, { beat: 6, chord: 'C' },
        { beat: 8, chord: 'G' }, { beat: 10, chord: 'D' },
        { beat: 12, chord: 'Em' }, { beat: 14, chord: 'C' },
      ],
      'electric-guitar': [
        { beat: 0, chord: 'G' }, { beat: 4, chord: 'D' },
        { beat: 8, chord: 'Em' }, { beat: 12, chord: 'C' },
      ],
      Guitar: [
        { beat: 2, chord: 'G' }, { beat: 6, chord: 'D' },
        { beat: 10, chord: 'Em' }, { beat: 14, chord: 'C' },
      ],
      Bass: [
        { beat: 0, note: 'G1' }, { beat: 4, note: 'D2' },
        { beat: 8, note: 'E2' }, { beat: 12, note: 'C2' },
      ],
      Drums: [
        { beat: 1, hit: 'hihat' }, { beat: 3, hit: 'hihat' },
        { beat: 5, hit: 'hihat' }, { beat: 7, hit: 'hihat' },
        { beat: 9, hit: 'hihat' }, { beat: 11, hit: 'hihat' },
        { beat: 13, hit: 'hihat' }, { beat: 15, hit: 'hihat' },
      ],
      Keys: [
        { beat: 0, chord: 'G' }, { beat: 4, chord: 'D' },
        { beat: 8, chord: 'Em' }, { beat: 12, chord: 'C' },
      ],
      Vocals: [
        { beat: 0, hit: 'ah' }, { beat: 8, hit: 'ah' },
      ],
      Horns: [
        { beat: 4, note: 'D4' }, { beat: 12, note: 'E4' },
      ],
    },
  },
  'spotlight': {
    id: 'spotlight',
    name: 'Spotlight',
    emoji: '✨',
    cost: 500,
    bpm: 104,
    loopBeats: 16,
    parts: {
      'trash-lid': [
        { beat: 0, hit: 'cymbal' }, { beat: 2, hit: 'cymbal' },
        { beat: 8, hit: 'cymbal' }, { beat: 10, hit: 'cymbal' },
      ],
      tambourine: [
        { beat: 0, hit: 'shake' }, { beat: 1, hit: 'shake' },
        { beat: 4, hit: 'shake' }, { beat: 5, hit: 'shake' },
        { beat: 8, hit: 'shake' }, { beat: 9, hit: 'shake' },
        { beat: 12, hit: 'shake' }, { beat: 13, hit: 'shake' },
      ],
      'drum-kit': [
        { beat: 0, hit: 'kick' }, { beat: 2, hit: 'snare' },
        { beat: 4, hit: 'kick' }, { beat: 6, hit: 'snare' },
        { beat: 8, hit: 'kick' }, { beat: 10, hit: 'snare' },
        { beat: 12, hit: 'kick' }, { beat: 14, hit: 'snare' },
      ],
      ukulele: [
        { beat: 0, chord: 'F' }, { beat: 4, chord: 'Am' },
        { beat: 8, chord: 'Dm' }, { beat: 12, chord: 'C' },
      ],
      'electric-guitar': [
        { beat: 0, chord: 'F' }, { beat: 4, chord: 'Am' },
        { beat: 8, chord: 'Dm' }, { beat: 12, chord: 'C' },
      ],
      Guitar: [
        { beat: 1, chord: 'F' }, { beat: 5, chord: 'Am' },
        { beat: 9, chord: 'Dm' }, { beat: 13, chord: 'C' },
      ],
      Bass: [
        { beat: 0, note: 'F1' }, { beat: 4, note: 'A1' },
        { beat: 8, note: 'D2' }, { beat: 12, note: 'C2' },
      ],
      Drums: [
        { beat: 1, hit: 'hihat' }, { beat: 3, hit: 'hihat' },
        { beat: 5, hit: 'hihat' }, { beat: 7, hit: 'hihat' },
        { beat: 9, hit: 'hihat' }, { beat: 11, hit: 'hihat' },
        { beat: 13, hit: 'hihat' }, { beat: 15, hit: 'hihat' },
      ],
      Keys: [
        { beat: 0, chord: 'F' }, { beat: 2, chord: 'Am' },
        { beat: 8, chord: 'Dm' }, { beat: 10, chord: 'C' },
      ],
      Vocals: [
        { beat: 4, hit: 'ah' }, { beat: 6, hit: 'ooh' },
        { beat: 12, hit: 'ah' }, { beat: 14, hit: 'ooh' },
      ],
      Horns: [
        { beat: 3, note: 'A4' }, { beat: 7, note: 'C5' },
        { beat: 11, note: 'D5' }, { beat: 15, note: 'F5' },
      ],
    },
  },
};

const SONG_LIST = Object.values(SONGS);

function getSong(id) {
  return SONGS[id] || SONGS['street-jam'];
}

function getPlayerPartKey(instrument) {
  return instrument?.id || 'trash-lid';
}

function getPartEvents(song, partKey, beatInLoop) {
  const part = song.parts[partKey];
  if (!part) return [];
  return part.filter((e) => e.beat === beatInLoop);
}

function getUpcomingNotes(song, partKey, elapsed, bpm, lookAhead = 3) {
  const beatDur = 60 / bpm;
  const loop = song.loopBeats || 16;
  const part = song.parts[partKey] || [];
  const currentBeat = elapsed / beatDur;
  const notes = [];

  for (let b = Math.floor(currentBeat); b <= Math.ceil(currentBeat + lookAhead); b += 1) {
    const loopBeat = ((b % loop) + loop) % loop;
    const events = part.filter((e) => e.beat === loopBeat);
    for (const ev of events) {
      const noteBeat = b;
      const dist = noteBeat - currentBeat;
      if (dist >= -0.15 && dist <= lookAhead) {
        notes.push({
          ...ev,
          beat: noteBeat,
          loopBeat,
          dist,
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
