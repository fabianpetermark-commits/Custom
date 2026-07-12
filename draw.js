// Splat Run -- rajzolas (canvas)
// Sprint 1 kodrendezes: kiemelve a korabbi egyetlen inline <script>-bol.
// A jatek osszes JS fajlja (levels.js, audio.js, physics.js, draw.js, game.js)
// egyazon globalis scope-ban fut (nincs bundler/modul-rendszer), pontosan
// ugy, mint korabban egyetlen (function(){ ... })()-en belul -- csak most
// tobb <script src> tagen keresztul, betoltesi sorrendben.

function drawDog(x, y, w, h, facing) {
  var black = '#211f1e';
  var tan = '#b8752f';
  var white = '#f4f1e6';

  ctx.save();
  var cx = x + w / 2;
  ctx.translate(cx, 0);
  ctx.scale(facing, 1);
  ctx.translate(-cx, 0);

  // ---- TAIL (tollas, felfele-hatra kunkorodo) ----
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(x - 1, y + h * 0.46);
  ctx.quadraticCurveTo(x - 10, y + h * 0.30, x - 9, y + h * 0.08);
  ctx.quadraticCurveTo(x - 12, y - h * 0.02, x - 6, y + h * 0.02);
  ctx.quadraticCurveTo(x - 5, y + h * 0.22, x + 2, y + h * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = tan;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + h * 0.14);
  ctx.quadraticCurveTo(x - 10, y + h * 0.04, x - 6, y + h * 0.04);
  ctx.quadraticCurveTo(x - 6, y + h * 0.1, x - 8, y + h * 0.14);
  ctx.fill();

  // ---- HATSO LABAK ----
  ctx.fillStyle = tan;
  ctx.fillRect(x + w * 0.14, y + h * 0.74, w * 0.16, h * 0.22);
  ctx.fillStyle = white;
  ctx.fillRect(x + w * 0.14, y + h * 0.90, w * 0.16, h * 0.08);

  // ---- TEST (nyujtottabb, futosabb sziluett) ----
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.46, y + h * 0.60, w * 0.56, h * 0.27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tan;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.38, y + h * 0.5, w * 0.32, h * 0.13, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // ---- ELSO LABAK ----
  ctx.fillStyle = tan;
  ctx.fillRect(x + w * 0.66, y + h * 0.76, w * 0.16, h * 0.22);
  ctx.fillStyle = white;
  ctx.fillRect(x + w * 0.66, y + h * 0.92, w * 0.16, h * 0.06);

  // ---- MELLKAS-GALLAR (feher "ruff") ----
  ctx.fillStyle = white;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.42, y + h * 0.42);
  ctx.quadraticCurveTo(x + w * 0.30, y + h * 0.5, x + w * 0.34, y + h * 0.66);
  ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.80, x + w * 0.5, y + h * 0.78);
  ctx.quadraticCurveTo(x + w * 0.58, y + h * 0.66, x + w * 0.56, y + h * 0.5);
  ctx.quadraticCurveTo(x + w * 0.52, y + h * 0.4, x + w * 0.42, y + h * 0.42);
  ctx.closePath();
  ctx.fill();

  // ---- FEJ ----
  var headCx = x + w * 0.66, headCy = y + h * 0.18, headR = w * 0.30;
  ctx.fillStyle = tan;
  ctx.beginPath();
  ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.ellipse(headCx - headR * 0.25, headCy - headR * 0.45, headR * 0.85, headR * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- POFA (elorenyulo, jellegzetes sheltie orr) ----
  ctx.fillStyle = tan;
  ctx.beginPath();
  ctx.moveTo(headCx + headR * 0.5, headCy - headR * 0.12);
  ctx.lineTo(x + w * 1.14, headCy + headR * 0.18);
  ctx.lineTo(headCx + headR * 0.35, headCy + headR * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = white;
  ctx.beginPath();
  ctx.moveTo(headCx + headR * 0.55, headCy - headR * 0.06);
  ctx.lineTo(x + w * 1.1, headCy + headR * 0.15);
  ctx.lineTo(headCx + headR * 0.5, headCy + headR * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.ellipse(x + w * 1.12, headCy + headR * 0.2, 1.7, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- FULEK (hegyes, csucsuk elorehajlik) ----
  function ear(baseX, baseY, tipX, tipY, foldX, foldY) {
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(foldX, foldY);
    ctx.closePath();
    ctx.fill();
  }
  ear(headCx - headR * 0.55, headCy - headR * 0.55,
      headCx - headR * 0.95, headCy - headR * 1.55,
      headCx - headR * 0.1, headCy - headR * 0.75);
  ear(headCx + headR * 0.35, headCy - headR * 0.7,
      headCx + headR * 0.55, headCy - headR * 1.7,
      headCx + headR * 0.95, headCy - headR * 0.55);
  ctx.fillStyle = tan;
  ctx.beginPath();
  ctx.moveTo(headCx - headR * 0.5, headCy - headR * 0.65);
  ctx.lineTo(headCx - headR * 0.72, headCy - headR * 1.15);
  ctx.lineTo(headCx - headR * 0.2, headCy - headR * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(headCx + headR * 0.42, headCy - headR * 0.85);
  ctx.lineTo(headCx + headR * 0.58, headCy - headR * 1.3);
  ctx.lineTo(headCx + headR * 0.82, headCy - headR * 0.7);
  ctx.closePath();
  ctx.fill();

  // ---- FEHER ARC-FOLT ----
  ctx.fillStyle = white;
  ctx.beginPath();
  ctx.ellipse(headCx + headR * 0.15, headCy + headR * 0.45, headR * 0.5, headR * 0.4, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // ---- SZEM ----
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.ellipse(headCx + headR * 0.28, headCy + headR * 0.02, 1.8, 2.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = white;
  ctx.beginPath();
  ctx.arc(headCx + headR * 0.32, headCy - headR * 0.05, 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSpikeStar(cx, cy, R) {
  var rainforest = level.theme === 'rainforest';
  var petal = rainforest ? '#e8e2cc' : '#f4f1e6';
  var petalEdge = rainforest ? '#b8b092' : '#c9c2ab';
  var core = '#c81e2e';
  var coreEdge = '#8a1420';

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + R * 0.9, R * 0.9, R * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  for (var k = 0; k < 8; k++) {
    var ang = k * Math.PI / 4;
    var len = (k % 2 === 0) ? R : R * 0.82;
    var halfW = R * 0.22;
    var tx = cx + Math.cos(ang) * len;
    var ty = cy + Math.sin(ang) * len;
    var px = Math.cos(ang + Math.PI / 2) * halfW;
    var py = Math.sin(ang + Math.PI / 2) * halfW;
    ctx.fillStyle = petal;
    ctx.beginPath();
    ctx.moveTo(cx + px, cy + py);
    ctx.quadraticCurveTo(cx + px * 0.4 + (tx - cx) * 0.55, cy + py * 0.4 + (ty - cy) * 0.55, tx, ty);
    ctx.quadraticCurveTo(cx - px * 0.4 + (tx - cx) * 0.55, cy - py * 0.4 + (ty - cy) * 0.55, cx - px, cy - py);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = petalEdge;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = coreEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(cx - R * 0.14, cy - R * 0.14, R * 0.14, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpikeShape(s) {
  var count = Math.max(1, Math.round(s.w / 26));
  var segW = s.w / count;
  var R = Math.min(13, segW * 0.48);
  for (var i = 0; i < count; i++) {
    var cx = s.x + i * segW + segW / 2;
    var cy = s.y + s.h - R;
    drawSpikeStar(cx, cy, R);
  }
}

function drawIcicle(ic) {
  if (ic._st === 'gone') return;
  var yy = ic._st === 'fall' ? ic._fy : ic.y;
  var wobble = ic._st === 'shake' ? Math.sin(ic._t * 1.3) * 1.6 : 0;
  var cx = ic.x + ic.w / 2 + wobble;
  ctx.fillStyle = 'rgba(198,228,252,0.92)';
  ctx.beginPath();
  ctx.moveTo(ic.x + wobble, yy);
  ctx.lineTo(ic.x + ic.w + wobble, yy);
  ctx.lineTo(cx + ic.w * 0.12, yy + ic.h * 0.55);
  ctx.lineTo(cx, yy + ic.h);
  ctx.lineTo(cx - ic.w * 0.12, yy + ic.h * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,170,215,0.9)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.moveTo(cx - ic.w * 0.2, yy + 2);
  ctx.lineTo(cx - ic.w * 0.08, yy + ic.h * 0.6);
  ctx.stroke();
}

function drawSpring(sp) {
  var compress = sp._anim > 0 ? sp._anim / 12 : 0;
  if (sp._anim > 0) sp._anim -= 1;
  var padH = 4;
  var bodyH = (sp.h - padH) * (1 - compress * 0.5);
  var topY = sp.y + sp.h - padH - bodyH;
  ctx.strokeStyle = '#8a95a5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  var coils = 3;
  for (var i = 0; i <= coils; i++) {
    var cy2 = sp.y + sp.h - (bodyH * i / coils);
    var cx2 = sp.x + (i % 2 === 0 ? 4 : sp.w - 4);
    if (i === 0) ctx.moveTo(sp.x + sp.w / 2, sp.y + sp.h);
    ctx.lineTo(cx2, cy2);
  }
  ctx.stroke();
  ctx.fillStyle = '#c8323e';
  ctx.fillRect(sp.x, topY - padH, sp.w, padH + 2);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(sp.x, topY - padH, sp.w, 2);
  ctx.fillStyle = '#5a6472';
  ctx.fillRect(sp.x - 2, sp.y + sp.h - 2, sp.w + 4, 3);
}

function drawIceCrystal(tx, ty) {
  var pulse = 0.6 + 0.25 * Math.sin(frameCount * 0.05 + tx);
  var glow = ctx.createRadialGradient(tx, ty, 2, tx, ty, 26 + pulse * 6);
  glow.addColorStop(0, 'rgba(150,220,255,' + (0.35 * pulse) + ')');
  glow.addColorStop(1, 'rgba(100,180,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(tx, ty, 26 + pulse * 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(205,240,255,0.95)';
  ctx.beginPath();
  ctx.moveTo(tx, ty - 9);
  ctx.lineTo(tx + 5, ty);
  ctx.lineTo(tx, ty + 9);
  ctx.lineTo(tx - 5, ty);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,180,230,0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawIceBackground() {
  var ww = level.worldW, wh = level.worldH;
  var grad = ctx.createLinearGradient(0, 0, 0, wh);
  grad.addColorStop(0, '#0d1626');
  grad.addColorStop(0.45, '#14263e');
  grad.addColorStop(1, '#0a1220');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ww, wh);

  var blockW = 56, blockH = 30;
  var rows = Math.ceil(wh / blockH) + 1;
  for (var row = 0; row < rows; row++) {
    var offset = (row % 2 === 0) ? 0 : blockW / 2;
    for (var bx = -blockW; bx < ww + blockW; bx += blockW) {
      var x = bx + offset;
      var seed = Math.sin(row * 12.9898 + x * 78.233) * 43758.5453;
      var shade = seed - Math.floor(seed);
      var b = 30 + shade * 14;
      ctx.fillStyle = 'rgb(' + Math.round(b * 0.55) + ',' + Math.round(b + 14) + ',' + Math.round(b + 34) + ')';
      ctx.fillRect(x + 1, row * blockH + 1, blockW - 2, blockH - 2);
      ctx.fillStyle = 'rgba(190,230,255,0.06)';
      ctx.fillRect(x + 1, row * blockH + 1, blockW - 2, 4);
    }
  }

  for (var i = 0; i < 34; i++) {
    var speed = 0.35 + (i % 3) * 0.22;
    var fy = ((i * 61.7 + frameCount * speed) % (wh + 12)) - 6;
    var fx = ((i * 137.5) % ww) + Math.sin(frameCount * 0.02 + i * 1.7) * 9;
    var fr = 1 + (i % 3) * 0.55;
    ctx.fillStyle = 'rgba(225,240,255,' + (0.25 + (i % 4) * 0.12) + ')';
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();
  }

  var vgrad = ctx.createLinearGradient(0, 0, 0, wh);
  vgrad.addColorStop(0, 'rgba(0,0,10,0.5)');
  vgrad.addColorStop(0.3, 'rgba(0,0,10,0.1)');
  vgrad.addColorStop(0.75, 'rgba(0,0,10,0.15)');
  vgrad.addColorStop(1, 'rgba(0,0,10,0.55)');
  ctx.fillStyle = vgrad;
  ctx.fillRect(0, 0, ww, wh);
}

function drawSaw(s) {
  var cx = s._cx !== undefined ? s._cx : s.cx;
  var cy = s._cy !== undefined ? s._cy : s.cy;
  var rainforest = level.theme === 'rainforest';
  var teeth = 8;
  ctx.fillStyle = rainforest ? '#6e4a24' : '#c9c9d4';
  ctx.beginPath();
  for (var i = 0; i < teeth * 2; i++) {
    var ang = (Math.PI * 2 * i) / (teeth * 2);
    var rad = i % 2 === 0 ? s.r : s.r * 0.65;
    var px = cx + Math.cos(ang + frameCount * 0.15) * rad;
    var py = cy + Math.sin(ang + frameCount * 0.15) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rainforest ? '#3e2a14' : '#7a7a86';
  ctx.beginPath();
  ctx.arc(cx, cy, s.r * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlade(b) {
  var x = b._x !== undefined ? b._x : b.x;
  var y = b._y !== undefined ? b._y : b.y;
  ctx.fillStyle = '#c9c9d4';
  ctx.fillRect(x, y, b.w, b.h - 10);
  ctx.beginPath();
  ctx.moveTo(x, y + b.h - 10);
  ctx.lineTo(x + b.w / 2, y + b.h);
  ctx.lineTo(x + b.w, y + b.h - 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5a5a64';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + b.w / 2, 0);
  ctx.lineTo(x + b.w / 2, y);
  ctx.stroke();
}

function drawMosquitoSwarm(m) {
  var cx = m._x !== undefined ? m._x : m.x;
  var cy = m._y !== undefined ? m._y : m.y;
  var dotCount = 9;
  for (var i = 0; i < dotCount; i++) {
    var jx = Math.sin(frameCount * (0.18 + i * 0.013) + i * 2.1) * m.r * 0.6;
    var jy = Math.cos(frameCount * (0.21 + i * 0.011) + i * 1.7) * m.r * 0.5;
    var dotR = 1.1 + (i % 3) * 0.5;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(18,18,20,0.85)' : 'rgba(40,40,44,0.7)';
    ctx.beginPath();
    ctx.arc(cx + jx, cy + jy, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPendulum(p) {
  var bx = p._x !== undefined ? p._x : p.anchorX;
  var by = p._y !== undefined ? p._y : p.anchorY + p.length;

  ctx.fillStyle = '#4a4438';
  ctx.beginPath();
  ctx.ellipse(p.anchorX, p.anchorY - 3, 16, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#332e26';
  ctx.beginPath();
  ctx.ellipse(p.anchorX - 5, p.anchorY - 4, 4, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(p.anchorX + 6, p.anchorY - 2, 3, 2.4, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3c5a2a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  var steps = 10;
  for (var i = 0; i <= steps; i++) {
    var tt = i / steps;
    var vx = p.anchorX + (bx - p.anchorX) * tt + Math.sin(tt * Math.PI * 4) * 2.5;
    var vy = p.anchorY + (by - p.anchorY) * tt;
    if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
  }
  ctx.stroke();
  ctx.fillStyle = '#4a7a34';
  for (var j = 1; j < steps; j += 2) {
    var tj = j / steps;
    var lx = p.anchorX + (bx - p.anchorX) * tj;
    var ly = p.anchorY + (by - p.anchorY) * tj;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + 5, ly - 2);
    ctx.lineTo(lx + 1, ly + 3);
    ctx.closePath();
    ctx.fill();
  }

  var podTheme = level.theme === 'rainforest';
  var spikeCount = 8;
  ctx.fillStyle = podTheme ? '#8a6a3a' : '#c9c9d4';
  for (var i2 = 0; i2 < spikeCount; i2++) {
    var ang = (Math.PI * 2 * i2) / spikeCount;
    var innerX = bx + Math.cos(ang) * p.r * 0.6;
    var innerY = by + Math.sin(ang) * p.r * 0.6;
    var tipX = bx + Math.cos(ang) * p.r * 1.6;
    var tipY = by + Math.sin(ang) * p.r * 1.6;
    var perpX = Math.cos(ang + Math.PI / 2) * 3;
    var perpY = Math.sin(ang + Math.PI / 2) * 3;
    ctx.beginPath();
    ctx.moveTo(innerX + perpX, innerY + perpY);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(innerX - perpX, innerY - perpY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = podTheme ? '#5a3a1a' : '#8a1a2a';
  ctx.beginPath();
  ctx.arc(bx, by, p.r * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawLadder(l) {
  ctx.strokeStyle = '#b98a4a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(l.x + 2, l.y);
  ctx.lineTo(l.x + 2, l.y + l.h);
  ctx.moveTo(l.x + l.w - 2, l.y);
  ctx.lineTo(l.x + l.w - 2, l.y + l.h);
  ctx.stroke();
  ctx.lineWidth = 2;
  for (var yy = l.y + 6; yy < l.y + l.h; yy += 14) {
    ctx.beginPath();
    ctx.moveTo(l.x + 2, yy);
    ctx.lineTo(l.x + l.w - 2, yy);
    ctx.stroke();
  }
}

function drawWall(w) {
  var grad = ctx.createLinearGradient(w.x, 0, w.x + w.w, 0);
  grad.addColorStop(0, 'rgba(90,80,60,0.55)');
  grad.addColorStop(0.5, 'rgba(140,125,95,0.7)');
  grad.addColorStop(1, 'rgba(90,80,60,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(w.x, w.y, w.w, w.h);
  ctx.strokeStyle = 'rgba(40,35,25,0.6)';
  ctx.lineWidth = 1;
  for (var yy = w.y + 8; yy < w.y + w.h; yy += 16) {
    ctx.beginPath();
    ctx.moveTo(w.x + 2, yy);
    ctx.lineTo(w.x + w.w - 2, yy - 4);
    ctx.stroke();
  }
}

function rockJagPath(r, seed, step) {
  // szabalytalan, "eros sziklat" ado korvonal a sima teglalap helyett
  var pts = [];
  var jag = Math.min(7, step * 0.4);
  function push(x, y, nx, ny, idx) {
    var j = (Math.sin(idx * 12.9898 + seed * 78.233) * 43758.5453);
    j = (j - Math.floor(j)) * jag;
    pts.push([x + nx * j, y + ny * j]);
  }
  var idx = 0;
  for (var x = r.x; x < r.x + r.w; x += step) push(x, r.y, 0, -1, idx++);
  push(r.x + r.w, r.y, 0, -1, idx++);
  for (var y = r.y; y < r.y + r.h; y += step) push(r.x + r.w, y, 1, 0, idx++);
  push(r.x + r.w, r.y + r.h, 1, 0, idx++);
  for (var x2 = r.x + r.w; x2 > r.x; x2 -= step) push(x2, r.y + r.h, 0, 1, idx++);
  push(r.x, r.y + r.h, 0, 1, idx++);
  for (var y2 = r.y + r.h; y2 > r.y; y2 -= step) push(r.x, y2, -1, 0, idx++);
  return pts;
}

function drawRock(r) {
  if (r._seed === undefined) r._seed = Math.random() * 1000;
  var seed = r._seed;
  var icy = level.theme === 'ice';
  var castle = level.theme === 'castle';
  var base = icy ? [58, 108, 150] : (castle ? [104, 92, 74] : [24, 20, 17]);
  var baseLite = icy ? [110, 172, 212] : (castle ? [162, 148, 122] : [52, 44, 36]);
  var edge = icy ? [210, 240, 255] : (castle ? [46, 38, 28] : [8, 6, 5]);

  var pts = rockJagPath(r, seed, 14);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.clip();

  var grad = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
  grad.addColorStop(0, 'rgb(' + baseLite[0] + ',' + baseLite[1] + ',' + baseLite[2] + ')');
  grad.addColorStop(1, 'rgb(' + base[0] + ',' + base[1] + ',' + base[2] + ')');
  ctx.fillStyle = grad;
  ctx.fillRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);

  ctx.fillStyle = icy ? 'rgba(230,248,255,0.16)' : 'rgba(0,0,0,0.28)';
  var speckCount = Math.max(8, Math.round((r.w * r.h) / 700));
  for (var s = 0; s < speckCount; s++) {
    var sx = r.x + ((s * 53 + seed * 971) % Math.max(1, r.w - 4)) + 2;
    var sy = r.y + ((s * 37 + seed * 613) % Math.max(1, r.h - 4)) + 2;
    var sr = 1.5 + ((s * 7) % 4);
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(' + edge[0] + ',' + edge[1] + ',' + edge[2] + ',0.85)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1]);
  ctx.closePath();
  ctx.stroke();

  if (icy) {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.stroke();
  }
}

function drawGoal(g) {
  var cx = g.x + g.w / 2, cy = g.y + g.h / 2;
  var pulse = 0.6 + 0.4 * Math.sin(frameCount * 0.07);
  var glowColor = level.theme === 'ice' ? '150,220,255' : (level.theme === 'rainforest' ? '160,255,140' : '255,220,90');
  var glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, g.w * 1.1 + pulse * 6);
  glow.addColorStop(0, 'rgba(' + glowColor + ',' + (0.4 * pulse) + ')');
  glow.addColorStop(1, 'rgba(' + glowColor + ',0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, g.w * 1.1 + pulse * 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(' + glowColor + ',0.9)';
  ctx.lineWidth = 2;
  ctx.strokeRect(g.x + 2, g.y + 2, g.w - 4, g.h - 4);

  ctx.fillStyle = '#8a7248';
  ctx.fillRect(cx - 1.5, g.y, 3, g.h);
  ctx.fillStyle = 'rgba(' + glowColor + ',0.85)';
  var wave = Math.sin(frameCount * 0.15) * 3;
  ctx.beginPath();
  ctx.moveTo(cx + 1.5, g.y + 4);
  ctx.lineTo(cx + g.w * 0.42 + wave, g.y + g.h * 0.28);
  ctx.lineTo(cx + 1.5, g.y + g.h * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawLeech(le) {
  var cx = le.x + le.w / 2, cy = le.y + le.h / 2;
  var pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.08);
  ctx.fillStyle = 'rgba(60,20,60,' + (0.6 + pulse * 0.2) + ')';
  ctx.beginPath();
  ctx.ellipse(cx, cy, le.w / 2, le.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(180,40,90,0.8)';
  ctx.beginPath();
  ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawRope(r) {
  var bob = ropeBobPos(r);
  if (r.vineSkin) {
    ctx.strokeStyle = '#3c5a2a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    var steps = 8;
    for (var i = 0; i <= steps; i++) {
      var tt = i / steps;
      var vx = r.anchorX + (bob.x - r.anchorX) * tt + Math.sin(tt * Math.PI * 3) * 3;
      var vy = r.anchorY + (bob.y - r.anchorY) * tt;
      if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
    }
    ctx.stroke();
    ctx.fillStyle = '#4a7a34';
    for (var j = 1; j < steps; j += 2) {
      var tj = j / steps;
      var lx = r.anchorX + (bob.x - r.anchorX) * tj;
      var ly = r.anchorY + (bob.y - r.anchorY) * tj;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 6, ly - 2);
      ctx.lineTo(lx + 1, ly + 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#2e4520';
    ctx.beginPath();
    ctx.arc(r.anchorX, r.anchorY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = player.onRope === r ? '#ff5c7a' : '#3c5a2a';
    ctx.beginPath();
    ctx.arc(bob.x, bob.y, 7, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(r.anchorX, r.anchorY);
  ctx.lineTo(bob.x, bob.y);
  ctx.stroke();
  ctx.fillStyle = '#8a5a2a';
  ctx.beginPath();
  ctx.arc(r.anchorX, r.anchorY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = player.onRope === r ? '#ff5c7a' : '#c9a86a';
  ctx.beginPath();
  ctx.arc(bob.x, bob.y, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawWater(w) {
  var swamp = level.theme === 'rainforest';
  var icy = level.theme === 'ice';
  ctx.fillStyle = swamp ? '#3a3a1c' : (icy ? '#0f3050' : '#1a4a6e');
  ctx.fillRect(w.x, w.y, w.w, w.h);
  if (icy) {
    ctx.fillStyle = 'rgba(215,240,255,0.55)';
    var floeCount = Math.max(2, Math.floor(w.w / 60));
    for (var fI = 0; fI < floeCount; fI++) {
      var fseed = Math.sin(fI * 73.3 + w.x) * 43758.5453;
      var ffrac = fseed - Math.floor(fseed);
      var flx = w.x + 18 + fI * 60 + ffrac * 22;
      var fly = w.y + 5 + Math.sin(frameCount * 0.025 + fI) * 1.5;
      ctx.beginPath();
      ctx.ellipse(flx, fly, 11, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = swamp ? 'rgba(150,170,90,0.5)' : (icy ? 'rgba(170,220,255,0.5)' : 'rgba(140,210,240,0.6)');
  ctx.lineWidth = 2;
  for (var i = 0; i < 3; i++) {
    var wy = w.y + 6 + i * 8 + Math.sin(frameCount * 0.06 + i) * 2;
    ctx.beginPath();
    for (var wx = w.x; wx <= w.x + w.w; wx += 12) {
      var yy = wy + Math.sin(wx * 0.15 + frameCount * 0.08 + i) * 2;
      if (wx === w.x) ctx.moveTo(wx, yy); else ctx.lineTo(wx, yy);
    }
    ctx.stroke();
  }
  if (swamp) {
    ctx.fillStyle = 'rgba(70,90,40,0.55)';
    var leafCount = Math.max(2, Math.floor(w.w / 55));
    for (var lI = 0; lI < leafCount; lI++) {
      var lseed = Math.sin(lI * 91.7 + w.x) * 43758.5453;
      var lfrac = lseed - Math.floor(lseed);
      var lx = w.x + 20 + lI * 55 + lfrac * 20;
      var ly = w.y + 8 + Math.sin(frameCount * 0.03 + lI) * 3;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 9, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawFish(f) {
  if (!f.active) return;
  var fx = f._x !== undefined ? f._x : f._jumpXStart;
  var fy = f._y !== undefined ? f._y : f.waterY;
  var dir = (f._jumpXEnd >= f._jumpXStart) ? 1 : -1;
  ctx.save();
  ctx.translate(fx, fy);
  ctx.scale(dir, 1);
  var stretch = Math.sin(f.phase * Math.PI);
  ctx.fillStyle = '#4c92ac';
  ctx.beginPath();
  ctx.ellipse(0, 0, f.r * 1.4, f.r * (0.6 + stretch * 0.2), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-f.r * 1.3, 0);
  ctx.lineTo(-f.r * 2, -f.r * 0.6);
  ctx.lineTo(-f.r * 2, f.r * 0.6);
  ctx.closePath();
  ctx.fill();

  var mouthGap = f.r * (0.22 + stretch * 0.4);
  var mouthX = f.r * 1.55;
  var jawX = f.r * 0.45;
  ctx.fillStyle = '#3a0a10';
  ctx.beginPath();
  ctx.moveTo(jawX, -f.r * 0.32);
  ctx.lineTo(mouthX, -mouthGap);
  ctx.lineTo(mouthX, mouthGap);
  ctx.lineTo(jawX, f.r * 0.32);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f2eee0';
  var teethCount = 4;
  for (var i = 0; i < teethCount; i++) {
    var t = i / (teethCount - 1);
    var tx = jawX + t * (mouthX - jawX) * 0.92;
    var upperY = -f.r * 0.32 + t * (-mouthGap + f.r * 0.32);
    var lowerY = f.r * 0.32 + t * (mouthGap - f.r * 0.32);
    ctx.beginPath();
    ctx.moveTo(tx - 1.6, upperY);
    ctx.lineTo(tx + 1.6, upperY);
    ctx.lineTo(tx, upperY + 3.4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tx - 1.6, lowerY);
    ctx.lineTo(tx + 1.6, lowerY);
    ctx.lineTo(tx, lowerY - 3.4);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = '#241f1c';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(f.r * 0.1, -f.r * 0.58);
  ctx.lineTo(f.r * 0.55, -f.r * 0.68);
  ctx.stroke();

  ctx.fillStyle = '#241f1c';
  ctx.beginPath();
  ctx.arc(f.r * 0.3, -f.r * 0.42, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFin(f) {
  var fx = f.x !== undefined ? f.x : (f.rangeMin + f.rangeMax) / 2;
  var wobble = Math.sin(frameCount * 0.1) * 1.5;
  var dir = f._lastFinX !== undefined && fx < f._lastFinX ? -1 : 1;
  f._lastFinX = fx;
  ctx.save();
  ctx.translate(fx, f.waterY + wobble);
  ctx.scale(dir, 1);
  ctx.fillStyle = '#3a6e88';
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.lineTo(4, -10);
  ctx.lineTo(8, 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(90,166,196,0.4)';
  ctx.beginPath();
  ctx.ellipse(-2, 3, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSwampBeast(f) {
  if (!f.active) return;
  var fx = f._x !== undefined ? f._x : f._jumpXStart;
  var fy = f._y !== undefined ? f._y : f.waterY;
  var dir = (f._jumpXEnd >= f._jumpXStart) ? 1 : -1;
  ctx.save();
  ctx.translate(fx, fy);
  ctx.scale(dir, 1);
  var stretch = Math.sin(f.phase * Math.PI);

  ctx.fillStyle = '#3e5a30';
  ctx.beginPath();
  ctx.ellipse(0, 2, f.r * 1.5, f.r * (0.75 + stretch * 0.2), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2c4322';
  for (var w = -1; w <= 1; w++) {
    ctx.beginPath();
    ctx.ellipse(w * f.r * 0.6, -f.r * 0.35, f.r * 0.32, f.r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  var mouthGap = f.r * (0.28 + stretch * 0.45);
  var mouthX = f.r * 1.5;
  var jawX = f.r * 0.3;
  ctx.fillStyle = '#1f150f';
  ctx.beginPath();
  ctx.moveTo(jawX, -f.r * 0.4);
  ctx.lineTo(mouthX, -mouthGap);
  ctx.lineTo(mouthX, mouthGap);
  ctx.lineTo(jawX, f.r * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e8e2c8';
  var teethCount = 5;
  for (var i = 0; i < teethCount; i++) {
    var t = i / (teethCount - 1);
    var tx = jawX + t * (mouthX - jawX) * 0.9;
    var upperY = -f.r * 0.4 + t * (-mouthGap + f.r * 0.4);
    var lowerY = f.r * 0.4 + t * (mouthGap - f.r * 0.4);
    ctx.beginPath();
    ctx.moveTo(tx - 1.8, upperY);
    ctx.lineTo(tx + 1.8, upperY);
    ctx.lineTo(tx, upperY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tx - 1.8, lowerY);
    ctx.lineTo(tx + 1.8, lowerY);
    ctx.lineTo(tx, lowerY - 4);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#c8e060';
  ctx.beginPath();
  ctx.arc(f.r * 0.15, -f.r * 0.55, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(f.r * 0.55, -f.r * 0.58, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#14100c';
  ctx.beginPath();
  ctx.arc(f.r * 0.15, -f.r * 0.55, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(f.r * 0.55, -f.r * 0.58, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCrocEyes(f) {
  var fx = f.x !== undefined ? f.x : (f.rangeMin + f.rangeMax) / 2;
  var wobble = Math.sin(frameCount * 0.08) * 1.2;
  ctx.save();
  ctx.translate(fx, f.waterY + wobble);
  ctx.fillStyle = 'rgba(40,50,20,0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a3318';
  ctx.beginPath();
  ctx.ellipse(-6, 0, 3.2, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, 0, 3.2, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c8e060';
  ctx.beginPath();
  ctx.arc(-6, -0.5, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -0.5, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

var TORCH_POSITIONS = [{ x: 70, y: 28 }, { x: 300, y: 28 }, { x: 530, y: 28 }];

function drawDungeonBackground() {
  var ww = level.worldW, wh = level.worldH;
  ctx.fillStyle = '#120e0c';
  ctx.fillRect(0, 0, ww, wh);

  var brickW = 42, brickH = 24;
  var rows = Math.ceil(wh / brickH) + 1;
  for (var row = 0; row < rows; row++) {
    var offset = (row % 2 === 0) ? 0 : brickW / 2;
    var by = row * brickH;
    for (var bx = -brickW; bx < ww + brickW; bx += brickW) {
      var x = bx + offset;
      var seed = Math.sin(row * 12.9898 + x * 78.233) * 43758.5453;
      var shade = seed - Math.floor(seed);
      var base = 34 + shade * 16;
      ctx.fillStyle = 'rgb(' + Math.round(base + 22) + ',' + Math.round(base + 12) + ',' + Math.round(base + 4) + ')';
      ctx.fillRect(x + 1, by + 1, brickW - 2, brickH - 2);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(x + 1, by + brickH - 6, brickW - 2, 3);
    }
  }

  var vgrad = ctx.createLinearGradient(0, 0, 0, wh);
  vgrad.addColorStop(0, 'rgba(0,0,0,0.6)');
  vgrad.addColorStop(0.3, 'rgba(0,0,0,0.15)');
  vgrad.addColorStop(0.75, 'rgba(0,0,0,0.2)');
  vgrad.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = vgrad;
  ctx.fillRect(0, 0, ww, wh);
}

function drawTorch(tx, ty) {
  var flick = 0.7 + 0.2 * Math.sin(frameCount * 0.3 + tx) + 0.1 * Math.sin(frameCount * 0.71 + tx * 2);
  var glowR = 30 + flick * 8;
  var glow = ctx.createRadialGradient(tx, ty - 6, 2, tx, ty - 6, glowR);
  glow.addColorStop(0, 'rgba(255,180,80,' + (0.45 * flick) + ')');
  glow.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(tx, ty - 6, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3a3226';
  ctx.fillRect(tx - 3, ty, 6, 10);
  ctx.beginPath();
  ctx.moveTo(tx - 7, ty);
  ctx.lineTo(tx + 7, ty);
  ctx.lineTo(tx, ty - 7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffdd66';
  ctx.beginPath();
  ctx.moveTo(tx, ty - 8 - flick * 6);
  ctx.quadraticCurveTo(tx + 5, ty - 14, tx + 2, ty - 20 - flick * 4);
  ctx.quadraticCurveTo(tx, ty - 16, tx - 2, ty - 20 - flick * 4);
  ctx.quadraticCurveTo(tx - 5, ty - 14, tx, ty - 8 - flick * 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ff7a30';
  ctx.beginPath();
  ctx.ellipse(tx, ty - 10, 3, 5 + flick * 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

var FIREFLY_POSITIONS = TORCH_POSITIONS;
var CASTLE_WINDOW_POSITIONS = [{ x: 100, y: 10 }, { x: 300, y: 10 }, { x: 500, y: 10 }];

function drawCastleBackground() {
  var ww = level.worldW, wh = level.worldH;
  ctx.fillStyle = '#3a3630';
  ctx.fillRect(0, 0, ww, wh);

  var brickW = 46, brickH = 26;
  var rows = Math.ceil(wh / brickH) + 1;
  for (var row = 0; row < rows; row++) {
    var offset = (row % 2 === 0) ? 0 : brickW / 2;
    var by = row * brickH;
    for (var bx = -brickW; bx < ww + brickW; bx += brickW) {
      var x = bx + offset;
      var seed = Math.sin(row * 12.9898 + x * 78.233) * 43758.5453;
      var shade = seed - Math.floor(seed);
      var base = 92 + shade * 20;
      ctx.fillStyle = 'rgb(' + Math.round(base + 14) + ',' + Math.round(base + 6) + ',' + Math.round(base - 8) + ')';
      ctx.fillRect(x + 1, by + 1, brickW - 2, brickH - 2);
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.fillRect(x + 1, by + brickH - 6, brickW - 2, 3);
    }
  }

  var vgrad = ctx.createLinearGradient(0, 0, 0, wh);
  vgrad.addColorStop(0, 'rgba(20,14,8,0.42)');
  vgrad.addColorStop(0.3, 'rgba(20,14,8,0.08)');
  vgrad.addColorStop(0.75, 'rgba(20,14,8,0.14)');
  vgrad.addColorStop(1, 'rgba(20,14,8,0.5)');
  ctx.fillStyle = vgrad;
  ctx.fillRect(0, 0, ww, wh);
}

function drawCastleWindow(tx, ty) {
  var w = 26, h = 44;
  var flick = 0.85 + 0.15 * Math.sin(frameCount * 0.05 + tx);
  var glow = ctx.createRadialGradient(tx, ty + h * 0.4, 4, tx, ty + h * 0.4, 60);
  glow.addColorStop(0, 'rgba(255,214,120,' + (0.28 * flick) + ')');
  glow.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(tx, ty + h * 0.4, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#5a4a34';
  ctx.beginPath();
  ctx.moveTo(tx - w / 2 - 3, ty + h + 3);
  ctx.lineTo(tx - w / 2 - 3, ty + 8);
  ctx.quadraticCurveTo(tx - w / 2 - 3, ty - 6, tx, ty - 8);
  ctx.quadraticCurveTo(tx + w / 2 + 3, ty - 6, tx + w / 2 + 3, ty + 8);
  ctx.lineTo(tx + w / 2 + 3, ty + h + 3);
  ctx.closePath();
  ctx.fill();

  var glass = ctx.createLinearGradient(tx, ty, tx, ty + h);
  glass.addColorStop(0, 'rgba(255,224,140,' + (0.55 * flick) + ')');
  glass.addColorStop(1, 'rgba(255,150,80,' + (0.4 * flick) + ')');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.moveTo(tx - w / 2, ty + h);
  ctx.lineTo(tx - w / 2, ty + 6);
  ctx.quadraticCurveTo(tx - w / 2, ty - 4, tx, ty - 6);
  ctx.quadraticCurveTo(tx + w / 2, ty - 4, tx + w / 2, ty + 6);
  ctx.lineTo(tx + w / 2, ty + h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(60,48,32,0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(tx, ty - 6);
  ctx.lineTo(tx, ty + h);
  ctx.moveTo(tx - w / 2, ty + h * 0.55);
  ctx.lineTo(tx + w / 2, ty + h * 0.55);
  ctx.stroke();
}

function pseudoRand(seed) {
  var v = Math.sin(seed * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

function drawGnarledBranch(x, y, angle, length, depth, seed, baseAlpha) {
  if (depth <= 0 || length < 5) return;
  var sway = Math.sin(frameCount * 0.006 + seed) * 0.015;
  var a = angle + sway;
  var midLen = length * 0.5;
  var midKink = (pseudoRand(seed * 3.1) - 0.5) * length * 0.55;
  var midX = x + Math.cos(a) * midLen - Math.sin(a) * midKink;
  var midY = y + Math.sin(a) * midLen + Math.cos(a) * midKink;
  var endX = x + Math.cos(a) * length;
  var endY = y + Math.sin(a) * length;

  var baseWidth = Math.max(2.5, depth * 4.4);
  var tipWidth = Math.max(1.6, depth * 2.1);
  var steps = 5;
  var leftPts = [], rightPts = [];
  for (var si = 0; si <= steps; si++) {
    var t = si / steps;
    var omt = 1 - t;
    var px = omt * omt * x + 2 * omt * t * midX + t * t * endX;
    var py = omt * omt * y + 2 * omt * t * midY + t * t * endY;
    var tx = 2 * omt * (midX - x) + 2 * t * (endX - midX);
    var ty = 2 * omt * (midY - y) + 2 * t * (endY - midY);
    var tl = Math.sqrt(tx * tx + ty * ty) || 1;
    var nx = -ty / tl, ny = tx / tl;
    var w = (baseWidth * (1 - t) + tipWidth * t) * 0.5;
    var bumpL = (pseudoRand(seed * 7.7 + si * 3.3) - 0.5) * w * 0.7;
    var bumpR = (pseudoRand(seed * 5.3 + si * 2.1 + 9) - 0.5) * w * 0.7;
    leftPts.push({ x: px + nx * (w + bumpL), y: py + ny * (w + bumpL) });
    rightPts.push({ x: px - nx * (w + bumpR), y: py - ny * (w + bumpR) });
  }
  ctx.fillStyle = 'rgba(4,7,5,' + baseAlpha + ')';
  ctx.beginPath();
  ctx.moveTo(leftPts[0].x, leftPts[0].y);
  for (var li = 1; li < leftPts.length; li++) ctx.lineTo(leftPts[li].x, leftPts[li].y);
  for (var ri = rightPts.length - 1; ri >= 0; ri--) ctx.lineTo(rightPts[ri].x, rightPts[ri].y);
  ctx.closePath();
  ctx.fill();

  if (depth === 1) return;
  for (var i = 0; i < 2; i++) {
    var spread = 0.35 + pseudoRand(seed + i * 5 + 1) * 0.75;
    var childAngle = a + (i === 0 ? -spread : spread);
    var childLen = length * (0.6 + pseudoRand(seed + i * 9 + 3) * 0.18);
    drawGnarledBranch(endX, endY, childAngle, childLen, depth - 1, seed * 1.7 + i * 13.1 + 2, baseAlpha);
  }
}

function drawRainforestBackground() {
  var ww = level.worldW, wh = level.worldH;
  var grad = ctx.createLinearGradient(0, 0, 0, wh);
  grad.addColorStop(0, '#4a5c56');
  grad.addColorStop(0.4, '#33443d');
  grad.addColorStop(0.75, '#1c2b24');
  grad.addColorStop(1, '#0d1712');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ww, wh);

  ctx.fillStyle = 'rgba(60,80,72,0.18)';
  for (var mi = 0; mi < 3; mi++) {
    var my = H * 0.3 + mi * 40 + Math.sin(frameCount * 0.004 + mi) * 6;
    ctx.beginPath();
    ctx.ellipse(W * 0.5, my, W * 0.7, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.lineCap = 'round';
  var farCount = 6;
  for (var f = 0; f < farCount; f++) {
    var fseed = f * 5.31 + 1.2;
    var fx = (f * 73 + pseudoRand(fseed) * 40) % (W + 60) - 30;
    drawGnarledBranch(fx, H + 6, -Math.PI / 2 + (pseudoRand(fseed + 1) - 0.5) * 0.5, 70 + pseudoRand(fseed + 2) * 30, 3, fseed, 0.35);
  }

  drawGnarledBranch(120, H + 10, -Math.PI / 2 + 0.08, 150, 5, 8.4, 0.85);
  drawGnarledBranch(430, H + 10, -Math.PI / 2 - 0.1, 170, 5, 19.7, 0.92);
  drawGnarledBranch(300, H + 14, -Math.PI / 2, 190, 5, 31.5, 0.97);

  var mist = ctx.createLinearGradient(0, H * 0.62, 0, H);
  mist.addColorStop(0, 'rgba(20,28,24,0)');
  mist.addColorStop(1, 'rgba(20,28,24,0.6)');
  ctx.fillStyle = mist;
  ctx.fillRect(0, H * 0.62, ww, H * 0.38);

  var vgrad = ctx.createLinearGradient(0, 0, 0, wh);
  vgrad.addColorStop(0, 'rgba(0,0,0,0.35)');
  vgrad.addColorStop(0.3, 'rgba(0,0,0,0.08)');
  vgrad.addColorStop(0.75, 'rgba(0,0,0,0.15)');
  vgrad.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vgrad;
  ctx.fillRect(0, 0, ww, wh);
}

function drawFirefly(fx, fy) {
  var flick = 0.5 + 0.35 * Math.sin(frameCount * 0.08 + fx) + 0.15 * Math.sin(frameCount * 0.21 + fx * 1.7);
  var driftX = fx + Math.sin(frameCount * 0.015 + fx * 0.05) * 18;
  var driftY = fy + 30 + Math.cos(frameCount * 0.012 + fx * 0.04) * 22;
  var glowR = 16 + flick * 6;
  var glow = ctx.createRadialGradient(driftX, driftY, 1, driftX, driftY, glowR);
  glow.addColorStop(0, 'rgba(220,255,140,' + (0.55 * flick) + ')');
  glow.addColorStop(1, 'rgba(220,255,140,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(driftX, driftY, glowR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,220,' + (0.7 + flick * 0.3) + ')';
  ctx.beginPath();
  ctx.arc(driftX, driftY, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawFinishEdge() {
  var ww = level.worldW, wh = level.worldH;
  var pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.08);
  var grad = ctx.createLinearGradient(ww - 26, 0, ww, 0);
  grad.addColorStop(0, 'rgba(255,224,102,0)');
  grad.addColorStop(1, 'rgba(255,224,102,' + (0.3 + 0.25 * pulse) + ')');
  ctx.fillStyle = grad;
  ctx.fillRect(ww - 26, 0, 26, wh);
}

function drawMossTuft(x, y) {
  ctx.fillStyle = '#33501f';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a8a3e';
  for (var i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.ellipse(x + i * 4, y - Math.abs(i), 2.6, 4.5, i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTiltingBranch(p) {
  var angle = Math.sin(frameCount * p.tilt.speed) * p.tilt.maxAngle;
  var cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.translate(-cx, -cy);
  drawPlatform(p);
  ctx.restore();
}

function drawPlatform(p) {
  if (p._seed === undefined) p._seed = Math.random();
  var seed = p._seed;

  if (level.theme === 'rainforest') {
    var logR = 74 + seed * 20, logG = 58 + seed * 22, logB = 36 + seed * 12;
    ctx.fillStyle = 'rgb(' + Math.round(logR) + ',' + Math.round(logG) + ',' + Math.round(logB) + ')';
    ctx.fillRect(p.x, p.y, p.w, p.h);

    ctx.fillStyle = 'rgba(200,255,160,0.14)';
    ctx.fillRect(p.x, p.y, p.w, 4);

    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fillRect(p.x, p.y + p.h - 5, p.w, 5);

    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    var ringCount = 2 + Math.floor(seed * 3);
    for (var g = 0; g < ringCount; g++) {
      var gx = p.x + ((g * 47 + seed * 811) % Math.max(1, p.w - 6)) + 3;
      ctx.beginPath();
      ctx.moveTo(gx, p.y + 3);
      ctx.lineTo(gx, p.y + p.h - 3);
      ctx.stroke();
    }

    var mossCount2 = 2 + (Math.floor(seed * 400) % 3);
    for (var m2 = 0; m2 < mossCount2; m2++) {
      var mx2 = p.x + 9 + ((m2 * 37 + seed * 271) % Math.max(1, p.w - 18));
      drawMossTuft(mx2, p.y);
    }
    if (seed < 0.4) {
      ctx.strokeStyle = '#3c5a2a';
      ctx.lineWidth = 2;
      var vx0 = p.x + p.w * (0.2 + seed * 0.6);
      ctx.beginPath();
      ctx.moveTo(vx0, p.y + p.h);
      ctx.quadraticCurveTo(vx0 + 4, p.y + p.h + 10, vx0 - 2, p.y + p.h + 20);
      ctx.stroke();
    }
    return;
  }

  if (level.theme === 'ice') {
    if (p.ice) {
      var iceR = 118 + seed * 22, iceG = 176 + seed * 18, iceB = 216 + seed * 16;
      ctx.fillStyle = 'rgb(' + Math.round(iceR) + ',' + Math.round(iceG) + ',' + Math.round(iceB) + ')';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(p.x, p.y, p.w, 3);
      ctx.fillStyle = 'rgba(30,70,110,0.35)';
      ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      var sheenCount = 1 + Math.floor(seed * 3);
      for (var sh = 0; sh < sheenCount; sh++) {
        var sx0 = p.x + ((sh * 71 + seed * 431) % Math.max(1, p.w - 22)) + 4;
        ctx.beginPath();
        ctx.moveTo(sx0, p.y + p.h - 4);
        ctx.lineTo(sx0 + 14, p.y + 3);
        ctx.stroke();
      }
    } else {
      var rockB = 66 + seed * 14;
      ctx.fillStyle = 'rgb(' + Math.round(rockB * 0.82) + ',' + Math.round(rockB * 0.9) + ',' + Math.round(rockB) + ')';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = 'rgba(235,245,255,0.92)';
      ctx.fillRect(p.x, p.y, p.w, 5);
      ctx.fillStyle = 'rgba(0,0,20,0.3)';
      ctx.fillRect(p.x, p.y + p.h - 5, p.w, 5);
      ctx.fillStyle = 'rgba(0,0,20,0.18)';
      var icrackCount = 2 + Math.floor(seed * 4);
      for (var ic2 = 0; ic2 < icrackCount; ic2++) {
        var icx2 = p.x + ((ic2 * 43 + seed * 887) % Math.max(1, p.w - 5)) + 2;
        var icy2 = p.y + 8 + ((ic2 * 59 + seed * 593) % Math.max(1, p.h - 13));
        ctx.fillRect(icx2, icy2, 3 + (ic2 % 2), 1.5);
      }
    }
    return;
  }

  if (level.theme === 'castle') {
    var stoneR = 150 + seed * 24, stoneG = 138 + seed * 20, stoneB = 118 + seed * 16;
    ctx.fillStyle = 'rgb(' + Math.round(stoneR) + ',' + Math.round(stoneG) + ',' + Math.round(stoneB) + ')';
    ctx.fillRect(p.x, p.y, p.w, p.h);

    ctx.fillStyle = 'rgba(255,240,210,0.22)';
    ctx.fillRect(p.x, p.y, p.w, 3);

    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4);

    ctx.strokeStyle = 'rgba(60,50,38,0.4)';
    ctx.lineWidth = 1;
    var blockW = 20;
    var blockRowOffset = (seed * 400) % blockW;
    for (var bx2 = p.x - blockRowOffset; bx2 < p.x + p.w; bx2 += blockW) {
      ctx.beginPath();
      ctx.moveTo(Math.max(p.x, bx2), p.y + 2);
      ctx.lineTo(Math.max(p.x, bx2), p.y + p.h - 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + p.h / 2);
    ctx.lineTo(p.x + p.w, p.y + p.h / 2);
    ctx.stroke();
    return;
  }

  var baseR = 88 + seed * 22, baseG = 72 + seed * 16, baseB = 54 + seed * 10;
  ctx.fillStyle = 'rgb(' + Math.round(baseR) + ',' + Math.round(baseG) + ',' + Math.round(baseB) + ')';
  ctx.fillRect(p.x, p.y, p.w, p.h);

  ctx.fillStyle = 'rgba(255,214,160,0.16)';
  ctx.fillRect(p.x, p.y, p.w, 4);

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(p.x, p.y + p.h - 5, p.w, 5);

  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  var crackCount = 3 + Math.floor(seed * 4);
  for (var i = 0; i < crackCount; i++) {
    var lx = p.x + ((i * 37 + seed * 971) % Math.max(1, p.w - 4)) + 2;
    var ly = p.y + 6 + ((i * 53 + seed * 613) % Math.max(1, p.h - 10));
    ctx.fillRect(lx, ly, 3 + (i % 2), 1.5);
  }

  if (seed < 0.55) {
    var mossCount = 1 + (Math.floor(seed * 400) % 3);
    for (var m = 0; m < mossCount; m++) {
      var mx = p.x + 9 + ((m * 41 + seed * 331) % Math.max(1, p.w - 18));
      drawMossTuft(mx, p.y);
    }
  }
}

function drawCrumblingPlatform(p) {
  var t = Math.min(1, (p._ct || 0) / 24);
  var mag = 1.5 + t * 3.5;
  var jx = (Math.random() - 0.5) * mag;
  var jy = (Math.random() - 0.5) * mag;
  ctx.save();
  ctx.translate(jx, jy);
  drawPlatform(p);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,70,60,' + (0.25 + t * 0.45) + ')';
  ctx.lineWidth = 2;
  ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
}

function drawPortcullis(g) {
  if (g._seed === undefined) g._seed = Math.random();
  var frameCol = '#3a3226', barCol = '#6b6258', barLite = '#a89c86';
  ctx.fillStyle = frameCol;
  ctx.fillRect(g.x - 3, g.y - 6, g.w + 6, 6);
  var barCount = Math.max(2, Math.round(g.w / 12));
  var barW = 5;
  for (var i = 0; i < barCount; i++) {
    var bx = g.x + 4 + i * ((g.w - 8) / Math.max(1, barCount - 1)) - barW / 2;
    var grad = ctx.createLinearGradient(bx, 0, bx + barW, 0);
    grad.addColorStop(0, barLite);
    grad.addColorStop(1, barCol);
    ctx.fillStyle = grad;
    ctx.fillRect(bx, g.y, barW, g.h);
  }
  ctx.fillStyle = barCol;
  var rungCount = Math.max(2, Math.round(g.h / 26));
  for (var j = 1; j < rungCount; j++) {
    var ry = g.y + (g.h * j) / rungCount;
    ctx.fillRect(g.x, ry - 2, g.w, 4);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(g.x, g.y, g.w, g.h);
}

function drawCannon(c) {
  var baseCol = '#4a463e', barrelCol = '#2c2a26', barrelLite = '#5c584e';
  ctx.fillStyle = baseCol;
  ctx.fillRect(c.x, c.y, c.w, c.h);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);

  var barrelLen = 14, barrelH = Math.min(c.h - 6, 12);
  var by = c.y + c.h / 2 - barrelH / 2;
  var bx = c.dir > 0 ? c.x + c.w : c.x - barrelLen;
  var grad = ctx.createLinearGradient(bx, by, bx, by + barrelH);
  grad.addColorStop(0, barrelLite);
  grad.addColorStop(1, barrelCol);
  ctx.fillStyle = grad;
  ctx.fillRect(bx, by, barrelLen, barrelH);
  ctx.fillStyle = '#0c0b0a';
  ctx.beginPath();
  ctx.ellipse(c.dir > 0 ? bx + barrelLen : bx, by + barrelH / 2, barrelH * 0.42, barrelH * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCannonball(b) {
  var grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0.5, b.x, b.y, b.r * 1.2);
  grad.addColorStop(0, '#5c584e');
  grad.addColorStop(1, '#100f0d');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  ctx.translate(-camera.x, -camera.y);

  if (level.theme === 'rainforest') {
    drawRainforestBackground();
    FIREFLY_POSITIONS.forEach(function(t) { drawFirefly(t.x, t.y); });
  } else if (level.theme === 'ice') {
    drawIceBackground();
    TORCH_POSITIONS.forEach(function(t) { drawIceCrystal(t.x, t.y); });
  } else if (level.theme === 'castle') {
    drawCastleBackground();
    CASTLE_WINDOW_POSITIONS.forEach(function(t) { drawCastleWindow(t.x, t.y); });
  } else {
    drawDungeonBackground();
    TORCH_POSITIONS.forEach(function(t) { drawTorch(t.x, t.y); });
  }
  drawFinishEdge();

  level.rocks.forEach(drawRock);
  level.portcullis.forEach(drawPortcullis);
  level.water.forEach(drawWater);
  level.ropes.forEach(drawRope);

  level.platforms.forEach(function(p) {
    if (p.crumble && p._cst === 'gone') return;
    if (p.tilt) drawTiltingBranch(p);
    else if (p.crumble && p._cst === 'shake') drawCrumblingPlatform(p);
    else drawPlatform(p);
  });

  level.walls.forEach(drawWall);
  level.ladders.forEach(drawLadder);
  level.springs.forEach(drawSpring);
  level.icicles.forEach(drawIcicle);
  level.spikes.forEach(drawSpikeShape);
  level.saws.forEach(drawSaw);
  level.blades.forEach(drawBlade);
  level.mosquitoSwarms.forEach(drawMosquitoSwarm);
  level.leeches.forEach(drawLeech);
  level.pendulums.forEach(drawPendulum);
  level.cannons.forEach(drawCannon);
  level._cannonballs.forEach(drawCannonball);
  if (level.theme === 'rainforest') {
    level.fishSpawners.forEach(drawSwampBeast);
    level.fishSpawners.forEach(function(f) { if (f.cruise) drawCrocEyes(f); });
  } else {
    level.fishSpawners.forEach(drawFish);
    level.fishSpawners.forEach(function(f) { if (f.cruise) drawFin(f); });
  }

  if (level.goal) drawGoal(level.goal);

  if (player.alive) {
    drawDog(Math.round(player.x), Math.round(player.y), player.w, player.h, player.facing);
  }

  particles.forEach(function(pt) {
    var alpha = pt.landed ? Math.max(0, Math.min(0.75, 0.75 * pt.life / 120)) : Math.max(0, pt.life / 50);
    ctx.fillStyle = 'rgba(' + (pt.rgb || '220,20,40') + ',' + alpha + ')';
    ctx.beginPath();
    if (pt.landed) {
      ctx.ellipse(pt.x, pt.y, pt.r * 1.1, pt.r * 0.55, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
    }
    ctx.fill();
  });

  pops.forEach(function(pop) {
    var t = pop.age / pop.maxAge;
    var r = pop.maxR * Math.sin(t * Math.PI * 0.5);
    var alpha = 0.65 * (1 - t);
    var spikes = 9;
    ctx.fillStyle = 'rgba(255,50,70,' + alpha + ')';
    ctx.beginPath();
    for (var i = 0; i < spikes * 2; i++) {
      var ang = (Math.PI * i) / spikes;
      var rad = i % 2 === 0 ? r : r * 0.45;
      var px = pop.x + Math.cos(ang) * rad;
      var py = pop.y + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  });

  chunks.forEach(function(c) {
    var alpha = Math.max(0, Math.min(1, c.life / 20));
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
    ctx.restore();
  });
}
