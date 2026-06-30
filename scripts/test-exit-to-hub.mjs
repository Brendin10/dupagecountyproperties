import puppeteer from 'puppeteer-core';

const SAVE = {
  character: 'benny',
  bandCash: 999,
  starMeter: 50,
  hasLid: true,
  tutorialComplete: true,
  inventories: {
    instruments: ['trash-lid'],
    songs: ['rebel-pulse'],
    clothes: [],
    makeup: [],
    accessories: [],
  },
  bandMembers: [],
  bandSlots: 1,
  currentVenue: 'street-corner',
  equippedInstrument: 'trash-lid',
  equippedSong: 'rebel-pulse',
  equippedWear: { clothes: null, makeup: null, accessories: null },
  gigBandIds: [],
};

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://localhost:8899/?v=59', { waitUntil: 'networkidle0' });
await page.evaluate((save) => {
  localStorage.setItem('bandland_save_v2', JSON.stringify(save));
}, SAVE);
await page.reload({ waitUntil: 'networkidle0' });
await page.click('#btn-continue');
await page.waitForSelector('.hub-screen');

const result = await page.evaluate(async () => {
  // Mimic showGigResultsOverlay: overlay on top, hub rendered underneath
  const layer = document.getElementById('gig-results-layer');
  layer.innerHTML = `
    <section class="screen results-screen">
      <h2>Gig Complete! 🎉</h2>
      <button type="button" class="btn btn-primary btn-lg" data-action="back-hub">Back to Map</button>
    </section>
  `;
  layer.classList.remove('hidden');

  // Hub should already be under overlay after real flow; simulate by calling exit
  layer.querySelector('[data-action="back-hub"]').onclick = () => window.Bandland.exitToHub();
  layer.querySelector('[data-action="back-hub"]').click();

  await new Promise((r) => setTimeout(r, 400));

  return {
    hasHub: !!document.querySelector('.hub-screen'),
    hasPerformBtn: !!document.getElementById('btn-perform'),
    hasVenueGrid: !!document.querySelector('.venue-grid'),
    overlayHidden: layer.classList.contains('hidden'),
    rootHasPlaceholder: document.querySelector('.results-placeholder') !== null,
    bodyHasChooseVenue: document.body.innerText.includes('Choose Your Venue'),
  };
});

console.log(JSON.stringify(result, null, 2));
if (errors.length) console.log('Errors:', errors);
await browser.close();

const ok = result.hasHub && result.hasPerformBtn && result.hasVenueGrid
  && result.overlayHidden && !result.rootHasPlaceholder && result.bodyHasChooseVenue;
process.exit(ok ? 0 : 1);
