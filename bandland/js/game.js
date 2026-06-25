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
  };

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
    updateHud();
    persist();
    return true;
  }

  function buyBandSlot() {
    const nextCost = BAND_SLOT_COSTS[state.bandSlots] ?? 9999;
    if (state.bandCash < nextCost || state.bandSlots >= 4) return false;
    state.bandCash -= nextCost;
    state.bandSlots += 1;
    updateHud();
    persist();
    return true;
  }

  function acceptRecruit() {
    if (!state.pendingRecruit) return false;
    if (state.bandMembers.length >= state.bandSlots) return false;
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
    return `
      <section class="screen title-screen">
        <div class="title-bg"></div>
        <div class="title-content">
          <p class="eyebrow">Welcome to</p>
          <h1 class="game-title">BAND<span>LAND</span></h1>
          <p class="subtitle">From trash can lids to sold-out shows.</p>
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
            <div class="story-character small">${char.render(100)}</div>
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
                  const equipped = (cat === 'instruments' && state.equippedInstrument === i.id)
                    || (cat === 'songs' && state.equippedSong === i.id);
                  const equipAttr = (cat === 'instruments' || cat === 'songs') ? i.id : '';
                  return `<button type="button" class="inv-chip ${equipped ? 'equipped' : ''}" data-equip-cat="${cat}" data-equip="${equipAttr}" title="${i.name}${equipped ? ' (equipped)' : ''}">${i.emoji}</button>`;
                }).join('')
              : '<span class="inv-empty">Empty</span>'}
          </div>
        </div>
      `;
    }).join('');

    const bandSection = `
      <div class="inv-section">
        <h4>Band (${state.bandMembers.length}/${state.bandSlots})</h4>
        <div class="inv-items band-roster">
          ${state.bandMembers.length
            ? state.bandMembers.map((m) => `
                <div class="bandmate-chip" title="${m.role}">
                  ${renderBandmateCharacter(m, 52)}
                  <span>${m.name}</span>
                </div>`).join('')
            : '<span class="inv-empty">Solo act</span>'}
        </div>
      </div>
    `;

    return `
      <section class="screen hub-screen">
        <div class="hub-layout">
          <aside class="hub-sidebar">
            <div class="hub-character">${renderCharacter(state.character, 120, { instrument: getActiveInstrument() })}</div>
            <p class="hub-name">${char.name}</p>
            <p class="hub-appeal">Crowd Appeal: <strong>+${appeal}</strong></p>
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
              <button class="btn btn-primary btn-lg" id="btn-perform">🎵 Play Gig</button>
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
    const full = state.bandMembers.length >= state.bandSlots;
    return `
      <div class="modal-overlay">
        <div class="modal recruit-modal">
          <div class="recruit-preview">${renderBandmateCharacter(r, 130)}</div>
          <h3>🌟 Someone Wants In!</h3>
          <p><strong>${r.name}</strong> (${r.role}) wants to join your band!</p>
          ${full
            ? `<p class="warn">Buy a band slot in the shop first! (${state.bandMembers.length}/${state.bandSlots})</p>`
            : `<p>They'll boost your crowd and star power.</p>`}
          <div class="modal-actions">
            ${full ? '' : `<button class="btn btn-primary" id="btn-accept-recruit">Welcome Aboard!</button>`}
            <button class="btn btn-ghost" id="btn-decline-recruit">Not Now</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderShop() {
    const tabs = ['instruments', 'songs', 'clothes', 'makeup', 'accessories', 'band'];
    const tabButtons = tabs.map((t) => `
      <button class="shop-tab ${state.shopTab === t ? 'active' : ''}" data-tab="${t}">
        ${t === 'band' ? '👥 Band Slots' : t === 'songs' ? '🎵 Songs' : t.charAt(0).toUpperCase() + t.slice(1)}
      </button>
    `).join('');

    let content = '';
    if (state.shopTab === 'band') {
      const nextCost = BAND_SLOT_COSTS[state.bandSlots] ?? null;
      content = `
        <div class="shop-list">
          <div class="shop-item">
            <span class="shop-emoji">👥</span>
            <div class="shop-info">
              <strong>Band Member Slot</strong>
              <span>Current: ${state.bandMembers.length} / ${state.bandSlots} slots</span>
            </div>
            ${nextCost !== null && state.bandSlots < 4
              ? `<button class="btn btn-buy" data-buy-slot="1" ${state.bandCash < nextCost ? 'disabled' : ''}>$${nextCost}</button>`
              : '<span class="owned-badge">MAX</span>'}
          </div>
        </div>
      `;
    } else {
      const items = SHOP_ITEMS[state.shopTab];
      content = `
        <div class="shop-list">
          ${items.map((item) => {
            const owned = state.inventories[state.shopTab].includes(item.id);
            return `
              <div class="shop-item ${owned ? 'owned' : ''}">
                <span class="shop-emoji">${item.emoji}</span>
                <div class="shop-info">
                  <strong>${item.name}</strong>
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
          <h2>Shop</h2>
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
        <div class="lineup-slot lead" id="performer">${renderCharacter(state.character, 130, { instrument: inst })}</div>
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
      <section class="screen perform-screen ${venue.bg}">
        ${renderVenueBackdrop(venue.id)}
        <div class="perform-content">
        <div class="perform-header">
          <h2>${venue.emoji} ${venue.name}</h2>
          <div class="perform-timer" id="perf-timer">⏱ ${p.timeLeft}s</div>
        </div>

        <div class="perform-stage">
          <div class="crowd-row" id="crowd-row">${crowdHtml}</div>
          <div class="stage-lights"></div>
          <div class="performer-wrap">
            ${renderStageLineup(inst)}
            <div class="performer-stack">
              ${RhythmLane.renderHtml(song.name)}
              <button class="play-btn" id="btn-play-note">
                <span class="instrument-emoji">${inst.emoji}</span>
                <span>PLAY ${inst.name.toUpperCase()}!</span>
              </button>
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
        render();
      });
    });

    $$('[data-buy-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (buyItem(btn.dataset.buyCat, btn.dataset.buyId)) render();
      });
    });

    $('[data-buy-slot]')?.addEventListener('click', () => {
      if (buyBandSlot()) render();
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

    $$('[data-equip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.equip;
        const cat = btn.dataset.equipCat;
        if (!id) return;
        if (cat === 'instruments' && state.inventories.instruments.includes(id)) {
          state.equippedInstrument = id;
          persist();
          render();
        }
        if (cat === 'songs' && state.inventories.songs?.includes(id)) {
          state.equippedSong = id;
          persist();
          render();
        }
      });
    });

    $('#btn-play-note')?.addEventListener('click', onPlayNote);
  }

  function startPerformanceLoop() {
    const p = state.performance;
    if (!p) return;

    const song = getActiveSong();
    const bpm = p.bpm;

    BandAudio.setBand(state.bandMembers, song);
    BandAudio.setOnMemberPlay((member) => triggerBandmateAnimation(member));
    BandAudio.start(bpm);

    Metronome.start(bpm, (beatIdx) => {
      BandAudio.onBeat(beatIdx);
    }, { silent: true });

    const uiLoop = () => {
      if (!state.performance || state.screen !== 'perform') return;
      updatePerformanceUI();
      state.perfUiRaf = requestAnimationFrame(uiLoop);
    };
    state.perfUiRaf = requestAnimationFrame(uiLoop);
  }

  function stopPerformanceLoop() {
    Metronome.stop();
    BandAudio.stop();
    if (state.perfUiRaf) cancelAnimationFrame(state.perfUiRaf);
    if (state.perfInterval) clearInterval(state.perfInterval);
    state.perfInterval = null;
    state.perfUiRaf = null;
  }

  function updatePerformanceUI() {
    const p = state.performance;
    if (!p) return;
    const inst = getActiveInstrument();
    const song = getActiveSong();
    const partKey = getPlayerPartKey(inst);
    const isMelodic = inst.type === 'melodic';
    const elapsed = Metronome.getElapsed();

    const timer = document.getElementById('perf-timer');
    if (timer) timer.textContent = `⏱ ${p.timeLeft}s`;

    RhythmLane.update(song, partKey, elapsed, p.bpm, isMelodic);

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
    if (comboEl) comboEl.textContent = p.combo > 1 ? `COMBO ×${p.combo}` : '';
  }

  function triggerBandmateAnimation(member) {
    const el = document.getElementById(`bandmate-${getBandmateId(member)}`);
    if (!el) return;
    const anim = ROLE_ANIM[member.role] || 'anim-hit';
    el.classList.remove(...ALL_ANIM_CLASSES);
    void el.offsetWidth;
    el.classList.add(anim);
  }

  function triggerPlayAnimation(inst, rating) {
    const performer = document.getElementById('performer');
    if (!performer) return;
    const anim = INST_ANIM[inst.id] || 'anim-hit';
    performer.classList.remove(...ALL_ANIM_CLASSES);
    void performer.offsetWidth;
    if (rating !== 'miss') {
      performer.classList.add(anim);
      performer.classList.add('hit-flash');
    }
    const held = performer.querySelector('.held-instrument');
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
      }
    }
  }

  function setRhythmHint(text, rating) {
    const el = document.getElementById('rhythm-hint');
    if (!el) return;
    el.innerHTML = text.replace(rating, `<span class="rating-${rating}">${rating.toUpperCase()}</span>`);
  }

  function startPerformance() {
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
      newUnlock: null,
      recruitRolls: 0,
    };

    stopPerformanceLoop();
    state.perfInterval = setInterval(tickPerformance, 1000);
    setScreen('perform');
    startPerformanceLoop();
  }

  function onPlayNote() {
    const p = state.performance;
    if (!p) return;

    const inst = getActiveInstrument();
    const song = getActiveSong();
    const partKey = getPlayerPartKey(inst);
    const elapsed = Metronome.getElapsed();
    const isMelodic = inst.type === 'melodic';
    const notes = getUpcomingNotes(song, partKey, elapsed, p.bpm, RhythmLane.LOOKAHEAD);
    const { rating, note } = rateNoteHit(notes, elapsed, p.bpm, isMelodic);

    triggerPlayAnimation(inst, rating);
    RhythmLane.flashHit(rating);

    if (rating === 'miss') {
      AudioEngine.playMiss();
      p.combo = 0;
      const starLoss = isMelodic ? 0.65 : 0.5;
      p.sessionStars = Math.max(0, p.sessionStars - starLoss);
      state.starMeter = Math.max(0, state.starMeter - starLoss);
      setRhythmHint(isMelodic ? 'miss — hit the gem in the zone!' : 'miss — hit the beat gem!', 'miss');
      spawnFloater(`-${starLoss.toFixed(1)} ★`, 'miss');
      updateHud();
      updatePerformanceUI();
      return;
    }

    if (note) {
      AudioEngine.playPartEvent(note, inst.id, 1);
    } else {
      AudioEngine.playInstrument(inst, note?.chord);
    }
    p.combo += 1;

    const mult = rating === 'perfect' ? 1.5 : 1.0;
    const appeal = crowdAppeal();
    const crowdGain = (rating === 'perfect' ? 0.7 : 0.35) * mult + appeal * 0.03;
    p.crowd = Math.min(p.crowdCap, p.crowd + crowdGain);
    p.cheer = Math.min(p.cheerGoal * 1.5, p.cheer + (rating === 'perfect' ? 4 : 2));

    if (p.cheer > p.cheerGoal * 0.5 && Math.random() < 0.12) AudioEngine.playCheer();
    if (p.combo >= 5 && p.combo % 5 === 0) AudioEngine.playCheer();

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

    if (state.starMeter >= 20 && !state.pendingRecruit && p.recruitRolls < 2 && Math.random() < 0.08) {
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
    setScreen('title');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => Game.init());
