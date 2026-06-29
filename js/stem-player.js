const StemPlayer = (() => {
  let song = null;
  let buffers = {};
  let sources = {};
  let gains = {};
  let running = false;
  let startCtxTime = 0;
  let startElapsed = 0;
  let playerStemKey = 'Drums';
  let fullMixVolume = 0.85;
  let fullMixGain = null;
  let stemBus = null;
  let sustainSource = null;
  let sustainGain = null;

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
    playerStemKey = options.playerStemKey !== undefined ? options.playerStemKey : 'Drums';
    fullMixVolume = songObj?.fullMixVolume ?? 0.85;

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
    return hasFullMix();
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
      fullMixGain.connect(stemBus);
    }
    fullMixGain.gain.value = fullMixVolume;
    return stemBus;
  }

  function noteTimeSec(note, songObj, bpm) {
    if (note?.timeSec != null) return note.timeSec;
    const beatDur = 60 / bpm;
    return (note.beat * beatDur) + (songObj?.beatOffset || 0);
  }

  function sliceDuration(note, songObj, bpm) {
    const beatDur = 60 / bpm;
    const noteDur = (note.dur || 1) * beatDur;
    if (note.hit === 'kick') return Math.min(noteDur, 0.35);
    if (note.hit === 'snare') return Math.min(noteDur, 0.42);
    if (note.hit) return Math.min(noteDur, 0.28);
    return Math.min(noteDur, 1.25);
  }

  function playHit(stemKey, note, songObj, bpm, volScale = 1) {
    const buf = buffers[stemKey];
    if (!buf || !note) return false;

    const ac = getCtx();
    const bus = ensureBus();
    const now = ac.currentTime;
    const offset = Math.min(Math.max(noteTimeSec(note, songObj, bpm), 0), Math.max(0, buf.duration - 0.02));
    let duration = sliceDuration(note, songObj, bpm);
    duration = Math.min(duration, buf.duration - offset);
    if (duration <= 0.01) return false;

    const src = ac.createBufferSource();
    src.buffer = buf;
    const gain = ac.createGain();
    const vol = (note.hit ? 0.92 : 0.78) * volScale;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.96);
    src.connect(gain);
    gain.connect(bus);
    src.start(now, offset, duration);
    return true;
  }

  function startSustain(stemKey, note, songObj, bpm, volScale = 1) {
    stopSustain();
    const buf = buffers[stemKey];
    if (!buf || !note) return false;

    const ac = getCtx();
    const bus = ensureBus();
    const now = ac.currentTime;
    const offset = Math.min(Math.max(noteTimeSec(note, songObj, bpm), 0), Math.max(0, buf.duration - 0.02));
    const beatDur = 60 / bpm;
    let duration = Math.min((note.dur || 1) * beatDur, buf.duration - offset);
    if (duration <= 0.05) return false;

    const src = ac.createBufferSource();
    src.buffer = buf;
    const gain = ac.createGain();
    const vol = 0.72 * volScale;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.03);
    src.connect(gain);
    gain.connect(bus);
    src.start(now, offset, duration);
    sustainSource = src;
    sustainGain = gain;
    return true;
  }

  function stopSustain() {
    if (!sustainSource) return;
    const ac = getCtx();
    const now = ac.currentTime;
    if (sustainGain) {
      try {
        sustainGain.gain.cancelScheduledValues(now);
        sustainGain.gain.setValueAtTime(sustainGain.gain.value, now);
        sustainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      } catch { /* already stopped */ }
    }
    try { sustainSource.stop(now + 0.07); } catch { /* already stopped */ }
    sustainSource = null;
    sustainGain = null;
  }

  function start(bpm, elapsedOffset = 0) {
    if (!song || !Object.keys(buffers).length) return false;
    stop({ keepSong: true });

    const ac = getCtx();
    ensureBus();
    startCtxTime = ac.currentTime + 0.05;
    startElapsed = elapsedOffset;
    running = true;

    const buf = buffers.Full;
    if (!buf) return false;

    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = false;

    const gain = ac.createGain();
    gain.connect(fullMixGain);
    gain.gain.value = 1;
    src.connect(gain);

    const offset = Math.min(Math.max(elapsedOffset, 0), buf.duration);
    src.start(startCtxTime, offset);

    sources.Full = src;
    gains.Full = gain;

    return true;
  }

  function setPlayerStem(stemKey) {
    playerStemKey = stemKey ?? null;
  }

  function duckPlayerStem() {
    /* Individual stems are not played during gigs; kept for API compatibility. */
  }

  function getElapsed() {
    if (!running) return startElapsed;
    const ac = getCtx();
    return startElapsed + Math.max(0, ac.currentTime - startCtxTime);
  }

  function stop(options = {}) {
    running = false;
    stopSustain();
    Object.values(sources).forEach((src) => {
      try { src.stop(); } catch { /* already stopped */ }
    });
    sources = {};
    gains = {};
    if (!options.keepSong) {
      song = null;
      buffers = {};
    }
  }

  function isRunning() {
    return running;
  }

  function hasFullMix() {
    return !!buffers.Full;
  }

  function hasStem(stemKey) {
    return !!buffers[stemKey];
  }

  function isLoaded() {
    return hasFullMix();
  }

  function hasStems() {
    return STEM_KEYS.some((key) => key !== 'Full' && buffers[key]);
  }

  return {
    load,
    start,
    stop,
    playHit,
    startSustain,
    stopSustain,
    setPlayerStem,
    duckPlayerStem,
    getElapsed,
    isRunning,
    hasStems,
    hasFullMix,
    hasStem,
    isLoaded,
  };
})();
