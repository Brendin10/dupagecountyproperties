const INSTRUMENTS = {
  'trash-lid': { id: 'trash-lid', name: 'Trash Can Lid', emoji: '🥁', type: 'percussion', subtype: 'cymbal', hold: 'one-hand-up', cost: 0, crowdBonus: 1, starter: true },
  tambourine: { id: 'tambourine', name: 'Tambourine', emoji: '🪇', type: 'percussion', subtype: 'shake', hold: 'one-hand-up', cost: 35, crowdBonus: 3 },
  'drum-kit': { id: 'drum-kit', name: 'Drum Kit', emoji: '🥁', type: 'percussion', subtype: 'drums', hold: 'two-hand', cost: 450, crowdBonus: 20 },
  ukulele: { id: 'ukulele', name: 'Ukulele', emoji: '🎸', type: 'melodic', subtype: 'ukulele', hold: 'strum', progression: ['C', 'G', 'Am', 'F'], cost: 90, crowdBonus: 6 },
  'electric-guitar': { id: 'electric-guitar', name: 'Electric Guitar', emoji: '🎸', type: 'melodic', subtype: 'electric', hold: 'strum', progression: ['E', 'B', 'C#m', 'A'], cost: 220, crowdBonus: 12 },
  piano: { id: 'piano', name: 'Piano', emoji: '🎹', type: 'melodic', subtype: 'piano', hold: 'keys', progression: ['C', 'Am', 'F', 'G'], cost: 320, crowdBonus: 14 },
  keyboard: { id: 'keyboard', name: 'Keyboard', emoji: '🎹', type: 'melodic', subtype: 'synth', hold: 'keys', progression: ['Am', 'F', 'C', 'G'], cost: 280, crowdBonus: 12 },
  trumpet: { id: 'trumpet', name: 'Trumpet', emoji: '🎺', type: 'melodic', subtype: 'brass', hold: 'one-hand-up', progression: ['C', 'G', 'Am', 'F'], cost: 195, crowdBonus: 10 },
  saxophone: { id: 'saxophone', name: 'Saxophone', emoji: '🎷', type: 'melodic', subtype: 'sax', hold: 'one-hand-up', progression: ['G', 'Em', 'C', 'D'], cost: 240, crowdBonus: 11 },
  trombone: { id: 'trombone', name: 'Trombone', emoji: '🎺', type: 'melodic', subtype: 'brass', hold: 'one-hand-up', progression: ['F', 'C', 'Dm', 'Bb'], cost: 210, crowdBonus: 10 },
  violin: { id: 'violin', name: 'Violin', emoji: '🎻', type: 'melodic', subtype: 'bow', hold: 'strum', progression: ['D', 'G', 'A', 'Bm'], cost: 260, crowdBonus: 11 },
  flute: { id: 'flute', name: 'Flute', emoji: '🪈', type: 'melodic', subtype: 'flute', hold: 'one-hand-up', progression: ['C', 'G', 'Am', 'Em'], cost: 175, crowdBonus: 9 },
  clarinet: { id: 'clarinet', name: 'Clarinet', emoji: '🎵', type: 'melodic', subtype: 'clarinet', hold: 'one-hand-up', progression: ['Bb', 'F', 'G', 'Eb'], cost: 185, crowdBonus: 9 },
  banjo: { id: 'banjo', name: 'Banjo', emoji: '🪕', type: 'melodic', subtype: 'banjo', hold: 'strum', progression: ['G', 'C', 'D', 'G'], cost: 155, crowdBonus: 8 },
  'bass-guitar': { id: 'bass-guitar', name: 'Bass Guitar', emoji: '🎸', type: 'melodic', subtype: 'bass', hold: 'strum', progression: ['E', 'A', 'B', 'C#m'], cost: 200, crowdBonus: 10 },
  'acoustic-guitar': { id: 'acoustic-guitar', name: 'Acoustic Guitar', emoji: '🎸', type: 'melodic', subtype: 'acoustic', hold: 'strum', progression: ['D', 'A', 'Bm', 'G'], cost: 140, crowdBonus: 8 },
  harmonica: { id: 'harmonica', name: 'Harmonica', emoji: '🎶', type: 'melodic', subtype: 'harmonica', hold: 'one-hand-up', progression: ['G', 'C', 'D', 'G'], cost: 95, crowdBonus: 6 },
  accordion: { id: 'accordion', name: 'Accordion', emoji: '🪗', type: 'melodic', subtype: 'accordion', hold: 'keys', progression: ['Am', 'Dm', 'E', 'Am'], cost: 310, crowdBonus: 13 },
  xylophone: { id: 'xylophone', name: 'Xylophone', emoji: '🎼', type: 'melodic', subtype: 'mallet', hold: 'one-hand-up', progression: ['C', 'F', 'G', 'C'], cost: 130, crowdBonus: 7 },
  cowbell: { id: 'cowbell', name: 'Cowbell', emoji: '🔔', type: 'percussion', subtype: 'bell', hold: 'one-hand-up', cost: 55, crowdBonus: 4 },
  bongo: { id: 'bongo', name: 'Bongos', emoji: '🪘', type: 'percussion', subtype: 'bongo', hold: 'two-hand', cost: 110, crowdBonus: 6 },
  triangle: { id: 'triangle', name: 'Triangle', emoji: '🔺', type: 'percussion', subtype: 'triangle', hold: 'one-hand-up', cost: 40, crowdBonus: 3 },
  organ: { id: 'organ', name: 'Organ', emoji: '🎹', type: 'melodic', subtype: 'organ', hold: 'keys', progression: ['C', 'G', 'Am', 'F'], cost: 380, crowdBonus: 15 },
  'synth-lead': { id: 'synth-lead', name: 'Synth Lead', emoji: '🎛️', type: 'melodic', subtype: 'synth', hold: 'keys', progression: ['Em', 'C', 'G', 'D'], cost: 340, crowdBonus: 14 },
};

