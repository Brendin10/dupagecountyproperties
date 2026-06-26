const CharacterRig = (() => {
  const OUTLINE = '#1C1230';

  const HOLD_TO_POSE = {
    strum: 'strum',
    keys: 'keys',
    'two-hand': 'drums',
    'one-hand-up': 'brass',
  };

  const ROLE_TO_HOLD = {
    Guitar: 'strum',
    Bass: 'strum',
    Drums: 'two-hand',
    Keys: 'keys',
    Vocals: 'one-hand-up',
    Horns: 'one-hand-up',
  };

  function poseFromHold(hold) {
    return HOLD_TO_POSE[hold] || 'idle';
  }

  function poseFromInstrument(inst) {
    if (!inst) return 'idle';
    return poseFromHold(inst.hold || 'strum');
  }

  function poseFromRole(role) {
    return poseFromHold(ROLE_TO_HOLD[role] || 'idle');
  }

  function armChain(side, colors, pose, layer, options = {}) {
    const isLeft = side === 'L';
    const sx = isLeft ? 58 : 142;
    const shoulderY = layer === 'back' ? 154 : 148;
    const toward = isLeft ? 1 : -1;
    const fur = colors.fur || '#8E58FF';
    const furLight = colors.furLight || '#BC94FF';
    const hand = colors.hand || '#D2B2FF';
    const poseCls = `rig-pose-${pose}`;

    const stick = pose === 'drums' && !options.hideSticks
      ? `<line class="rig-stick" x1="${isLeft ? 28 : 172}" y1="188" x2="${isLeft ? 18 : 182}" y2="168" stroke="#8B7355" stroke-width="3" stroke-linecap="round"/>
         <ellipse class="rig-stick-tip" cx="${isLeft ? 16 : 184}" cy="166" rx="4" ry="3" fill="#deb887" stroke="${OUTLINE}" stroke-width="1"/>`
      : '';

    return `
      <g class="rig-arm rig-arm-${side} rig-layer-${layer} ${poseCls}" transform="translate(${sx},${shoulderY})">
        <g class="rig-upper-arm">
          <ellipse cx="${12 * toward}" cy="10" rx="17" ry="14" fill="${fur}" stroke="${OUTLINE}" stroke-width="3"/>
        </g>
        <g class="rig-forearm" transform="translate(0,18)">
          <g class="rig-forearm-pose" style="transform-box:fill-box;transform-origin:0 0">
            <ellipse cx="0" cy="14" rx="11" ry="13" fill="${furLight}" stroke="${OUTLINE}" stroke-width="2.5"/>
          </g>
        </g>
        <g class="rig-hand" transform="translate(0,32)">
          <g class="rig-hand-pose" style="transform-box:fill-box;transform-origin:0 0">
            <ellipse cx="0" cy="6" rx="9" ry="8" fill="${hand}" stroke="${OUTLINE}" stroke-width="2"/>
          </g>
        </g>
        ${stick}
      </g>`;
  }

  function renderRiggedArms(colors, pose, layer = 'front', options = {}) {
    return armChain('L', colors, pose, layer, options) + armChain('R', colors, pose, layer, options);
  }

  function bennyColors() {
    return { fur: '#8E58FF', furLight: '#BC94FF', hand: '#D2B2FF' };
  }

  function lizzyColors() {
    return { fur: '#9458FF', furLight: '#C29AFF', hand: '#DAB6FF' };
  }

  function bandmateColors(m) {
    return { fur: m.fur, furLight: m.furLight, hand: m.belly };
  }

  function applyPose(rootEl, pose, phase = 'hit') {
    if (!rootEl) return;
    const poses = ['idle', 'strum', 'keys', 'drums', 'brass'];
    rootEl.querySelectorAll('.rig-arm').forEach((arm) => {
      poses.forEach((p) => arm.classList.remove(`rig-pose-${p}`));
      arm.classList.add(`rig-pose-${pose}`);
      arm.classList.remove('rig-hit', 'rig-hit-alt');
      void arm.offsetWidth;
      if (phase === 'hit') {
        arm.classList.add(arm.classList.contains('rig-arm-L') ? 'rig-hit' : 'rig-hit-alt');
      }
    });
    rootEl.querySelectorAll('.rig-stick').forEach((s) => {
      s.classList.remove('rig-stick-hit');
      void s.offsetWidth;
      if (phase === 'hit' && pose === 'drums') s.classList.add('rig-stick-hit');
    });
  }

  function applyPoseFromInstrument(rootEl, inst, phase = 'hit') {
    applyPose(rootEl, poseFromInstrument(inst), phase);
  }

  function applyPoseFromRole(rootEl, role, phase = 'hit') {
    applyPose(rootEl, poseFromRole(role), phase);
  }

  return {
    poseFromHold,
    poseFromInstrument,
    poseFromRole,
    renderRiggedArms,
    bennyColors,
    lizzyColors,
    bandmateColors,
    applyPose,
    applyPoseFromInstrument,
    applyPoseFromRole,
  };
})();
