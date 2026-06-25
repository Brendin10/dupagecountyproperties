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
  },
};

function renderBandmateHold(type) {
  const holds = {
    guitar: `<g transform="translate(118,148) rotate(-20)"><rect x="-4" y="-30" width="8" height="45" rx="3" fill="#5a3818" stroke="${OUTLINE}" stroke-width="2"/><ellipse cx="0" cy="18" rx="16" ry="12" fill="#8B0000" stroke="${OUTLINE}" stroke-width="2"/></g>`,
    drums: `<g transform="translate(95,155)"><ellipse cx="0" cy="0" rx="18" ry="10" fill="#a0522d" stroke="${OUTLINE}" stroke-width="2"/><rect x="-3" y="-25" width="6" height="28" fill="#888" stroke="${OUTLINE}" stroke-width="1"/></g>`,
    keys: `<g transform="translate(100,150)"><rect x="-22" y="-8" width="44" height="22" rx="3" fill="#222" stroke="${OUTLINE}" stroke-width="2"/>${[0,1,2,3,4].map(i => `<rect x="${-18+i*8}" y="-4" width="6" height="14" fill="#f5f5f5"/>`).join('')}</g>`,
    mic: `<g transform="translate(120,130)"><rect x="-3" y="0" width="6" height="35" fill="#555" stroke="${OUTLINE}" stroke-width="1"/><ellipse cx="0" cy="0" rx="10" ry="14" fill="#888" stroke="${OUTLINE}" stroke-width="2"/></g>`,
    bass: `<g transform="translate(115,150) rotate(-15)"><rect x="-5" y="-35" width="10" height="55" rx="3" fill="#1a1a2e" stroke="${OUTLINE}" stroke-width="2"/><ellipse cx="0" cy="22" rx="18" ry="13" fill="#2a2a4a" stroke="${OUTLINE}" stroke-width="2"/></g>`,
    horn: `<g transform="translate(118,138) rotate(-30)"><path d="M0,0 Q20,-5 35,10 L30,18 Q15,8 0,12 Z" fill="#d4a017" stroke="${OUTLINE}" stroke-width="2"/></g>`,
  };
  return holds[type] || '';
}

function renderBandmate(id, size = 80) {
  const m = BANDMATES[id];
  if (!m) return '';
  const w = size;
  const h = size * 1.35;
  return `
    <svg viewBox="0 0 200 270" width="${w}" height="${h}" class="bandmate-svg" aria-label="${m.name}">
      <ellipse cx="100" cy="252" rx="42" ry="8" fill="rgba(0,0,0,0.15)"/>
      <rect x="62" y="210" width="22" height="28" rx="10" fill="${m.accent}" stroke="${OUTLINE}" stroke-width="2"/>
      <rect x="116" y="210" width="22" height="28" rx="10" fill="${m.accent}" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="100" cy="162" rx="48" ry="42" fill="${m.fur}" stroke="${OUTLINE}" stroke-width="3"/>
      <ellipse cx="100" cy="166" rx="38" ry="32" fill="${m.furLight}"/>
      <ellipse cx="100" cy="172" rx="24" ry="18" fill="${m.belly}"/>
      <ellipse cx="44" cy="160" rx="14" ry="16" fill="${m.fur}" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="156" cy="160" rx="14" ry="16" fill="${m.fur}" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="100" cy="88" rx="46" ry="44" fill="${m.fur}" stroke="${OUTLINE}" stroke-width="3"/>
      <ellipse cx="100" cy="92" rx="36" ry="34" fill="${m.furLight}"/>
      <circle cx="72" cy="52" r="5" fill="${m.fur}" stroke="${OUTLINE}" stroke-width="1"/>
      <circle cx="128" cy="52" r="5" fill="${m.fur}" stroke="${OUTLINE}" stroke-width="1"/>
      <ellipse cx="80" cy="86" rx="14" ry="15" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="120" cy="86" rx="14" ry="15" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
      <circle cx="82" cy="88" r="7" fill="#2D1B69"/>
      <circle cx="122" cy="88" r="7" fill="#2D1B69"/>
      <circle cx="85" cy="85" r="2.5" fill="white"/>
      <circle cx="125" cy="85" r="2.5" fill="white"/>
      <path d="M82 104 Q100 116 118 104" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="68" cy="98" r="7" fill="#FF8EC8" opacity="0.4"/>
      <circle cx="132" cy="98" r="7" fill="#FF8EC8" opacity="0.4"/>
      ${renderBandmateHold(m.hold)}
    </svg>`;
}

function getBandmateByName(name) {
  return Object.values(BANDMATES).find((b) => b.name === name);
}
