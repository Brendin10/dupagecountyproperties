const VENUES = [
  {
    id: 'street-corner',
    name: 'Street Corner',
    emoji: '🏙️',
    starRequired: 0,
    tipMultiplier: 1,
    crowdCap: 12,
    description: 'Your very first stage. Passersby might toss a coin if you\'re lucky.',
    bg: 'venue-street',
    bpm: 88,
  },
  {
    id: 'local-tavern',
    name: 'Local Tavern',
    emoji: '🍺',
    starRequired: 25,
    tipMultiplier: 2,
    crowdCap: 24,
    description: 'Sticky floors, warm lights, and a crowd that actually came to listen.',
    bg: 'venue-tavern',
    bpm: 96,
  },
  {
    id: 'town-square',
    name: 'Town Square',
    emoji: '🏛️',
    starRequired: 60,
    tipMultiplier: 3.5,
    crowdCap: 40,
    description: 'The whole town gathers when the music hits just right.',
    bg: 'venue-square',
    bpm: 100,
  },
  {
    id: 'talent-show',
    name: 'Local Talent Show',
    emoji: '🎤',
    starRequired: 100,
    tipMultiplier: 5,
    crowdCap: 60,
    description: 'Judges are watching. The crowd is roaring. Show them what you\'ve got.',
    bg: 'venue-talent',
    bpm: 104,
  },
  {
    id: 'concert-venue',
    name: 'Small Concert Venue',
    emoji: '🎸',
    starRequired: 160,
    tipMultiplier: 8,
    crowdCap: 90,
    description: 'Real stage lights. Real sound. You\'re not busking anymore.',
    bg: 'venue-concert',
    bpm: 112,
  },
];

const SHOP_ITEMS = {
  instruments: [
    { id: 'trash-lid', name: 'Trash Can Lid', emoji: '🥁', cost: 0, crowdBonus: 1, owned: true, starter: true },
    { id: 'tambourine', name: 'Tambourine', emoji: '🪇', cost: 35, crowdBonus: 3 },
    { id: 'ukulele', name: 'Ukulele', emoji: '🎸', cost: 90, crowdBonus: 6 },
    { id: 'electric-guitar', name: 'Electric Guitar', emoji: '🎸', cost: 220, crowdBonus: 12 },
    { id: 'drum-kit', name: 'Drum Kit', emoji: '🥁', cost: 450, crowdBonus: 20 },
  ],
  clothes: [
    { id: 'street-tee', name: 'Street Tee', emoji: '👕', cost: 20, crowdBonus: 2 },
    { id: 'sparkle-jacket', name: 'Sparkle Jacket', emoji: '✨', cost: 75, crowdBonus: 5 },
    { id: 'stage-outfit', name: 'Stage Outfit', emoji: '🕺', cost: 180, crowdBonus: 10 },
  ],
  makeup: [
    { id: 'glitter-eyes', name: 'Glitter Eyes', emoji: '💄', cost: 30, crowdBonus: 3 },
    { id: 'rock-star-face', name: 'Rock Star Face', emoji: '🌟', cost: 85, crowdBonus: 6 },
  ],
  accessories: [
    { id: 'cool-shades', name: 'Cool Shades', emoji: '🕶️', cost: 25, crowdBonus: 2 },
    { id: 'chain-necklace', name: 'Chain Necklace', emoji: '📿', cost: 60, crowdBonus: 4 },
    { id: 'top-hat', name: 'Top Hat', emoji: '🎩', cost: 120, crowdBonus: 8 },
  ],
  songs: SONG_LIST.map((s) => ({
    id: s.id,
    name: s.name,
    emoji: s.emoji,
    cost: s.cost,
    crowdBonus: s.cost > 0 ? Math.floor(s.cost / 40) + 4 : 2,
  })),
};

const BAND_SLOT_COSTS = [0, 80, 200, 400];

const RECRUIT_POOL = [
  { id: 'riff', name: 'Riff', emoji: '🎸', role: 'Guitar' },
  { id: 'boom', name: 'Boom', emoji: '🥁', role: 'Drums' },
  { id: 'melody', name: 'Melody', emoji: '🎹', role: 'Keys' },
  { id: 'vox', name: 'Vox', emoji: '🎤', role: 'Vocals' },
  { id: 'slap', name: 'Slap', emoji: '🎸', role: 'Bass' },
  { id: 'ziggy', name: 'Ziggy', emoji: '🎺', role: 'Horns' },
];
