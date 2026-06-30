#!/usr/bin/env node
/**
 * Generates short procedural WAV samples for Bandland hybrid audio.
 * CC0 — synthesized in-repo, no external assets.
 */
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'bandland/audio/instruments');
const SR = 44100;

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SR, 24);
  buffer.writeUInt32LE(SR * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767), 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

function env(len, attack, decay) {
  return Array.from({ length: len }, (_, i) => {
    const t = i / len;
    if (t < attack) return t / attack;
    return Math.exp(-((t - attack) / decay) * 6);
  });
}

function mix(...tracks) {
  const len = Math.max(...tracks.map((t) => t.length));
  const out = new Float64Array(len);
  for (const tr of tracks) {
    for (let i = 0; i < tr.length; i++) out[i] += tr[i];
  }
  return Array.from(out);
}

function sine(freq, dur, vol = 1, phase = 0) {
  const n = Math.floor(SR * dur);
  return Array.from({ length: n }, (_, i) => vol * Math.sin(2 * Math.PI * freq * (i / SR) + phase));
}

function noise(dur, vol = 1) {
  const n = Math.floor(SR * dur);
  return Array.from({ length: n }, () => (Math.random() * 2 - 1) * vol);
}

function applyEnv(samples, attack = 0.01, decay = 0.2) {
  const e = env(samples.length, attack, decay);
  return samples.map((s, i) => s * e[i]);
}

function strumSample(freqs, dur = 0.55) {
  const tracks = freqs.map((f, i) => applyEnv(sine(f, dur, 0.35 / freqs.length, i * 0.2), 0.002, 0.35));
  const buzz = applyEnv(noise(dur, 0.04), 0.001, 0.08);
  return mix(...tracks, buzz);
}

function kickSample() {
  const n = Math.floor(SR * 0.35);
  return Array.from({ length: n }, (_, i) => {
    const t = i / SR;
    const freq = 150 * Math.exp(-t * 12);
    const e = Math.exp(-t * 8);
    return e * Math.sin(2 * Math.PI * freq * t) * 0.9;
  });
}

function snareSample() {
  const tone = applyEnv(sine(180, 0.12, 0.4), 0.001, 0.06);
  const snap = applyEnv(noise(0.15, 0.55), 0.001, 0.05);
  return mix(tone, snap);
}

function hihatSample() {
  return applyEnv(noise(0.08, 0.35), 0.001, 0.04);
}

function pianoSample() {
  const freqs = [261.63, 329.63, 392.0];
  const tracks = freqs.map((f) => applyEnv(sine(f, 0.9, 0.25), 0.003, 0.5));
  return mix(...tracks);
}

function brassSample() {
  const f = 440;
  const harm = [1, 2, 3].map((h) => applyEnv(sine(f * h, 0.35, 0.2 / h), 0.02, 0.15));
  return mix(...harm);
}

function cymbalSample() {
  return applyEnv(noise(0.6, 0.5), 0.002, 0.35);
}

const samples = {
  'electric-strum.wav': () => strumSample([82.41, 123.47, 164.81]),
  'acoustic-strum.wav': () => strumSample([73.42, 110.0, 146.83]),
  'ukulele-strum.wav': () => strumSample([261.63, 329.63, 392.0, 523.25]),
  'bass-pluck.wav': () => applyEnv(sine(55, 0.4, 0.7), 0.005, 0.25),
  'piano-chord.wav': pianoSample,
  'keyboard-chord.wav': pianoSample,
  'organ-chord.wav': () => mix(applyEnv(sine(130.81, 0.8, 0.3), 0.02, 0.4), applyEnv(sine(196, 0.8, 0.2), 0.02, 0.4)),
  'drum-kick.wav': kickSample,
  'drum-snare.wav': snareSample,
  'drum-hihat.wav': hihatSample,
  'brass-note.wav': brassSample,
  'sax-note.wav': () => applyEnv(sine(311, 0.45, 0.35), 0.03, 0.2),
  'cymbal-hit.wav': cymbalSample,
  'shake.wav': () => applyEnv(noise(0.2, 0.25), 0.01, 0.1),
  'bell-hit.wav': () => applyEnv(sine(880, 0.5, 0.4), 0.002, 0.3),
};

for (const [name, fn] of Object.entries(samples)) {
  writeWav(path.join(OUT, name), fn());
  console.log('wrote', name);
}

// Crowd samples (minimal procedural ambience)
const crowdDir = path.join(process.cwd(), 'bandland/audio');
fs.mkdirSync(crowdDir, { recursive: true });

function crowdWav(dur, cheer = true) {
  const n = Math.floor(SR * dur);
  return Array.from({ length: n }, (_, i) => {
    const t = i / SR;
    const mod = cheer ? 0.5 + 0.5 * Math.sin(t * 3) : 0.4 + 0.3 * Math.sin(t * 5);
    return (Math.random() * 2 - 1) * 0.15 * mod * Math.exp(-t * 0.15);
  });
}

writeWav(path.join(crowdDir, 'crowd-cheer.wav'), crowdWav(4, true));
writeWav(path.join(crowdDir, 'crowd-boo.wav'), crowdWav(3, false));
console.log('wrote crowd wav placeholders');
