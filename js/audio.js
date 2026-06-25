const AudioEngine = (() => {
  let ctx = null;
  let mixReady = false;
  let musicBus = null;
  let percBus = null;
  let dryGain = null;
  let wetGain = null;
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

  function initMix() {
    if (mixReady) return musicBus;
    const ac = getCtx();
    musicBus = ac.createGain();
    musicBus.gain.value = 1;
    percBus = ac.createGain();
    percBus.gain.value = 1;
    dryGain = ac.createGain();
    dryGain.gain.value = 0.9;
    wetGain = ac.createGain();
    wetGain.gain.value = 0.2;
    reverbSend = ac.createGain();
    reverbSend.gain.value = 0.3;

    const delay = ac.createDelay(0.5);
    delay.delayTime.value = 0.12;
    const delayFilter = ac.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 2000;
    const delayFeedback = ac.createGain();
    delayFeedback.gain.value = 0.26;

    musicBus.connect(dryGain);
    musicBus.connect(reverbSend);
    reverbSend.connect(delay);
    delay.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delay);
    delayFilter.connect(wetGain);

    percBus.connect(dryGain);

    dryGain.connect(ac.destination);
    wetGain.connect(ac.destination);
    mixReady = true;
    return musicBus;
  }

  function getMix() {
    return initMix();
  }

  function connectToMix(node, pan = 0, bus = 'music') {
    initMix();
    const target = bus === 'perc' ? percBus : musicBus;
    if (pan !== 0) {
      const ac = getCtx();
      const p = ac.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      node.connect(p);
      p.connect(target);
      return p;
    }
    node.connect(target);
    return node;
  }

  function masterGain(ac, now, peak, dur, pan = 0, bus = 'music') {
    const g = ac.createGain();
    g.gain.setValueAtTime(peak, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    connectToMix(g, pan, bus);
    return g;
  }

  function playKick(ac, now, vol = 0.55) {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
    const g = masterGain(ac, now, vol, 0.28, 0, 'perc');
    osc.connect(g);
    osc.start(now);
    osc.stop(now + 0.26);

    const click = ac.createOscillator();
    click.type = 'sine';
    click.frequency.value = 1100;
    const cg = masterGain(ac, now, 0.07, 0.012, 0, 'perc');
    click.connect(cg);
    click.start(now);
    click.stop(now + 0.02);
  }

  function playSnare(ac, now, vol = 0.35) {
    const tone = ac.createOscillator();
    tone.type = 'triangle';
    tone.frequency.setValueAtTime(240, now);
    tone.frequency.exponentialRampToValueAtTime(130, now + 0.09);
    const tg = masterGain(ac, now, vol * 0.6, 0.11, 0.04, 'perc');
    tone.connect(tg);
    tone.start(now);
    tone.stop(now + 0.1);

    const click = ac.createOscillator();
    click.type = 'square';
    click.frequency.value = 850;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1900;
    bp.Q.value = 1;
    const cg = masterGain(ac, now, vol * 0.22, 0.035, -0.04, 'perc');
    click.connect(bp);
    bp.connect(cg);
    click.start(now);
    click.stop(now + 0.04);
  }

  function playHihat(ac, now, vol = 0.14) {
    [4100, 6600, 9200].forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;
      const hp = ac.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 4500;
      const g = masterGain(ac, now + i * 0.001, vol * 0.32, 0.035, 0, 'perc');
      osc.connect(hp);
      hp.connect(g);
      osc.start(now + i * 0.001);
      osc.stop(now + 0.04);
    });
  }

  function playCymbal(ac, now, vol = 0.28) {
    const ratios = [1, 1.48, 2.05, 2.78, 3.55, 4.4];
    const base = 320;
    ratios.forEach((r, i) => {
      const osc = ac.createOscillator();
      osc.type = 'triangle';
      const f = base * r;
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.5, now + 0.38);
      const g = ac.createGain();
      const t = now + i * 0.003;
      g.gain.setValueAtTime(vol * 0.13, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      connectToMix(g, (i - 2.5) * 0.07, 'perc');
      osc.connect(g);
      osc.start(t);
      osc.stop(t + 0.42);
    });
  }

  function playShake(ac, now, vol = 0.2) {
    [2600, 3400, 4200, 5000].forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = masterGain(ac, now + i * 0.006, vol * 0.28, 0.06, (i - 1.5) * 0.12, 'perc');
      osc.connect(g);
      osc.start(now + i * 0.006);
      osc.stop(now + 0.07);
    });
  }

  function playBassNote(ac, now, note, vol = 0.22) {
    const freq = NOTE_FREQ[note] || 82.41;
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const osc2 = ac.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2;
    const g = masterGain(ac, now, vol, 0.35, 0, 'music');
    const g2 = masterGain(ac, now, vol * 0.25, 0.2, 0, 'music');
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
      connectToMix(g, 0, 'music');
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
        connectToMix(g, pan + (j === 1 ? 0.05 : 0), 'music');
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
      connectToMix(g, 0, 'music');
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
    const g = masterGain(ac, now, vol, 0.28, 0, 'music');
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
      connectToMix(g, 0, 'music');
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
      connectToMix(g, i === 0 ? -0.3 : i === 2 ? 0.3 : 0, 'music');
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
    connectToMix(g, 0, 'music');
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
      connectToMix(g, i % 2 === 0 ? -0.4 : 0.4, 'music');
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
      connectToMix(g, -0.15 + i * 0.15, 'music');
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
    const g = masterGain(ac, now, 0.06, 0.14, 0, 'music');
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
