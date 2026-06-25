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

function instLayer(cls, content) {
  return `<g class="inst-layer ${cls}">${content}</g>`;
}

function renderHeldInstrumentInner(inst, pose = 'idle') {
  if (!inst) return '';
  const anim = pose !== 'idle' ? `inst-${pose}` : '';
  const shapes = {
    'trash-lid': `
      <g class="held-instrument held-cymbal instrument-layered ${anim}" transform="translate(118,148) rotate(-18)">
        ${instLayer('inst-shadow', `<ellipse cx="4" cy="6" rx="30" ry="8" fill="rgba(0,0,0,0.25)"/>`)}
        ${instLayer('inst-rim', `
          <ellipse cx="0" cy="0" rx="30" ry="30" fill="#a8a8a8" stroke="${OUTLINE}" stroke-width="3"/>
          <ellipse cx="0" cy="-2" rx="28" ry="28" fill="#c8c8c8"/>
          <ellipse cx="0" cy="0" rx="26" ry="26" fill="none" stroke="#888" stroke-width="2"/>`)}
        ${instLayer('inst-face', `
          <ellipse cx="0" cy="2" rx="22" ry="22" fill="#e8e8e8"/>
          <ellipse cx="-6" cy="-4" rx="8" ry="6" fill="#fff" opacity="0.45"/>
          <ellipse cx="8" cy="6" rx="5" ry="4" fill="#bbb" opacity="0.3"/>`)}
        ${instLayer('inst-handle', `
          <rect x="-4" y="22" width="8" height="18" rx="3" fill="#888" stroke="${OUTLINE}" stroke-width="2"/>
          <rect x="-3" y="24" width="6" height="14" rx="2" fill="#aaa"/>`)}
      </g>`,
    tambourine: `
      <g class="held-instrument held-tambourine instrument-layered ${anim}" transform="translate(122,142)">
        ${instLayer('inst-shadow', `<ellipse cx="2" cy="8" rx="26" ry="7" fill="rgba(0,0,0,0.22)"/>`)}
        ${instLayer('inst-frame', `
          <circle cx="0" cy="0" r="24" fill="#b8860b" stroke="${OUTLINE}" stroke-width="3"/>
          <circle cx="0" cy="0" r="20" fill="#d4a017"/>
          <circle cx="0" cy="0" r="17" fill="none" stroke="#a07010" stroke-width="2"/>`)}
        ${instLayer('inst-jingles', `
          ${[[-14,-10],[12,-8],[-8,12],[10,10],[0,-16],[16,2],[-12,4]].map(([x,y]) =>
            `<circle cx="${x}" cy="${y}" r="2.5" fill="#ccc" stroke="#888" stroke-width="1"/>`
          ).join('')}`)}
        ${instLayer('inst-skin', `
          <circle cx="0" cy="0" r="14" fill="#e8c878" opacity="0.5"/>
          <ellipse cx="-4" cy="-3" rx="5" ry="4" fill="#fff" opacity="0.25"/>`)}
      </g>`,
    'drum-kit': `
      <g class="held-instrument held-drums instrument-layered ${anim}">
        ${instLayer('inst-shadow', `<ellipse cx="100" cy="178" rx="90" ry="12" fill="rgba(0,0,0,0.2)"/>`)}
        ${instLayer('inst-floor-tom', `
          <ellipse cx="138" cy="168" rx="22" ry="15" fill="#6b3410" stroke="${OUTLINE}" stroke-width="2"/>
          <ellipse cx="138" cy="164" rx="20" ry="13" fill="#a0522d"/>
          <ellipse cx="138" cy="162" rx="16" ry="10" fill="#c07040" opacity="0.5"/>
          <rect x="126" y="152" width="24" height="18" rx="2" fill="#654321" stroke="${OUTLINE}" stroke-width="2"/>`)}
        ${instLayer('inst-snare', `
          <ellipse cx="62" cy="172" rx="18" ry="12" fill="#8B4513" stroke="${OUTLINE}" stroke-width="2"/>
          <ellipse cx="62" cy="168" rx="16" ry="10" fill="#c8c8c8"/>
          <ellipse cx="62" cy="166" rx="13" ry="8" fill="#e0e0e0"/>
          <rect x="52" y="148" width="20" height="24" rx="3" fill="#654321" stroke="${OUTLINE}" stroke-width="2"/>
          <line x1="48" y1="155" x2="76" y2="155" stroke="#aaa" stroke-width="1"/>`)}
        ${instLayer('inst-sticks', `
          <rect x="44" y="138" width="5" height="32" rx="2" fill="#deb887" stroke="${OUTLINE}" stroke-width="1" transform="rotate(-25 46 154)"/>
          <ellipse cx="38" cy="132" rx="4" ry="3" fill="#f5deb3" transform="rotate(-25 38 132)"/>
          <rect x="148" y="142" width="5" height="28" rx="2" fill="#deb887" stroke="${OUTLINE}" stroke-width="1" transform="rotate(15 150 156)"/>`)}
        ${instLayer('inst-cymbal', `
          <ellipse cx="100" cy="148" rx="20" ry="14" fill="#c8c8c8" stroke="${OUTLINE}" stroke-width="2"/>
          <ellipse cx="100" cy="146" rx="16" ry="11" fill="#e0e0e0"/>
          <rect x="97" y="148" width="6" height="22" fill="#888" stroke="${OUTLINE}" stroke-width="1"/>`)}
      </g>`,
    ukulele: `
      <g class="held-instrument held-ukulele instrument-layered ${anim}" transform="translate(100,158) rotate(-25)">
        ${instLayer('inst-shadow', `<ellipse cx="4" cy="28" rx="24" ry="8" fill="rgba(0,0,0,0.22)"/>`)}
        ${instLayer('inst-neck', `
          <rect x="-5" y="-32" width="10" height="52" rx="3" fill="#6B4423" stroke="${OUTLINE}" stroke-width="2"/>
          <rect x="-4" y="-30" width="8" height="48" rx="2" fill="#8B5A2B"/>
          <rect x="-6" y="-34" width="12" height="8" rx="2" fill="#5a3818" stroke="${OUTLINE}" stroke-width="1"/>
          ${[0,1,2,3].map(i => `<circle cx="0" cy="${-20 + i*10}" r="2" fill="#ccc" stroke="#888" stroke-width="0.5"/>`).join('')}`)}
        ${instLayer('inst-body', `
          <ellipse cx="0" cy="20" rx="22" ry="16" fill="#a06830" stroke="${OUTLINE}" stroke-width="3"/>
          <ellipse cx="0" cy="18" rx="18" ry="13" fill="#c68642"/>
          <ellipse cx="-5" cy="14" rx="6" ry="5" fill="#fff" opacity="0.2"/>`)}
        ${instLayer('inst-soundhole', `
          <circle cx="0" cy="20" r="7" fill="#3a2010" stroke="${OUTLINE}" stroke-width="2"/>
          <circle cx="0" cy="20" r="5" fill="#2a1808"/>
          <circle cx="-2" cy="18" r="1.5" fill="#4a3020" opacity="0.5"/>`)}
        ${instLayer('inst-strings', `
          ${[-3,-1,1,3].map(x => `<line x1="${x}" y1="-28" x2="${x}" y2="32" stroke="#ddd" stroke-width="0.8"/>`).join('')}
          <line x1="-14" y1="6" x2="14" y2="6" stroke="#ccc" stroke-width="1.5"/>
          <line x1="-14" y1="12" x2="14" y2="12" stroke="#ccc" stroke-width="1.5"/>
          <line x1="-14" y1="18" x2="14" y2="18" stroke="#ccc" stroke-width="1.5"/>`)}
        ${instLayer('inst-bridge', `<rect x="-8" y="30" width="16" height="4" rx="1" fill="#f5f5f5" stroke="#ccc" stroke-width="1"/>`)}
      </g>`,
    'electric-guitar': `
      <g class="held-instrument held-guitar instrument-layered ${anim}" transform="translate(98,155) rotate(-20)">
        ${instLayer('inst-shadow', `<ellipse cx="2" cy="32" rx="26" ry="9" fill="rgba(0,0,0,0.25)"/>`)}
        ${instLayer('inst-neck', `
          <path d="M-7,-38 L7,-38 L9,18 Q0,24 -9,18 Z" fill="#1a1a1a" stroke="${OUTLINE}" stroke-width="3"/>
          <path d="M-5,-36 L5,-36 L7,16 Q0,20 -7,16 Z" fill="#2a2a2a"/>
          <rect x="-8" y="-42" width="16" height="8" rx="2" fill="#333" stroke="${OUTLINE}" stroke-width="2"/>
          ${[-2,0,2].map(x => `<circle cx="${x}" cy="-38" r="1.5" fill="#888"/>`).join('')}
          <rect x="-6" y="-8" width="12" height="3" fill="#c0c0c0"/>`)}
        ${instLayer('inst-body-back', `
          <ellipse cx="0" cy="24" rx="24" ry="18" fill="#5a0000" stroke="${OUTLINE}" stroke-width="3"/>
          <path d="M-8,-35 L8,-35 L14,20 Q0,30 -14,20 Z" fill="#111" stroke="${OUTLINE}" stroke-width="2"/>`)}
        ${instLayer('inst-body-front', `
          <ellipse cx="0" cy="22" rx="22" ry="16" fill="#8B0000" stroke="${OUTLINE}" stroke-width="3"/>
          <ellipse cx="0" cy="20" rx="18" ry="13" fill="#a01010"/>
          <ellipse cx="-6" cy="16" rx="5" ry="4" fill="#fff" opacity="0.15"/>`)}
        ${instLayer('inst-pickups', `
          <rect x="-10" y="14" width="20" height="8" rx="2" fill="#222" stroke="#444" stroke-width="1"/>
          <rect x="-6" y="16" width="12" height="4" fill="#444"/>
          <circle cx="0" cy="-18" r="5" fill="#444" stroke="${OUTLINE}" stroke-width="2"/>
          <circle cx="0" cy="-18" r="3" fill="#666"/>`)}
        ${instLayer('inst-strings', `
          ${[-4,-2,0,2,4,6].map(x => `<line x1="${x}" y1="-36" x2="${x * 0.8}" y2="30" stroke="#bbb" stroke-width="0.7"/>`).join('')}`)}
        ${instLayer('inst-knobs', `
          <circle cx="-8" cy="28" r="3" fill="#d4a017" stroke="${OUTLINE}" stroke-width="1"/>
          <circle cx="8" cy="28" r="3" fill="#d4a017" stroke="${OUTLINE}" stroke-width="1"/>`)}
      </g>`,
  };
  return shapes[inst.id] || shapes['trash-lid'];
}

function renderHeldInstrument(inst, pose = 'idle') {
  return renderHeldInstrumentInner(inst, pose);
}
