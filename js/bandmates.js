const BANDMATES = {
  riff: {
    id: 'riff',
    name: 'Riff',
    role: 'Guitar',
    fur: '#FF8C42',
    furLight: '#FFB07A',
    belly: '#FFD4B0',
    accent: '#2D5A27',
    hold: 'guitar',
    instrumentId: 'electric-guitar',
  },
  boom: {
    id: 'boom',
    name: 'Boom',
    role: 'Drums',
    fur: '#3ECFCC',
    furLight: '#7EEDE8',
    belly: '#B8F5F3',
    accent: '#1A6B68',
    hold: 'drums',
    instrumentId: 'drum-kit',
  },
  melody: {
    id: 'melody',
    name: 'Melody',
    role: 'Keys',
    fur: '#6B8CFF',
    furLight: '#A4B8FF',
    belly: '#D0DAFF',
    accent: '#2A4080',
    hold: 'keys',
    instrumentId: 'keyboard',
  },
  vox: {
    id: 'vox',
    name: 'Vox',
    role: 'Vocals',
    fur: '#FF5E8A',
    furLight: '#FF9EB8',
    belly: '#FFD0E0',
    accent: '#8B2040',
    hold: 'mic',
    instrumentId: null,
  },
  slap: {
    id: 'slap',
    name: 'Slap',
    role: 'Bass',
    fur: '#7BC950',
    furLight: '#A8E080',
    belly: '#D4F0C0',
    accent: '#2A6020',
    hold: 'bass',
    instrumentId: 'bass-guitar',
  },
  ziggy: {
    id: 'ziggy',
    name: 'Ziggy',
    role: 'Horns',
    fur: '#FFD166',
    furLight: '#FFE699',
    belly: '#FFF3CC',
    accent: '#B8860B',
    hold: 'horn',
    instrumentId: 'trumpet',
  },
};

function bandmateInstrumentSvg(m) {
  if (m.instrumentId && typeof INSTRUMENTS !== 'undefined' && typeof InstrumentArt !== 'undefined') {
    return InstrumentArt.renderHeld(INSTRUMENTS[m.instrumentId], 'idle');
  }
  if (m.hold === 'mic') {
    return `<g transform="translate(120,130)"><rect x="-3" y="0" width="6" height="35" fill="#555" stroke="${OUTLINE}" stroke-width="1"/><ellipse cx="0" cy="0" rx="10" ry="14" fill="#888" stroke="${OUTLINE}" stroke-width="2"/></g>`;
  }
  return '';
}

function renderBandmate(id, size = 80) {
  const m = BANDMATES[id];
  if (!m) return '';
  const w = size;
  const h = size * 1.35;
  const colors = typeof CharacterRig !== 'undefined' ? CharacterRig.bandmateColors(m) : m;
  const pose = typeof CharacterRig !== 'undefined' ? CharacterRig.poseFromRole(m.role) : 'idle';
  const armsBack = typeof CharacterRig !== 'undefined'
    ? CharacterRig.renderRiggedArms(colors, pose, 'back')
    : '';
  const armsFront = typeof CharacterRig !== 'undefined'
    ? CharacterRig.renderRiggedArms(colors, pose, 'front')
    : '';
  const tufts = (cx, cy, spread) => Array.from({ length: 6 }, (_, i) => {
    const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(ang) * spread;
    const y = cy + Math.sin(ang) * (spread * 0.6);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${m.furLight}" stroke="${OUTLINE}" stroke-width="1.5"/>`;
  }).join('');
  const inst = bandmateInstrumentSvg(m);
  return `
    <svg viewBox="0 0 200 270" width="${w}" height="${h}" class="bandmate-svg rigged-bandmate" data-pose="${pose}" aria-label="${m.name}">
      <ellipse cx="100" cy="252" rx="42" ry="8" fill="rgba(0,0,0,0.15)"/>
      <rect x="62" y="210" width="22" height="28" rx="10" fill="${m.accent}" stroke="${OUTLINE}" stroke-width="2"/>
      <rect x="116" y="210" width="22" height="28" rx="10" fill="${m.accent}" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="100" cy="162" rx="50" ry="44" fill="${m.fur}" stroke="${OUTLINE}" stroke-width="3"/>
      <ellipse cx="100" cy="166" rx="40" ry="34" fill="${m.furLight}"/>
      <ellipse cx="100" cy="172" rx="26" ry="20" fill="${m.belly}"/>
      ${tufts(100, 160, 30)}
      <g class="rig-arms-back">${armsBack}</g>
      <ellipse cx="100" cy="88" rx="48" ry="46" fill="${m.fur}" stroke="${OUTLINE}" stroke-width="3"/>
      <ellipse cx="100" cy="92" rx="38" ry="36" fill="${m.furLight}"/>
      ${tufts(100, 56, 26)}
      <circle cx="72" cy="52" r="5" fill="${m.fur}" stroke="${OUTLINE}" stroke-width="1"/>
      <circle cx="128" cy="52" r="5" fill="${m.fur}" stroke="${OUTLINE}" stroke-width="1"/>
      <circle cx="100" cy="44" r="5" fill="${m.furLight}" stroke="${OUTLINE}" stroke-width="1"/>
      <ellipse cx="80" cy="84" rx="15" ry="16" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="120" cy="84" rx="15" ry="16" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
      <circle cx="82" cy="86" r="8" fill="#2D1B69"/>
      <circle cx="122" cy="86" r="8" fill="#2D1B69"/>
      <circle cx="85" cy="82" r="3" fill="white"/>
      <circle cx="125" cy="82" r="3" fill="white"/>
      <path d="M74 76 Q82 68 90 76" fill="none" stroke="${OUTLINE}" stroke-width="2" stroke-linecap="round"/>
      <path d="M110 76 Q118 68 126 76" fill="none" stroke="${OUTLINE}" stroke-width="2" stroke-linecap="round"/>
      <path d="M76 104 Q100 120 124 104" fill="#FF9EC8" stroke="${OUTLINE}" stroke-width="2.5"/>
      <path d="M84 108 Q100 114 116 108" fill="white" stroke="${OUTLINE}" stroke-width="1.5"/>
      <circle cx="68" cy="96" r="8" fill="#FF8EC8" opacity="0.5"/>
      <circle cx="132" cy="96" r="8" fill="#FF8EC8" opacity="0.5"/>
      <g class="rig-arms-front">${armsFront}</g>
      <g class="bandmate-instrument">${inst}</g>
    </svg>`;
}

function getBandmateByName(name) {
  return Object.values(BANDMATES).find((b) => b.name === name);
}
