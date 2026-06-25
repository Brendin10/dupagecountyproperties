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
    state.bandSlots = data.bandSlots ?? 1;
    state.currentVenue = data.currentVenue ?? 'street-corner';
    state.equippedInstrument = data.equippedInstrument ?? 'trash-lid';
    state.equippedSong = data.equippedSong ?? 'street-jam';
    return true;
  },

  clear() {
    localStorage.removeItem(SAVE_KEY);
  },

  hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  },
};
