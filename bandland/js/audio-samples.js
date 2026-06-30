const AudioSamples = (() => {
  const BASE = 'audio/instruments/';

  const SUBTYPE_SAMPLES = {
    electric: ['electric-strum.wav'],
    acoustic: ['acoustic-strum.wav'],
    ukulele: ['ukulele-strum.wav'],
    bass: ['bass-pluck.wav'],
    banjo: ['acoustic-strum.wav'],
    bow: ['acoustic-strum.wav'],
    piano: ['piano-chord.wav'],
    synth: ['keyboard-chord.wav'],
    organ: ['organ-chord.wav'],
    accordion: ['piano-chord.wav'],
    brass: ['brass-note.wav'],
    sax: ['sax-note.wav'],
    flute: ['brass-note.wav'],
    clarinet: ['brass-note.wav'],
    harmonica: ['brass-note.wav'],
    mallet: ['bell-hit.wav'],
    drums: ['drum-kick.wav', 'drum-snare.wav', 'drum-hihat.wav'],
    cymbal: ['cymbal-hit.wav'],
    shake: ['shake.wav'],
    bell: ['bell-hit.wav'],
    triangle: ['bell-hit.wav'],
    bongo: ['drum-snare.wav'],
  };

  const cache = new Map();
  const loading = new Map();
  let hitCounter = 0;

  function getCtx() {
    return AudioEngine.getCtx();
  }

  function sampleUrl(name) {
    return `${BASE}${name}`;
  }

  function loadBuffer(name) {
    if (cache.has(name)) return Promise.resolve(cache.get(name));
    if (loading.has(name)) return loading.get(name);

    const ac = getCtx();
    const promise = fetch(sampleUrl(name))
      .then((r) => {
        if (!r.ok) throw new Error(`sample ${name} ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buf) => new Promise((resolve, reject) => {
        ac.decodeAudioData(buf, resolve, reject);
      }))
      .then((decoded) => {
        cache.set(name, decoded);
        loading.delete(name);
        return decoded;
      })
      .catch((err) => {
        loading.delete(name);
        console.warn('Instrument sample load failed', name, err);
        return null;
      });

    loading.set(name, promise);
    return promise;
  }

  async function loadInstrumentSamples(subtype) {
    if (!subtype) return [];
    const names = SUBTYPE_SAMPLES[subtype] || [];
    const results = await Promise.all(names.map(loadBuffer));
    return results.filter(Boolean);
  }

  function pickSample(subtype, noteEvent) {
    const names = SUBTYPE_SAMPLES[subtype] || [];
    if (!names.length) return null;
    if (subtype === 'drums' && noteEvent?.hit) {
      const hitMap = { kick: 'drum-kick.wav', snare: 'drum-snare.wav', hihat: 'drum-hihat.wav' };
      const hitName = hitMap[noteEvent.hit];
      if (hitName && cache.has(hitName)) return cache.get(hitName);
    }
    hitCounter += 1;
    const name = names[hitCounter % names.length];
    return cache.get(name) || null;
  }

  function playInstrumentSample(subtype, noteEvent, vol = 0.55) {
    const buffer = pickSample(subtype, noteEvent);
    if (!buffer) return false;

    const ac = getCtx();
    const now = ac.currentTime;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const g = ac.createGain();
    const pitch = 0.96 + Math.random() * 0.08;
    src.playbackRate.value = pitch;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + Math.min(buffer.duration * 0.9, 0.8));
    src.connect(g);
    AudioEngine.connectToMix(g, (Math.random() - 0.5) * 0.3, noteEvent?.hit ? 'perc' : 'music');
    src.start(now);
    return true;
  }

  function preloadCommon() {
    const common = ['electric-strum.wav', 'drum-kick.wav', 'drum-snare.wav', 'piano-chord.wav', 'cymbal-hit.wav'];
    return Promise.all(common.map(loadBuffer));
  }

  return {
    loadBuffer,
    loadInstrumentSamples,
    playInstrumentSample,
    preloadCommon,
    hasSample(subtype) {
      return !!(SUBTYPE_SAMPLES[subtype]?.length);
    },
  };
})();
