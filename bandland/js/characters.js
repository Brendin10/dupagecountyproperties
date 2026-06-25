const OUTLINE = '#1C1230';

const CHARACTERS = {
  benny: {
    id: 'benny',
    name: 'Benny',
    tagline: 'Purple powerhouse. Chunky biker fuzz.',
    render(size = 200) {
      return `
        <svg viewBox="0 0 200 270" width="${size}" height="${size * 1.35}" class="character-svg benny-svg" aria-label="Benny">
          <ellipse cx="100" cy="252" rx="50" ry="9" fill="rgba(0,0,0,0.18)"/>
          <!-- feet -->
          <rect x="58" y="210" width="26" height="32" rx="12" fill="#6234BC" stroke="${OUTLINE}" stroke-width="3"/>
          <rect x="116" y="210" width="26" height="32" rx="12" fill="#6234BC" stroke="${OUTLINE}" stroke-width="3"/>
          <ellipse cx="71" cy="238" rx="13" ry="7" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="2"/>
          <ellipse cx="129" cy="238" rx="13" ry="7" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="2"/>
          <!-- body blob -->
          <ellipse cx="100" cy="162" rx="54" ry="46" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="4"/>
          <ellipse cx="100" cy="166" rx="42" ry="36" fill="#BC94FF"/>
          <ellipse cx="100" cy="172" rx="28" ry="22" fill="#D2B2FF"/>
          <!-- jacket -->
          <path d="M44 138 Q100 122 156 138 L150 188 Q100 200 50 188 Z" fill="#764426" stroke="${OUTLINE}" stroke-width="4"/>
          <path d="M56 144 Q100 132 144 144 L140 178 Q100 186 60 178 Z" fill="#A86C3A"/>
          <rect x="92" y="132" width="16" height="54" rx="3" fill="#583018" stroke="${OUTLINE}" stroke-width="2"/>
          <ellipse cx="70" cy="158" rx="10" ry="9" fill="#F8F2E6" stroke="${OUTLINE}" stroke-width="2"/>
          <line x1="66" y1="156" x2="74" y2="162" stroke="${OUTLINE}" stroke-width="2"/>
          <!-- arms -->
          <ellipse cx="42" cy="162" rx="18" ry="20" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="4"/>
          <ellipse cx="158" cy="162" rx="18" ry="20" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="4"/>
          <ellipse cx="34" cy="178" rx="10" ry="10" fill="#BC94FF" stroke="${OUTLINE}" stroke-width="2"/>
          <ellipse cx="166" cy="178" rx="10" ry="10" fill="#BC94FF" stroke="${OUTLINE}" stroke-width="2"/>
          <!-- head -->
          <ellipse cx="100" cy="88" rx="52" ry="50" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="4"/>
          <ellipse cx="100" cy="92" rx="42" ry="40" fill="#BC94FF"/>
          <!-- fur tufts -->
          <circle cx="54" cy="72" r="6" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="2"/>
          <circle cx="146" cy="72" r="6" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="2"/>
          <circle cx="72" cy="52" r="5" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="2"/>
          <circle cx="128" cy="52" r="5" fill="#8E58FF" stroke="${OUTLINE}" stroke-width="2"/>
          <!-- horns -->
          <polygon points="66,48 60,18 78,34" fill="#D6A860" stroke="${OUTLINE}" stroke-width="3"/>
          <polygon points="134,48 140,18 122,34" fill="#D6A860" stroke="${OUTLINE}" stroke-width="3"/>
          <!-- MSM glossy eyes -->
          <ellipse cx="78" cy="86" rx="17" ry="18" fill="white" stroke="${OUTLINE}" stroke-width="3"/>
          <ellipse cx="122" cy="86" rx="17" ry="18" fill="white" stroke="${OUTLINE}" stroke-width="3"/>
          <ellipse cx="80" cy="88" rx="10" ry="11" fill="#1478C8"/>
          <ellipse cx="124" cy="88" rx="10" ry="11" fill="#1478C8"/>
          <circle cx="74" cy="80" r="5" fill="white"/>
          <circle cx="118" cy="80" r="5" fill="white"/>
          <circle cx="84" cy="92" r="3" fill="white"/>
          <circle cx="128" cy="92" r="3" fill="white"/>
          <!-- grin + tusks -->
          <path d="M76 108 Q100 124 124 108" fill="none" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/>
          <polygon points="88,108 92,120 82,116" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
          <polygon points="112,108 118,116 108,120" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
          <circle cx="64" cy="100" r="8" fill="#FF78B4" opacity="0.45"/>
          <circle cx="136" cy="100" r="8" fill="#FF78B4" opacity="0.45"/>
        </svg>
      `;
    },
  },
  lizzy: {
    id: 'lizzy',
    name: 'Lizzy',
    tagline: 'Pink jacket queen. Ponytail puff.',
    render(size = 200) {
      return `
        <svg viewBox="0 0 200 270" width="${size}" height="${size * 1.35}" class="character-svg lizzy-svg" aria-label="Lizzy">
          <ellipse cx="100" cy="252" rx="50" ry="9" fill="rgba(0,0,0,0.18)"/>
          <!-- ponytail puff -->
          <ellipse cx="100" cy="28" rx="26" ry="30" fill="#DC48FF" stroke="${OUTLINE}" stroke-width="4"/>
          <ellipse cx="100" cy="32" rx="18" ry="22" fill="#F882FF"/>
          <path d="M78 44 Q62 90 70 130 Q76 100 84 70 Q90 52 100 42" fill="#C838F0" stroke="${OUTLINE}" stroke-width="3"/>
          <path d="M122 44 Q138 90 130 130 Q124 100 116 70 Q110 52 100 42" fill="#C838F0" stroke="${OUTLINE}" stroke-width="3"/>
          <!-- feet -->
          <rect x="58" y="210" width="26" height="32" rx="12" fill="#6638C0" stroke="${OUTLINE}" stroke-width="3"/>
          <rect x="116" y="210" width="26" height="32" rx="12" fill="#6638C0" stroke="${OUTLINE}" stroke-width="3"/>
          <ellipse cx="71" cy="238" rx="13" ry="7" fill="#9458FF" stroke="${OUTLINE}" stroke-width="2"/>
          <ellipse cx="129" cy="238" rx="13" ry="7" fill="#9458FF" stroke="${OUTLINE}" stroke-width="2"/>
          <!-- body -->
          <ellipse cx="100" cy="164" rx="52" ry="44" fill="#9458FF" stroke="${OUTLINE}" stroke-width="4"/>
          <ellipse cx="100" cy="168" rx="40" ry="34" fill="#C29AFF"/>
          <ellipse cx="100" cy="174" rx="26" ry="20" fill="#DAB6FF"/>
          <!-- pink jacket -->
          <path d="M46 140 Q100 124 154 140 L148 186 Q100 198 52 186 Z" fill="#FF6CB2" stroke="${OUTLINE}" stroke-width="4"/>
          <path d="M58 146 Q100 134 142 146 L138 176 Q100 184 62 176 Z" fill="#FF9ECE"/>
          <rect x="92" y="134" width="16" height="50" rx="3" fill="#E64696" stroke="${OUTLINE}" stroke-width="2"/>
          <ellipse cx="132" cy="156" rx="8" ry="7" fill="#281638" stroke="${OUTLINE}" stroke-width="2"/>
          <!-- arms -->
          <ellipse cx="44" cy="164" rx="17" ry="19" fill="#9458FF" stroke="${OUTLINE}" stroke-width="4"/>
          <ellipse cx="156" cy="164" rx="17" ry="19" fill="#9458FF" stroke="${OUTLINE}" stroke-width="4"/>
          <ellipse cx="36" cy="180" rx="10" ry="10" fill="#C29AFF" stroke="${OUTLINE}" stroke-width="2"/>
          <ellipse cx="164" cy="180" rx="10" ry="10" fill="#C29AFF" stroke="${OUTLINE}" stroke-width="2"/>
          <!-- head -->
          <ellipse cx="100" cy="92" rx="50" ry="48" fill="#9458FF" stroke="${OUTLINE}" stroke-width="4"/>
          <ellipse cx="100" cy="96" rx="40" ry="38" fill="#C29AFF"/>
          <circle cx="56" cy="76" r="6" fill="#9458FF" stroke="${OUTLINE}" stroke-width="2"/>
          <circle cx="144" cy="76" r="6" fill="#9458FF" stroke="${OUTLINE}" stroke-width="2"/>
          <!-- horns -->
          <polygon points="72,54 68,34 82,44" fill="#D6A860" stroke="${OUTLINE}" stroke-width="3"/>
          <polygon points="128,54 132,34 118,44" fill="#D6A860" stroke="${OUTLINE}" stroke-width="3"/>
          <!-- glossy eyes + lashes -->
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
          <!-- smile -->
          <path d="M74 112 Q100 128 126 112" fill="none" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/>
          <ellipse cx="100" cy="118" rx="9" ry="5" fill="#B45078" stroke="${OUTLINE}" stroke-width="2"/>
          <polygon points="90,112 94,122 86,118" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
          <polygon points="110,112 114,118 106,122" fill="white" stroke="${OUTLINE}" stroke-width="2"/>
          <circle cx="62" cy="104" r="9" fill="#FF78B4" opacity="0.5"/>
          <circle cx="138" cy="104" r="9" fill="#FF78B4" opacity="0.5"/>
        </svg>
      `;
    },
  },
};

function renderCharacter(id, size, opts = {}) {
  let svg = CHARACTERS[id]?.render(size) ?? '';
  if (opts.instrument) {
    const held = renderHeldInstrument(opts.instrument, opts.pose || 'idle');
    svg = svg.replace('</svg>', `${held}</svg>`);
  }
  return svg;
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
