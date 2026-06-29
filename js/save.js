const SAVE_KEY = 'bandland_save_v2';

function migrateSaveInventories(inventories) {
  const inv = inventories || {};
  if (!inv.instruments) inv.instruments = ['drums'];
  inv.instruments = [...new Set(
    inv.instruments.map((id) => (typeof migrateInstrumentId === 'function' ? migrateInstrumentId(id) : id))
  )];
  if (!inv.instruments.includes('drums')) inv.instruments.unshift('drums');

  const defaultSong = typeof SongLoader !== 'undefined' ? SongLoader.getDefaultSongId() : 'street-jam';
  if (!inv.songs) inv.songs = [defaultSong];
  const validSongs = typeof SONG_MANIFEST !== 'undefined'
    ? new Set(SONG_MANIFEST.map((s) => s.id))
    : new Set([defaultSong]);
  inv.songs = inv.songs.filter((id) => validSongs.has(id));
  if (!inv.songs.length) inv.songs = [defaultSong];
  return inv;
}

const SaveManager = {
  save(state) {
    const data = {
      character: state.character,
      bandCash: state.bandCash,
      starMeter: state.starMeter,
      hasLid: state.hasLid,
      tutorialComplete: state.hasLid,
      inventories: state.inventories,
      bandMembers: state.bandMembers,
      bandSlots: state.bandSlots,
      currentVenue: state.currentVenue,
      equippedInstrument: state.equippedInstrument,
      equippedSong: state.equippedSong,
      equippedWear: state.equippedWear,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save progress', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem('bandland_save_v1');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  apply(state, data) {
    if (!data) return false;
    state.character = data.character;
    state.bandCash = data.bandCash ?? 0;
    state.starMeter = data.starMeter ?? 0;
    state.hasLid = data.hasLid ?? data.tutorialComplete ?? false;
    state.inventories = migrateSaveInventories(data.inventories ?? state.inventories);
    state.bandMembers = (data.bandMembers ?? []).map((m) => ({
      ...m,
      role: m.role === 'Guitar' ? 'Lead' : m.role,
    }));
    state.bandSlots = Math.min(Math.max(Math.floor(Number(data.bandSlots)) || 1, 1), MAX_BAND_SLOTS);
    if (state.bandSlots < state.bandMembers.length) {
      state.bandSlots = Math.min(state.bandMembers.length, MAX_BAND_SLOTS);
    }
    state.currentVenue = data.currentVenue ?? 'street-corner';
    if (state.currentVenue === 'concert-venue') state.currentVenue = 'small-concert-venue';
    state.equippedInstrument = typeof migrateInstrumentId === 'function'
      ? migrateInstrumentId(data.equippedInstrument)
      : (data.equippedInstrument ?? 'drums');
    const defaultSong = typeof SongLoader !== 'undefined' ? SongLoader.getDefaultSongId() : 'street-jam';
    const validSongs = typeof SONG_MANIFEST !== 'undefined'
      ? new Set(SONG_MANIFEST.map((s) => s.id))
      : new Set([defaultSong]);
    const rawSong = data.equippedSong ?? defaultSong;
    state.equippedSong = validSongs.has(rawSong) ? rawSong : defaultSong;
    state.equippedWear = data.equippedWear ?? { clothes: null, makeup: null, accessories: null };
    return true;
  },

  clear() {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem('bandland_save_v1');
  },

  hasSave() {
    return !!(localStorage.getItem(SAVE_KEY) || localStorage.getItem('bandland_save_v1'));
  },
};
