const CHARACTERS = {
  benny: {
    id: 'benny',
    name: 'Benny',
    tagline: 'Purple powerhouse. Leather jacket energy.',
    render(size = 200) {
      return `
        <svg viewBox="0 0 200 260" width="${size}" height="${size * 1.3}" class="character-svg benny-svg" aria-label="Benny">
          <ellipse cx="100" cy="235" rx="55" ry="10" fill="rgba(0,0,0,0.15)"/>
          <!-- legs -->
          <rect x="72" y="195" width="22" height="28" rx="10" fill="#7B4DFF"/>
          <rect x="106" y="195" width="22" height="28" rx="10" fill="#7B4DFF"/>
          <ellipse cx="83" cy="224" rx="14" ry="8" fill="#5A35CC"/>
          <ellipse cx="117" cy="224" rx="14" ry="8" fill="#5A35CC"/>
          <!-- body fur -->
          <ellipse cx="100" cy="150" rx="58" ry="62" fill="#9B6BFF"/>
          <ellipse cx="100" cy="155" rx="48" ry="50" fill="#B48CFF"/>
          <!-- jacket -->
          <path d="M48 118 Q100 95 152 118 L158 188 Q100 205 42 188 Z" fill="#6B3E1E"/>
          <path d="M58 125 L100 112 L142 125 L138 180 Q100 192 62 180 Z" fill="#8B5A2B"/>
          <rect x="92" y="112" width="16" height="78" fill="#5D3418"/>
          <circle cx="78" cy="145" r="9" fill="#F5F0E8" stroke="#333" stroke-width="2"/>
          <text x="78" y="149" text-anchor="middle" font-size="10" fill="#333">☠</text>
          <text x="128" y="158" text-anchor="middle" font-size="7" fill="#F5F0E8" font-family="Fredoka, sans-serif">HAIRY</text>
          <text x="128" y="166" text-anchor="middle" font-size="6" fill="#F5F0E8" font-family="Fredoka, sans-serif">MONSTER</text>
          <!-- arms -->
          <ellipse cx="46" cy="155" rx="16" ry="22" fill="#9B6BFF"/>
          <ellipse cx="154" cy="155" rx="16" ry="22" fill="#9B6BFF"/>
          <circle cx="40" cy="172" r="10" fill="#B48CFF"/>
          <circle cx="160" cy="172" r="10" fill="#B48CFF"/>
          <!-- head -->
          <circle cx="100" cy="88" r="52" fill="#9B6BFF"/>
          <circle cx="100" cy="92" r="44" fill="#B48CFF"/>
          <!-- horns -->
          <path d="M68 52 Q62 18 78 34 Q72 48 68 52" fill="#C9A06C"/>
          <path d="M132 52 Q138 18 122 34 Q128 48 132 52" fill="#C9A06C"/>
          <path d="M70 50 Q66 30 76 38" fill="#E8C88E" opacity="0.6"/>
          <path d="M130 50 Q134 30 124 38" fill="#E8C88E" opacity="0.6"/>
          <!-- eyes -->
          <ellipse cx="82" cy="88" rx="14" ry="16" fill="white"/>
          <ellipse cx="118" cy="88" rx="14" ry="16" fill="white"/>
          <circle cx="84" cy="90" r="8" fill="#2D1B69"/>
          <circle cx="120" cy="90" r="8" fill="#2D1B69"/>
          <circle cx="87" cy="87" r="3" fill="white"/>
          <circle cx="123" cy="87" r="3" fill="white"/>
          <path d="M68 74 Q82 68 96 74" fill="none" stroke="#5A35CC" stroke-width="4" stroke-linecap="round"/>
          <path d="M104 74 Q118 68 132 74" fill="none" stroke="#5A35CC" stroke-width="4" stroke-linecap="round"/>
          <!-- mouth & fangs -->
          <path d="M78 108 Q100 122 122 108" fill="none" stroke="#4A2D91" stroke-width="3" stroke-linecap="round"/>
          <polygon points="88,108 92,118 84,116" fill="white"/>
          <polygon points="112,108 116,118 108,116" fill="white"/>
          <!-- cheek blush -->
          <circle cx="68" cy="100" r="8" fill="#FF8EC8" opacity="0.35"/>
          <circle cx="132" cy="100" r="8" fill="#FF8EC8" opacity="0.35"/>
        </svg>
      `;
    },
  },
  lizzy: {
    id: 'lizzy',
    name: 'Lizzy',
    tagline: 'Pink jacket queen. Ponytail power.',
    render(size = 200) {
      return `
        <svg viewBox="0 0 200 260" width="${size}" height="${size * 1.3}" class="character-svg lizzy-svg" aria-label="Lizzy">
          <ellipse cx="100" cy="235" rx="55" ry="10" fill="rgba(0,0,0,0.15)"/>
          <!-- ponytail -->
          <ellipse cx="100" cy="30" rx="22" ry="28" fill="#D050FF"/>
          <path d="M88 42 Q70 90 74 140 Q78 120 88 80 Q95 55 100 45" fill="#E070FF"/>
          <path d="M112 42 Q130 90 126 140 Q122 120 112 80 Q105 55 100 45" fill="#C040EE"/>
          <!-- legs -->
          <rect x="72" y="195" width="22" height="28" rx="10" fill="#7B4DFF"/>
          <rect x="106" y="195" width="22" height="28" rx="10" fill="#7B4DFF"/>
          <ellipse cx="83" cy="224" rx="14" ry="8" fill="#5A35CC"/>
          <ellipse cx="117" cy="224" rx="14" ry="8" fill="#5A35CC"/>
          <!-- body -->
          <ellipse cx="100" cy="152" rx="54" ry="58" fill="#9B6BFF"/>
          <ellipse cx="100" cy="156" rx="45" ry="48" fill="#B48CFF"/>
          <!-- pink jacket -->
          <path d="M50 120 Q100 98 150 120 L156 186 Q100 202 44 186 Z" fill="#FF7EB9"/>
          <path d="M60 126 L100 114 L140 126 L136 178 Q100 190 64 178 Z" fill="#FF9FD0"/>
          <rect x="92" y="114" width="16" height="72" fill="#FF5EA8"/>
          <circle cx="124" cy="148" r="8" fill="#2D1B69" stroke="#fff" stroke-width="1.5"/>
          <text x="124" y="151" text-anchor="middle" font-size="8" fill="#fff">☠</text>
          <text x="76" y="170" text-anchor="middle" font-size="6" fill="#5D1040" font-family="Fredoka, sans-serif" transform="rotate(-8 76 170)">HAIRY</text>
          <text x="76" y="177" text-anchor="middle" font-size="5" fill="#5D1040" font-family="Fredoka, sans-serif" transform="rotate(-8 76 177)">MONSTER</text>
          <!-- arms -->
          <ellipse cx="48" cy="158" rx="15" ry="21" fill="#9B6BFF"/>
          <ellipse cx="152" cy="158" rx="15" ry="21" fill="#9B6BFF"/>
          <circle cx="42" cy="175" r="10" fill="#B48CFF"/>
          <circle cx="158" cy="175" r="10" fill="#B48CFF"/>
          <!-- head -->
          <circle cx="100" cy="90" r="50" fill="#9B6BFF"/>
          <circle cx="100" cy="94" r="42" fill="#B48CFF"/>
          <!-- horns -->
          <path d="M72 56 Q68 30 80 40 Q76 52 72 56" fill="#C9A06C"/>
          <path d="M128 56 Q132 30 120 40 Q124 52 128 56" fill="#C9A06C"/>
          <!-- eyes with lashes -->
          <ellipse cx="82" cy="90" rx="15" ry="17" fill="white"/>
          <ellipse cx="118" cy="90" rx="15" ry="17" fill="white"/>
          <circle cx="84" cy="92" r="8" fill="#2D1B69"/>
          <circle cx="120" cy="92" r="8" fill="#2D1B69"/>
          <circle cx="87" cy="89" r="3" fill="white"/>
          <circle cx="123" cy="89" r="3" fill="white"/>
          <path d="M68 82 L64 74 M70 86 L65 80 M72 90 L67 86" stroke="#5A35CC" stroke-width="2" stroke-linecap="round"/>
          <path d="M132 82 L136 74 M130 86 L135 80 M128 90 L133 86" stroke="#5A35CC" stroke-width="2" stroke-linecap="round"/>
          <path d="M70 76 Q82 70 94 76" fill="none" stroke="#D050FF" stroke-width="3" stroke-linecap="round"/>
          <path d="M106 76 Q118 70 130 76" fill="none" stroke="#D050FF" stroke-width="3" stroke-linecap="round"/>
          <!-- smile -->
          <path d="M76 110 Q100 126 124 110" fill="none" stroke="#4A2D91" stroke-width="3" stroke-linecap="round"/>
          <polygon points="90,110 94,120 86,118" fill="white"/>
          <polygon points="110,110 114,120 106,118" fill="white"/>
          <circle cx="66" cy="102" r="9" fill="#FF8EC8" opacity="0.4"/>
          <circle cx="134" cy="102" r="9" fill="#FF8EC8" opacity="0.4"/>
        </svg>
      `;
    },
  },
};

function renderCharacter(id, size) {
  return CHARACTERS[id]?.render(size) ?? '';
}

function renderCrowdMember(index) {
  const colors = ['#FF6B9D', '#6BCBFF', '#FFD166', '#95E06C', '#C77DFF'];
  const c = colors[index % colors.length];
  return `
    <svg viewBox="0 0 40 50" width="32" height="40" class="crowd-member">
      <circle cx="20" cy="14" r="10" fill="${c}"/>
      <rect x="12" y="24" width="16" height="18" rx="6" fill="${c}" opacity="0.85"/>
      <circle cx="16" cy="13" r="2" fill="#333"/>
      <circle cx="24" cy="13" r="2" fill="#333"/>
      <path d="M16 18 Q20 21 24 18" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>
  `;
}
