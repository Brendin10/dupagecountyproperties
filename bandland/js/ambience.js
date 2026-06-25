const Ambience = (() => {
  let ctx = null;
  let running = false;
  let crowdNode = null;
  let roomNode = null;
  let cheerTimer = null;
  let bandLevel = 0;
  let venueTier = 0;

  function getCtx() {
    return AudioEngine.getCtx();
  }

  function makeNoiseBuffer(ac, dur) {
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  function start(bandMembers = [], venue = {}, crowd = 0) {
    stop();
    const ac = getCtx();
    AudioEngine.resume();
    ctx = ac;
    running = true;
    bandLevel = bandMembers.length;
    venueTier = venue.tier ?? 0;

    const crowdVol = Math.min(0.22, 0.04 + bandLevel * 0.025 + venueTier * 0.004 + crowd * 0.008);
    const roomVol = Math.min(0.12, 0.02 + venueTier * 0.003 + bandLevel * 0.008);

    crowdNode = ac.createBufferSource();
    crowdNode.buffer = makeNoiseBuffer(ac, 4);
    crowdNode.loop = true;
    const crowdFilter = ac.createBiquadFilter();
    crowdFilter.type = 'bandpass';
    crowdFilter.frequency.value = 400 + venueTier * 40;
    crowdFilter.Q.value = 0.4;
    const crowdGain = ac.createGain();
    crowdGain.gain.value = crowdVol;
    crowdNode.connect(crowdFilter);
    crowdFilter.connect(crowdGain);
    AudioEngine.connectAmbience(crowdGain);
    crowdNode.start();

    roomNode = ac.createOscillator();
    roomNode.type = 'sine';
    roomNode.frequency.value = 55 + venueTier * 2;
    const roomGain = ac.createGain();
    roomGain.gain.value = roomVol;
    const roomFilt = ac.createBiquadFilter();
    roomFilt.type = 'lowpass';
    roomFilt.frequency.value = 120;
    roomNode.connect(roomFilt);
    roomFilt.connect(roomGain);
    AudioEngine.connectAmbience(roomGain);
    roomNode.start();

    cheerTimer = setInterval(() => {
      if (!running) return;
      if (Math.random() < 0.08 + bandLevel * 0.04) AudioEngine.playCrowdBurst?.(0.06 + bandLevel * 0.02);
    }, 2800 - bandLevel * 200);
  }

  function update(crowd = 0, bandCount = bandLevel) {
    bandLevel = bandCount;
  }

  function stop() {
    running = false;
    if (cheerTimer) clearInterval(cheerTimer);
    cheerTimer = null;
    try { crowdNode?.stop(); } catch { /* */ }
    try { roomNode?.stop(); } catch { /* */ }
    crowdNode = null;
    roomNode = null;
  }

  return { start, stop, update };
})();
