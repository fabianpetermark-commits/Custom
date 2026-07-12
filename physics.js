// Splat Run -- fizika, utkozes, hazardok
// Sprint 1 kodrendezes: kiemelve a korabbi egyetlen inline <script>-bol.
// A jatek osszes JS fajlja (levels.js, audio.js, physics.js, draw.js, game.js)
// egyazon globalis scope-ban fut (nincs bundler/modul-rendszer), pontosan
// ugy, mint korabban egyetlen (function(){ ... })()-en belul -- csak most
// tobb <script src> tagen keresztul, betoltesi sorrendben.

var GRAVITY = 0.5;
var MOVE_SPEED = 3.2;
var JUMP_MIN_FORCE = -6.5;
var JUMP_HOLD_ACCEL = -0.45;
var JUMP_MAX_HOLD = 14;
var DOUBLE_JUMP_FORCE = -5.0;
var CLIMB_SPEED = 2.6;
var ROPE_PUMP = 0.0018;
var ROPE_GRAB_RADIUS = 22;
var MAX_ROPE_ANGLE = 1.25;
var MAX_ROPE_ANGVEL = 0.05;
var DASH_SPEED = 6.0;
var DASH_DURATION = 10;

function osc(min, max, speed, phase, frame) {
  return min + (max - min) * (0.5 + 0.5 * Math.sin(frame * speed + phase));
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function goalReached() {
  return level.goal && rectsOverlap(player, level.goal);
}

function syncFollowSpikes() {
  level.spikes.forEach(function(s) {
    if (s.follow) {
      s.x = s.follow.platform.x + s.follow.offsetX;
      s.y = s.follow.platform.y + s.follow.offsetY;
    }
  });
}

function currentHazardRects() {
  var rects = [];
  syncFollowSpikes();
  level.spikes.forEach(function(s) {
    rects.push(s);
  });
  level.saws.forEach(function(s) {
    var pos = osc(s.min, s.max, s.speed, s.phase, frameCount);
    var cx = s.axis === 'x' ? pos : s.cx;
    var cy = s.axis === 'y' ? pos : s.cy;
    s._cx = cx; s._cy = cy;
    rects.push({ x: cx - s.r, y: cy - s.r, w: s.r * 2, h: s.r * 2 });
  });
  level.blades.forEach(function(b) {
    var pos = osc(b.min, b.max, b.speed, b.phase, frameCount);
    var y = b.axis === 'y' ? pos : b.y;
    var x = b.axis === 'x' ? pos : b.x;
    b._x = x; b._y = y;
    rects.push({ x: x, y: y, w: b.w, h: b.h });
  });
  level.mosquitoSwarms.forEach(function(m) {
    var mx = m.x + m.ampX * Math.sin(frameCount * m.speedX + m.phaseX);
    var my = m.y + m.ampY * Math.sin(frameCount * m.speedY + m.phaseY);
    m._x = mx; m._y = my;
    rects.push({ x: mx - m.r, y: my - m.r, w: m.r * 2, h: m.r * 2 });
  });
  level.pendulums.forEach(function(p) {
    var angle = osc(p.minAngle, p.maxAngle, p.speed, p.phase, frameCount);
    var bx = p.anchorX + p.length * Math.sin(angle);
    var by = p.anchorY + p.length * Math.cos(angle);
    p._x = bx; p._y = by;
    rects.push({ x: bx - p.r, y: by - p.r, w: p.r * 2, h: p.r * 2 });
  });
  level.water.forEach(function(w) { rects.push(w); });
  level.fishSpawners.forEach(function(f) {
    if (f.cruise) {
      f.x = osc(f.rangeMin, f.rangeMax, f.speed, f.phase, frameCount);
      return;
    }
    if (f.active) {
      var fx = f._jumpXStart + (f._jumpXEnd - f._jumpXStart) * f.phase;
      var fy = f.waterY - f.jumpHeight * Math.sin(f.phase * Math.PI);
      f._x = fx; f._y = fy;
      rects.push({ x: fx - f.r, y: fy - f.r, w: f.r * 2, h: f.r * 2 });
    }
  });
  level.icicles.forEach(function(ic) {
    if (ic._st === 'gone') return;
    var yy = ic._st === 'fall' ? ic._fy : ic.y;
    rects.push({ x: ic.x + 2, y: yy + 2, w: ic.w - 4, h: ic.h - 2 });
  });
  level._cannonballs.forEach(function(b) {
    rects.push({ x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 });
  });
  return rects;
}

function updateMovingPlatforms() {
  level.platforms.forEach(function(p) {
    if (p.move) {
      var newPos = osc(p.move.min, p.move.max, p.move.speed, p.move.phase, frameCount);
      if (p.move.axis === 'y') {
        p._deltaY = newPos - p.y;
        p._deltaX = 0;
        p.y = newPos;
      } else {
        p._deltaX = newPos - p.x;
        p._deltaY = 0;
        p.x = newPos;
      }
    } else {
      p._deltaX = 0;
      p._deltaY = 0;
    }
  });
  level.portcullis.forEach(function(g) {
    if (!g.move) return;
    var newPos = osc(g.move.min, g.move.max, g.move.speed, g.move.phase, frameCount);
    if (g.move.axis === 'y') {
      g._deltaY = newPos - g.y;
      g._deltaX = 0;
      g.y = newPos;
    } else {
      g._deltaX = newPos - g.x;
      g._deltaY = 0;
      g.x = newPos;
    }
  });
}

// Omlo kolap: ha a jatekos ralep, remegni kezd, majd eltunik (leomlik),
// egy ido utan pedig ujra megjelenik. A platformCollision() mar kihagyja
// a 'gone' allapotut, itt csak az allapotgep es a torozelek.
function updateCrumblePlatforms() {
  level.platforms.forEach(function(p) {
    if (!p.crumble) return;
    if (p._cst === undefined) { p._cst = 'idle'; p._ct = 0; p._origY = p.y; }
    if (p._cst === 'idle') {
      if (player.onGround && player.ridingPlatform === p) {
        p._cst = 'shake';
        p._ct = 0;
      }
    } else if (p._cst === 'shake') {
      p._ct += 1;
      if (p._ct >= 24) {
        p._cst = 'gone';
        p._ct = 0;
        spawnStoneDebris(p.x + p.w / 2, p.y + p.h);
      }
    } else if (p._cst === 'gone') {
      p._ct += 1;
      if (p._ct >= 130) { p._cst = 'idle'; p._ct = 0; }
    }
  });
}

function spawnStoneDebris(cx, cy) {
  for (var i = 0; i < 9; i++) {
    particles.push({
      x: cx + (Math.random() - 0.5) * 20, y: cy - 3,
      vx: (Math.random() - 0.5) * 3.5,
      vy: -Math.random() * 3 - 1,
      r: 1.8 + Math.random() * 2.2,
      life: 34 + Math.random() * 16,
      rgb: '150,138,120',
      shortLived: true
    });
  }
}

// Automata agyu: idozitve vizszintes golyot lo ki, plusz fust-particle-t
// a csotorkolatnal. A golyok kulon, konnyu run-time listaban elnek
// (level._cannonballs), es a szilard testekbe/jatekosba utkozve tunnek el.
function updateCannons() {
  level.cannons.forEach(function(c) {
    c._t = (c._t || 0) + 1;
    if (c._t >= c.interval) {
      c._t = 0;
      var muzzleX = c.dir > 0 ? c.x + c.w : c.x;
      var muzzleY = c.y + c.h / 2;
      level._cannonballs.push({
        x: muzzleX, y: muzzleY, r: c.r || 6, vx: (c.speed || 3.2) * c.dir,
        spawnX: muzzleX, range: c.range || 260
      });
      for (var i = 0; i < 6; i++) {
        particles.push({
          x: muzzleX, y: muzzleY + (Math.random() - 0.5) * 4,
          vx: c.dir * (2 + Math.random() * 2), vy: (Math.random() - 0.5) * 1.5,
          r: 1.5 + Math.random() * 1.8,
          life: 14 + Math.random() * 10,
          rgb: '150,150,150',
          shortLived: true
        });
      }
    }
  });
}

function cannonballHitsSolid(b) {
  var solids = level.rocks.concat(level.portcullis).concat(level.walls);
  for (var i = 0; i < solids.length; i++) {
    var r = solids[i];
    if (b.x + b.r > r.x && b.x - b.r < r.x + r.w && b.y + b.r > r.y && b.y - b.r < r.y + r.h) return true;
  }
  return false;
}

function updateCannonballs() {
  var balls = level._cannonballs;
  for (var i = balls.length - 1; i >= 0; i--) {
    var b = balls[i];
    b.x += b.vx;
    if (b.x < -20 || b.x > level.worldW + 20 || Math.abs(b.x - b.spawnX) > b.range || cannonballHitsSolid(b)) {
      balls.splice(i, 1);
    }
  }
}

function updateSinkingPlatforms() {
  level.platforms.forEach(function(p) {
    if (!p.sink) return;
    var occupied = player.onGround && player.ridingPlatform === p;
    var targetY = occupied ? p.sink.maxY : p.sink.restY;
    var oldY = p.y;
    if (p.y < targetY) p.y = Math.min(targetY, p.y + p.sink.speed);
    else if (p.y > targetY) p.y = Math.max(targetY, p.y - p.sink.speed);
    p._deltaY = (p._deltaY || 0) + (p.y - oldY);
  });
}

function updateIcicles() {
  level.icicles.forEach(function(ic) {
    if (ic._st === 'idle') {
      var pcx = player.x + player.w / 2;
      var icx = ic.x + ic.w / 2;
      if (Math.abs(pcx - icx) < ic.w / 2 + 32 && player.y + player.h > ic.y + ic.h) {
        ic._st = 'shake';
        ic._t = 0;
      }
    } else if (ic._st === 'shake') {
      ic._t += 1;
      if (ic._t >= 18) { ic._st = 'fall'; ic._vy = 0; }
    } else if (ic._st === 'fall') {
      ic._vy = Math.min(10, ic._vy + 0.5);
      ic._fy += ic._vy;
      var solids = level._solidRects;
      for (var i = 0; i < solids.length; i++) {
        var r = solids[i];
        if (ic.x < r.x + r.w && ic.x + ic.w > r.x && ic._fy < r.y + r.h && ic._fy + ic.h > r.y) {
          ic._st = 'gone';
          spawnIceShards(ic.x + ic.w / 2, ic._fy + ic.h);
          break;
        }
      }
      if (ic._st === 'fall' && ic._fy > level.worldH) ic._st = 'gone';
    }
  });
}

function spawnIceShards(cx, cy) {
  for (var i = 0; i < 7; i++) {
    particles.push({
      x: cx, y: cy - 3,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 2.5 - 0.5,
      r: 1.5 + Math.random() * 1.5,
      life: 26 + Math.random() * 12,
      rgb: '205,232,255',
      shortLived: true
    });
  }
}

function updateFishSpawners() {
  level.fishSpawners.forEach(function(f) {
    if (f.cruise) return;
    if (!f.active) {
      f.timer -= 1;
      if (f.timer <= 0) {
        f.active = true;
        f.phase = 0;
        if (f.spots) {
          var startIdx = (f._lastSpotIdx !== undefined) ? f._lastSpotIdx : Math.floor(Math.random() * f.spots.length);
          var endIdx = Math.floor(Math.random() * f.spots.length);
          var tries2 = 0;
          while (endIdx === startIdx && tries2 < 5) {
            endIdx = Math.floor(Math.random() * f.spots.length);
            tries2 += 1;
          }
          f._jumpXStart = f.spots[startIdx];
          f._jumpXEnd = f.spots[endIdx];
          f._lastSpotIdx = endIdx;
        } else {
          var startX = (f._lastX !== undefined) ? f._lastX : (f.rangeMin + f.rangeMax) / 2;
          var endX = f.rangeMin + Math.random() * (f.rangeMax - f.rangeMin);
          var tries = 0;
          while (Math.abs(endX - startX) < 40 && tries < 5) {
            endX = f.rangeMin + Math.random() * (f.rangeMax - f.rangeMin);
            tries += 1;
          }
          f._jumpXStart = startX;
          f._jumpXEnd = endX;
        }
      }
    } else {
      f.phase += 1 / f.jumpDuration;
      if (f.phase >= 1) {
        f.active = false;
        f._lastX = f._jumpXEnd;
        f.timer = f.cooldownMin + Math.random() * (f.cooldownMax - f.cooldownMin);
      }
    }
  });
}

function checkHazards(hazardRects) {
  for (var i = 0; i < hazardRects.length; i++) {
    if (rectsOverlap(player, hazardRects[i])) return true;
  }
  return false;
}

function platformCollision() {
  player.onGround = false;
  player.ridingPlatform = null;
  var landed = null, landedTop = Infinity;
  level.platforms.forEach(function(p) {
    if (p.crumble && p._cst === 'gone') return;
    if (player.vy < 0) return;
    var xOverlap = player.x + player.w > p.x && player.x < p.x + p.w;
    if (!xOverlap) return;
    var prevBottom = player.y + player.h - player.vy;
    var newBottom = player.y + player.h;
    if (prevBottom <= p.y + 1 && newBottom >= p.y - 1 && p.y < landedTop) {
      landed = p; landedTop = p.y;
    }
  });
  if (landed) {
    player.y = landed.y - player.h;
    player.vy = 0;
    player.onGround = true;
    player.ridingPlatform = landed;
    player.isJumping = false;
    player.jumpTime = 0;
    player.jumpsUsed = 0;
    player.dashUsed = false;
  }
}

function slopeSurfaceY(s, px) {
  var t = Math.max(0, Math.min(1, (px - s.x) / s.w));
  return s.direction === 'up' ? (s.y + s.h) - t * s.h : s.y + t * s.h;
}

function slopeCollision() {
  level.slopes.forEach(function(s) {
    var px = player.x + player.w / 2;
    if (px >= s.x && px <= s.x + s.w && player.vy >= 0) {
      var surfY = slopeSurfaceY(s, px) - player.h;
      if (player.y >= surfY - 6 && player.y <= surfY + player.vy + 1) {
        player.y = surfY;
        player.vy = 0;
        player.onGround = true;
        player.jumpsUsed = 0;
        player.dashUsed = false;
        player.isJumping = false;
        player.jumpTime = 0;
      }
    }
  });
}

function wallCollision() {
  level.walls.forEach(function(w) {
    if (rectsOverlap(player, w)) {
      var playerCenter = player.x + player.w / 2;
      var wallCenter = w.x + w.w / 2;
      if (playerCenter < wallCenter) {
        player.x = w.x - player.w + 1;
      } else {
        player.x = w.x + w.w - 1;
      }
    }
  });
}

// Rock: minden iranybol szilard blokk (barlang-fal/mennyezet). A Wall-tol
// eltcsonken tetejere allhatsz es feje beleutkozhet alulrol - ezert kulon
// tipus, nem a meglevo Wall/Platform viselkedesenek modositasa (ne torje a
// mar leszimulalt ugras-tavolsagokat a regi palyakon).
function rockCollision() {
  level.rocks.concat(level.portcullis).forEach(function(r) {
    var xOverlap = player.x + player.w > r.x && player.x < r.x + r.w;
    if (!xOverlap) return;
    var prevBottom = player.y + player.h - player.vy;
    var newBottom = player.y + player.h;
    var prevTop = player.y - player.vy;
    var newTop = player.y;
    if (player.vy >= 0 && prevBottom <= r.y + 1 && newBottom >= r.y - 1) {
      player.y = r.y - player.h;
      player.vy = 0;
      player.onGround = true;
      player.ridingPlatform = r;
      player.isJumping = false;
      player.jumpTime = 0;
      player.jumpsUsed = 0;
      player.dashUsed = false;
    } else if (player.vy < 0 && prevTop >= r.y + r.h - 1 && newTop <= r.y + r.h + 1) {
      player.y = r.y + r.h;
      player.vy = 0;
      player.isJumping = false;
    } else if (rectsOverlap(player, r)) {
      var playerCenter = player.x + player.w / 2;
      var rockCenter = r.x + r.w / 2;
      if (playerCenter < rockCenter) player.x = r.x - player.w + 1;
      else player.x = r.x + r.w - 1;
    }
  });
}

function springBounce() {
  level.springs.forEach(function(sp) {
    if (player.vy < 0) return;
    var xOverlap = player.x + player.w > sp.x + 2 && player.x < sp.x + sp.w - 2;
    if (!xOverlap) return;
    var bottom = player.y + player.h;
    if (bottom >= sp.y && bottom <= sp.y + sp.h + Math.max(6, player.vy + 1)) {
      player.y = sp.y - player.h;
      player.vy = -(sp.power || 11);
      player.onGround = false;
      player.ridingPlatform = null;
      player.isJumping = false;
      player.jumpTime = 0;
      player.jumpsUsed = 1;
      player.dashUsed = false;
      sp._anim = 12;
      if (audioCtx) {
        var t0 = audioCtx.currentTime;
        playNote(180, t0, 0.08, 'square', 0.08, 900);
        playNote(360, t0 + 0.06, 0.12, 'square', 0.07, 1400);
      }
    }
  });
}

function startJump() {
  player.vy = JUMP_MIN_FORCE;
  player.isJumping = true;
  player.jumpTime = 0;
  player.jumpsUsed = 1;
  player.onGround = false;
  player.onLadder = false;
}

function airJump() {
  player.vy = DOUBLE_JUMP_FORCE;
  player.isJumping = false;
  player.jumpsUsed = 2;
  player.onLadder = false;
}

function handleJumpPress() {
  if (player.onRope) return;
  if (player.onWall && !player.onGround) {
    player.vy = -5.5;
    player.vx = player.wallSide * -3.6;
    player.isJumping = true;
    player.jumpTime = 0;
    player.jumpsUsed = 1;
    player.onWall = null;
    player.wallJumpLockUntil = frameCount + 12;
    player.wallKickFrames = 8;
    return;
  }
  if (player.jumpsUsed === 0) {
    startJump();
  } else if (player.jumpsUsed === 1) {
    airJump();
  }
}

function handleDashPress() {
  if (player.onRope || player.onLadder || player.dashUsed) return;
  player.dashUsed = true;
  player.dashFrames = DASH_DURATION;
  player.dashDir = player.facing;
}

function ladderOverlap() {
  for (var i = 0; i < level.ladders.length; i++) {
    if (rectsOverlap(player, level.ladders[i])) return level.ladders[i];
  }
  return null;
}

function wallOverlap() {
  for (var i = 0; i < level.walls.length; i++) {
    if (rectsOverlap(player, level.walls[i])) return level.walls[i];
  }
  return null;
}

function leechOverlap() {
  for (var i = 0; i < level.leeches.length; i++) {
    if (rectsOverlap(player, level.leeches[i])) return level.leeches[i];
  }
  return null;
}

function ropeBobPos(r) {
  return {
    x: r.anchorX + r.length * Math.sin(r.angle),
    y: r.anchorY + r.length * Math.cos(r.angle)
  };
}

function tryGrabRope() {
  for (var i = 0; i < level.ropes.length; i++) {
    var r = level.ropes[i];
    var bob = ropeBobPos(r);
    var pcx = player.x + player.w / 2;
    var pcy = player.y + player.h / 2;
    var dx = pcx - bob.x, dy = pcy - bob.y;
    if (Math.sqrt(dx * dx + dy * dy) < ROPE_GRAB_RADIUS) {
      return r;
    }
  }
  return null;
}

function update() {
  if (!player.alive || transitioning || allDone) return;

  updateMovingPlatforms();
  updateSinkingPlatforms();
  updateFishSpawners();
  updateIcicles();
  updateCrumblePlatforms();
  updateCannons();
  updateCannonballs();
  updateSawSound();

  var hazardRects = currentHazardRects();

  if (player.onRope) {
    var r = player.onRope;
    var angAcc = -(GRAVITY / r.length) * Math.sin(r.angle);
    if (keys.left) r.angVel -= ROPE_PUMP;
    if (keys.right) r.angVel += ROPE_PUMP;
    r.angVel += angAcc;
    r.angVel *= 0.992;
    if (r.angVel > MAX_ROPE_ANGVEL) r.angVel = MAX_ROPE_ANGVEL;
    if (r.angVel < -MAX_ROPE_ANGVEL) r.angVel = -MAX_ROPE_ANGVEL;
    r.angle += r.angVel;
    var releaseAngVel = r.angVel;
    if (r.angle > MAX_ROPE_ANGLE) { r.angle = MAX_ROPE_ANGLE; r.angVel = 0; }
    if (r.angle < -MAX_ROPE_ANGLE) { r.angle = -MAX_ROPE_ANGLE; r.angVel = 0; }

    var bob = ropeBobPos(r);
    player.x = bob.x - player.w / 2;
    player.y = bob.y - player.h / 2;

    if (keys.up) {
      var vx = r.length * Math.cos(r.angle) * releaseAngVel;
      var vy = -r.length * Math.sin(r.angle) * releaseAngVel;
      player.onRope = null;
      player.vx = vx;
      player.vy = vy - 2;
      player.jumpsUsed = 0;
      player.dashUsed = false;
      r.angle = 0;
      r.angVel = 0;
    } else {
      if (checkHazards(hazardRects)) { killPlayer(); return; }
      if (player.x + player.w >= level.worldW - 0.5 || goalReached()) { reachGoal(); return; }
      updateCamera();
      return;
    }
  }

  if (!player.onRope) {
    var onLadderZone = ladderOverlap();

    if (onLadderZone && (keys.up || keys.down) && !player.onLadder) {
      player.onLadder = true;
      player.vy = 0;
      player.jumpsUsed = 0;
      player.dashUsed = false;
    }

    if (player.onLadder) {
      if (!onLadderZone) {
        player.onLadder = false;
      } else {
        player.vy = 0;
        if (keys.up) player.y -= CLIMB_SPEED;
        if (keys.down) player.y += CLIMB_SPEED;
        if (keys.left) { player.x -= MOVE_SPEED * 0.6; player.facing = -1; }
        if (keys.right) { player.x += MOVE_SPEED * 0.6; player.facing = 1; }
      }
    }

    if (!player.onLadder) {
      var effMoveSpeed = frameCount < player.slowUntilFrame ? MOVE_SPEED * 0.5 : MOVE_SPEED;
      if (player.wallKickFrames > 0) {
        player.wallKickFrames -= 1;
      } else if (player.dashFrames > 0) {
        player.vx = DASH_SPEED * player.dashDir;
        player.vy = 0;
        player.dashFrames -= 1;
      } else if (player.onGround && player.ridingPlatform && player.ridingPlatform.ice) {
        if (keys.left) { player.vx = Math.max(player.vx - 0.22, -effMoveSpeed); player.facing = -1; }
        else if (keys.right) { player.vx = Math.min(player.vx + 0.22, effMoveSpeed); player.facing = 1; }
        else player.vx *= 0.965;
      } else if (keys.left) { player.vx = -effMoveSpeed; player.facing = -1; }
      else if (keys.right) { player.vx = effMoveSpeed; player.facing = 1; }
      else player.vx = 0;

      if (player.isJumping) {
        if (keys.jumpHeld && player.jumpTime < JUMP_MAX_HOLD) {
          player.vy += JUMP_HOLD_ACCEL;
          player.jumpTime += 1;
        } else {
          player.isJumping = false;
        }
      }

      if (player.dashFrames <= 0) {
        player.vy += GRAVITY;
        if (player.vy > 12) player.vy = 12;
      }

      if (player.onGround && player.ridingPlatform) {
        player.x += player.ridingPlatform._deltaX || 0;
        player.y += player.ridingPlatform._deltaY || 0;
      }

      player.x += player.vx;
      player.y += player.vy;
      platformCollision();
      slopeCollision();
      wallCollision();
      rockCollision();
      springBounce();

      var wallZone = (!player.onGround && frameCount > (player.wallJumpLockUntil || 0)) ? wallOverlap() : null;
      player.onWall = null;
      if (wallZone && player.vy > 0) {
        var wallOnRight = wallZone.x >= player.x + player.w / 2;
        if ((wallOnRight && keys.right) || (!wallOnRight && keys.left)) {
          player.onWall = wallZone;
          player.wallSide = wallOnRight ? 1 : -1;
          if (player.vy > 1.2) player.vy = 1.2;
        }
      }
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.w > level.worldW) player.x = level.worldW - player.w;
    if (player.y < 0) { player.y = 0; if (player.vy < 0) player.vy = 0; }

    if (!player.onLadder) {
      var grabbed = tryGrabRope();
      if (grabbed && !player.onGround) {
        player.onRope = grabbed;
      }
    }
  }

  if (leechOverlap()) { player.slowUntilFrame = frameCount + 90; }

  if (player.y > level.worldH) { killPlayer(); return; }
  if (checkHazards(hazardRects)) { killPlayer(); return; }
  if (player.x + player.w >= level.worldW - 0.5 || goalReached()) { reachGoal(); return; }

  updateCamera();
  updateParticles();
  updateChunks();
}

function particleHitsSolid(pt) {
  var rects = level._solidRects;
  for (var i = 0; i < rects.length; i++) {
    var r = rects[i];
    if (pt.x + pt.r > r.x && pt.x - pt.r < r.x + r.w &&
        pt.y + pt.r > r.y && pt.y - pt.r < r.y + r.h) {
      return r;
    }
  }
  return null;
}

function updateParticles() {
  for (var j = particles.length - 1; j >= 0; j--) {
    var pt = particles[j];
    pt.age = (pt.age || 0) + 1;

    if (!pt.landed) {
      pt.vy += 0.35;
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 1;

      var hitRect = pt.age > 4 ? particleHitsSolid(pt) : null;
      if (hitRect) {
        pt.landed = true;
        pt.vx = 0;
        pt.vy = 0;
        pt.life = pt.shortLived ? 60 : 420;
        pt.followRect = hitRect;
        pt.offsetX = pt.x - hitRect.x;
        pt.offsetY = pt.y - hitRect.y;
      } else if (pt.y > level.worldH || pt.life <= 0) {
        particles.splice(j, 1);
        continue;
      }
    } else {
      if (pt.followRect) {
        pt.x = pt.followRect.x + pt.offsetX;
        pt.y = pt.followRect.y + pt.offsetY;
      }
      pt.life -= 1;
      if (pt.life <= 0) {
        particles.splice(j, 1);
      }
      continue;
    }
  }

  var landedCount = 0;
  for (var k = 0; k < particles.length; k++) if (particles[k].landed) landedCount += 1;
  while (landedCount > 600) {
    var idx = -1;
    for (var m = 0; m < particles.length; m++) {
      if (particles[m].landed) { idx = m; break; }
    }
    if (idx === -1) break;
    particles.splice(idx, 1);
    landedCount -= 1;
  }

  for (var p = pops.length - 1; p >= 0; p--) {
    pops[p].age += 1;
    if (pops[p].age > pops[p].maxAge) pops.splice(p, 1);
  }
}

function updateChunks() {
  for (var i = chunks.length - 1; i >= 0; i--) {
    var c = chunks[i];
    c.vy += 0.35;
    c.x += c.vx;
    c.y += c.vy;
    c.rot += c.vrot;
    c.life -= 1;
    if (c.life <= 0 || c.y > level.worldH) chunks.splice(i, 1);
  }
}

function killPlayer() {
  player.alive = false;
  deaths += 1;
  deathsEl.textContent = 'HALALOK: ' + deaths;
  spawnBlood(player.x + player.w / 2, player.y + player.h / 2);
  spawnChunks(player.x + player.w / 2, player.y + player.h / 2);
  pops.push({ x: player.x + player.w / 2, y: player.y + player.h / 2, age: 0, maxAge: 14, maxR: 26 });
  level.ropes.forEach(function(r) { r.angle = 0; r.angVel = 0; });
  setTimeout(function() {
    resetPlayer();
  }, 260);
}

function spawnChunks(cx, cy) {
  var colors = ['#211f1e', '#b8752f', '#f4f1e6'];
  for (var i = 0; i < 10; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 1.2 + Math.random() * 3.2;
    chunks.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.7 - 1.2,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.4,
      life: 35 + Math.random() * 25,
      size: 3 + Math.random() * 3,
      color: colors[i % colors.length]
    });
  }
}

function spawnBlood(cx, cy) {
  for (var i = 0; i < 18; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.6 + Math.random() * 2.2;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.6 - 0.6,
      life: 30 + Math.random() * 20,
      r: 2.5 + Math.random() * 3,
      landed: false,
      age: 0
    });
  }
}
