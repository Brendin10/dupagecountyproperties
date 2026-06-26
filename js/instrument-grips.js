const InstrumentGrips = (() => {
  const PNG_BOOST = {
    'trash-lid': 2.68, tambourine: 2.16, ukulele: 2.02, 'electric-guitar': 2.01,
    'acoustic-guitar': 1.16, 'bass-guitar': 1.14, banjo: 1.25, piano: 2.02,
    keyboard: 2.55, organ: 2.18, trumpet: 2.33, trombone: 2.41, saxophone: 3.4,
    violin: 2.67, flute: 1.6, clarinet: 2.12, harmonica: 2.5, 'synth-lead': 2.42,
    triangle: 2.23, xylophone: 2.56, accordion: 2.54, bongo: 2.51, cowbell: 2.33,
    'drum-kit': 2.22,
  };

  const HOLD_DEFAULTS = {
    strum: {
      gripL: { x: 52, y: 172 },
      gripR: { x: 132, y: 158 },
      art: { w: 108, h: 136, anchorX: 0.36, anchorY: 0.76 },
      rot: -18,
      depth: 'sandwich',
    },
    keys: {
      gripL: { x: 64, y: 164 },
      gripR: { x: 136, y: 164 },
      art: { w: 148, h: 78, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
      depth: 'sandwich',
    },
    'two-hand': {
      gripL: { x: 68, y: 168 },
      gripR: { x: 132, y: 168 },
      art: { w: 168, h: 112, anchorX: 0.5, anchorY: 0.72 },
      rot: 0,
      depth: 'sandwich',
    },
    'one-hand-up': {
      gripL: { x: 84, y: 158 },
      gripR: { x: 116, y: 136 },
      art: { w: 88, h: 108, anchorX: 0.28, anchorY: 0.55 },
      rot: -22,
      depth: 'sandwich',
    },
  };

  const OVERRIDES = {
    'trash-lid': {
      gripL: { x: 98, y: 136 },
      gripR: { x: 118, y: 128 },
      art: { w: 140, h: 140, anchorX: 0.5, anchorY: 0.55 },
      rot: -4,
    },
    tambourine: {
      gripR: { x: 118, y: 136 },
      art: { w: 78, h: 78, anchorX: 0.5, anchorY: 0.5 },
      rot: 0,
    },
    ukulele: {
      art: { w: 96, h: 118, anchorX: 0.38, anchorY: 0.74 },
      rot: -22,
    },
    'electric-guitar': {
      art: { w: 118, h: 152, anchorX: 0.36, anchorY: 0.76 },
      rot: -18,
    },
    'acoustic-guitar': {
      art: { w: 114, h: 148, anchorX: 0.36, anchorY: 0.76 },
      rot: -20,
    },
    'bass-guitar': {
      art: { w: 114, h: 136, anchorX: 0.36, anchorY: 0.76 },
      rot: -16,
    },
    banjo: {
      art: { w: 88, h: 112, anchorX: 0.4, anchorY: 0.72 },
      rot: -18,
    },
    violin: {
      gripL: { x: 74, y: 158 },
      gripR: { x: 114, y: 144 },
      art: { w: 72, h: 118, anchorX: 0.42, anchorY: 0.68 },
      rot: -26,
    },
    piano: {
      art: { w: 158, h: 92, anchorX: 0.5, anchorY: 0.68 },
      rot: 0,
    },
    keyboard: {
      art: { w: 146, h: 72, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
    },
    organ: {
      art: { w: 134, h: 110, anchorX: 0.5, anchorY: 0.65 },
      rot: 0,
    },
    accordion: {
      gripL: { x: 58, y: 162 },
      gripR: { x: 142, y: 162 },
      art: { w: 132, h: 110, anchorX: 0.5, anchorY: 0.58 },
      rot: 0,
    },
    'synth-lead': {
      art: { w: 140, h: 78, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
    },
    trumpet: {
      art: { w: 94, h: 112, anchorX: 0.22, anchorY: 0.52 },
      rot: -26,
    },
    trombone: {
      art: { w: 98, h: 112, anchorX: 0.22, anchorY: 0.52 },
      rot: -26,
    },
    saxophone: {
      art: { w: 104, h: 122, anchorX: 0.24, anchorY: 0.5 },
      rot: -22,
    },
    flute: {
      gripR: { x: 108, y: 128 },
      art: { w: 42, h: 128, anchorX: 0.5, anchorY: 0.42 },
      rot: -12,
    },
    clarinet: {
      gripR: { x: 106, y: 130 },
      art: { w: 48, h: 128, anchorX: 0.5, anchorY: 0.42 },
      rot: -12,
    },
    harmonica: {
      gripL: { x: 88, y: 148 },
      gripR: { x: 104, y: 144 },
      art: { w: 78, h: 52, anchorX: 0.5, anchorY: 0.55 },
      rot: 0,
    },
    'drum-kit': {
      gripL: { x: 64, y: 172 },
      gripR: { x: 136, y: 172 },
      art: { w: 178, h: 118, anchorX: 0.5, anchorY: 0.78 },
      rot: 0,
      hideSticks: true,
    },
    bongo: {
      art: { w: 88, h: 96, anchorX: 0.5, anchorY: 0.65 },
      rot: 0,
    },
    cowbell: {
      gripR: { x: 116, y: 136 },
      art: { w: 72, h: 82, anchorX: 0.5, anchorY: 0.45 },
      rot: -20,
    },
    triangle: {
      gripR: { x: 120, y: 132 },
      art: { w: 56, h: 102, anchorX: 0.5, anchorY: 0.35 },
      rot: 0,
    },
    xylophone: {
      gripL: { x: 74, y: 164 },
      gripR: { x: 126, y: 164 },
      art: { w: 122, h: 72, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
    },
  };

  function getGrip(inst) {
    if (!inst) return null;
    const hold = inst.hold || 'strum';
    const base = HOLD_DEFAULTS[hold] || HOLD_DEFAULTS.strum;
    const over = OVERRIDES[inst.id] || {};
    return {
      hold,
      gripL: over.gripL || base.gripL,
      gripR: over.gripR || base.gripR,
      art: { ...base.art, ...(over.art || {}) },
      rot: over.rot ?? base.rot,
      depth: over.depth || base.depth,
      hideSticks: over.hideSticks ?? base.hideSticks ?? false,
    };
  }

  function pngBoost(instId) {
    return PNG_BOOST[instId] ?? 2.2;
  }

  function mountTransform(grip) {
    const { gripL, art, rot } = grip;
    const w = art.w;
    const h = art.h;
    const ax = art.anchorX * w;
    const ay = art.anchorY * h;
    return {
      transform: `translate(${gripL.x},${gripL.y}) rotate(${rot}) translate(${-ax},${-ay})`,
      w,
      h,
    };
  }

  return { getGrip, mountTransform, pngBoost, HOLD_DEFAULTS, OVERRIDES, PNG_BOOST };
})();
