const InstrumentGrips = (() => {
  const HOLD_DEFAULTS = {
    strum: {
      gripL: { x: 56, y: 178 },
      gripR: { x: 130, y: 156 },
      art: { w: 86, h: 108, anchorX: 0.36, anchorY: 0.76 },
      rot: -18,
      depth: 'sandwich',
    },
    keys: {
      gripL: { x: 68, y: 168 },
      gripR: { x: 132, y: 168 },
      art: { w: 118, h: 62, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
      depth: 'sandwich',
    },
    'two-hand': {
      gripL: { x: 72, y: 172 },
      gripR: { x: 128, y: 172 },
      art: { w: 140, h: 94, anchorX: 0.5, anchorY: 0.72 },
      rot: 0,
      depth: 'sandwich',
    },
    'one-hand-up': {
      gripL: { x: 88, y: 168 },
      gripR: { x: 118, y: 142 },
      art: { w: 64, h: 82, anchorX: 0.28, anchorY: 0.55 },
      rot: -24,
      depth: 'sandwich',
    },
  };

  const OVERRIDES = {
    'trash-lid': {
      gripL: { x: 108, y: 152 },
      gripR: { x: 122, y: 142 },
      art: { w: 58, h: 58, anchorX: 0.5, anchorY: 0.62 },
      rot: -10,
    },
    tambourine: {
      gripR: { x: 122, y: 142 },
      art: { w: 50, h: 50, anchorX: 0.5, anchorY: 0.5 },
      rot: 0,
    },
    ukulele: {
      art: { w: 62, h: 78, anchorX: 0.38, anchorY: 0.74 },
      rot: -22,
    },
    'electric-guitar': {
      art: { w: 78, h: 100, anchorX: 0.36, anchorY: 0.76 },
      rot: -18,
    },
    'acoustic-guitar': {
      art: { w: 76, h: 98, anchorX: 0.36, anchorY: 0.76 },
      rot: -20,
    },
    'bass-guitar': {
      art: { w: 80, h: 96, anchorX: 0.36, anchorY: 0.76 },
      rot: -16,
    },
    banjo: {
      art: { w: 60, h: 76, anchorX: 0.4, anchorY: 0.72 },
      rot: -18,
    },
    violin: {
      gripL: { x: 78, y: 162 },
      gripR: { x: 118, y: 148 },
      art: { w: 50, h: 84, anchorX: 0.42, anchorY: 0.68 },
      rot: -26,
    },
    piano: {
      art: { w: 126, h: 74, anchorX: 0.5, anchorY: 0.68 },
      rot: 0,
    },
    keyboard: {
      art: { w: 116, h: 58, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
    },
    organ: {
      art: { w: 106, h: 88, anchorX: 0.5, anchorY: 0.65 },
      rot: 0,
    },
    accordion: {
      gripL: { x: 62, y: 166 },
      gripR: { x: 138, y: 166 },
      art: { w: 104, h: 88, anchorX: 0.5, anchorY: 0.58 },
      rot: 0,
    },
    'synth-lead': {
      art: { w: 112, h: 62, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
    },
    trumpet: {
      art: { w: 66, h: 80, anchorX: 0.22, anchorY: 0.52 },
      rot: -26,
    },
    trombone: {
      art: { w: 70, h: 80, anchorX: 0.22, anchorY: 0.52 },
      rot: -26,
    },
    saxophone: {
      art: { w: 74, h: 88, anchorX: 0.24, anchorY: 0.5 },
      rot: -22,
    },
    flute: {
      gripR: { x: 112, y: 132 },
      art: { w: 30, h: 94, anchorX: 0.5, anchorY: 0.42 },
      rot: -12,
    },
    clarinet: {
      gripR: { x: 110, y: 134 },
      art: { w: 34, h: 94, anchorX: 0.5, anchorY: 0.42 },
      rot: -12,
    },
    harmonica: {
      gripL: { x: 92, y: 152 },
      gripR: { x: 108, y: 148 },
      art: { w: 56, h: 38, anchorX: 0.5, anchorY: 0.55 },
      rot: 0,
    },
    'drum-kit': {
      gripL: { x: 68, y: 178 },
      gripR: { x: 132, y: 178 },
      art: { w: 146, h: 98, anchorX: 0.5, anchorY: 0.78 },
      rot: 0,
      hideSticks: true,
    },
    bongo: {
      art: { w: 66, h: 72, anchorX: 0.5, anchorY: 0.65 },
      rot: 0,
    },
    cowbell: {
      gripR: { x: 120, y: 140 },
      art: { w: 50, h: 58, anchorX: 0.5, anchorY: 0.45 },
      rot: -20,
    },
    triangle: {
      gripR: { x: 124, y: 136 },
      art: { w: 38, h: 72, anchorX: 0.5, anchorY: 0.35 },
      rot: 0,
    },
    xylophone: {
      gripL: { x: 78, y: 168 },
      gripR: { x: 122, y: 168 },
      art: { w: 98, h: 58, anchorX: 0.5, anchorY: 0.62 },
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

  const ART_SCALE = 1.3;

  function mountTransform(grip) {
    const { gripL, art, rot } = grip;
    const w = art.w * ART_SCALE;
    const h = art.h * ART_SCALE;
    const ax = art.anchorX * w;
    const ay = art.anchorY * h;
    return {
      transform: `translate(${gripL.x},${gripL.y}) rotate(${rot}) translate(${-ax},${-ay})`,
      w,
      h,
    };
  }

  return { getGrip, mountTransform, HOLD_DEFAULTS, OVERRIDES };
})();
