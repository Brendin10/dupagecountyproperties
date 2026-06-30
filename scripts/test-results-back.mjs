import puppeteer from 'puppeteer-core';

const SAVE = {
  character: 'benny',
  bandCash: 999,
  starMeter: 0,
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
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto('http://localhost:8899/?v=57', { waitUntil: 'networkidle0' });
await page.evaluate((save) => {
  localStorage.setItem('bandland_save_v2', JSON.stringify(save));
}, SAVE);
await page.reload({ waitUntil: 'networkidle0' });
const continueBtn = await page.$('#btn-continue');
if (continueBtn) {
  await continueBtn.click();
} else {
  await page.click('#btn-start');
  await page.click('.character-card');
  await page.click('#btn-tutorial-next');
  await page.click('#btn-tap-lid');
  await page.waitForSelector('.hub-screen', { timeout: 5000 });
}
await page.waitForSelector('.hub-screen', { timeout: 10000 });

const result = await page.evaluate(async () => {
  const curtain = document.getElementById('stage-curtain');
  curtain.className = 'stage-curtain curtain-opening';
  curtain.style.pointerEvents = 'auto';
  curtain.style.opacity = '1';
  curtain.style.visibility = 'visible';

  document.getElementById('screen-root').innerHTML = `
    <section class="screen results-screen">
      <h2>Gig Complete! 🎉</h2>
      <button type="button" class="btn btn-primary btn-lg" id="btn-back-hub" data-action="back-hub" onclick="window.Bandland&&window.Bandland.exitToHub()">Back to Map</button>
    </section>
  `;

  const backBtn = document.getElementById('btn-back-hub');
  backBtn.click();
  await new Promise((r) => setTimeout(r, 300));

  const curtainPE = getComputedStyle(curtain).pointerEvents;
  return {
    hasBandland: typeof window.Bandland?.exitToHub === 'function',
    onHub: !!document.querySelector('.hub-screen'),
    curtainPE,
  };
});

console.log('Test result:', JSON.stringify(result, null, 2));
if (errors.length) console.log('Page errors:', errors);

await browser.close();
process.exit(result.onHub && result.hasBandland ? 0 : 1);
