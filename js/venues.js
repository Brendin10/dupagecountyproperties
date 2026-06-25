const VENUE_BACKDROPS = {
  'street-corner': () => `
    <svg class="venue-backdrop-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sky-street" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6eb5ff"/><stop offset="100%" stop-color="#f5d89a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#sky-street)"/>
      <rect y="280" width="800" height="120" fill="#8b7355"/>
      <rect y="275" width="800" height="8" fill="#6b5a45"/>
      <!-- buildings -->
      <rect x="40" y="120" width="90" height="160" fill="#5a6a7a" stroke="#2a3540" stroke-width="3"/>
      <rect x="50" y="140" width="20" height="25" fill="#ffe9a0" opacity="0.8"/>
      <rect x="80" y="150" width="20" height="25" fill="#ffe9a0" opacity="0.6"/>
      <rect x="140" y="90" width="110" height="190" fill="#4a5568" stroke="#2a3540" stroke-width="3"/>
      <rect x="155" y="110" width="25" height="30" fill="#ffe9a0" opacity="0.7"/>
      <rect x="190" y="120" width="25" height="30" fill="#ffe9a0" opacity="0.5"/>
      <rect x="580" y="100" width="100" height="180" fill="#6a5a7a" stroke="#2a3540" stroke-width="3"/>
      <rect x="690" y="130" width="80" height="150" fill="#5a6a8a" stroke="#2a3540" stroke-width="3"/>
      <!-- street lamp -->
      <rect x="395" y="180" width="10" height="100" fill="#333"/>
      <circle cx="400" cy="175" r="18" fill="#fff8d0" opacity="0.9"/>
      <ellipse cx="400" cy="300" rx="40" ry="8" fill="rgba(0,0,0,0.2)"/>
    </svg>`,

  'local-tavern': () => `
    <svg class="venue-backdrop-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice">
      <rect width="800" height="400" fill="#2a1810"/>
      <!-- wooden walls -->
      <rect y="60" width="800" height="340" fill="#4a3020"/>
      ${Array.from({length: 12}, (_, i) => `<rect x="${i*68}" y="60" width="4" height="340" fill="#3a2518" opacity="0.5"/>`).join('')}
      <!-- bar back shelf -->
      <rect x="80" y="100" width="640" height="120" fill="#3d2818" stroke="#2a1810" stroke-width="4"/>
      <rect x="100" y="115" width="50" height="70" rx="4" fill="#5a3828"/>
      <rect x="170" y="120" width="40" height="65" rx="4" fill="#6a4830"/>
      <rect x="230" y="118" width="45" height="68" rx="4" fill="#5a3828"/>
      <rect x="500" y="115" width="50" height="70" rx="4" fill="#6a4830"/>
      <rect x="580" y="120" width="40" height="65" rx="4" fill="#5a3828"/>
      <!-- warm lights -->
      <circle cx="150" cy="80" r="25" fill="#ffb347" opacity="0.35"/>
      <circle cx="400" cy="70" r="30" fill="#ff9f5a" opacity="0.4"/>
      <circle cx="650" cy="80" r="25" fill="#ffb347" opacity="0.35"/>
      <!-- sign -->
      <rect x="320" y="40" width="160" height="50" rx="8" fill="#5c3018" stroke="#8b5a2b" stroke-width="3"/>
      <text x="400" y="72" text-anchor="middle" fill="#f5e6c8" font-family="Fredoka,sans-serif" font-size="22" font-weight="700">TAVERN</text>
      <!-- floor -->
      <rect y="320" width="800" height="80" fill="#3a2818"/>
      <ellipse cx="400" cy="330" rx="200" ry="15" fill="rgba(0,0,0,0.25)"/>
    </svg>`,

  'town-square': () => `
    <svg class="venue-backdrop-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice">
      <rect width="800" height="280" fill="#87ceeb"/>
      <rect y="280" width="800" height="120" fill="#9aab8a"/>
      <!-- cobble hint -->
      ${Array.from({length: 20}, (_, i) => `<ellipse cx="${40 + i*40}" cy="340" rx="18" ry="8" fill="#7a9a6a" opacity="0.5"/>`).join('')}
      <!-- clock tower -->
      <rect x="350" y="60" width="100" height="220" fill="#c8b8a0" stroke="#8a7a68" stroke-width="4"/>
      <polygon points="400,30 430,60 370,60" fill="#8a5040"/>
      <circle cx="400" cy="130" r="35" fill="#f5f0e8" stroke="#8a7a68" stroke-width="3"/>
      <line x1="400" y1="130" x2="400" y2="105" stroke="#333" stroke-width="3"/>
      <line x1="400" y1="130" x2="420" y2="135" stroke="#333" stroke-width="2"/>
      <!-- fountain -->
      <ellipse cx="180" cy="300" rx="55" ry="20" fill="#6a9ab8"/>
      <ellipse cx="180" cy="290" rx="35" ry="12" fill="#8abbd8"/>
      <rect x="170" y="250" width="20" height="50" fill="#a0a0a0"/>
      <!-- trees -->
      <ellipse cx="80" cy="260" rx="40" ry="50" fill="#5a9a5a"/>
      <rect x="72" y="260" width="16" height="40" fill="#6b4423"/>
      <ellipse cx="720" cy="255" rx="45" ry="55" fill="#5a9a5a"/>
      <rect x="712" y="255" width="16" height="45" fill="#6b4423"/>
      <!-- benches -->
      <rect x="550" y="295" width="70" height="8" rx="2" fill="#6b4423"/>
      <rect x="560" y="303" width="6" height="20" fill="#5a3818"/>
      <rect x="604" y="303" width="6" height="20" fill="#5a3818"/>
    </svg>`,

  'talent-show': () => `
    <svg class="venue-backdrop-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice">
      <rect width="800" height="400" fill="#1a0a2e"/>
      <!-- curtains -->
      <path d="M0,0 Q100,200 0,400 L0,400 L0,0" fill="#8b1538"/>
      <path d="M800,0 Q700,200 800,400 L800,400 L800,0" fill="#8b1538"/>
      <path d="M0,0 Q200,180 0,400" fill="#a02050" opacity="0.8"/>
      <path d="M800,0 Q600,180 800,400" fill="#a02050" opacity="0.8"/>
      <!-- stage arch -->
      <ellipse cx="400" cy="420" rx="320" ry="200" fill="#2a1040" stroke="#d4a050" stroke-width="6"/>
      <!-- spotlights -->
      <polygon points="200,0 250,0 350,280 300,280" fill="rgba(255,220,100,0.12)"/>
      <polygon points="400,0 450,0 420,300 370,300" fill="rgba(255,220,100,0.18)"/>
      <polygon points="600,0 650,0 550,280 500,280" fill="rgba(255,220,100,0.12)"/>
      <!-- judges table -->
      <rect x="250" y="310" width="300" height="15" fill="#4a3060"/>
      <text x="400" y="305" text-anchor="middle" fill="#d4a050" font-family="Fredoka,sans-serif" font-size="14">★ TALENT SHOW ★</text>
      <!-- stage floor -->
      <rect y="350" width="800" height="50" fill="#3a2050"/>
    </svg>`,

  'concert-venue': () => `
    <svg class="venue-backdrop-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice">
      <rect width="800" height="400" fill="#0a0814"/>
      <!-- truss -->
      <rect x="100" y="30" width="600" height="12" fill="#333"/>
      <rect x="120" y="42" width="8" height="80" fill="#444"/>
      <rect x="672" y="42" width="8" height="80" fill="#444"/>
      <!-- stage lights -->
      ${[180, 280, 400, 520, 620].map((x, i) => `
        <circle cx="${x}" cy="55" r="12" fill="${['#ff6b9d','#6bcbff','#ffd166','#6bcbff','#ff6b9d'][i]}" opacity="0.9"/>
        <polygon points="${x},67 ${x-20},200 ${x+20},200" fill="rgba(255,255,255,0.06)"/>
      `).join('')}
      <!-- neon sign -->
      <text x="400" y="130" text-anchor="middle" fill="#ff6b9d" font-family="Fredoka,sans-serif" font-size="36" font-weight="700" opacity="0.85">LIVE</text>
      <!-- crowd silhouettes -->
      ${Array.from({length: 15}, (_, i) => {
        const x = 60 + i * 48;
        return `<ellipse cx="${x}" cy="310" rx="14" ry="18" fill="#1a1030"/>`;
      }).join('')}
      <!-- stage -->
      <rect y="340" width="800" height="60" fill="#1a1035"/>
      <rect y="335" width="800" height="6" fill="#ffd166" opacity="0.6"/>
    </svg>`,
};

function renderVenueBackdrop(venueId) {
  const fn = VENUE_BACKDROPS[venueId] || VENUE_BACKDROPS['street-corner'];
  return `<div class="venue-backdrop" aria-hidden="true">${fn()}</div>`;
}
