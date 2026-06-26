const InstrumentGrips = (() => {
  const PNG_BOOST = {
    'trash-lid': 2.68, tambourine: 2.16, ukulele: 2.02, 'electric-guitar': 2.01,
    'acoustic-guitar': 1.16, 'bass-guitar': 1.14, banjo: 1.25, piano: 2.02,
    keyboard: 2.55, organ: 2.18, trumpet: 2.33, trombone: 2.41, saxophone: 3.4,
    violin: 2.67, flute: 1.6, clarinet: 2.12, harmonica: 2.5, 'synth-lead': 2.42,
    triangle: 2.23, xylophone: 2.56, accordion: 2.54, bongo: 2.51, cowbell: 2.33,
    'drum-kit': 2.22,
  };

  const BOOST_REF = 2.2;

  const HOLD_DEFAULTS = {
    strum: {
      gripL: { x: 68, y: 162 },
      gripR: { x: 132, y: 156 },
      art: { w: 108, h: 136, anchorX: 0.36, anchorY: 0.76 },
      rot: -18,
      layers: { L: 'back', R: 'front' },
      mount: 'L',
    },
    keys: {
      gripL: { x: 72, y: 162 },
      gripR: { x: 128, y: 162 },
      art: { w: 148, h: 78, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
      layers: { L: 'front', R: 'front' },
      mount: 'mid',
    },
    'two-hand': {
      gripL: { x: 72, y: 166 },
      gripR: { x: 128, y: 166 },
      art: { w: 168, h: 112, anchorX: 0.5, anchorY: 0.72 },
      rot: 0,
      layers: { L: 'front', R: 'front' },
      mount: 'mid',
    },
    'one-hand-up': {
      gripL: { x: 78, y: 160 },
      gripR: { x: 112, y: 142 },
      art: { w: 88, h: 108, anchorX: 0.5, anchorY: 0.55 },
      rot: -12,
      layers: { L: 'back', R: 'front' },
      mount: 'R',
    },
  };

  const OVERRIDES = {
    'trash-lid': {
      gripL: { x: 92, y: 148 },
      gripR: { x: 112, y: 138 },
      art: { w: 132, h: 132, anchorX: 0.5, anchorY: 0.52 },
      rot: -6,
      mount: 'R',
    },
    tambourine: {
      gripR: { x: 112, y: 142 },
      art: { w: 76, h: 76, anchorX: 0.5, anchorY: 0.5 },
      rot: 0,
    },
    ukulele: {
      gripL: { x: 66, y: 160 },
      gripR: { x: 128, y: 154 },
      art: { w: 98, h: 120, anchorX: 0.38, anchorY: 0.74 },
      rot: -20,
    },
    'electric-guitar': {
      gripL: { x: 66, y: 160 },
      gripR: { x: 134, y: 154 },
      art: { w: 118, h: 152, anchorX: 0.36, anchorY: 0.76 },
      rot: -18,
    },
    'acoustic-guitar': {
      gripL: { x: 66, y: 160 },
      gripR: { x: 132, y: 154 },
      art: { w: 114, h: 148, anchorX: 0.36, anchorY: 0.76 },
      rot: -20,
    },
    'bass-guitar': {
      gripL: { x: 68, y: 160 },
      gripR: { x: 130, y: 156 },
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
      gripL: { x: 70, y: 164 },
      gripR: { x: 130, y: 164 },
      art: { w: 158, h: 92, anchorX: 0.5, anchorY: 0.68 },
      rot: 0,
      mount: 'mid',
    },
    keyboard: {
      gripL: { x: 72, y: 162 },
      gripR: { x: 128, y: 162 },
      art: { w: 146, h: 72, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
      mount: 'mid',
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
      mount: 'mid',
    },
    'synth-lead': {
      art: { w: 140, h: 78, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
    },
    trumpet: {
      gripR: { x: 108, y: 140 },
      art: { w: 94, h: 112, anchorX: 0.22, anchorY: 0.52 },
      rot: -24,
    },
    trombone: {
      gripR: { x: 106, y: 140 },
      art: { w: 98, h: 112, anchorX: 0.22, anchorY: 0.52 },
      rot: -24,
    },
    saxophone: {
      gripR: { x: 104, y: 138 },
      art: { w: 104, h: 122, anchorX: 0.24, anchorY: 0.5 },
      rot: -20,
    },
    flute: {
      gripR: { x: 108, y: 132 },
      art: { w: 42, h: 128, anchorX: 0.5, anchorY: 0.42 },
      rot: -10,
    },
    clarinet: {
      gripR: { x: 106, y: 132 },
      art: { w: 48, h: 128, anchorX: 0.5, anchorY: 0.42 },
      rot: -10,
    },
    harmonica: {
      gripL: { x: 88, y: 148 },
      gripR: { x: 104, y: 144 },
      art: { w: 78, h: 52, anchorX: 0.5, anchorY: 0.55 },
      rot: 0,
      mount: 'mid',
    },
    'drum-kit': {
      gripL: { x: 68, y: 168 },
      gripR: { x: 132, y: 168 },
      art: { w: 178, h: 118, anchorX: 0.5, anchorY: 0.78 },
      rot: 0,
      hideSticks: true,
      mount: 'mid',
    },
    bongo: {
      art: { w: 88, h: 96, anchorX: 0.5, anchorY: 0.65 },
      rot: 0,
    },
    cowbell: {
      gripR: { x: 114, y: 140 },
      art: { w: 72, h: 82, anchorX: 0.5, anchorY: 0.45 },
      rot: -18,
    },
    triangle: {
      gripR: { x: 116, y: 136 },
      art: { w: 56, h: 102, anchorX: 0.5, anchorY: 0.35 },
      rot: 0,
    },
    xylophone: {
      gripL: { x: 74, y: 164 },
      gripR: { x: 126, y: 164 },
      art: { w: 122, h: 72, anchorX: 0.5, anchorY: 0.62 },
      rot: 0,
      mount: 'mid',
    },
  };

  function mergeLayers(base, over) {
    return { ...base, ...(over || {}) };
  }

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
      layers: mergeLayers(base.layers, over.layers),
      mount: over.mount || base.mount,
      hideSticks: over.hideSticks ?? base.hideSticks ?? false,
    };
  }

  function sidesForLayer(grip, layer) {
    if (!grip?.layers) return ['L', 'R'];
    return ['L', 'R'].filter((side) => grip.layers[side] === layer);
  }

  function mountPoint(grip) {
    const { mount, gripL, gripR } = grip;
    if (mount === 'R') return gripR;
    if (mount === 'mid') {
      return {
        x: Math.round((gripL.x + gripR.x) / 2 * 10) / 10,
        y: Math.round((gripL.y + gripR.y) / 2 * 10) / 10,
      };
    }
    return gripL;
  }

  function pngBoost(instId) {
    return PNG_BOOST[instId] ?? BOOST_REF;
  }

  function mountTransform(grip, instId) {
    const anchor = mountPoint(grip);
    const boost = instId ? pngBoost(instId) / BOOST_REF : 1;
    const w = grip.art.w * boost;
    const h = grip.art.h * boost;
    const ax = grip.art.anchorX * w;
    const ay = grip.art.anchorY * h;
    return {
      transform: `translate(${anchor.x},${anchor.y}) rotate(${grip.rot}) translate(${-ax},${-ay})`,
      w,
      h,
      ax,
      ay,
      boost,
    };
  }

  return {
    getGrip,
    mountTransform,
    mountPoint,
    sidesForLayer,
    pngBoost,
    HOLD_DEFAULTS,
    OVERRIDES,
    PNG_BOOST,
    BOOST_REF,
  };
})();

window.InstrumentGrips = InstrumentGrips;
