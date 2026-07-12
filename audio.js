// Splat Run -- zene- es hangmotor
// Sprint 1 kodrendezes: kiemelve a korabbi egyetlen inline <script>-bol.
// A jatek osszes JS fajlja (levels.js, audio.js, physics.js, draw.js, game.js)
// egyazon globalis scope-ban fut (nincs bundler/modul-rendszer), pontosan
// ugy, mint korabban egyetlen (function(){ ... })()-en belul -- csak most
// tobb <script src> tagen keresztul, betoltesi sorrendben.

var audioCtx = null;
var musicOn = true;
var musicTimer = null;
var noiseBuffer = null;
var longNoiseBuffer = null;
var TEMPO = 138;
var BEAT = 60 / TEMPO;

// Retro arcade chiptune (A minor), pulse lead + arpeggio + driving bass.
// Each note: [freq, durationInBeats]. 0 = rest.
var A3 = 220, B3 = 246.94, C4 = 261.63, D4 = 293.66, E4 = 329.63,
    F4 = 349.23, G4 = 392.0, A4 = 440, C5 = 523.25, D5 = 587.33, E5 = 659.25;
var A2 = 110, C3 = 130.81, E3 = 164.81, F3 = 174.61, G3 = 196.0, D3 = 146.83;

var MELODY = [
  [A4, 0.5], [E5, 0.5], [C5, 0.5], [A4, 0.5], [B3, 0.5], [E4, 0.5], [G4, 0.5], [E4, 0.5],
  [C4, 0.5], [E4, 0.5], [A4, 0.5], [C5, 0.5], [B3, 0.5], [G4, 0.5], [E4, 0.5], [D4, 0.5],
  [A4, 0.5], [E5, 0.5], [C5, 0.5], [A4, 0.5], [F4, 0.5], [A4, 0.5], [C5, 0.5], [F4, 0.5],
  [G4, 0.5], [B3, 0.5], [D5, 0.5], [G4, 0.5], [E4, 1], [0, 1]
];

// Arpeggio (fast pulse, adds the "arcade" shimmer)
var ARP = [
  A3, E4, A4, E4, A3, E4, A4, E4, E3, B3, E4, B3, E3, B3, E4, B3,
  F3, C4, F4, C4, F3, C4, F4, C4, G3, D4, G4, D4, G3, D4, G4, D4
];

var BASS = [
  [A2, 1], [A2, 1], [A2, 0.5], [A2, 0.5], [E3, 1],
  [F3, 1], [F3, 1], [C3, 1], [C3, 1],
  [A2, 1], [A2, 1], [A2, 0.5], [A2, 0.5], [E3, 1],
  [G3, 1], [G3, 1], [D3, 1], [E3, 1]
];

var sawSound = null;

function playNote(freq, startTime, duration, type, vol, filterFreq) {
  if (!freq || !audioCtx) return;
  var o = audioCtx.createOscillator();
  var g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, startTime);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.95);
  if (filterFreq) {
    var f = audioCtx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filterFreq;
    o.connect(f);
    f.connect(g);
  } else {
    o.connect(g);
  }
  g.connect(audioCtx.destination);
  o.start(startTime);
  o.stop(startTime + duration);
}

function playKick(startTime) {
  if (!audioCtx) return;
  var o = audioCtx.createOscillator();
  var g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, startTime);
  o.frequency.exponentialRampToValueAtTime(42, startTime + 0.12);
  g.gain.setValueAtTime(0.22, startTime);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.16);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start(startTime);
  o.stop(startTime + 0.16);
}

function ensureNoiseBuffer() {
  if (noiseBuffer) return;
  var size = audioCtx.sampleRate * 0.05;
  noiseBuffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
  var data = noiseBuffer.getChannelData(0);
  for (var i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
}

function playHat(startTime, vol) {
  ensureNoiseBuffer();
  var src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer;
  var filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 6000;
  var g = audioCtx.createGain();
  g.gain.setValueAtTime(vol, startTime);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.05);
  src.connect(filter);
  filter.connect(g);
  g.connect(audioCtx.destination);
  src.start(startTime);
  src.stop(startTime + 0.05);
}

function playSnare(startTime) {
  ensureNoiseBuffer();
  var src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer;
  var filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  var g = audioCtx.createGain();
  g.gain.setValueAtTime(0.12, startTime);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.11);
  src.connect(filter);
  filter.connect(g);
  g.connect(audioCtx.destination);
  src.start(startTime);
  src.stop(startTime + 0.11);
}

