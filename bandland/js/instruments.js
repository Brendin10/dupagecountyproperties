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

function instLayer(cls, content) {
  return `<g class="inst-layer ${cls}">${content}</g>`;
}

function genericInstrumentSvg(inst) {
  const palette = {
    piano: '#1a1a2e', synth: '#2d1b69', organ: '#3d2010', brass: '#d4a017',
    sax: '#c47a20', bow: '#8B4513', flute: '#c0e8ff', clarinet: '#1a1a1a',
    banjo: '#deb887', bass: '#2a2a2a', acoustic: '#a06830', harmonica: '#ccc',
    accordion: '#c0392b', mallet: '#6bcbff', bell: '#d4a017', bongo: '#8B4513',
    triangle: '#ffd166', ukulele: '#a06830', electric: '#8B0000',
  };
  const fill = palette[inst.subtype] || '#666';
  const anim = '';
  return `<g class="held-instrument held-generic instrument-layered ${anim}" transform="translate(112,148) rotate(-15)">
    ${instLayer('inst-shadow', `<ellipse cx="0" cy="18" rx="22" ry="7" fill="rgba(0,0,0,0.22)"/>`)}
    ${instLayer('inst-body', `
      <rect x="-22" y="-8" width="44" height="38" rx="8" fill="${fill}" stroke="${OUTLINE}" stroke-width="3"/>
      <rect x="-18" y="-4" width="36" height="28" rx="5" fill="${fill}" opacity="0.7"/>
      <text x="0" y="14" text-anchor="middle" font-size="18">${inst.emoji}</text>`)}
  </g>`;
}

function renderHeldInstrumentInner(inst, pose = 'idle') {
  if (!inst) return '';
  const anim = pose !== 'idle' ? `inst-${pose}` : '';
  const shapes = {
    'trash-lid': `
      <g class="held-instrument held-cymbal instrument-layered ${anim}" transform="translate(118,148) rotate(-18)">
        ${instLayer('inst-shadow', `<ellipse cx="4" cy="6" rx="30" ry="8" fill="rgba(0,0,0,0.25)"/>`)}
        ${instLayer('inst-rim', `<ellipse cx="0" cy="0" rx="30" ry="30" fill="#a8a8a8" stroke="${OUTLINE}" stroke-width="3"/><ellipse cx="0" cy="-2" rx="28" ry="28" fill="#c8c8c8"/>`)}
        ${instLayer('inst-face', `<ellipse cx="0" cy="2" rx="22" ry="22" fill="#e8e8e8"/>`)}
        ${instLayer('inst-handle', `<rect x="-4" y="22" width="8" height="18" rx="3" fill="#888" stroke="${OUTLINE}" stroke-width="2"/>`)}
      </g>`,
    tambourine: `
      <g class="held-instrument held-tambourine instrument-layered ${anim}" transform="translate(122,142)">
        ${instLayer('inst-shadow', `<ellipse cx="2" cy="8" rx="26" ry="7" fill="rgba(0,0,0,0.22)"/>`)}
        ${instLayer('inst-frame', `<circle cx="0" cy="0" r="24" fill="#b8860b" stroke="${OUTLINE}" stroke-width="3"/><circle cx="0" cy="0" r="20" fill="#d4a017"/>`)}
        ${instLayer('inst-jingles', `
          <circle cx="-14" cy="-10" r="2.5" fill="#ccc"/>
          <circle cx="12" cy="-8" r="2.5" fill="#ccc"/>
          <circle cx="-8" cy="12" r="2.5" fill="#ccc"/>
          <circle cx="10" cy="10" r="2.5" fill="#ccc"/>`)}
      </g>`,
    'drum-kit': `
      <g class="held-instrument held-drums instrument-layered ${anim}">
        ${instLayer('inst-shadow', `<ellipse cx="100" cy="178" rx="90" ry="12" fill="rgba(0,0,0,0.2)"/>`)}
        ${instLayer('inst-snare', `<ellipse cx="62" cy="172" rx="18" ry="12" fill="#8B4513" stroke="${OUTLINE}" stroke-width="2"/><ellipse cx="62" cy="168" rx="16" ry="10" fill="#c8c8c8"/>`)}
        ${instLayer('inst-cymbal', `<ellipse cx="100" cy="148" rx="20" ry="14" fill="#c8c8c8" stroke="${OUTLINE}" stroke-width="2"/>`)}
      </g>`,
    ukulele: `
      <g class="held-instrument held-ukulele instrument-layered ${anim}" transform="translate(100,158) rotate(-25)">
        ${instLayer('inst-shadow', `<ellipse cx="4" cy="28" rx="24" ry="8" fill="rgba(0,0,0,0.22)"/>`)}
        ${instLayer('inst-body', `<ellipse cx="0" cy="20" rx="22" ry="16" fill="#a06830" stroke="${OUTLINE}" stroke-width="3"/><circle cx="0" cy="20" r="7" fill="#3a2010" stroke="${OUTLINE}" stroke-width="2"/>`)}
        ${instLayer('inst-neck', `<rect x="-5" y="-32" width="10" height="52" rx="3" fill="#6B4423" stroke="${OUTLINE}" stroke-width="2"/>`)}
        ${instLayer('inst-strings', `
          <line x1="-3" y1="-28" x2="-3" y2="32" stroke="#ddd" stroke-width="0.8"/>
          <line x1="-1" y1="-28" x2="-1" y2="32" stroke="#ddd" stroke-width="0.8"/>
          <line x1="1" y1="-28" x2="1" y2="32" stroke="#ddd" stroke-width="0.8"/>
          <line x1="3" y1="-28" x2="3" y2="32" stroke="#ddd" stroke-width="0.8"/>`)}
      </g>`,
    'electric-guitar': `
      <g class="held-instrument held-guitar instrument-layered ${anim}" transform="translate(98,155) rotate(-20)">
        ${instLayer('inst-shadow', `<ellipse cx="2" cy="32" rx="26" ry="9" fill="rgba(0,0,0,0.25)"/>`)}
        ${instLayer('inst-body-front', `<ellipse cx="0" cy="22" rx="22" ry="16" fill="#8B0000" stroke="${OUTLINE}" stroke-width="3"/>`)}
        ${instLayer('inst-neck', `<path d="M-7,-38 L7,-38 L9,18 Q0,24 -9,18 Z" fill="#1a1a1a" stroke="${OUTLINE}" stroke-width="3"/>`)}
        ${instLayer('inst-strings', `
          <line x1="-4" y1="-36" x2="-3.2" y2="30" stroke="#bbb" stroke-width="0.7"/>
          <line x1="-2" y1="-36" x2="-1.6" y2="30" stroke="#bbb" stroke-width="0.7"/>
          <line x1="0" y1="-36" x2="0" y2="30" stroke="#bbb" stroke-width="0.7"/>
          <line x1="2" y1="-36" x2="1.6" y2="30" stroke="#bbb" stroke-width="0.7"/>
          <line x1="4" y1="-36" x2="3.2" y2="30" stroke="#bbb" stroke-width="0.7"/>
          <line x1="6" y1="-36" x2="4.8" y2="30" stroke="#bbb" stroke-width="0.7"/>`)}
      </g>`,
  };
  if (shapes[inst.id]) return shapes[inst.id];
  return genericInstrumentSvg(inst);
}

function renderHeldInstrument(inst, pose = 'idle') {
  return renderHeldInstrumentInner(inst, pose);
}
