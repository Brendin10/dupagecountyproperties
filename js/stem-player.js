const StemPlayer = (() => {
  let song = null;
  let buffers = {};
  let sources = {};
  let gains = {};
  let running = false;
  let startCtxTime = 0;
  let startElapsed = 0;
  let playerStemKey = 'Drums';
  let fullMixGain = null;
  let stemBus = null;

  const STEM_KEYS = ['Bass', 'Drums', 'Lead', 'Keys', 'Full'];

  function getCtx() {
    return AudioEngine.getCtx();
  }

  async function decodeUrl(ac, url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load audio ${url}`);
    const data = await res.arrayBuffer();
    return ac.decodeAudioData(data);
  }

  async function load(songObj, options = {}) {
    stop();
    song = songObj;
    buffers = {};
    playerStemKey = options.playerStemKey || 'Drums';

    if (!song?.stems) return false;
    const ac = getCtx();
    const bust = typeof SONG_ASSET_VERSION !== 'undefined' ? SONG_ASSET_VERSION : '1';
    const loads = STEM_KEYS.map(async (key) => {
      const url = song.stems[key];
      if (!url) return;
      const sep = url.includes('?') ? '&' : '?';
      buffers[key] = await decodeUrl(ac, `${url}${sep}v=${bust}`);
    });
    await Promise.all(loads);
    return Object.keys(buffers).length > 0;
  }

  function ensureBus() {
    const ac = getCtx();
    if (!stemBus) {
      stemBus = ac.createGain();
      stemBus.gain.value = 0.85;
      stemBus.connect(AudioEngine.initMix?.() || ac.destination);
    }
    if (!fullMixGain) {
      fullMixGain = ac.createGain();
      fullMixGain.gain.value = 0.18;
      fullMixGain.connect(stemBus);
    }
    return stemBus;
  }

  function start(bpm, elapsedOffset = 0) {
    if (!song || !Object.keys(buffers).length) return false;
    stop({ keepSong: true });

    const ac = getCtx();
    const bus = ensureBus();
    startCtxTime = ac.currentTime + 0.05;
    startElapsed = elapsedOffset;
    running = true;

    STEM_KEYS.forEach((key) => {
      const buf = buffers[key];
      if (!buf) return;

      const src = ac.createBufferSource();
      src.buffer = buf;
      src.loop = false;

      const gain = ac.createGain();
      let vol = key === 'Full' ? 0.22 : 0.72;
      if (key === playerStemKey) vol = 0;
      if (key === 'Full') {
        gain.connect(fullMixGain);
      } else {
        gain.connect(bus);
      }
      gain.gain.value = vol;
      src.connect(gain);

      const offset = Math.min(Math.max(elapsedOffset, 0), buf.duration);
      src.start(startCtxTime, offset);

      sources[key] = src;
      gains[key] = gain;
    });

    return true;
  }

  function setPlayerStem(stemKey) {
    playerStemKey = stemKey || 'Drums';
    if (!running) return;
    STEM_KEYS.forEach((key) => {
      if (!gains[key] || key === 'Full') return;
      gains[key].gain.value = key === playerStemKey ? 0 : 0.72;
    });
  }

  function duckPlayerStem(duck = true) {
    if (!gains[playerStemKey]) return;
    gains[playerStemKey].gain.value = duck ? 0 : 0.72;
  }

  function getElapsed() {
    if (!running) return startElapsed;
    const ac = getCtx();
    return startElapsed + Math.max(0, ac.currentTime - startCtxTime);
  }

  function stop(options = {}) {
    running = false;
    Object.values(sources).forEach((src) => {
      try { src.stop(); } catch { /* already stopped */ }
    });
    sources = {};
    gains = {};
    if (!options.keepSong) song = null;
  }

  function isRunning() {
    return running;
  }

  function hasStems() {
    return Object.keys(buffers).length > 0;
  }

  return {
    load,
    start,
    stop,
    setPlayerStem,
    duckPlayerStem,
    getElapsed,
    isRunning,
    hasStems,
  };
})();
