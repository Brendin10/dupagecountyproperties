const SAVE_KEY = 'bandland_save_v1';

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
      const raw = localStorage.getItem(SAVE_KEY);
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
    state.hasLid = data.hasLid ?? false;
    state.inventories = data.inventories ?? state.inventories;
    if (!state.inventories.songs) state.inventories.songs = ['street-jam'];
    state.bandMembers = data.bandMembers ?? [];
    if (state.bandMembers.length > MAX_BAND_SLOTS) {
      state.bandMembers = state.bandMembers.slice(0, MAX_BAND_SLOTS);
    }
    state.bandSlots = Math.min(Math.max(Math.floor(Number(data.bandSlots)) || 1, 1), MAX_BAND_SLOTS);
    if (state.bandSlots < state.bandMembers.length) {
      state.bandSlots = state.bandMembers.length;
    }
    state.currentVenue = data.currentVenue ?? 'street-corner';
    if (state.currentVenue === 'concert-venue') state.currentVenue = 'small-concert-venue';
    state.equippedInstrument = data.equippedInstrument ?? 'trash-lid';
    state.equippedSong = data.equippedSong ?? 'street-jam';
    state.equippedWear = data.equippedWear ?? { clothes: null, makeup: null, accessories: null };
    return true;
  },

  clear() {
    localStorage.removeItem(SAVE_KEY);
  },

  hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  },
};
