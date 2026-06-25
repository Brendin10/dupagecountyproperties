const AudioEngine = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  function resume() {
    const ac = getCtx();
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function playTick(vol = 0.12) {
    const ac = resume();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  function playCrash() {
    const ac = resume();
    const now = ac.currentTime;
    const bufferSize = ac.sampleRate * 0.4;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.35);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    noise.start(now);
    noise.stop(now + 0.4);
    const osc = ac.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.25);
    const oscGain = ac.createGain();
    oscGain.gain.setValueAtTime(0.15, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(oscGain);
    oscGain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  function playDrum() {
    const ac = resume();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.6, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  function playShake() {
    const ac = resume();
    const now = ac.currentTime;
    const len = Math.floor(ac.sampleRate * 0.12);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain();
    g.gain.value = 0.25;
    src.connect(g);
    g.connect(ac.destination);
    src.start(now);
  }

  const CHORD_FREQS = {
    C: [261.63, 329.63, 392.0],
    G: [392.0, 493.88, 587.33],
    Am: [220.0, 261.63, 329.63],
    F: [174.61, 220.0, 261.63],
    E: [329.63, 415.3, 493.88],
    B: [246.94, 311.13, 369.99],
    'C#m': [277.18, 329.63, 415.3],
    A: [220.0, 277.18, 329.63],
  };

  function playChord(chordName, subtype = 'pluck') {
    const ac = resume();
    const now = ac.currentTime;
    const freqs = CHORD_FREQS[chordName] || CHORD_FREQS.C;
    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = subtype === 'chord' ? 'sawtooth' : 'triangle';
      osc.frequency.value = freq;
      const g = ac.createGain();
      const delay = i * 0.02;
      g.gain.setValueAtTime(0, now + delay);
      g.gain.linearRampToValueAtTime(0.12, now + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + (subtype === 'chord' ? 0.5 : 0.35));
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.6);
    });
  }

  function playInstrument(instrument, chord) {
    if (!instrument) return playCrash();
    switch (instrument.subtype) {
      case 'cymbal': playCrash(); break;
      case 'drums': playDrum(); break;
      case 'shake': playShake(); break;
      case 'pluck':
      case 'chord': playChord(chord || 'C', instrument.subtype); break;
      default: playCrash();
    }
  }

  function playCheer() {
    const ac = resume();
    const now = ac.currentTime;
    [440, 554, 659].forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ac.createGain();
      g.gain.setValueAtTime(0, now + i * 0.05);
      g.gain.linearRampToValueAtTime(0.08, now + i * 0.05 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + 0.35);
    });
  }

  function playCoin() {
    const ac = resume();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  function playMiss() {
    const ac = resume();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  return { playCrash, playCheer, playCoin, playTick, playInstrument, playMiss };
})();
