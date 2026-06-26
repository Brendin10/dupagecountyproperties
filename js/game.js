const Game = (() => {
  const state = {
    screen: 'title',
    character: null,
    bandCash: 0,
    starMeter: 0,
    hasLid: false,
    tutorialStep: 0,
    inventories: {
      instruments: ['trash-lid'],
      clothes: [],
      makeup: [],
      accessories: [],
      songs: ['street-jam'],
    },
    bandMembers: [],
    bandSlots: 1,
    currentVenue: 'street-corner',
    performance: null,
    pendingRecruit: null,
    equippedInstrument: 'trash-lid',
    equippedSong: 'street-jam',
    equippedWear: { clothes: null, makeup: null, accessories: null },
    shopNotice: null,
    gigIntroRunning: false,
  };

  let parallaxCleanup = null;

  function getActiveInstrument() {
    const id = state.equippedInstrument
      || state.inventories.instruments[state.inventories.instruments.length - 1]
      || 'trash-lid';
    return INSTRUMENTS[id] || INSTRUMENTS['trash-lid'];
  }

  function getActiveSong() {
    const id = state.equippedSong || 'street-jam';
    return getSong(id);
  }

  function getPerformanceBpm() {
    return getActiveSong().bpm;
  }

  const INST_ANIM = {
    'trash-lid': 'anim-cymbal',
    tambourine: 'anim-shake',
    'drum-kit': 'anim-drums',
    ukulele: 'anim-strum',
    'electric-guitar': 'anim-strum',
    bongo: 'anim-drums',
    cowbell: 'anim-cymbal',
    triangle: 'anim-cymbal',
    piano: 'anim-keys',
    keyboard: 'anim-keys',
    organ: 'anim-keys',
    'synth-lead': 'anim-keys',
    accordion: 'anim-keys',
    violin: 'anim-strum',
    banjo: 'anim-strum',
    'acoustic-guitar': 'anim-strum',
    'bass-guitar': 'anim-strum',
    trumpet: 'anim-horn',
    trombone: 'anim-horn',
    saxophone: 'anim-horn',
    flute: 'anim-sing',
    clarinet: 'anim-sing',
    harmonica: 'anim-sing',
    xylophone: 'anim-cymbal',
  };

  const SUBTYPE_ANIM = {
    cymbal: 'anim-cymbal', shake: 'anim-shake', drums: 'anim-drums', bongo: 'anim-drums',
    bell: 'anim-cymbal', triangle: 'anim-cymbal', ukulele: 'anim-strum', electric: 'anim-strum',
    acoustic: 'anim-strum', banjo: 'anim-strum', bass: 'anim-strum', bow: 'anim-strum',
    piano: 'anim-keys', synth: 'anim-keys', organ: 'anim-keys', accordion: 'anim-keys',
    brass: 'anim-horn', sax: 'anim-horn', flute: 'anim-sing', clarinet: 'anim-sing',
    harmonica: 'anim-sing', mallet: 'anim-cymbal',
  };

  let activeHold = null;

  const REWIND_SECONDS = 5;
  const GIG_START_GRACE_SEC = 5;
  const RHYTHM_WARMUP_SEC = 4;
  const SNAPSHOT_INTERVAL = 0.5;
  const SNAPSHOT_RETENTION = 12;
  let rewindSnapshots = [];
  let lastSnapshotAt = -1;
  let rewindCooldown = false;

  const ROLE_ANIM = {
    Guitar: 'anim-strum',
    Drums: 'anim-drums',
    Bass: 'anim-strum',
    Keys: 'anim-keys',
    Vocals: 'anim-sing',
    Horns: 'anim-horn',
  };

  const ALL_ANIM_CLASSES = [
    'anim-cymbal', 'anim-shake', 'anim-drums', 'anim-strum',
    'anim-keys', 'anim-sing', 'anim-horn', 'anim-hit',
    'play-melodic', 'play-percussion', 'hit-flash',
  ];

  function getBandmateId(member) {
    if (member.id) return member.id;
    const found = typeof getBandmateByName === 'function' ? getBandmateByName(member.name) : null;
    return found?.id || 'riff';
  }

  function renderBandmateCharacter(member, size = 80) {
    return renderBandmate(getBandmateId(member), size);
  }

  function normalizeBandMembers() {
    state.bandMembers = state.bandMembers.map((m) => ({
      ...m,
      id: m.id || getBandmateId(m),
    }));
  }

  function slotMax() {
    return typeof MAX_BAND_SLOTS !== 'undefined' ? MAX_BAND_SLOTS : 7;
  }

  function getSlotCosts() {
    const max = slotMax();
    if (typeof BAND_SLOT_COSTS !== 'undefined' && BAND_SLOT_COSTS.length >= max) {
      return BAND_SLOT_COSTS;
    }
    const costs = [0, 80, 200, 400];
    while (costs.length < max) {
      const tier = costs.length;
      const prev = costs[costs.length - 1];
      costs.push(Math.round(prev * 1.08 + tier * 35));
    }
    return costs;
  }

  function getBandSlotCount() {
    return Math.max(1, Math.floor(Number(state.bandSlots)) || 1);
  }

  function getOpenBandSlots() {
    return Math.max(0, getBandSlotCount() - state.bandMembers.length);
  }

  function canRecruitBandmate() {
    return getOpenBandSlots() > 0;
  }

  function nextBandSlotCost() {
    const slots = getBandSlotCount();
    if (slots >= slotMax()) return null;
    const costs = getSlotCosts();
    const cost = costs[slots];
    return cost != null ? cost : null;
  }

  function persist() {
    SaveManager.save(state);
  }

  function resetProgress() {
    state.character = null;
    state.bandCash = 0;
    state.starMeter = 0;
    state.hasLid = false;
    state.tutorialStep = 0;
    state.inventories = {
      instruments: ['trash-lid'],
      clothes: [],
      makeup: [],
      accessories: [],
      songs: ['street-jam'],
    };
    state.bandMembers = [];
    state.bandSlots = 1;
    state.currentVenue = 'street-corner';
    state.performance = null;
    state.pendingRecruit = null;
    state.equippedInstrument = 'trash-lid';
    state.equippedSong = 'street-jam';
    state.equippedWear = { clothes: null, makeup: null, accessories: null };
  }

  const root = () => document.getElementById('screen-root');
  const hud = () => document.getElementById('hud');

  function updateHud() {
    document.getElementById('hud-cash').textContent = Math.floor(state.bandCash);
    document.getElementById('hud-stars').textContent = Math.floor(state.starMeter);
    const showHud = !['title', 'select'].includes(state.screen);
    hud().classList.toggle('hidden', !showHud);
  }

  function setScreen(name) {
    state.screen = name;
    updateHud();
    render();
  }

  function crowdAppeal() {
    let bonus = 0;
    for (const cat of Object.keys(state.inventories)) {
      for (const itemId of state.inventories[cat]) {
        const item = SHOP_ITEMS[cat].find((i) => i.id === itemId);
        if (item) bonus += item.crowdBonus;
      }
    }
    bonus += state.bandMembers.length * 8;
    return bonus;
  }

  function ownedItems(cat) {
    return SHOP_ITEMS[cat].filter((i) => state.inventories[cat].includes(i.id));
  }

  function buyItem(cat, itemId) {
    const item = SHOP_ITEMS[cat].find((i) => i.id === itemId);
    if (!item || state.inventories[cat]?.includes(itemId)) return false;
    if (state.bandCash < item.cost) return false;
    if (!state.inventories[cat]) state.inventories[cat] = [];
    state.bandCash -= item.cost;
    state.inventories[cat].push(itemId);
    if (cat === 'instruments') state.equippedInstrument = itemId;
    if (cat === 'songs') state.equippedSong = itemId;
    if (['clothes', 'makeup', 'accessories'].includes(cat)) {
      state.equippedWear = state.equippedWear || { clothes: null, makeup: null, accessories: null };
      state.equippedWear[cat] = itemId;
    }
    updateHud();
    persist();
    return true;
  }

  function buyBandSlot() {
    const slots = getBandSlotCount();
    const nextCost = nextBandSlotCost();
    if (nextCost === null || state.bandCash < nextCost) return false;
    state.bandCash -= nextCost;
    state.bandSlots = slots + 1;
    state.shopNotice = `Band slot purchased! ${getOpenBandSlots()} open slot${getOpenBandSlots() === 1 ? '' : 's'} available.`;
    updateHud();
    persist();
    return true;
  }

  function acceptRecruit() {
    if (!state.pendingRecruit) return false;
    if (!canRecruitBandmate()) return false;
    state.bandMembers.push(state.pendingRecruit);
    normalizeBandMembers();
    state.starMeter += 5;
    state.pendingRecruit = null;
    updateHud();
    persist();
    return true;
  }

  function venueUnlocked(venue) {
    return state.starMeter >= venue.starRequired;
  }

  function renderTitle() {
    const hasSave = SaveManager.hasSave();
    const idleChar = state.character
      ? renderCharacter(state.character, 180, { instrument: INSTRUMENTS['trash-lid'] })
      : renderCharacter('benny', 180, { instrument: INSTRUMENTS['trash-lid'] });
    return `
      <section class="screen title-screen">
        <div class="title-bg"></div>
        <div class="title-content">
          <img src="assets/brand/bandland-logo.png" alt="" class="brand-logo-hero" />
          <p class="subtitle">From trash can lids to sold-out shows.</p>
          <div class="title-idle-character" id="title-idle-char">${idleChar}</div>
          <div class="title-actions">
            ${hasSave ? '<button class="btn btn-primary btn-lg" id="btn-continue">Continue</button>' : ''}
            <button class="btn ${hasSave ? 'btn-secondary' : 'btn-primary'} btn-lg" id="btn-start">Start Your Journey</button>
          </div>
        </div>
        <div class="title-notes">🎵 🥁 🎸 ⭐</div>
      </section>
    `;
  }

  function renderSelect() {
    return `
      <section class="screen select-screen">
        <h2>Pick Your Star</h2>
        <p class="screen-desc">Two monsters. One dream. Infinite gigs.</p>
        <div class="character-grid">
          ${['benny', 'lizzy'].map((id) => {
            const c = CHARACTERS[id];
            return `
              <button class="character-card" data-character="${id}">
                <div class="character-preview">${c.render(160)}</div>
                <h3>${c.name}</h3>
                <p>${c.tagline}</p>
              </button>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderTutorial() {
    const char = CHARACTERS[state.character];
    if (state.tutorialStep === 0) {
      return `
        <section class="screen story-screen venue-street">
          <div class="story-panel row-layout">
            <div class="story-character">${char.render(140)}</div>
            <div class="story-text">
              <h2>The Corner of the Street</h2>
              <p>${char.name} arrives at their first venue, heart pounding. The crowd could be huge… if they had something to play.</p>
              <p class="muted">But wait — there's no instrument!</p>
              <button class="btn btn-primary" id="btn-tutorial-next">Look Around</button>
            </div>
          </div>
        </section>
      `;
    }

    return `
      <section class="screen story-screen venue-street">
        <div class="story-panel">
          <div class="lid-scene">
            <div class="trash-can">🗑️</div>
            <button class="lid-btn" id="btn-tap-lid" title="Tap the lid!">
              <span class="lid-icon">🔘</span>
              <span class="lid-label">Metal Lid</span>
            </button>
            <div class="story-character small">${renderCharacter(state.character, 100, { instrument: INSTRUMENTS['trash-lid'] })}</div>
          </div>
          <div class="story-text">
            <h2>Found It!</h2>
            <p>A metal trash can lid, just sitting there. ${char.name} taps it gently… <em>CRASH!</em></p>
            <p class="muted" id="lid-hint">👆 Tap the lid to hear it!</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderHub() {
    const char = CHARACTERS[state.character];
    const appeal = crowdAppeal();

    const venueCards = VENUES.map((v) => {
      const unlocked = venueUnlocked(v);
      return `
        <button class="venue-card ${unlocked ? '' : 'locked'} ${state.currentVenue === v.id ? 'active' : ''}"
                data-venue="${v.id}" ${unlocked ? '' : 'disabled'}>
          <span class="venue-emoji">${v.emoji}</span>
          <span class="venue-name">${v.name}</span>
          ${unlocked
            ? `<span class="venue-meta">×${v.tipMultiplier} tips</span>`
            : `<span class="venue-lock">🔒 ${v.starRequired} ★</span>`}
        </button>
      `;
    }).join('');

    const inventorySections = ['instruments', 'songs', 'clothes', 'makeup', 'accessories'].map((cat) => {
      const items = ownedItems(cat);
      const label = cat === 'songs' ? 'Songs' : cat.charAt(0).toUpperCase() + cat.slice(1);
      return `
        <div class="inv-section">
          <h4>${label}</h4>
          <div class="inv-items">
            ${items.length
              ? items.map((i) => {
                  const wearCats = ['clothes', 'makeup', 'accessories'];
                  const equipped = (cat === 'instruments' && state.equippedInstrument === i.id)
                    || (cat === 'songs' && state.equippedSong === i.id)
                    || (wearCats.includes(cat) && state.equippedWear?.[cat] === i.id);
                  const equipAttr = (cat === 'instruments' || cat === 'songs' || wearCats.includes(cat)) ? i.id : '';
                  const chipInner = cat === 'instruments' && INSTRUMENTS[i.id]
                    ? (typeof renderInventoryItemThumb === 'function' ? renderInventoryItemThumb(cat, i, 36) : i.emoji)
                    : `<span class="brand-card-icon">${i.emoji}</span>`;
                  return `<button type="button" class="inv-chip ${equipped ? 'equipped' : ''}" data-equip-cat="${cat}" data-equip="${equipAttr}" title="${i.name}${equipped ? ' (on)' : ' — click to preview'}">${chipInner}</button>`;
                }).join('')
              : '<span class="inv-empty">Empty</span>'}
          </div>
        </div>
      `;
    }).join('');

    const openSlots = getOpenBandSlots();
    const slotCount = getBandSlotCount();

    const bandSection = `
      <div class="inv-section">
        <h4>Band (${state.bandMembers.length}/${slotCount})</h4>
        <p class="band-open-slots">${openSlots} open slot${openSlots === 1 ? '' : 's'} · play gigs to recruit</p>
        <div class="inv-items band-roster">
          ${state.bandMembers.map((m) => `
                <div class="bandmate-chip" title="${m.role}">
                  ${renderBandmateCharacter(m, 52)}
                  <span>${m.name}</span>
                </div>`).join('')}
          ${Array.from({ length: openSlots }, (_, i) => `
                <div class="bandmate-chip empty-slot" title="Open slot — recruit during gigs">
                  <div class="empty-slot-icon">➕</div>
                  <span>Open</span>
                </div>`).join('')}
          ${!state.bandMembers.length && !openSlots
            ? '<span class="inv-empty">Solo act</span>'
            : ''}
        </div>
      </div>
    `;

    const inst = getActiveInstrument();
    const song = getActiveSong();

    return `
      <section class="screen hub-screen">
        <div class="hub-layout">
          <aside class="hub-sidebar">
            <div class="hub-character">${renderCharacter(state.character, 120, { instrument: inst, equippedWear: state.equippedWear })}</div>
            <p class="hub-name">${char.name}</p>
            <p class="hub-appeal">Crowd Appeal: <strong>+${appeal}</strong></p>
            <div class="hub-loadout">
              <h4>Gig Loadout</h4>
              <div class="loadout-row loadout-instrument">
                ${typeof renderShopInstrumentPreview === 'function' ? renderShopInstrumentPreview(inst, 32) : inst.emoji}
                <span>${inst.name}</span>
              </div>
              <div class="loadout-row"><span>${song.emoji}</span> ${song.name}</div>
            </div>
            ${inventorySections}
            ${bandSection}
          </aside>

          <div class="hub-main">
            <div class="hub-venue-preview">
              ${renderVenueBackdrop(state.currentVenue)}
              <div class="hub-venue-label">${VENUES.find((v) => v.id === state.currentVenue)?.name || 'Venue'}</div>
            </div>
            <h2>Choose Your Venue</h2>
            <div class="venue-grid">${venueCards}</div>

            <div class="hub-actions">
              <button class="btn btn-primary btn-lg" id="btn-perform">
                <span class="gig-loadout-preview">${typeof renderShopInstrumentPreview === 'function' ? renderShopInstrumentPreview(inst, 36) : inst.emoji}</span>
                <span class="gig-loadout-text">Play Gig<br><small>${inst.name} · ${song.name}</small></span>
              </button>
              <button class="btn btn-secondary" id="btn-shop">🛍️ Shop</button>
            </div>
          </div>
        </div>

        ${state.pendingRecruit ? renderRecruitModal() : ''}
      </section>
    `;
  }

  function renderRecruitModal() {
    const r = state.pendingRecruit;
    const openSlots = getOpenBandSlots();
    const full = openSlots <= 0;
    const slotCount = getBandSlotCount();
    return `
      <div class="modal-overlay">
        <div class="modal recruit-modal">
          <div class="recruit-preview">${renderBandmateCharacter(r, 130)}</div>
          <h3>🌟 Someone Wants In!</h3>
          <p><strong>${r.name}</strong> (${r.role}) wants to join your band!</p>
          ${full
            ? `<p class="warn">No open band slots! Buy a slot in the shop. (${state.bandMembers.length}/${slotCount} filled)</p>`
            : `<p>${openSlots} open slot${openSlots === 1 ? '' : 's'} — they'll boost your crowd and star power.</p>`}
          <div class="modal-actions">
            ${full ? '' : `<button class="btn btn-primary" id="btn-accept-recruit">Welcome Aboard!</button>`}
            <button class="btn btn-ghost" id="btn-decline-recruit">Not Now</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderShopBandSlots() {
    const max = slotMax();
    const slotCount = getBandSlotCount();
    const costs = getSlotCosts();
    const nextCost = nextBandSlotCost();
    const atMax = slotCount >= max;
    const members = state.bandMembers;

    return Array.from({ length: max }, (_, idx) => {
      const slotNum = idx + 1;
      const member = members[idx];

      if (member) {
        return `
          <div class="shop-band-slot brand-card filled">
            <div class="bandmate-chip" title="${member.role}">
              ${renderBandmateCharacter(member, 52)}
              <span>${member.name}</span>
            </div>
            <span class="shop-slot-label">Slot ${slotNum}</span>
          </div>`;
      }

      if (slotNum <= slotCount) {
        return `
          <div class="shop-band-slot brand-card open">
            <div class="bandmate-chip empty-slot" title="Open slot — recruit during gigs">
              <div class="empty-slot-icon">➕</div>
              <span>Open</span>
            </div>
            <span class="shop-slot-label">Slot ${slotNum}</span>
          </div>`;
      }

      if (slotNum === slotCount + 1 && !atMax && nextCost != null) {
        return `
          <div class="shop-band-slot brand-card locked-next">
            <span class="brand-card-icon brand-card-icon-lg">🔒</span>
            <div class="shop-info">
              <strong class="brand-label">Slot ${slotNum}</strong>
              <span>Unlock band member slot</span>
            </div>
            <button class="btn btn-buy" data-buy-slot="1" ${state.bandCash < nextCost ? 'disabled' : ''}>$${nextCost}</button>
          </div>`;
      }

      const unlockCost = costs[slotNum - 1];
      return `
        <div class="shop-band-slot brand-card locked">
          <span class="brand-card-icon">🔒</span>
          <div class="shop-info">
            <strong class="brand-label">Slot ${slotNum}</strong>
            <span>${unlockCost != null ? `$${unlockCost} when unlocked` : 'Locked'}</span>
          </div>
          <span class="owned-badge">LOCKED</span>
        </div>`;
    }).join('');
  }

  function renderShop() {
    const tabs = ['instruments', 'songs', 'clothes', 'makeup', 'accessories', 'band'];
    const tabButtons = tabs.map((t) => `
      <button class="shop-tab ${state.shopTab === t ? 'active' : ''}" data-tab="${t}">
        ${t === 'band' ? '👥 Band Slots' : t === 'songs' ? '🎵 Songs' : t === 'instruments' ? `🎸 Instruments (${SHOP_ITEMS.instruments.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
      </button>
    `).join('');

    let content = '';
    if (state.shopTab === 'band') {
      const openSlots = getOpenBandSlots();
      const slotCount = getBandSlotCount();
      const atMax = slotCount >= slotMax();
      content = `
        <div class="shop-list shop-band-list">
          ${state.shopNotice ? `<p class="shop-notice">${state.shopNotice}</p>` : ''}
          <p class="shop-band-summary">${state.bandMembers.length} bandmates · ${openSlots} open · ${slotCount} / ${slotMax()} slots${atMax ? ' · MAX' : ''}</p>
          <div class="shop-band-grid">${renderShopBandSlots()}</div>
        </div>
      `;
    } else {
      const items = SHOP_ITEMS[state.shopTab];
      content = `
        <div class="shop-list">
          ${items.map((item) => {
            const owned = state.inventories[state.shopTab].includes(item.id);
            const instObj = state.shopTab === 'instruments' ? INSTRUMENTS[item.id] : null;
            const preview = typeof renderShopItemPreview === 'function'
              ? renderShopItemPreview(state.shopTab, item, 72)
              : `<span class="brand-card-icon brand-card-icon-lg">${item.emoji}</span>`;
            const previewInst = instObj ? item.id : '';
            return `
              <div class="shop-item brand-card ${owned ? 'owned' : ''}">
                <button type="button" class="shop-preview-btn" data-preview-inst="${previewInst}" data-preview-cat="${state.shopTab}" title="${instObj ? 'Tap to preview sound' : item.name}">${preview}</button>
                <div class="shop-info">
                  <strong class="brand-label">${item.name}</strong>
                  <span>+${item.crowdBonus} crowd appeal</span>
                </div>
                ${owned
                  ? '<span class="owned-badge">OWNED</span>'
                  : `<button class="btn btn-buy" data-buy-cat="${state.shopTab}" data-buy-id="${item.id}" ${state.bandCash < item.cost ? 'disabled' : ''}>$${item.cost}</button>`}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    return `
      <section class="screen shop-screen">
        <div class="shop-header">
          <button class="btn btn-ghost" id="btn-back-hub">← Back</button>
          <img src="assets/brand/bandland-logo.png" alt="Bandland" class="brand-logo" />
          <h2 class="brand-label">Shop</h2>
        </div>
        <div class="shop-tabs">${tabButtons}</div>
        ${content}
      </section>
    `;
  }

  function renderStageLineup(inst) {
    const left = state.bandMembers.filter((_, i) => i % 2 === 0);
    const right = state.bandMembers.filter((_, i) => i % 2 === 1);
    const leftHtml = left.map((m, i) => `
      <div class="lineup-slot side" id="bandmate-${getBandmateId(m)}" style="--slot:${i}">
        ${renderBandmateCharacter(m, 88)}
      </div>`).join('');
    const rightHtml = right.map((m, i) => `
      <div class="lineup-slot side" id="bandmate-${getBandmateId(m)}" style="--slot:${i}">
        ${renderBandmateCharacter(m, 88)}
      </div>`).join('');
    return `
      <div class="stage-lineup">
        <div class="lineup-side left">${leftHtml}</div>
        <div class="lineup-slot lead" id="performer">${renderCharacter(state.character, 150, { instrument: inst, equippedWear: state.equippedWear })}</div>
        <div class="lineup-side right">${rightHtml}</div>
      </div>`;
  }

  function renderPerformance() {
    const venue = VENUES.find((v) => v.id === state.currentVenue);
    const song = getActiveSong();
    const p = state.performance;
    const inst = getActiveInstrument();
    const isMelodic = inst.type === 'melodic';
    const cheerPct = Math.min(100, (p.cheer / p.cheerGoal) * 100);
    const crowdPct = Math.min(100, (p.crowd / p.crowdCap) * 100);

    const crowdHtml = Array.from({ length: Math.min(p.crowd, 20) }, (_, i) =>
      `<div class="crowd-person" style="--delay:${i * 0.05}s">${renderCrowdMember(i)}</div>`
    ).join('');

    return `
      <section class="screen perform-screen ${venue.bg} stage-mounting">
        ${renderVenueBackdrop(venue.id)}
        <div class="perform-content">
        <div class="perform-header">
          <h2>${venue.emoji} ${venue.name}</h2>
          <div class="perform-timer" id="perf-timer">⏱ ${p.timeLeft}s</div>
        </div>

        <div class="perform-stage">
          <div class="crowd-row" id="crowd-row">${crowdHtml}</div>
          ${typeof renderStageLighting === 'function' ? renderStageLighting(venue.tier ?? 0) : '<div class="stage-lights"></div>'}
          <div class="performer-wrap ${p.onFire ? 'band-on-fire' : ''}">
            ${renderStageLineup(inst)}
            <div class="performer-stack">
              ${RhythmLane.renderHtml(song.name)}
              <div class="play-controls">
                <button type="button" class="rewind-btn" id="btn-rewind" title="Rewind 5 seconds" disabled>
                  <span aria-hidden="true">⏪</span>
                  <span>5s</span>
                </button>
                <button class="play-btn" id="btn-play-note">
                  <span class="instrument-emoji">${inst.emoji}</span>
                  <span>PLAY ${inst.name.toUpperCase()}!</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="perform-meters">
          <div class="meter">
            <label>Crowd <span id="crowd-label">${Math.floor(p.crowd)}/${p.crowdCap}</span></label>
            <div class="meter-bar"><div class="meter-fill crowd-fill" id="crowd-fill" style="width:${crowdPct}%"></div></div>
          </div>
          <div class="meter">
            <label>Cheer <span id="cheer-label">${Math.floor(p.cheer)}/${p.cheerGoal}</span></label>
            <div class="meter-bar"><div class="meter-fill cheer-fill" id="cheer-fill" style="width:${cheerPct}%"></div></div>
          </div>
        </div>

        <div class="perform-floaters" id="floaters"></div>
        <div class="perform-footer">
          <span class="gig-cash" id="gig-cash">+${Math.floor(p.sessionCash)} BandCash this gig</span>
        </div>
        </div>
      </section>
    `;
  }

  function renderBooed() {
    return `
      <section class="screen booed-screen">
        <div class="booed-overlay">
          <h1 class="booed-title">YOU GOT BOOED OFF STAGE</h1>
          <p class="booed-sub">Five misses in a row — the crowd wasn't feeling it.</p>
          <p class="booed-tip">Keep practicing those gems and come back stronger!</p>
          <button class="btn btn-primary btn-lg" id="btn-back-hub">Back to Map</button>
        </div>
      </section>
    `;
  }

  function renderResults() {
    const p = state.performance;
    return `
      <section class="screen results-screen">
        <h2>Gig Complete! 🎉</h2>
        <div class="results-grid">
          <div class="result-card"><span>💵</span><strong>+${Math.floor(p.sessionCash)}</strong><small>BandCash</small></div>
          <div class="result-card"><span>⭐</span><strong>+${Math.floor(p.sessionStars)}</strong><small>Star Meter</small></div>
          <div class="result-card"><span>👥</span><strong>${Math.floor(p.peakCrowd)}</strong><small>Peak Crowd</small></div>
        </div>
        ${p.newUnlock
          ? `<p class="unlock-msg">🔓 New venue unlocked: <strong>${p.newUnlock}</strong>!</p>`
          : ''}
        <button class="btn btn-primary btn-lg" id="btn-back-hub">Back to Map</button>
      </section>
    `;
  }

  function renderTune() {
    const ids = Object.keys(INSTRUMENTS);
    const id = state.tuneInstId || ids[0];
    const inst = INSTRUMENTS[id];
    const charId = state.character || 'benny';
    const options = ids.map((i) =>
      `<option value="${i}" ${i === id ? 'selected' : ''}>${INSTRUMENTS[i].name}</option>`
    ).join('');
    return `
      <section class="screen tune-screen">
        <h2 class="brand-label">Instrument Grip Preview</h2>
        <p class="tune-hint-text">Use <code>?tune=1</code> or <code>tools/tune-instrument-grip.html</code> to fine-tune hand positions for all 24 instruments.</p>
        <select id="tune-inst-select" class="tune-select">${options}</select>
        <div class="tune-preview-wrap">${renderCharacter(charId, 200, { instrument: inst })}</div>
        <button class="btn btn-primary" id="btn-back-title">Back to Title</button>
      </section>`;
  }

  function render() {
    state.shopTab = state.shopTab || 'instruments';
    let html = '';
    switch (state.screen) {
      case 'title': html = renderTitle(); break;
      case 'select': html = renderSelect(); break;
      case 'tutorial': html = renderTutorial(); break;
      case 'hub': html = renderHub(); break;
      case 'shop': html = renderShop(); break;
      case 'perform': html = renderPerformance(); break;
      case 'results': html = renderResults(); break;
      case 'booed': html = renderBooed(); break;
      case 'tune': html = renderTune(); break;
      default: html = renderTitle();
    }
    root().innerHTML = html;
    bindEvents();
    if (parallaxCleanup) parallaxCleanup();
    parallaxCleanup = null;
    if (['hub', 'perform'].includes(state.screen)) {
      const parallaxRoot = state.screen === 'hub'
        ? document.querySelector('.hub-venue-preview')
        : document.querySelector('.perform-screen');
      if (parallaxRoot) parallaxCleanup = initVenueParallax(parallaxRoot);
    }
    if (state.screen === 'title') {
      startTitleIdleAnimation();
    }
    syncPerformerInstrumentPose();
  }

  function syncPerformerInstrumentPose() {
    if (!['hub', 'perform', 'tune'].includes(state.screen)) return;
    let performer = document.getElementById('performer');
    if (!performer && state.screen === 'hub') {
      performer = document.querySelector('.hub-character .character-layered');
    }
    if (!performer && state.screen === 'tune') {
      performer = document.querySelector('.tune-preview-wrap .character-layered');
    }
    const inst = getActiveInstrument();
    if (!performer || !inst || typeof CharacterRig === 'undefined') return;
    requestAnimationFrame(() => {
      CharacterRig.syncInstrumentPose(performer, inst);
    });
  }

  function triggerPlayPress(inst) {
    const performer = document.getElementById('performer');
    if (!performer || !inst || typeof CharacterRig === 'undefined') return;
    CharacterRig.playInstrumentPress(performer, inst);
  }

  function triggerPlayRelease(inst) {
    const performer = document.getElementById('performer');
    if (!performer || typeof CharacterRig === 'undefined') return;
    CharacterRig.playInstrumentRelease(performer, inst);
  }

  let titleIdleTimer = null;

  function startTitleIdleAnimation() {
    if (titleIdleTimer) clearInterval(titleIdleTimer);
    const el = document.getElementById('title-idle-char');
    if (!el) return;
    titleIdleTimer = setInterval(() => {
      const charEl = el.querySelector('.character-layered');
      if (!charEl) return;
      charEl.classList.remove('anim-cymbal');
      void charEl.offsetWidth;
      charEl.classList.add('anim-cymbal');
    }, 2400);
  }

  function bindEvents() {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    $('#btn-start')?.addEventListener('click', () => {
      SaveManager.clear();
      resetProgress();
      setScreen('select');
    });

    $('#btn-continue')?.addEventListener('click', () => {
      const data = SaveManager.load();
      if (SaveManager.apply(state, data)) {
        normalizeBandMembers();
        state.tutorialStep = state.hasLid ? 1 : 0;
        setScreen(state.hasLid ? 'hub' : 'tutorial');
      }
    });

    $$('.character-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.character = btn.dataset.character;
        state.tutorialStep = 0;
        persist();
        setScreen('tutorial');
      });
    });

    $('#btn-tutorial-next')?.addEventListener('click', () => {
      state.tutorialStep = 1;
      render();
    });

    $('#btn-tap-lid')?.addEventListener('click', () => {
      AudioEngine.playCrash();
      const charEl = document.querySelector('.lid-scene .character-layered');
      if (charEl && typeof CharacterRig !== 'undefined') {
        CharacterRig.applyPose(charEl, 'brass', 'hit');
      }
      const hint = $('#lid-hint');
      if (hint) hint.textContent = 'Perfect! That crash/cymbal sound is GOLD.';
      setTimeout(() => {
        state.hasLid = true;
        persist();
        setScreen('hub');
      }, 1200);
    });

    $$('.venue-card:not(.locked)').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.currentVenue = btn.dataset.venue;
        persist();
        render();
      });
    });

    $('#btn-perform')?.addEventListener('click', startPerformance);
    $('#btn-shop')?.addEventListener('click', () => setScreen('shop'));
    $('#btn-back-hub')?.addEventListener('click', () => {
      persist();
      setScreen('hub');
    });

    $$('.shop-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        state.shopTab = tab.dataset.tab;
        state.shopNotice = null;
        render();
      });
    });

    $$('[data-buy-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (buyItem(btn.dataset.buyCat, btn.dataset.buyId)) render();
      });
    });

    $('[data-buy-slot]')?.addEventListener('click', () => {
      if (buyBandSlot()) {
        render();
      } else {
        state.shopNotice = 'Could not buy slot — need more BandCash or you are at max slots.';
        render();
      }
    });

    $('#btn-accept-recruit')?.addEventListener('click', () => {
      acceptRecruit();
      render();
    });

    $('#btn-decline-recruit')?.addEventListener('click', () => {
      state.pendingRecruit = null;
      persist();
      render();
    });

    $$('[data-equip-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.equip;
        const cat = btn.dataset.equipCat;
        if (!id) return;
        if (cat === 'instruments' && state.inventories.instruments.includes(id)) {
          state.equippedInstrument = id;
          AudioEngine.playInstrument?.(INSTRUMENTS[id]);
          persist();
          render();
          return;
        }
        if (cat === 'songs' && state.inventories.songs?.includes(id)) {
          state.equippedSong = id;
          persist();
          render();
          return;
        }
        if (['clothes', 'makeup', 'accessories'].includes(cat) && state.inventories[cat]?.includes(id)) {
          state.equippedWear = state.equippedWear || { clothes: null, makeup: null, accessories: null };
          state.equippedWear[cat] = state.equippedWear[cat] === id ? null : id;
          persist();
          render();
        }
      });
    });

    $$('.shop-preview-btn[data-preview-inst]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.previewInst;
        if (!id || !INSTRUMENTS[id]) return;
        AudioEngine.resume();
        AudioEngine.playInstrument(INSTRUMENTS[id]);
      });
    });

    const playBtn = $('#btn-play-note');
    playBtn?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      playBtn.setPointerCapture(e.pointerId);
      triggerPlayPress(getActiveInstrument());
      onNotePress();
    });
    playBtn?.addEventListener('pointerup', (e) => {
      playBtn.releasePointerCapture?.(e.pointerId);
      onNoteRelease();
      triggerPlayRelease(getActiveInstrument());
    });
    playBtn?.addEventListener('pointercancel', () => {
      onNoteRelease();
      triggerPlayRelease(getActiveInstrument());
    });

    $('#btn-rewind')?.addEventListener('click', rewindPerformance);

    $('#tune-inst-select')?.addEventListener('change', (e) => {
      state.tuneInstId = e.target.value;
      render();
    });
    $('#btn-back-title')?.addEventListener('click', () => setScreen('title'));
  }

  function updateFireState() {
    const p = state.performance;
    if (!p) return;
    const on = !!p.onFire;
    document.getElementById('performer')?.classList.toggle('on-fire', on);
    document.querySelectorAll('.lineup-slot.side').forEach((el) => el.classList.toggle('on-fire', on));
    document.querySelector('.performer-wrap')?.classList.toggle('band-on-fire', on);
  }

  function endBooedOffStage() {
    const p = state.performance;
    if (!p || p.booed) return;
    p.booed = true;
    p.onFire = false;
    stopPerformanceLoop();
    AudioEngine.setCrowdBooing?.(true);
    AudioEngine.playBoo?.();
    setTimeout(() => AudioEngine.playBoo?.(), 200);
    setTimeout(() => AudioEngine.playBoo?.(), 450);
    state.bandCash = Math.max(0, state.bandCash - Math.floor(p.sessionCash * 0.3));
    p.sessionCash = Math.floor(p.sessionCash * 0.4);
    persist();
    setScreen('booed');
  }

  function beginRhythmGameplay(bpm) {
    const p = state.performance;
    if (!p || p.rhythmActive) return;

    p.rhythmActive = true;
    p.rhythmStartAt = performance.now();
    p.leadInBeat = (RHYTHM_WARMUP_SEC * bpm) / 60;

    BandAudio.start(bpm);
    Metronome.start(bpm, (beatIdx) => {
      BandAudio.onBeat(beatIdx);
    }, { silent: true });
    setRhythmHint('Tap quick gems · hold long gems through the zone!');
  }

  function startPerformanceLoop() {
    const p = state.performance;
    if (!p) return;

    const song = getActiveSong();
    const bpm = p.bpm;
    const venue = VENUES.find((v) => v.id === state.currentVenue);

    AudioEngine.initMix();
    AudioEngine.startCrowdAmbience?.(venue?.tier ?? 0);
    BandAudio.setBand(state.bandMembers, song);
    BandAudio.setOnMemberPlay((member) => triggerBandmateAnimation(member));

    p.rhythmActive = false;
    p.rhythmStartAt = performance.now() + GIG_START_GRACE_SEC * 1000;

    const uiLoop = () => {
      if (!state.performance || state.screen !== 'perform') return;
      updatePerformanceUI();
      state.perfUiRaf = requestAnimationFrame(uiLoop);
    };
    state.perfUiRaf = requestAnimationFrame(uiLoop);

    if (state.rhythmGraceTimeout) clearTimeout(state.rhythmGraceTimeout);
    state.rhythmGraceTimeout = setTimeout(() => {
      state.rhythmGraceTimeout = null;
      if (!state.performance || state.screen !== 'perform') return;
      beginRhythmGameplay(bpm);
    }, GIG_START_GRACE_SEC * 1000);
  }

  function stopPerformanceLoop() {
    if (state.rhythmGraceTimeout) {
      clearTimeout(state.rhythmGraceTimeout);
      state.rhythmGraceTimeout = null;
    }
    const performer = document.getElementById('performer');
    if (performer && typeof CharacterRig !== 'undefined') {
      CharacterRig.playInstrumentRelease(performer, getActiveInstrument());
    }
    Metronome.stop();
    BandAudio.stop();
    AudioEngine.stopSustain?.();
    AudioEngine.stopCrowdAmbience?.();
    AudioEngine.setCrowdBooing?.(false);
    activeHold = null;
    rewindSnapshots = [];
    lastSnapshotAt = -1;
    rewindCooldown = false;
    if (state.perfUiRaf) cancelAnimationFrame(state.perfUiRaf);
    if (state.perfInterval) clearInterval(state.perfInterval);
    state.perfInterval = null;
    state.perfUiRaf = null;
  }

  function captureRewindSnapshot(elapsed) {
    const p = state.performance;
    if (!p) return;

    rewindSnapshots.push({
      elapsed,
      timeLeft: p.timeLeft,
      crowd: p.crowd,
      cheer: p.cheer,
      sessionCash: p.sessionCash,
      sessionStars: p.sessionStars,
      peakCrowd: p.peakCrowd,
      combo: p.combo,
      missStreak: p.missStreak,
      onFire: p.onFire,
      booed: p.booed,
      recruitRolls: p.recruitRolls,
      hitBeats: [...p.hitBeats],
      missedBeats: [...(p.missedBeats || [])],
      bandCash: state.bandCash,
      starMeter: state.starMeter,
      pendingRecruit: state.pendingRecruit,
    });

    const cutoff = elapsed - SNAPSHOT_RETENTION;
    while (rewindSnapshots.length && rewindSnapshots[0].elapsed < cutoff) {
      rewindSnapshots.shift();
    }
    lastSnapshotAt = elapsed;
  }

  function findRewindSnapshot(targetElapsed) {
    if (!rewindSnapshots.length) return null;
    let best = rewindSnapshots[0];
    for (const snap of rewindSnapshots) {
      if (snap.elapsed <= targetElapsed) best = snap;
      else break;
    }
    return best;
  }

  function updateRewindButtonState() {
    const btn = document.getElementById('btn-rewind');
    if (!btn) return;
    const p = state.performance;
    const canRewind = !!p
      && state.screen === 'perform'
      && !p.booed
      && !rewindCooldown
      && rewindSnapshots.length > 0
      && Metronome.running;
    btn.disabled = !canRewind;
  }

  function rewindPerformance() {
    const p = state.performance;
    if (!p || state.screen !== 'perform' || p.booed || rewindCooldown || !Metronome.running) return;

    const currentElapsed = Metronome.getElapsed();
    const targetElapsed = Math.max(0, currentElapsed - REWIND_SECONDS);
    const snapshot = findRewindSnapshot(targetElapsed);
    if (!snapshot) return;

    rewindCooldown = true;
    const btn = document.getElementById('btn-rewind');
    if (btn) btn.disabled = true;

    activeHold = null;
    AudioEngine.stopSustain?.();
    const zone = document.getElementById('hit-zone');
    if (zone) zone.classList.remove('holding');

    p.timeLeft = snapshot.timeLeft;
    p.crowd = snapshot.crowd;
    p.cheer = snapshot.cheer;
    p.sessionCash = snapshot.sessionCash;
    p.sessionStars = snapshot.sessionStars;
    p.peakCrowd = snapshot.peakCrowd;
    p.combo = snapshot.combo;
    p.missStreak = snapshot.missStreak;
    p.onFire = snapshot.onFire;
    p.booed = snapshot.booed;
    p.recruitRolls = snapshot.recruitRolls;
    p.hitBeats = new Set(snapshot.hitBeats);
    p.missedBeats = new Set(snapshot.missedBeats || []);
    state.bandCash = snapshot.bandCash;
    state.starMeter = snapshot.starMeter;
    state.pendingRecruit = snapshot.pendingRecruit;

    const beatDur = 60 / p.bpm;
    Metronome.seek(snapshot.elapsed);
    BandAudio.syncToBeat(Math.floor(snapshot.elapsed / beatDur));

    const floaters = document.getElementById('floaters');
    if (floaters) floaters.innerHTML = '';

    AudioEngine.setCrowdBooing?.(p.missStreak >= 3);
    updateFireState();
    updateHud();
    updatePerformanceUI();
    persist();

    setTimeout(() => {
      rewindCooldown = false;
      updateRewindButtonState();
    }, 1000);
  }

  function finalizeActiveHoldIfExpired() {
    const p = state.performance;
    if (!p || !activeHold) return;

    const elapsed = Metronome.getElapsed();
    const beatDur = 60 / p.bpm;
    const currentBeat = elapsed / beatDur;
    const { note, inst } = activeHold;
    const endBeat = note.beat + (note.dur || 1);

    if (currentBeat < endBeat) return;

    const { rating } = rateHoldRelease(note, elapsed, p.bpm);
    activeHold = null;
    AudioEngine.stopSustain?.();
    const zone = document.getElementById('hit-zone');
    if (zone) zone.classList.remove('holding');
    applyHitScore(rating, note, inst);
  }

  function checkMissedNotes() {
    const p = state.performance;
    if (!p || p.booed || !isRhythmScoringEnabled()) return;

    const inst = getActiveInstrument();
    const song = getActiveSong();
    const partKey = getPlayerPartKey(inst);
    const isMelodic = inst.type === 'melodic';
    const elapsed = Metronome.getElapsed();
    const beatDur = 60 / p.bpm;
    const currentBeat = elapsed / beatDur;
    const late = isMelodic ? 0.24 : 0.2;

    const leadInBeat = p.leadInBeat ?? 0;

    const part = song.parts[partKey] || [];
    if (!p.missedBeats) p.missedBeats = new Set();

    let earliestMiss = null;
    for (const ev of part) {
      const key = noteKey(ev);
      if (p.hitBeats.has(key) || p.missedBeats.has(key)) continue;

      const dur = ev.dur || 1;
      const isHold = dur > 1.05;
      const holdLate = isMelodic ? 0.5 : 0.45;
      const missAfter = isHold ? ev.beat + dur + holdLate * 0.25 : ev.beat + late;

      if (ev.beat < leadInBeat) {
        if (currentBeat > missAfter) p.missedBeats.add(key);
        continue;
      }

      const activeHoldKey = activeHold ? noteKey(activeHold.note) : null;
      if (activeHoldKey === key) continue;

      if (currentBeat <= missAfter) continue;

      if (!earliestMiss || ev.beat < earliestMiss.beat) {
        earliestMiss = { ...ev, key, isHold, dur };
      }
    }

    if (!earliestMiss) return;

    p.missedBeats.add(earliestMiss.key);
    applyHitScore('miss', earliestMiss, inst);
  }

  function updatePerformanceUI() {
    const p = state.performance;
    if (!p || state._updatingPerfUi) return;
    state._updatingPerfUi = true;

    const inst = getActiveInstrument();
    const song = getActiveSong();
    const partKey = getPlayerPartKey(inst);
    const isMelodic = inst.type === 'melodic';
    const elapsed = Metronome.getElapsed();

    const timer = document.getElementById('perf-timer');
    if (timer) timer.textContent = `⏱ ${p.timeLeft}s`;

    if (!p.rhythmActive) {
      const left = Math.max(0, Math.ceil((p.rhythmStartAt - performance.now()) / 1000));
      setRhythmHint(left > 0 ? `Get ready… ${left}` : 'Go!', 'good');
      const hitZone = document.getElementById('hit-zone');
      if (hitZone) hitZone.classList.remove('ready', 'holding');
      state._updatingPerfUi = false;
      return;
    }

    finalizeActiveHoldIfExpired();

    if (elapsed < RHYTHM_WARMUP_SEC) {
      const left = Math.max(1, Math.ceil(RHYTHM_WARMUP_SEC - elapsed));
      setRhythmHint(`Get ready… ${left}`, 'good');
    }

    checkMissedNotes();
    if (!state.performance || state.screen !== 'perform') {
      state._updatingPerfUi = false;
      return;
    }

    if (elapsed - lastSnapshotAt >= SNAPSHOT_INTERVAL) {
      captureRewindSnapshot(elapsed);
    }
    updateRewindButtonState();

    RhythmLane.update(song, partKey, elapsed, p.bpm, isMelodic, p.hitBeats, p.missedBeats, activeHold ? noteKey(activeHold.note) : null, p.leadInBeat ?? 0, activeHold?.note ?? null);

    const crowdPct = Math.min(100, (p.crowd / p.crowdCap) * 100);
    const cheerPct = Math.min(100, (p.cheer / p.cheerGoal) * 100);
    const crowdFill = document.getElementById('crowd-fill');
    const cheerFill = document.getElementById('cheer-fill');
    if (crowdFill) crowdFill.style.width = `${crowdPct}%`;
    if (cheerFill) cheerFill.style.width = `${cheerPct}%`;
    const crowdLabel = document.getElementById('crowd-label');
    const cheerLabel = document.getElementById('cheer-label');
    if (crowdLabel) crowdLabel.textContent = `${Math.floor(p.crowd)}/${p.crowdCap}`;
    if (cheerLabel) cheerLabel.textContent = `${Math.floor(p.cheer)}/${p.cheerGoal}`;
    const cashEl = document.getElementById('gig-cash');
    if (cashEl) cashEl.textContent = `+${Math.floor(p.sessionCash)} BandCash this gig`;
    const comboEl = document.getElementById('combo-display');
    if (comboEl) {
      if (p.onFire) comboEl.textContent = `🔥 ON FIRE ×${p.combo}`;
      else if (p.missStreak >= 3) comboEl.textContent = `BOOED ×${p.missStreak}`;
      else comboEl.textContent = p.combo > 1 ? `COMBO ×${p.combo}` : '';
    }
    updateFireState();
    state._updatingPerfUi = false;
  }

  function triggerBandmateAnimation(member) {
    const el = document.getElementById(`bandmate-${getBandmateId(member)}`);
    if (!el) return;
    const anim = ROLE_ANIM[member.role] || 'anim-hit';
    el.classList.remove(...ALL_ANIM_CLASSES);
    void el.offsetWidth;
    el.classList.add(anim);
    if (typeof CharacterRig !== 'undefined') {
      CharacterRig.applyPoseFromRole(el, member.role, 'hit');
    }
  }

  function triggerPlayAnimation(inst, rating) {
    const performer = document.getElementById('performer');
    if (!performer) return;
    const anim = INST_ANIM[inst.id] || SUBTYPE_ANIM[inst.subtype] || 'anim-hit';
    performer.classList.remove(...ALL_ANIM_CLASSES);
    void performer.offsetWidth;
    if (rating !== 'miss') {
      performer.classList.add(anim);
      performer.classList.add('hit-flash');
      if (typeof CharacterRig !== 'undefined') {
        CharacterRig.playInstrumentHit(performer, inst);
        if (activeHold) CharacterRig.playInstrumentSustain(performer, inst);
      }
    }
    const held = performer.querySelector('.held-play');
    if (held) {
      held.classList.remove('inst-play-melodic', 'inst-play-percussion', 'inst-play-drums', 'inst-play-cymbal', 'inst-play-shake');
      void held.offsetWidth;
      if (rating !== 'miss') {
        const instAnim = {
          'drum-kit': 'inst-play-drums',
          'trash-lid': 'inst-play-cymbal',
          tambourine: 'inst-play-shake',
        }[inst.id] || (inst.type === 'melodic' ? 'inst-play-melodic' : 'inst-play-percussion');
        held.classList.add(instAnim);
        if (inst.id === 'drum-kit' && typeof InstrumentArt !== 'undefined' && !InstrumentArt.hasArt(inst)) {
          const mount = performer.querySelector('.held-mount');
          const hitType = rating === 'perfect' ? 'cymbal' : 'snare';
          InstrumentArt.triggerDrumHit(mount || held, hitType);
        }
      }
    }
  }

  function setRhythmHint(text, rating) {
    const el = document.getElementById('rhythm-hint');
    if (!el) return;
    if (!rating || !text.includes(rating)) {
      el.textContent = text;
      return;
    }
    el.innerHTML = text.replace(rating, `<span class="rating-${rating}">${rating.toUpperCase()}</span>`);
  }

  function setCurtainState(phase, message = '') {
    const curtain = document.getElementById('stage-curtain');
    const status = document.getElementById('curtain-status');
    if (!curtain) return;
    curtain.classList.remove('curtain-idle', 'curtain-closing', 'curtain-loading', 'curtain-opening', 'curtain-done');
    curtain.classList.add(`curtain-${phase}`);
    curtain.setAttribute('aria-hidden', phase === 'idle' || phase === 'done' ? 'true' : 'false');
    if (status) status.textContent = message;
  }

  function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function runGigIntroSequence() {
    const btn = document.getElementById('btn-perform');
    if (btn) btn.disabled = true;

    setCurtainState('closing');
    AudioEngine.resume();

    const inst = getActiveInstrument();
    const preload = Promise.all([
      AudioEngine.loadCheerSample?.().catch(() => null),
      AudioEngine.loadBooSample?.().catch(() => null),
      typeof AudioSamples !== 'undefined' ? AudioSamples.loadInstrumentSamples(inst.subtype) : null,
    ]);

    await waitMs(600);
    setCurtainState('loading', 'Tuning up…');
    await preload;

    const venue = VENUES.find((v) => v.id === state.currentVenue);
    const appeal = crowdAppeal();
    const crowdCap = venue.crowdCap + Math.floor(appeal * 0.5);
    const bpm = getPerformanceBpm();

    state.performance = {
      timeLeft: 60,
      crowd: Math.min(3 + Math.floor(appeal * 0.2), crowdCap),
      crowdCap,
      cheer: 0,
      cheerGoal: 50 + venue.starRequired * 0.3,
      sessionCash: 0,
      sessionStars: 0,
      peakCrowd: 0,
      appeal,
      tipMultiplier: venue.tipMultiplier,
      bpm,
      combo: 0,
      missStreak: 0,
      onFire: false,
      booed: false,
      venueTier: venue.tier ?? 0,
      newUnlock: null,
      recruitRolls: 0,
      hitBeats: new Set(),
      missedBeats: new Set(),
    };

    activeHold = null;
    rewindSnapshots = [];
    lastSnapshotAt = -1;
    rewindCooldown = false;
    stopPerformanceLoop();
    state.perfInterval = setInterval(tickPerformance, 1000);
    setScreen('perform');

    await waitMs(80);
    setCurtainState('opening');
    const performContent = document.querySelector('.perform-content');
    if (performContent) {
      performContent.classList.add('stage-reveal');
      document.querySelector('.perform-screen')?.classList.remove('stage-mounting');
    }

    await waitMs(800);
    setCurtainState('done');
    startPerformanceLoop();

    if (btn) btn.disabled = false;
    await waitMs(300);
    setCurtainState('idle');
  }

  function startPerformance() {
    if (state.gigIntroRunning) return;
    state.gigIntroRunning = true;
    runGigIntroSequence().finally(() => {
      state.gigIntroRunning = false;
    });
  }

  function isRhythmScoringEnabled() {
    const p = state.performance;
    if (!p || !p.rhythmActive || !Metronome.running) return false;
    return Metronome.getElapsed() >= RHYTHM_WARMUP_SEC;
  }

  function applyHitScore(rating, note, inst) {
    const p = state.performance;
    if (!p) return;
    if (rating === 'miss' && !isRhythmScoringEnabled()) return;

    triggerPlayAnimation(inst, rating);
    RhythmLane.flashHit(rating);

    if (rating === 'miss') {
      AudioEngine.playMiss();
      AudioEngine.stopSustain?.();
      p.combo = 0;
      p.onFire = false;
      p.missStreak = (p.missStreak || 0) + 1;
      updateFireState();

      if (p.missStreak >= 5) {
        endBooedOffStage();
        return;
      }
      if (p.missStreak >= 3) {
        AudioEngine.setCrowdBooing?.(true);
        spawnFloater('BOO!', 'miss');
      }

      const isMelodic = inst.type === 'melodic';
      const starLoss = isMelodic ? 0.65 : 0.5;
      p.sessionStars = Math.max(0, p.sessionStars - starLoss);
      state.starMeter = Math.max(0, state.starMeter - starLoss);
      setRhythmHint(isMelodic ? 'miss — hit the gem in the zone!' : 'miss — hit the beat gem!', 'miss');
      spawnFloater(`-${starLoss.toFixed(1)} ★`, 'miss');
      updateHud();
      return;
    }

    p.missStreak = 0;
    AudioEngine.setCrowdBooing?.(false);

    const isMelodic = inst.type === 'melodic';
    AudioEngine.playHitBurst?.(rating);
    if (note) {
      AudioEngine.playPartEvent(note, inst, rating === 'perfect' ? 0.48 : 0.38);
      RhythmLane.explodeGem(note, rating, isMelodic);
    } else {
      AudioEngine.playInstrument(inst);
      RhythmLane.explodeGem({ beat: -1 }, rating, isMelodic);
    }
    p.combo += 1;
    if (p.combo >= 10) p.onFire = true;
    updateFireState();

    const mult = rating === 'perfect' ? 1.5 : 1.0;
    const appeal = crowdAppeal();
    const crowdGain = (rating === 'perfect' ? 0.7 : 0.35) * mult + appeal * 0.03;
    p.crowd = Math.min(p.crowdCap, p.crowd + crowdGain);
    p.cheer = Math.min(p.cheerGoal * 1.5, p.cheer + (rating === 'perfect' ? 4 : 2));

    if (p.cheer > p.cheerGoal * 0.5 && Math.random() < 0.12) AudioEngine.playCheer();
    if (p.combo >= 5 && p.combo % 5 === 0) {
      AudioEngine.playCheerLoud();
      AudioEngine.boostCrowdCheer?.();
    }

    const tip = (1 + p.crowd * 0.12) * p.tipMultiplier * mult * (0.85 + Math.random() * 0.3);
    p.sessionCash += tip;
    state.bandCash += tip;

    const starGain = (0.12 + p.crowd * 0.02) * mult;
    p.sessionStars += starGain;
    state.starMeter += starGain;

    if (tip >= 2) {
      AudioEngine.playCoin();
      spawnFloater(`+$${Math.floor(tip)}`, 'cash');
    }
    spawnFloater(rating.toUpperCase(), rating);

    p.peakCrowd = Math.max(p.peakCrowd, p.crowd);
    setRhythmHint(`${rating}!`, rating);

    if (state.starMeter >= 20 && canRecruitBandmate() && !state.pendingRecruit && p.recruitRolls < 2 && Math.random() < 0.08) {
      const recruit = RECRUIT_POOL[Math.floor(Math.random() * RECRUIT_POOL.length)];
      const recruitId = recruit.id || getBandmateId(recruit);
      if (!state.bandMembers.find((m) => getBandmateId(m) === recruitId)) {
        state.pendingRecruit = recruit;
        p.recruitRolls += 1;
      }
    }

    updateHud();
    updatePerformanceUI();
    persist();

    const crowdRow = document.getElementById('crowd-row');
    if (crowdRow) {
      const count = Math.min(Math.floor(p.crowd), 20);
      if (crowdRow.children.length !== count) {
        crowdRow.innerHTML = Array.from({ length: count }, (_, i) =>
          `<div class="crowd-person" style="--delay:${i * 0.05}s">${renderCrowdMember(i)}</div>`
        ).join('');
      }
    }
  }

  function onNotePress() {
    const p = state.performance;
    if (!p || !p.rhythmActive || activeHold) return;
    if (!isRhythmScoringEnabled()) return;

    const inst = getActiveInstrument();
    const song = getActiveSong();
    const partKey = getPlayerPartKey(inst);
    const elapsed = Metronome.getElapsed();
    const isMelodic = inst.type === 'melodic';
    const notes = getUpcomingNotes(song, partKey, elapsed, p.bpm, RhythmLane.LOOKAHEAD, p.hitBeats, p.missedBeats, p.leadInBeat ?? 0);
    const { rating, note, phase } = rateNotePress(notes, elapsed, p.bpm, isMelodic, p.hitBeats);

    if (!note || rating === 'miss') {
      const tapLate = isMelodic ? 0.24 : 0.2;
      const tapEarly = isMelodic ? 0.14 : 0.12;
      const holdLate = isMelodic ? 0.5 : 0.45;
      const holdEarly = isMelodic ? 0.42 : 0.38;
      const beatDur = 60 / p.bpm;
      const currentBeat = elapsed / beatDur;
      const hittable = notes.some((n) => {
        const dist = n.beat - currentBeat;
        if (n.isHold) {
          const inBody = currentBeat >= n.beat && currentBeat < n.endBeat;
          return dist >= -holdLate && dist <= holdEarly || inBody;
        }
        return dist >= -tapLate && dist <= tapEarly;
      });
      if (hittable) applyHitScore('miss', null, inst);
      return;
    }

    const key = noteKey(note);
    if (p.hitBeats.has(key)) return;

    if (note.isHold && phase === 'hold-start') {
      p.hitBeats.add(key);
      activeHold = { note, inst, pressElapsed: elapsed };
      AudioEngine.startSustain?.(inst, note);
      const zone = document.getElementById('hit-zone');
      if (zone) zone.classList.add('holding');
      triggerPlayAnimation(inst, rating);
      setRhythmHint('hold through the gem!', 'good');
      return;
    }

    p.hitBeats.add(key);
    applyHitScore(rating, note, inst);
  }

  function onNoteRelease() {
    const p = state.performance;
    if (!p || !activeHold) return;

    const { note, inst, pressElapsed } = activeHold;
    const elapsed = Metronome.getElapsed();
    const { rating } = rateHoldRelease(note, elapsed, p.bpm);
    activeHold = null;
    AudioEngine.stopSustain?.();
    const zone = document.getElementById('hit-zone');
    if (zone) zone.classList.remove('holding');
    applyHitScore(rating, note, inst);
  }

  function onPlayNote() {
    onNotePress();
  }

  function spawnFloater(text, type) {
    const container = document.getElementById('floaters');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `floater ${type}`;
    el.textContent = text;
    el.style.left = `${40 + Math.random() * 20}%`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function tickPerformance() {
    const p = state.performance;
    if (!p) return;

    p.timeLeft -= 1;

    if (p.crowd > 2) {
      p.crowd = Math.max(2, p.crowd - 0.15);
    }

    if (p.timeLeft <= 0) {
      stopPerformanceLoop();

      const prevMax = VENUES.filter((v) => venueUnlocked(v)).length;
      updateHud();
      const newMax = VENUES.filter((v) => venueUnlocked(v)).length;
      if (newMax > prevMax) {
        const newest = VENUES.filter((v) => venueUnlocked(v)).pop();
        p.newUnlock = newest?.name;
      }

      persist();
      setScreen('results');
    } else {
      updatePerformanceUI();
    }
  }

  function init() {
    if (typeof ensureSongInstrumentParts === 'function') ensureSongInstrumentParts();
    if (new URLSearchParams(window.location.search).get('tune') === '1') {
      state.screen = 'tune';
      state.tuneInstId = Object.keys(INSTRUMENTS)[0];
      render();
      return;
    }
    setScreen('title');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => Game.init());
