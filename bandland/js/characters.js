const OUTLINE = '#1C1230';

function charSvg(inner, cls = '') {
  return `<svg viewBox="0 0 200 270" class="char-part-svg ${cls}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

function charLayer(name, z, inner, extra = '') {
  return `<div class="char-layer layer-${name} ${extra}" style="z-index:${z}">${charSvg(inner)}</div>`;
}

function layeredCharacter(id, size, layers, instrumentHtml = '') {
  const h = size * 1.35;
  const instLayer = instrumentHtml
    ? `<div class="char-layer layer-instrument" style="z-index:20">${charSvg(instrumentHtml)}</div>`
    : '';
  return `<div class="character-layered ${id}-layered" style="width:${size}px;height:${h}px" aria-label="${id}">
    ${layers.join('')}${instLayer}
  </div>`;
}

const BENNY_LAYERS = (size) => {
  const s = size;
  return [
    charLayer('shadow', 1, `<ellipse cx="100" cy="252" rx="50" ry="9" fill="rgba(0,0,0,0.22)"/>`),
    charLayer('legs', 2, `
      <rect x="58" y="210" width="26" height="32" rx="12" fill="#5230A0" stroke="${OUTLINE}" stroke-width="3"/>
      <rect x="116" y="210" width="26" height="32" rx="12" fill="#5230A0" stroke="${OUTLINE}" stroke-width="3"/>
      <ellipse cx="71" cy="238" rx="13" ry="7" fill="#6234BC" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="129" cy="238" rx="13" ry="7" fill="#6234BC" stroke="${OUTLINE}" stroke-width="2"/>
      <rect x="62" y="218" width="8" height="14" rx="3" fill="#8E58FF" opacity="0.5"/>
      <rect x="120" y="218" width="8" height="14" rx="3" fill="#8E58FF" opacity="0.5"/>`),
    charLayer('body', 3, `
      <ellipse cx="100" cy="165" rx="54" ry="46" fill="#7E48EF" stroke="${OUTLINE}" stroke-width="4"/>
      <ellipse cx="100" cy="168" rx="42" ry="36" fill="#8E58FF"/>
      <ellipse cx="100" cy="174" rx="28" ry="22" fill="#BC94FF"/>
      <ellipse cx="100" cy="178" rx="18" ry="14" fill="#D2B2FF"/>`),
    charLayer('arms-back', 4, `
      <ellipse cx="38" cy="168" rx="16" ry="18" fill="#7E48EF" stroke="${OUTLINE}" stroke-width="3"/>
      <ellipse cx="162" cy="168" rx="16" ry="18" fill="#7E48EF" stroke="${OUTLINE}" stroke-width="3"/>`),
    charLayer('jacket', 6, `
      <path d="M44 138 Q100 120 156 138 L152 192 Q100 204 48 192 Z" fill="#5a3420" stroke="${OUTLINE}" stroke-width="4"/>
      <path d="M56 144 Q100 130 144 144 L140 184 Q100 194 60 184 Z" fill="#764426"/>
      <path d="M58 148 Q100 136 142 148 L138 178 Q100 186 62 178 Z" fill="#A86C3A"/>
      <rect x="92" y="130" width="16" height="58" rx="3" fill="#583018" stroke="${OUTLINE}" stroke-width="2"/>
      <path d="M48 142 L62 158 L56 172 Z" fill="#A86C3A" stroke="${OUTLINE}" stroke-width="2"/>
      <path d="M152 142 L138 158 L144 172 Z" fill="#A86C3A" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="70" cy="156" rx="11" ry="10" fill="#F8F2E6" stroke="${OUTLINE}" stroke-width="2"/>
      <line x1="66" y1="154" x2="74" y2="160" stroke="${OUTLINE}" stroke-width="2"/>
      <rect x="88" y="128" width="24" height="8" rx="3" fill="#6a4828" stroke="${OUTLINE}" stroke-width="1"/>`),
    charLayer('head', 7, `
      <ellipse cx="100" cy="92" rx="52" ry="50" fill="#7E48EF" stroke="${OUTLINE}" stroke-width="4"/>
      <ellipse cx="100" cy="96" rx="42" ry="40" fill="#8E58FF"/>
      <ellipse cx="100" cy="100" rx="32" ry="30" fill="#BC94FF" opacity="0.55"/>`),
    charLayer('horns', 8, `
      <polygon points="66,48 58,14 80,32" fill="#C89848" stroke="${OUTLINE}" stroke-width="3"/>
      <polygon points="66,48 64,32 76,40" fill="#D6A860"/>
      <polygon points="134,48 142,14 120,32" fill="#C89848" stroke="${OUTLINE}" stroke-width="3"/>
      <polygon points="134,48 136,32 124,40" fill="#D6A860"/>`),
    charLayer('hair', 9, `
      <circle cx="54" cy="72" r="7" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="2"/>
      <circle cx="146" cy="72" r="7" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="2"/>
      <circle cx="72" cy="50" r="6" fill="#9E68FF" stroke="${OUTLINE}" stroke-width="2"/>
      <circle cx="128" cy="50" r="6" fill="#9E68FF" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="48" cy="82" rx="10" ry="8" fill="#7E48EF" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="152" cy="82" rx="10" ry="8" fill="#7E48EF" stroke="${OUTLINE}" stroke-width="2"/>`),
    charLayer('face', 10, `
      <ellipse cx="78" cy="86" rx="17" ry="18" fill="white" stroke="${OUTLINE}" stroke-width="3"/>
      <ellipse cx="122" cy="86" rx="17" ry="18" fill="white" stroke="${OUTLINE}" stroke-width="3"/>
      <ellipse cx="80" cy="88" rx="10" ry="11" fill="#1478C8"/>
      <ellipse cx="124" cy="88" rx="10" ry="11" fill="#1478C8"/>
      <circle cx="74" cy="80" r="5" fill="white"/>
      <circle cx="118" cy="80" r="5" fill="white"/>
      <circle cx="84" cy="92" r="3" fill="white"/>
      <circle cx="128" cy="92" r="3" fill="white"/>
      <path d="M76 108 Q100 124 124 108" fill="none" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/>
      <polygon points="88,108 92,120 82,116" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
      <polygon points="112,108 118,116 108,120" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
      <circle cx="64" cy="100" r="8" fill="#FF78B4" opacity="0.45"/>
      <circle cx="136" cy="100" r="8" fill="#FF78B4" opacity="0.45"/>`),
    charLayer('arms-front', 11, `
      <ellipse cx="42" cy="162" rx="18" ry="20" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="4"/>
      <ellipse cx="158" cy="162" rx="18" ry="20" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="4"/>
      <ellipse cx="34" cy="178" rx="10" ry="10" fill="#BC94FF" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="166" cy="178" rx="10" ry="10" fill="#BC94FF" stroke="${OUTLINE}" stroke-width="2"/>
      <ellipse cx="30" cy="186" rx="7" ry="6" fill="#D2B2FF" stroke="${OUTLINE}" stroke-width="1"/>
      <ellipse cx="170" cy="186" rx="7" ry="6" fill="#D2B2FF" stroke="${OUTLINE}" stroke-width="1"/>`),
  ];
};

const LIZZY_LAYERS = () => [
  charLayer('shadow', 1, `<ellipse cx="100" cy="252" rx="50" ry="9" fill="rgba(0,0,0,0.22)"/>`),
  charLayer('hair-back', 2, `
    <path d="M78 44 Q62 90 70 130 Q76 100 84 70 Q90 52 100 42" fill="#B028D8" stroke="${OUTLINE}" stroke-width="3"/>
    <path d="M122 44 Q138 90 130 130 Q124 100 116 70 Q110 52 100 42" fill="#B028D8" stroke="${OUTLINE}" stroke-width="3"/>
    <ellipse cx="100" cy="28" rx="28" ry="32" fill="#C838F0" stroke="${OUTLINE}" stroke-width="4"/>
    <ellipse cx="100" cy="32" rx="20" ry="24" fill="#DC48FF"/>`),
  charLayer('legs', 3, `
    <rect x="58" y="210" width="26" height="32" rx="12" fill="#5630B0" stroke="${OUTLINE}" stroke-width="3"/>
    <rect x="116" y="210" width="26" height="32" rx="12" fill="#5630B0" stroke="${OUTLINE}" stroke-width="3"/>
    <ellipse cx="71" cy="238" rx="13" ry="7" fill="#6638C0" stroke="${OUTLINE}" stroke-width="2"/>
    <ellipse cx="129" cy="238" rx="13" ry="7" fill="#6638C0" stroke="${OUTLINE}" stroke-width="2"/>`),
  charLayer('body', 4, `
    <ellipse cx="100" cy="166" rx="52" ry="44" fill="#8450EF" stroke="${OUTLINE}" stroke-width="4"/>
    <ellipse cx="100" cy="170" rx="40" ry="34" fill="#9458FF"/>
    <ellipse cx="100" cy="176" rx="26" ry="20" fill="#C29AFF"/>
    <ellipse cx="100" cy="180" rx="16" ry="12" fill="#DAB6FF"/>`),
  charLayer('arms-back', 5, `
    <ellipse cx="40" cy="170" rx="15" ry="17" fill="#8450EF" stroke="${OUTLINE}" stroke-width="3"/>
    <ellipse cx="160" cy="170" rx="15" ry="17" fill="#8450EF" stroke="${OUTLINE}" stroke-width="3"/>`),
  charLayer('jacket', 7, `
    <path d="M46 140 Q100 122 154 140 L150 190 Q100 202 52 190 Z" fill="#E05098" stroke="${OUTLINE}" stroke-width="4"/>
    <path d="M58 146 Q100 132 142 146 L138 180 Q100 190 62 180 Z" fill="#FF6CB2"/>
    <path d="M62 150 Q100 138 138 150 L134 174 Q100 182 66 174 Z" fill="#FF9ECE"/>
    <rect x="92" y="132" width="16" height="52" rx="3" fill="#E64696" stroke="${OUTLINE}" stroke-width="2"/>
    <path d="M50 144 L64 160 L58 176 Z" fill="#FF9ECE" stroke="${OUTLINE}" stroke-width="2"/>
    <ellipse cx="132" cy="154" rx="9" ry="8" fill="#281638" stroke="${OUTLINE}" stroke-width="2"/>
    <rect x="86" y="128" width="28" height="8" rx="3" fill="#FF8EC8" stroke="${OUTLINE}" stroke-width="1"/>`),
  charLayer('head', 8, `
    <ellipse cx="100" cy="94" rx="50" ry="48" fill="#8450EF" stroke="${OUTLINE}" stroke-width="4"/>
    <ellipse cx="100" cy="98" rx="40" ry="38" fill="#9458FF"/>
    <ellipse cx="100" cy="102" rx="30" ry="28" fill="#C29AFF" opacity="0.5"/>`),
  charLayer('horns', 9, `
    <polygon points="72,54 66,30 84,42" fill="#D6A860" stroke="${OUTLINE}" stroke-width="3"/>
    <polygon points="128,54 134,30 116,42" fill="#D6A860" stroke="${OUTLINE}" stroke-width="3"/>`),
  charLayer('hair-front', 10, `
    <circle cx="56" cy="76" r="7" fill="#9458FF" stroke="${OUTLINE}" stroke-width="2"/>
    <circle cx="144" cy="76" r="7" fill="#9458FF" stroke="${OUTLINE}" stroke-width="2"/>
    <ellipse cx="100" cy="38" rx="22" ry="18" fill="#F882FF" opacity="0.7"/>`),
  charLayer('face', 11, `
    <ellipse cx="78" cy="90" rx="18" ry="19" fill="white" stroke="${OUTLINE}" stroke-width="3"/>
    <ellipse cx="122" cy="90" rx="18" ry="19" fill="white" stroke="${OUTLINE}" stroke-width="3"/>
    <ellipse cx="80" cy="92" rx="11" ry="12" fill="#C83CB4"/>
    <ellipse cx="124" cy="92" rx="11" ry="12" fill="#C83CB4"/>
    <circle cx="74" cy="84" r="5" fill="white"/>
    <circle cx="118" cy="84" r="5" fill="white"/>
    <circle cx="84" cy="96" r="3" fill="white"/>
    <circle cx="128" cy="96" r="3" fill="white"/>
    <path d="M58 80 L52 70" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
    <path d="M142 80 L148 70" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
    <path d="M74 112 Q100 128 126 112" fill="none" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="100" cy="118" rx="9" ry="5" fill="#B45078" stroke="${OUTLINE}" stroke-width="2"/>
    <polygon points="90,112 94,122 86,118" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
    <polygon points="110,112 114,118 106,122" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
    <circle cx="62" cy="104" r="9" fill="#FF78B4" opacity="0.5"/>
    <circle cx="138" cy="104" r="9" fill="#FF78B4" opacity="0.5"/>`),
  charLayer('arms-front', 12, `
    <ellipse cx="44" cy="164" rx="17" ry="19" fill="#9458FF" stroke="${OUTLINE}" stroke-width="4"/>
    <ellipse cx="156" cy="164" rx="17" ry="19" fill="#9458FF" stroke="${OUTLINE}" stroke-width="4"/>
    <ellipse cx="36" cy="180" rx="10" ry="10" fill="#C29AFF" stroke="${OUTLINE}" stroke-width="2"/>
    <ellipse cx="164" cy="180" rx="10" ry="10" fill="#C29AFF" stroke="${OUTLINE}" stroke-width="2"/>`),
];

const CHARACTERS = {
  benny: {
    id: 'benny',
    name: 'Benny',
    tagline: 'Purple powerhouse. Chunky biker fuzz.',
    render(size = 200) {
      return layeredCharacter('benny', size, BENNY_LAYERS(size));
    },
  },
  lizzy: {
    id: 'lizzy',
    name: 'Lizzy',
    tagline: 'Pink jacket queen. Ponytail puff.',
    render(size = 200) {
      return layeredCharacter('lizzy', size, LIZZY_LAYERS());
    },
  },
};

function renderCharacter(id, size, opts = {}) {
  const char = CHARACTERS[id];
  if (!char) return '';
  const instInner = opts.instrument ? renderHeldInstrumentInner(opts.instrument, opts.pose || 'idle') : '';
  if (id === 'benny') return layeredCharacter('benny', size, BENNY_LAYERS(size), instInner);
  return layeredCharacter('lizzy', size, LIZZY_LAYERS(), instInner);
}

function renderCrowdMember(index) {
  const colors = ['#FF6B9D', '#6BCBFF', '#FFD166', '#95E06C', '#C77DFF'];
  const c = colors[index % colors.length];
  return `
    <svg viewBox="0 0 40 50" width="32" height="40" class="crowd-member">
      <ellipse cx="20" cy="38" rx="14" ry="8" fill="#3C3250" stroke="#1C1230" stroke-width="2"/>
      <ellipse cx="20" cy="16" rx="12" ry="13" fill="#BEA0D2" stroke="#1C1230" stroke-width="2"/>
      <ellipse cx="20" cy="14" rx="13" ry="12" fill="${c}" stroke="#1C1230" stroke-width="2"/>
      <rect x="10" y="18" width="20" height="18" rx="5" fill="${c}" stroke="#1C1230" stroke-width="2"/>
    </svg>
  `;
}
