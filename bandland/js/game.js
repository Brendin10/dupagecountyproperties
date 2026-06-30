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
    },
    bandMembers: [],
    bandSlots: 1,
    currentVenue: 'street-corner',
    performance: null,
    pendingRecruit: null,
  };

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
    if (!item || state.inventories[cat].includes(itemId)) return false;
    if (state.bandCash < item.cost) return false;
    state.bandCash -= item.cost;
    state.inventories[cat].push(itemId);
    updateHud();
    return true;
  }

  function buyBandSlot() {
    const nextCost = BAND_SLOT_COSTS[state.bandSlots] ?? 9999;
    if (state.bandCash < nextCost || state.bandSlots >= 4) return false;
    state.bandCash -= nextCost;
    state.bandSlots += 1;
    updateHud();
    return true;
  }

  function acceptRecruit() {
    if (!state.pendingRecruit) return false;
    if (state.bandMembers.length >= state.bandSlots) return false;
    state.bandMembers.push(state.pendingRecruit);
    state.starMeter += 5;
    state.pendingRecruit = null;
    updateHud();
    return true;
  }

  function venueUnlocked(venue) {
    return state.starMeter >= venue.starRequired;
  }

  function renderTitle() {
    return `
      <section class="screen title-screen">
        <div class="title-bg"></div>
        <div class="title-content">
          <p class="eyebrow">Welcome to</p>
          <h1 class="game-title">BAND<span>LAND</span></h1>
          <p class="subtitle">From trash can lids to sold-out shows.</p>
          <button class="btn btn-primary btn-lg" id="btn-start">Start Your Journey</button>
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

    const inventorySections = ['instruments', 'clothes', 'makeup', 'accessories'].map((cat) => {
      const items = ownedItems(cat);
      const label = cat.charAt(0).toUpperCase() + cat.slice(1);
      return `
        <div class="inv-section">
          <h4>${label}</h4>
          <div class="inv-items">
            ${items.length
              ? items.map((i) => `<span class="inv-chip" title="${i.name}">${i.emoji}</span>`).join('')
              : '<span class="inv-empty">Empty</span>'}
          </div>
        </div>
      `;
    }).join('');

    const bandSection = `
      <div class="inv-section">
        <h4>Band (${state.bandMembers.length}/${state.bandSlots})</h4>
        <div class="inv-items">
          ${state.bandMembers.length
            ? state.bandMembers.map((m) => `<span class="inv-chip" title="${m.role}">${m.emoji} ${m.name}</span>`).join('')
            : '<span class="inv-empty">Solo act</span>'}
        </div>
      </div>
    `;

    return `
      <section class="screen hub-screen">
        <div class="hub-layout">
          <aside class="hub-sidebar">
            <div class="hub-character">${char.render(120)}</div>
            <p class="hub-name">${char.name}</p>
            <p class="hub-appeal">Crowd Appeal: <strong>+${appeal}</strong></p>
            ${inventorySections}
            ${bandSection}
          </aside>

          <div class="hub-main">
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
        <div class="modal">
          <h3>🌟 Someone Wants In!</h3>
          <p><strong>${r.emoji} ${r.name}</strong> (${r.role}) wants to join your band!</p>
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
    const tabs = ['instruments', 'clothes', 'makeup', 'accessories', 'band'];
    const tabButtons = tabs.map((t) => `
      <button class="shop-tab ${state.shopTab === t ? 'active' : ''}" data-tab="${t}">
        ${t === 'band' ? '👥 Band Slots' : t.charAt(0).toUpperCase() + t.slice(1)}
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

  function renderPerformance() {
    const venue = VENUES.find((v) => v.id === state.currentVenue);
    const p = state.performance;
    const char = CHARACTERS[state.character];
    const cheerPct = Math.min(100, (p.cheer / p.cheerGoal) * 100);
    const crowdPct = Math.min(100, (p.crowd / p.crowdCap) * 100);

    const crowdHtml = Array.from({ length: Math.min(p.crowd, 20) }, (_, i) =>
      `<div class="crowd-person" style="--delay:${i * 0.05}s">${renderCrowdMember(i)}</div>`
    ).join('');

    return `
      <section class="screen perform-screen ${venue.bg}">
        <div class="perform-header">
          <h2>${venue.emoji} ${venue.name}</h2>
          <div class="perform-timer">⏱ ${p.timeLeft}s</div>
        </div>

        <div class="perform-stage">
          <div class="crowd-row">${crowdHtml}</div>
          <div class="stage-lights"></div>
          <div class="performer-wrap">
            ${state.bandMembers.map((m, i) => `<span class="bandmate" style="--i:${i}">${m.emoji}</span>`).join('')}
            <div class="performer ${p.hitFlash ? 'hit-flash' : ''}">${char.render(130)}</div>
            <button class="play-btn" id="btn-play-note">
              <span class="instrument-emoji">${ownedItems('instruments').at(-1)?.emoji ?? '🥁'}</span>
              <span>TAP TO PLAY!</span>
            </button>
          </div>
        </div>

        <div class="perform-meters">
          <div class="meter">
            <label>Crowd <span>${Math.floor(p.crowd)}/${p.crowdCap}</span></label>
            <div class="meter-bar"><div class="meter-fill crowd-fill" style="width:${crowdPct}%"></div></div>
          </div>
          <div class="meter">
            <label>Cheer <span>${Math.floor(p.cheer)}/${p.cheerGoal}</span></label>
            <div class="meter-bar"><div class="meter-fill cheer-fill" style="width:${cheerPct}%"></div></div>
          </div>
        </div>

        <div class="perform-floaters" id="floaters"></div>

        <div class="perform-footer">
          <span class="gig-cash">+${Math.floor(p.sessionCash)} BandCash this gig</span>
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
  }

  function bindEvents() {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    $('#btn-start')?.addEventListener('click', () => setScreen('select'));

    $$('.character-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.character = btn.dataset.character;
        state.tutorialStep = 0;
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
        setScreen('hub');
      }, 1200);
    });

    $$('.venue-card:not(.locked)').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.currentVenue = btn.dataset.venue;
        render();
      });
    });

    $('#btn-perform')?.addEventListener('click', startPerformance);
    $('#btn-shop')?.addEventListener('click', () => setScreen('shop'));
    $('#btn-back-hub')?.addEventListener('click', () => setScreen('hub'));

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
      render();
    });

    $('#btn-play-note')?.addEventListener('click', onPlayNote);
  }

  function startPerformance() {
    const venue = VENUES.find((v) => v.id === state.currentVenue);
    const appeal = crowdAppeal();
    const crowdCap = venue.crowdCap + Math.floor(appeal * 0.5);

    state.performance = {
      timeLeft: 30,
      crowd: Math.min(3 + Math.floor(appeal * 0.2), crowdCap),
      crowdCap,
      cheer: 0,
      cheerGoal: 50 + venue.starRequired * 0.3,
      sessionCash: 0,
      sessionStars: 0,
      peakCrowd: 0,
      appeal,
      tipMultiplier: venue.tipMultiplier,
      hitFlash: false,
      newUnlock: null,
      recruitRolls: 0,
    };

    if (state.perfInterval) clearInterval(state.perfInterval);
    state.perfInterval = setInterval(tickPerformance, 1000);
    setScreen('perform');
  }

  function onPlayNote() {
    const p = state.performance;
    if (!p) return;

    AudioEngine.playCrash();
    p.hitFlash = true;
    setTimeout(() => { if (state.performance) state.performance.hitFlash = false; render(); }, 120);

    const appeal = crowdAppeal();
    const crowdGain = 0.3 + appeal * 0.04;
    p.crowd = Math.min(p.crowdCap, p.crowd + crowdGain);

    const cheerGain = 1.5 + p.crowd * 0.08;
    p.cheer = Math.min(p.cheerGoal * 1.5, p.cheer + cheerGain);

    if (p.cheer > p.cheerGoal * 0.5 && Math.random() < 0.15) {
      AudioEngine.playCheer();
    }

    const tip = (1 + p.crowd * 0.15) * p.tipMultiplier * (0.8 + Math.random() * 0.4);
    p.sessionCash += tip;
    state.bandCash += tip;

    const starGain = 0.08 + p.crowd * 0.02 + (tip > 3 ? 0.1 : 0);
    p.sessionStars += starGain;
    state.starMeter += starGain;

    if (tip >= 2) {
      AudioEngine.playCoin();
      spawnFloater(`+$${Math.floor(tip)}`, 'cash');
    }

    p.peakCrowd = Math.max(p.peakCrowd, p.crowd);

    if (state.starMeter >= 20 && !state.pendingRecruit && p.recruitRolls < 2 && Math.random() < 0.08) {
      const recruit = RECRUIT_POOL[Math.floor(Math.random() * RECRUIT_POOL.length)];
      if (!state.bandMembers.find((m) => m.name === recruit.name)) {
        state.pendingRecruit = recruit;
        p.recruitRolls += 1;
      }
    }

    updateHud();
    render();
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
      clearInterval(state.perfInterval);
      state.perfInterval = null;

      const prevMax = VENUES.filter((v) => venueUnlocked(v)).length;
      updateHud();
      const newMax = VENUES.filter((v) => venueUnlocked(v)).length;
      if (newMax > prevMax) {
        const newest = VENUES.filter((v) => venueUnlocked(v)).pop();
        p.newUnlock = newest?.name;
      }

      setScreen('results');
    } else {
      render();
    }
  }

  function init() {
    setScreen('title');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => Game.init());
