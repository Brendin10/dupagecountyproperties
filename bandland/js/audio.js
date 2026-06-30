const AudioEngine = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  function playCrash() {
    const ac = getCtx();
    if (ac.state === 'suspended') ac.resume();

    const now = ac.currentTime;

    // Noise burst for cymbal crash
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

    // Metallic ring
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

  function playCheer() {
    const ac = getCtx();
    if (ac.state === 'suspended') ac.resume();
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
    const ac = getCtx();
    if (ac.state === 'suspended') ac.resume();
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

  return { playCrash, playCheer, playCoin };
})();
