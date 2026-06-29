const InstrumentGrips = (() => {
  const PNG_BOOST = {
    drums: 2.22,
    bass: 1.14,
    'electric-guitar': 2.01,
    keys: 2.02,
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
  };

  const OVERRIDES = {
    drums: {
      gripL: { x: 64, y: 172 },
      gripR: { x: 136, y: 172 },
      art: { w: 178, h: 118, anchorX: 0.5, anchorY: 0.78 },
      rot: 0,
      hideSticks: true,
    },
    bass: {
      art: { w: 114, h: 136, anchorX: 0.36, anchorY: 0.76 },
      rot: -16,
    },
    'electric-guitar': {
      art: { w: 118, h: 152, anchorX: 0.36, anchorY: 0.76 },
      rot: -18,
    },
    keys: {
      art: { w: 158, h: 92, anchorX: 0.5, anchorY: 0.68 },
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
