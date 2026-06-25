const BandAudio = (() => {
  let members = [];
  let bpm = 100;
  let running = false;
  let beatCallback = null;

  const ROLE_SOUNDS = {
    Guitar: (ac, now) => {
      const osc = ac.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(196, now);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.04, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    },
    Drums: (ac, now) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.07, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    },
    Keys: (ac, now) => {
      [262, 330, 392].forEach((f, i) => {
        const osc = ac.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = ac.createGain();
        g.gain.setValueAtTime(0, now + i * 0.01);
        g.gain.linearRampToValueAtTime(0.025, now + i * 0.01 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(g);
        g.connect(ac.destination);
        osc.start(now + i * 0.01);
        osc.stop(now + 0.4);
      });
    },
    Vocals: (ac, now) => {
      const len = Math.floor(ac.sampleRate * 0.15);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.08;
      const src = ac.createBufferSource();
      src.buffer = buf;
      const filt = ac.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = 800;
      const g = ac.createGain();
      g.gain.value = 0.35;
      src.connect(filt);
      filt.connect(g);
      g.connect(ac.destination);
      src.start(now);
    },
    Bass: (ac, now) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    },
    Horns: (ac, now) => {
      const osc = ac.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(466, now + 0.08);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.035, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    },
  };

  function getCtx() {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function setBand(bandMembers) {
    members = bandMembers || [];
  }

  function onBeat() {
    if (!running || members.length === 0) return;
    const ac = getCtx();
    const now = ac.currentTime;
    members.forEach((m, i) => {
      const play = ROLE_SOUNDS[m.role];
      if (play) {
        setTimeout(() => play(ac, now + i * 0.03), i * 30);
      }
    });
  }

  function start(bpmVal, externalBeatFn) {
    bpm = bpmVal;
    running = true;
    beatCallback = externalBeatFn;
  }

  function stop() {
    running = false;
  }

  function handleBeat() {
    if (running) onBeat();
    if (beatCallback) beatCallback();
  }

  return { setBand, start, stop, onBeat, handleBeat, get running() { return running; } };
})();