const INSTRUMENT_SHOP_ITEMS = Object.values(INSTRUMENTS).map((i) => ({
  id: i.id,
  name: i.name,
  emoji: i.emoji,
  cost: i.cost ?? 100,
  crowdBonus: i.crowdBonus ?? 5,
  owned: !!i.starter,
  starter: !!i.starter,
}));

function getEquippedInstrument(state) {
  const id = state.equippedInstrument
    || state.inventories.instruments[state.inventories.instruments.length - 1]
    || 'trash-lid';
  return INSTRUMENTS[id] || INSTRUMENTS['trash-lid'];
}

function renderHeldInstrumentInner(inst, pose = 'idle') {
  if (!inst) return '';
  if (typeof InstrumentArt !== 'undefined') {
    return InstrumentArt.renderHeld(inst, pose);
  }
  return '';
}

function renderHeldInstrument(inst, pose = 'idle') {
  return renderHeldInstrumentInner(inst, pose);
}

function renderShopInstrumentPreview(inst, size = 48) {
  if (typeof InstrumentArt !== 'undefined') {
    return InstrumentArt.renderShopPreview(inst, size);
  }
  return `<span class="shop-emoji">${inst.emoji}</span>`;
}

function renderInventoryItemThumb(cat, item, size = 36) {
  if (cat === 'instruments' && INSTRUMENTS[item.id] && typeof InstrumentArt !== 'undefined') {
    return InstrumentArt.renderInventoryThumb(INSTRUMENTS[item.id], size);
  }
  return `<span class="brand-card-icon">${item.emoji}</span>`;
}

function renderShopItemPreview(cat, item, size = 72) {
  if (cat === 'instruments' && INSTRUMENTS[item.id]) {
    return renderShopInstrumentPreview(INSTRUMENTS[item.id], size);
  }
  return `<span class="brand-card-icon brand-card-icon-lg">${item.emoji}</span>`;
}
