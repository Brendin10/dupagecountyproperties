const AudioEngine = (() => {
  let ctx = null;
  let mixReady = false;
  let mixBus = null;
  let dryGain = null;
  let wetGain = null;
  let convolver = null;
  let reverbSend = null;

  const CHORD_ROOT = {
    C: 'C2', G: 'G1', Am: 'A1', F: 'F1', E: 'E2', B: 'B1',
    'C#m': 'C#2', A: 'A1', D: 'D2', Em: 'E2', Dm: 'D2',
  };

  const NOTE_FREQ = {
    E2: 82.41, A1: 55.0, B1: 61.74, C2: 65.41, 'C#2': 69.3, D2: 73.42,
    G1: 49.0, F1: 43.65, G2: 98.0, G4: 392.0, A4: 440.0, C5: 523.25,
    D5: 587.33, F5: 698.46, E4: 329.63, F4: 349.23,
  };

  const CHORD_FREQS = {
    C: [261.63, 329.63, 392.0],
    G: [392.0, 493.88, 587.33],
    Am: [220.0, 261.63, 329.63],
    F: [174.61, 220.0, 261.63],
    E: [329.63, 415.3, 493.88],
    B: [246.94, 311.13, 369.99],
    'C#m': [277.18, 329.63, 415.3],
    A: [220.0, 277.18, 329.63],
    D: [293.66, 369.99, 440.0],
    Em: [164.81, 196.0, 246.94],
    Dm: [146.83, 174.61, 220.0],
  };

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function resume() { return getCtx(); }

  function createImpulse(ac, duration, decay) {
    const len = Math.floor(ac.sampleRate * duration);
    const buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
    }
    return buf;
  }

  function initMix() {
    if (mixReady) return mixBus;
    const ac = getCtx();
    mixBus = ac.createGain();
    mixBus.gain.value = 1;
    dryGain = ac.createGain();
    dryGain.gain.value = 0.7;
    wetGain = ac.createGain();
    wetGain.gain.value = 0.48;
    reverbSend = ac.createGain();
    reverbSend.gain.value = 0.52;
    convolver = ac.createConvolver();
    convolver.buffer = createImpulse(ac, 2.4, 2.4);
    mixBus.connect(dryGain);
    mixBus.connect(reverbSend);
    reverbSend.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(ac.destination);
    wetGain.connect(ac.destination);
    mixReady = true;
    return mixBus;
  }

  function getMix() {
    return initMix();
  }

  function connectToMix(node, pan = 0) {
    initMix();
    if (pan !== 0 && node.connect) {
      const ac = getCtx();
      const p = ac.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      node.connect(p);
      p.connect(mixBus);
      return p;
    }
    node.connect(mixBus);
    return node;
  }

  function masterGain(ac, now, peak, dur, pan = 0) {
    const g = ac.createGain();
    g.gain.setValueAtTime(peak, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    connectToMix(g, pan);
    return g;
  }

  function playKick(ac, now, vol = 0.55) {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
    const g = masterGain(ac, now, vol, 0.28, 0);
    osc.connect(g);
    osc.start(now);
    osc.stop(now + 0.26);

    const len = Math.floor(ac.sampleRate * 0.02);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const click = ac.createBufferSource();
    click.buffer = buf;
    const cg = masterGain(ac, now, 0.15, 0.03);
    click.connect(cg);
    click.start(now);
  }

  function playSnare(ac, now, vol = 0.35) {
    const len = Math.floor(ac.sampleRate * 0.2);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 1.4;
    const noise = ac.createBufferSource();
    noise.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2200;
    bp.Q.value = 0.5;
    const g = masterGain(ac, now, vol * 0.85, 0.22, 0.08);
    noise.connect(bp);
    bp.connect(g);
    noise.start(now);

    const tone = ac.createOscillator();
    tone.type = 'triangle';
    tone.frequency.setValueAtTime(220, now);
    tone.frequency.exponentialRampToValueAtTime(160, now + 0.06);
    const tg = masterGain(ac, now, 0.18, 0.1, -0.05);
    tone.connect(tg);
    tone.start(now);
    tone.stop(now + 0.09);
  }

  function playHihat(ac, now, vol = 0.14) {
    const len = Math.floor(ac.sampleRate * 0.06);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = masterGain(ac, now, vol, 0.06);
    src.connect(hp);
    hp.connect(g);
    src.start(now);
  }

  function playCymbal(ac, now, vol = 0.28) {
    const len = Math.floor(ac.sampleRate * 0.45);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(5000, now);
    hp.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
    const g = masterGain(ac, now, vol, 0.42);
    src.connect(hp);
    hp.connect(g);
    src.start(now);

    const ping = ac.createOscillator();
    ping.type = 'triangle';
    ping.frequency.setValueAtTime(820, now);
    ping.frequency.exponentialRampToValueAtTime(380, now + 0.2);
    const pg = masterGain(ac, now, 0.08, 0.22);
    ping.connect(pg);
    ping.start(now);
    ping.stop(now + 0.24);
  }

  function playShake(ac, now, vol = 0.2) {
    const len = Math.floor(ac.sampleRate * 0.1);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 4500;
    const g = masterGain(ac, now, vol, 0.1);
    src.connect(bp);
    bp.connect(g);
    src.start(now);
  }

  function playBassNote(ac, now, note, vol = 0.22) {
    const freq = NOTE_FREQ[note] || 82.41;
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const osc2 = ac.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2;
    const g = masterGain(ac, now, vol, 0.35);
    const g2 = masterGain(ac, now, vol * 0.25, 0.2);
    osc.connect(g);
    osc2.connect(g2);
    osc.start(now);
    osc.stop(now + 0.36);
    osc2.start(now);
    osc2.stop(now + 0.22);
  }

  function playPluck(ac, now, freqs, vol = 0.14, bright = false) {
    freqs.forEach((freq, i) => {
      const delay = i * 0.008;
      const len = Math.floor(ac.sampleRate * 0.35);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let s = 0; s < len; s++) {
        d[s] = Math.sin(2 * Math.PI * freq * s / ac.sampleRate) * (1 - s / len) ** (bright ? 1.2 : 1.6);
      }
      const src = ac.createBufferSource();
      src.buffer = buf;
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = bright ? 4200 : 2800;
      const g = ac.createGain();
      g.gain.setValueAtTime(0, now + delay);
      g.gain.linearRampToValueAtTime(vol, now + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);
      g.connect(getMix());
      src.connect(lp);
      lp.connect(g);
      src.start(now + delay);
    });
  }

  function playChord(ac, now, chordName, vol = 0.13, power = false) {
    playPluck(ac, now, CHORD_FREQS[chordName] || CHORD_FREQS.C, vol, power);
  }

  function playGuitarChord(ac, now, chordName, vol = 1) {
    const freqs = CHORD_FREQS[chordName] || CHORD_FREQS.E;
    freqs.forEach((f, i) => {
      const pan = i === 0 ? -0.25 : i === 2 ? 0.25 : 0;
      [f, f * 1.004].forEach((freq, j) => {
        const osc = ac.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(3200, now);
        lp.frequency.exponentialRampToValueAtTime(1100, now + 0.4);
        const g = ac.createGain();
        const t = now + i * 0.005 + j * 0.002;
        const peak = 0.065 * vol;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(lp);
        lp.connect(g);
        connectToMix(g, pan + (j === 1 ? 0.05 : 0));
        osc.start(t);
        osc.stop(t + 0.48);
      });
    });
  }

  function playKeysChord(ac, now, chordName) {
    const freqs = CHORD_FREQS[chordName] || CHORD_FREQS.C;
    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const osc2 = ac.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2;
      const g = ac.createGain();
      const t = now + i * 0.012;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      g.connect(getMix());
      osc.connect(g);
      osc2.connect(g);
      osc.start(t);
      osc2.start(t);
      osc.stop(t + 0.58);
      osc2.stop(t + 0.58);
    });
  }

  function playHornNote(ac, now, note, vol = 0.1) {
    const freq = NOTE_FREQ[note] || 440;
    const osc = ac.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 0.98, now);
    osc.frequency.linearRampToValueAtTime(freq * 1.02, now + 0.12);
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2200;
    const g = masterGain(ac, now, vol, 0.28);
    osc.connect(lp);
    lp.connect(g);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  function playVocal(ac, now, style = 'ooh') {
    const base = style === 'ah' ? 440 : 523;
    [base, base * 1.25].forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 900 + i * 200;
      bp.Q.value = 4;
      const g = ac.createGain();
      const t = now + i * 0.02;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      g.connect(getMix());
      osc.connect(bp);
      bp.connect(g);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  function playPartEvent(event, roleOrInst, volScale = 1) {
    const ac = getCtx();
    const now = ac.currentTime;
    const v = volScale;

    if (event.chord) {
      if (roleOrInst === 'Guitar' || roleOrInst === 'electric-guitar') playGuitarChord(ac, now, event.chord, v);
      else if (roleOrInst === 'Keys') playKeysChord(ac, now, event.chord);
      else playChord(ac, now, event.chord, 0.16 * v, roleOrInst === 'electric-guitar');
      return;
    }
    if (event.note) {
      if (roleOrInst === 'Bass') playBassNote(ac, now, event.note, 0.28 * v);
      else if (roleOrInst === 'Horns') playHornNote(ac, now, event.note, 0.12 * v);
      else playPluck(ac, now, [NOTE_FREQ[event.note] || 440], 0.14 * v);
      return;
    }
    if (event.hit) {
      switch (event.hit) {
        case 'kick': playKick(ac, now, 0.52 * v); break;
        case 'snare': playSnare(ac, now, 0.38 * v); break;
        case 'hihat': playHihat(ac, now, 0.14 * v); break;
        case 'cymbal': playCymbal(ac, now, 0.3 * v); break;
        case 'shake': playShake(ac, now, 0.22 * v); break;
        case 'ooh':
        case 'ah': playVocal(ac, now, event.hit); break;
        default: playSnare(ac, now, 0.24 * v);
      }
    }
  }

  function playInstrument(instrument, chord) {
    const ac = getCtx();
    const now = ac.currentTime;
    if (!instrument) { playCymbal(ac, now, 0.45); return; }
    switch (instrument.id) {
      case 'trash-lid': playCymbal(ac, now, 0.3); break;
      case 'tambourine': playShake(ac, now, 0.22); break;
      case 'drum-kit': playKick(ac, now, 0.48); break;
      case 'electric-guitar': playGuitarChord(ac, now, chord || 'E'); break;
      case 'ukulele': playChord(ac, now, chord || 'C', 0.14); break;
      default: playPartEvent({ chord: chord || 'C' }, instrument.id);
    }
  }

  function playCrash() { playCymbal(getCtx(), getCtx().currentTime, 0.45); }

  function playCheer() {
    const ac = getCtx();
    const now = ac.currentTime;
    [440, 554, 659].forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = masterGain(ac, now + i * 0.05, 0.08, 0.3);
      osc.connect(g);
      osc.start(now + i * 0.05);
      osc.stop(now + 0.35);
    });
  }

  function playCoin() {
    const ac = getCtx();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
    const g = masterGain(ac, now, 0.12, 0.15);
    osc.connect(g);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  function playTick(vol = 0.06) {
    const ac = getCtx();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880;
    const g = masterGain(ac, now, vol, 0.04);
    osc.connect(g);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  function playSongPad(ac, now, chordName, vol = 0.06) {
    const freqs = CHORD_FREQS[chordName] || CHORD_FREQS.C;
    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq / 2;
      const osc2 = ac.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = freq;
      const osc3 = ac.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.value = freq * 2;
      const g = ac.createGain();
      const t = now + i * 0.015;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.12);
      g.gain.setValueAtTime(vol * 0.85, t + 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
      connectToMix(g, i === 0 ? -0.3 : i === 2 ? 0.3 : 0);
      osc.connect(g);
      osc2.connect(g);
      osc3.connect(g);
      osc.start(t);
      osc2.start(t);
      osc3.start(t);
      osc.stop(t + 2.3);
      osc2.stop(t + 2.3);
      osc3.stop(t + 2.3);
    });
  }

  function playLiveBass(ac, now, chordName, vol = 0.2) {
    const note = CHORD_ROOT[chordName] || 'E2';
    const freq = NOTE_FREQ[note] || 82.41;
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const osc2 = ac.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 280;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.02);
    g.gain.setValueAtTime(vol * 0.9, now + 0.35);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc.connect(lp);
    osc2.connect(lp);
    lp.connect(g);
    connectToMix(g, 0);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.58);
    osc2.stop(now + 0.58);
  }

  function playLiveShimmer(ac, now, chordName, vol = 0.05) {
    const freqs = (CHORD_FREQS[chordName] || CHORD_FREQS.C).map((f) => f * 2);
    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const hp = ac.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 800;
      const g = ac.createGain();
      const t = now + i * 0.03;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(hp);
      hp.connect(g);
      connectToMix(g, i % 2 === 0 ? -0.4 : 0.4);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  function playLiveStrum(ac, now, chordName, vol = 0.08) {
    playGuitarChord(ac, now, chordName, vol * 1.2);
    const freqs = CHORD_FREQS[chordName] || CHORD_FREQS.C;
    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq * 0.5;
      const g = ac.createGain();
      const t = now + i * 0.04;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * 0.4, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(g);
      connectToMix(g, -0.15 + i * 0.15);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  function playMiss() {
    const ac = getCtx();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
    const g = masterGain(ac, now, 0.06, 0.14);
    osc.connect(g);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  return {
    resume, getCtx, initMix, getMix,
    playCrash, playCheer, playCoin, playMiss, playTick,
    playInstrument, playPartEvent, playSongPad,
    playLiveBass, playLiveShimmer, playLiveStrum,
    playKick, playSnare, playHihat, playCymbal, playShake,
    playChord, playGuitarChord, playBassNote, playKeysChord, playHornNote, playVocal,
  };
})();
