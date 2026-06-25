const INSTRUMENTS = {
  'trash-lid': {
    id: 'trash-lid',
    name: 'Trash Can Lid',
    emoji: '🥁',
    type: 'percussion',
    subtype: 'cymbal',
    hold: 'one-hand-up',
  },
  tambourine: {
    id: 'tambourine',
    name: 'Tambourine',
    emoji: '🪇',
    type: 'percussion',
    subtype: 'shake',
    hold: 'one-hand-up',
  },
  'drum-kit': {
    id: 'drum-kit',
    name: 'Drum Kit',
    emoji: '🥁',
    type: 'percussion',
    subtype: 'drums',
    hold: 'two-hand',
  },
  ukulele: {
    id: 'ukulele',
    name: 'Ukulele',
    emoji: '🎸',
    type: 'melodic',
    subtype: 'pluck',
    hold: 'strum',
    progression: ['C', 'G', 'Am', 'F'],
  },
  'electric-guitar': {
    id: 'electric-guitar',
    name: 'Electric Guitar',
    emoji: '🎸',
    type: 'melodic',
    subtype: 'chord',
    hold: 'strum',
    progression: ['E', 'B', 'C#m', 'A'],
  },
};

function getEquippedInstrument(state) {
  const id = state.equippedInstrument
    || state.inventories.instruments[state.inventories.instruments.length - 1]
    || 'trash-lid';
  return INSTRUMENTS[id] || INSTRUMENTS['trash-lid'];
}

function renderHeldInstrument(inst, pose = 'idle') {
  if (!inst) return '';
  const anim = pose !== 'idle' ? `inst-${pose}` : '';
  const type = inst.type;

  const shapes = {
    'trash-lid': `
      <g class="held-instrument held-cymbal ${anim}" transform="translate(118,148) rotate(-18)">
        <ellipse cx="0" cy="0" rx="28" ry="28" fill="#c8c8c8" stroke="${OUTLINE}" stroke-width="3"/>
        <ellipse cx="0" cy="0" rx="20" ry="20" fill="#e0e0e0" stroke="#999" stroke-width="2"/>
      </g>`,
    tambourine: `
      <g class="held-instrument held-tambourine ${anim}" transform="translate(122,142)">
        <circle cx="0" cy="0" r="22" fill="#d4a017" stroke="${OUTLINE}" stroke-width="3"/>
        <circle cx="-8" cy="-6" r="2" fill="#aaa"/><circle cx="8" cy="-4" r="2" fill="#aaa"/>
        <circle cx="0" cy="10" r="2" fill="#aaa"/>
      </g>`,
    'drum-kit': `
      <g class="held-instrument held-drums ${anim}">
        <ellipse cx="62" cy="168" rx="16" ry="10" fill="#8B4513" stroke="${OUTLINE}" stroke-width="2"/>
        <rect x="54" y="148" width="16" height="22" rx="3" fill="#654321" stroke="${OUTLINE}" stroke-width="2"/>
        <ellipse cx="138" cy="162" rx="20" ry="14" fill="#a0522d" stroke="${OUTLINE}" stroke-width="3"/>
      </g>`,
    ukulele: `
      <g class="held-instrument held-ukulele ${anim}" transform="translate(100,158) rotate(-25)">
        <ellipse cx="0" cy="18" rx="20" ry="14" fill="#c68642" stroke="${OUTLINE}" stroke-width="3"/>
        <rect x="-5" y="-28" width="10" height="48" rx="3" fill="#8B5A2B" stroke="${OUTLINE}" stroke-width="2"/>
        <line x1="-14" y1="4" x2="14" y2="4" stroke="#ddd" stroke-width="1.5"/>
        <line x1="-14" y1="10" x2="14" y2="10" stroke="#ddd" stroke-width="1.5"/>
      </g>`,
    'electric-guitar': `
      <g class="held-instrument held-guitar ${anim}" transform="translate(98,155) rotate(-20)">
        <path d="M-8,-35 L8,-35 L12,20 Q0,28 -12,20 Z" fill="#222" stroke="${OUTLINE}" stroke-width="3"/>
        <ellipse cx="0" cy="22" rx="22" ry="16" fill="#8B0000" stroke="${OUTLINE}" stroke-width="3"/>
        <circle cx="0" cy="-20" r="5" fill="#444"/>
      </g>`,
  };

  return shapes[inst.id] || shapes['trash-lid'];
}