// Short "pluck" envelope pulse voice for chiptune lead/arp.
function playPulse(freq, startTime, duration, vol, detune) {
  if (!freq || !audioCtx) return;
  var o = audioCtx.createOscillator();
  var g = audioCtx.createGain();
  o.type = 'square';
  o.frequency.value = freq;
  if (detune) o.detune.value = detune;
  g.gain.setValueAtTime(0.0001, startTime);
  g.gain.exponentialRampToValueAtTime(vol, startTime + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.9);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start(startTime);
  o.stop(startTime + duration);
}

function scheduleMusic() {
  if (!musicOn || !audioCtx) return;
  var t = audioCtx.currentTime + 0.05;
  var startT = t;
  MELODY.forEach(function(n) {
    if (n[0]) {
      playPulse(n[0], t, n[1] * BEAT * 0.92, 0.075);
      playPulse(n[0], t, n[1] * BEAT * 0.92, 0.03, 8);
    }
    t += n[1] * BEAT;
  });
  var totalBeats = 16;
  var ta = startT;
  for (var a = 0; a < ARP.length; a++) {
    playPulse(ARP[a], ta, BEAT * 0.5 * 0.7, 0.035);
    ta += BEAT * 0.5;
  }
  var tb = startT;
  BASS.forEach(function(n) {
    playNote(n[0], tb, n[1] * BEAT * 0.92, 'triangle', 0.14, 400);
    tb += n[1] * BEAT;
  });
  for (var i = 0; i < totalBeats; i++) {
    var beatTime = startT + i * BEAT;
    if (i % 2 === 0) playKick(beatTime);
    else playSnare(beatTime);
    playHat(beatTime + BEAT * 0.5, 0.04);
    playHat(beatTime, 0.025);
  }
  var totalMs = (t - startT) * 1000;
  musicTimer = setTimeout(scheduleMusic, Math.max(100, totalMs - 40));
}

function startMusic() {
  if (!musicOn) return;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return;
    }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  if (!musicTimer) scheduleMusic();
  startSawSound();
}

function stopMusic() {
  musicOn = false;
  clearTimeout(musicTimer);
  musicTimer = null;
  stopSawSound();
}

// --- Furesz-zorej: folyamatos, halk surrogas, ha van furesz a palyan ---
function ensureLongNoiseBuffer() {
  if (longNoiseBuffer) return;
  var size = Math.floor(audioCtx.sampleRate * 1.0);
  longNoiseBuffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
  var data = longNoiseBuffer.getChannelData(0);
  for (var i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
}

function startSawSound() {
  if (!audioCtx || sawSound) return;
  ensureLongNoiseBuffer();
  var src = audioCtx.createBufferSource();
  src.buffer = longNoiseBuffer;
  src.loop = true;
  var bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 3200;
  bp.Q.value = 6;
  var osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 165;
  var oscG = audioCtx.createGain();
  oscG.gain.value = 0.5;
  var g = audioCtx.createGain();
  g.gain.value = 0;
  src.connect(bp);
  bp.connect(g);
  osc.connect(oscG);
  oscG.connect(g);
  g.connect(audioCtx.destination);
  src.start();
  osc.start();
  sawSound = { src: src, osc: osc, gain: g, bp: bp };
}

function stopSawSound() {
  if (!sawSound) return;
  try { sawSound.src.stop(); sawSound.osc.stop(); } catch (e) {}
  sawSound = null;
}

function updateSawSound() {
  if (!sawSound || !audioCtx) return;
  var target = 0;
  if (level && level.saws && level.saws.length && player) {
    var best = 1e9;
    var pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
    level.saws.forEach(function(s) {
      var cx = s._cx !== undefined ? s._cx : s.cx;
      var cy = s._cy !== undefined ? s._cy : s.cy;
      var d = Math.hypot(cx - pcx, cy - pcy);
      if (d < best) best = d;
    });
    var near = Math.max(0, 1 - best / 260);
    target = (0.012 + 0.055 * near) * (running && player.alive ? 1 : 0);
  }
  sawSound.gain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.08);
}

document.getElementById('musicToggle').addEventListener('click', function() {
  if (musicOn) {
    stopMusic();
    document.getElementById('musicToggle').textContent = 'ZENE: KI';
  } else {
    musicOn = true;
    document.getElementById('musicToggle').textContent = 'ZENE: BE';
    startMusic();
  }
});
