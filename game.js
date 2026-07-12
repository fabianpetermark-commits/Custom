// Splat Run -- jatek-allapot, menu, UI, vezerlok, game loop inditasa
// Sprint 1 kodrendezes: kiemelve a korabbi egyetlen inline <script>-bol.
// A jatek osszes JS fajlja (levels.js, audio.js, physics.js, draw.js, game.js)
// egyazon globalis scope-ban fut (nincs bundler/modul-rendszer), pontosan
// ugy, mint korabban egyetlen (function(){ ... })()-en belul -- csak most
// tobb <script src> tagen keresztul, betoltesi sorrendben.

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var RENDER_SCALE = canvas.width / 600;
var W = 600, H = 340;

var deathsEl = document.getElementById('deaths');
var timerEl = document.getElementById('timer');
var levelEl = document.getElementById('levelLabel');
var overlay = document.getElementById('overlay');


var LEVELS = buildLevels();

var levelIndex, level, player, keys, particles, bloodStains, pops, chunks, running, transitioning, allDone;
var frameCount, startTime, elapsed, deaths, loopId;
var camera = { x: 0, y: 0 };

var gameState = 'menu';
var pausedGame = false;
var menuIndex = 0;
var playerIdentity = null;
var supabaseClient = null;
var asyncOpToken = 0;
var nameSubmitInFlight = false;
var savingInFlight = false;
var pendingLevelIdx = null;

// Rejtett teszt-mod: a ?dev=1 URL-parammal egyszer bekapcsolva a device-on
// marad (localStorage), es a fomenube egy "PALYA VALASZTO" pontot tesz ki,
// ahonnan barmelyik palya kozvetlenul elindithato (a normal, sorban-halado
// jatekmenet valtozatlan marad a tobbi jatekosnak).
var DEV_KEY = 'splatDevMode';
(function() {
  var m = (location.search || '').match(/[?&]dev=(\d)/);
  if (m) {
    try { localStorage.setItem(DEV_KEY, m[1] === '1' ? '1' : '0'); } catch (e) {}
  }
})();
function isDevMode() {
  try { return localStorage.getItem(DEV_KEY) === '1'; } catch (e) { return false; }
}

var SUPABASE_URL = 'https://rrqrmbiclapopgrcypye.supabase.co';
var SUPABASE_KEY = 'sb_publishable_hbjYoyagZNpg7tt90PlC0w_i-7TT1IR';
if (window.supabase && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

function loadPlayerIdentity() {
  try {
    var raw = localStorage.getItem('splatRunPlayer');
    if (raw) playerIdentity = JSON.parse(raw);
  } catch (e) { playerIdentity = null; }
}
loadPlayerIdentity();

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function pad1(n) { return n.toFixed(1); }

function loadLevel(idx) {
  levelIndex = idx;
  level = LEVELS[idx];
  levelEl.textContent = 'PALYA ' + (idx + 1) + '/' + LEVELS.length;
  frameCount = 0;
  if (!level.icicles) level.icicles = [];
  if (!level.springs) level.springs = [];
  if (!level.rocks) level.rocks = [];
  if (!level.portcullis) level.portcullis = [];
  if (!level.cannons) level.cannons = [];
  if (!level.worldW) level.worldW = W;
  if (!level.worldH) level.worldH = H;
  level._solidRects = level.platforms.concat(level.spikes).concat(level.ladders).concat(level.walls).concat(level.rocks).concat(level.portcullis);
  level._cannonballs = [];
  resetIcicles();
  resetCrumblePlatforms();
  level.springs.forEach(function(sp) { sp._anim = 0; });
  level.cannons.forEach(function(c) { c._t = c.phase || 0; });
  updateMovingPlatforms();
  syncFollowSpikes();
  resetPlayer();
  particles = [];
  bloodStains = [];
  pops = [];
  chunks = [];
  level.ropes.forEach(function(r) { r.angle = 0; r.angVel = 0; });
  camera.x = 0; camera.y = 0;
  updateCamera();
  draw();
}

function updateCamera() {
  if (!player) return;
  var targetX = player.x + player.w / 2 - W / 2;
  var targetY = player.y + player.h / 2 - H / 2;
  camera.x = Math.max(0, Math.min(level.worldW - W, targetX));
  camera.y = Math.max(0, Math.min(level.worldH - H, targetY));
}

function resetPlayer() {
  var startX = level.start.x;
  var startY = level.start.y;
  if (level.start.followPlatform) {
    startY = level.start.followPlatform.y - 26;
  }
  player = {
    x: startX, y: startY, w: 18, h: 26,
    vx: 0, vy: 0, onGround: false, alive: true,
    onLadder: false, onRope: null, ridingPlatform: null,
    isJumping: false, jumpTime: 0, jumpsUsed: 0,
    facing: 1,
    onWall: null, wallSide: 0, wallJumpLockUntil: 0, wallKickFrames: 0,
    dashUsed: false, dashFrames: 0, dashDir: 1,
    slowUntilFrame: 0
  };
  if (level && level.icicles) resetIcicles();
  if (level && level.platforms) resetCrumblePlatforms();
}

function resetIcicles() {
  level.icicles.forEach(function(ic) {
    ic._st = 'idle';
    ic._fy = ic.y;
    ic._vy = 0;
    ic._t = 0;
  });
}

function resetCrumblePlatforms() {
  level.platforms.forEach(function(p) {
    if (!p.crumble) return;
    p._cst = 'idle';
    p._ct = 0;
    p._origY = p.y;
  });
}

keys = { left: false, right: false, up: false, down: false, jumpHeld: false };
var spaceDown = false;
var lastFrameTime = null;
var accumulator = 0;
var FIXED_DT = 1000 / 60;

function startRun() {
  var hashMatch = (location.hash || '').match(/palya=(\d+)/);
  var startIdx = hashMatch ? Math.min(LEVELS.length - 1, Math.max(0, parseInt(hashMatch[1], 10) - 1)) : 0;
  startAtLevel(startIdx);
}

function startAtLevel(idx) {
  asyncOpToken++;
  gameState = 'playing';
  pausedGame = false;
  deaths = 0;
  elapsed = 0;
  transitioning = false;
  allDone = false;
  loadLevel(idx);
  beginLoop();
  startMusic();
}

function openPauseMenu() {
  if (gameState !== 'playing') return;
  pausedGame = true;
  cancelAnimationFrame(loopId);
  if (sawSound && audioCtx) sawSound.gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
  showMenu();
}

function resumeGame() {
  asyncOpToken++;
  pausedGame = false;
  gameState = 'playing';
  beginLoop();
}

function beginLoop() {
  running = true;
  overlay.classList.add('hidden');
  startTime = performance.now() - elapsed * 1000;
  lastFrameTime = null;
  accumulator = 0;
  loopId = requestAnimationFrame(loop);
}

function loop(now) {
  if (!running) return;
  if (lastFrameTime === null) lastFrameTime = now;
  var delta = now - lastFrameTime;
  lastFrameTime = now;
  if (delta > 250) delta = 250;
  accumulator += delta;

  while (accumulator >= FIXED_DT) {
    if (player.alive && !transitioning && !allDone) frameCount += 1;
    update();
    accumulator -= FIXED_DT;
  }

  elapsed = (performance.now() - startTime) / 1000;
  timerEl.textContent = 'IDO: ' + pad1(elapsed) + 's';
  draw();
  if (running) loopId = requestAnimationFrame(loop);
}


function reachGoal() {
  transitioning = true;
  if (levelIndex >= LEVELS.length - 1) {
    allDone = true;
    running = false;
    gameState = 'victory';
    cancelAnimationFrame(loopId);
    overlay.innerHTML = '<div class="overlay-title">GYOZELEM!</div>' +
      '<div>OSSZ IDO: ' + pad1(elapsed) + 's &nbsp; HALALOK: ' + deaths + '</div>' +
      '<div class="blink">UJRAINDITAS: NYOMJ EGY GOMBOT</div>' +
      '<div class="menu-list"><div class="menu-item" id="victoryMenuBtn">FOMENU</div></div>';
    overlay.classList.remove('hidden');
    var vbtn = document.getElementById('victoryMenuBtn');
    if (vbtn) vbtn.addEventListener('click', function() { pausedGame = false; showMenu(); });
    return;
  }
  running = false;
  gameState = 'levelComplete';
  cancelAnimationFrame(loopId);
  overlay.innerHTML = '<div class="overlay-title">PALYA TELJESITVE</div>' +
    '<div>' + level.name + ' KESZ &nbsp; HALALOK: ' + deaths + '</div>' +
    '<div class="blink">FOLYTATAS: NYOMJ EGY GOMBOT</div>';
  overlay.classList.remove('hidden');
}

function advanceAfterOverlay() {
  if (allDone) {
    startRun();
    return;
  }
  transitioning = false;
  gameState = 'playing';
  loadLevel(levelIndex + 1);
  beginLoop();
}

function isIosSafari() {
  var ua = window.navigator.userAgent;
  var isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  var isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  return isIos && isSafari;
}

function menuItemList() {
  var items = pausedGame ? [{ action: 'resume', label: 'FOLYTATAS' }] : [];
  items = items.concat([
    { action: 'new', label: 'UJ JATEK' },
    { action: 'load', label: 'JATEK BETOLTESE', disabled: savingInFlight },
    { action: 'save', label: 'JATEK MENTESE', disabled: savingInFlight },
    { action: 'rank', label: 'RANGSOR' },
    { action: 'settings', label: 'BEALLITASOK' },
    { action: 'install', label: 'TELEPITES' }
  ]);
  if (isDevMode()) items.push({ action: 'levelselect', label: 'PALYA VALASZTO' });
  return items;
}

function triggerInstall() {
  if (window.__isStandaloneApp) {
    showInstallInstructions('MAR TELEPITVE VAN EZEN AZ ESZKOZON.');
    return;
  }
  if (window.__deferredInstallPrompt) {
    var promptEvent = window.__deferredInstallPrompt;
    window.__deferredInstallPrompt = null;
    promptEvent.prompt();
    promptEvent.userChoice.then(function() { renderMenu(); });
    return;
  }
  if (isIosSafari()) {
    showInstallInstructions('SAFARIBAN: KOPPINTS A MEGOSZTAS IKONRA,<br>MAJD VALASZD: "KEZDOKEPERNYOHOZ ADAS"');
    return;
  }
  showInstallInstructions('EZ A BONGESZO NEM TAMOGATJA A KOZVETLEN TELEPITEST.<br>HASZNALD A BONGESZO MENUJET: "TELEPITES" / "HOZZAADAS A KEZDOKEPERNYOHOZ".');
}

function showInstallInstructions(message) {
  gameState = 'install';
  overlay.innerHTML =
    '<div class="overlay-title">TELEPITES</div>' +
    '<div>' + message + '</div>' +
    '<div class="menu-list"><div class="menu-item selected" id="installBack">VISSZA</div></div>';
  overlay.classList.remove('hidden');
  var btn = document.getElementById('installBack');
  if (btn) btn.addEventListener('click', function() { showMenu(); });
}

function showMenu(msg, msgIsError) {
  asyncOpToken++;
  running = false;
  transitioning = false;
  gameState = 'menu';
  menuIndex = 0;
  cancelAnimationFrame(loopId);
  if (!pausedGame) loadLevel(levelIndex || 0);
  renderMenu(msg, msgIsError);
  overlay.classList.remove('hidden');
}

function renderMenu(msg, msgIsError) {
  var items = menuItemList();
  if (menuIndex >= items.length) menuIndex = 0;
  var itemsHtml = items.map(function(item, i) {
    var cls = 'menu-item' + (i === menuIndex ? ' selected' : '') + (item.disabled ? ' disabled' : '');
    return '<div class="' + cls + '" data-action="' + item.action + '">' + item.label + '</div>';
  }).join('');
  overlay.innerHTML =
    '<div class="overlay-title">SPLAT RUN</div>' +
    (playerIdentity ? '<div>JATEKOS: ' + escapeHtml(playerIdentity.name) + '</div>' : '<div>NINCS MEG NEV BEALLITVA</div>') +
    '<div class="menu-list">' + itemsHtml + '</div>' +
    '<div class="menu-msg' + (msgIsError ? ' error' : '') + '">' + (msg ? escapeHtml(msg) : '') + '</div>';
  Array.prototype.forEach.call(overlay.querySelectorAll('.menu-item'), function(el, i) {
    el.addEventListener('click', function() {
      if (items[i].disabled) return;
      menuIndex = i;
      handleMenuAction(items[i].action);
    });
  });
}

function handleMenuKeydown(e) {
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  var key = e.key.toLowerCase();
  var items = menuItemList();
  if (key === 'arrowup' || key === 'w') {
    menuIndex = (menuIndex - 1 + items.length) % items.length;
    renderMenu();
    e.preventDefault();
  } else if (key === 'arrowdown' || key === 's') {
    menuIndex = (menuIndex + 1) % items.length;
    renderMenu();
    e.preventDefault();
  } else if (key === 'enter' || key === ' ') {
    if (!items[menuIndex].disabled) handleMenuAction(items[menuIndex].action);
    e.preventDefault();
  }
}

function handleMenuAction(action) {
  if (action === 'resume') resumeGame();
  else if (action === 'new') startNewGame();
  else if (action === 'load') loadGame();
  else if (action === 'save') saveGame();
  else if (action === 'rank') showRanking();
  else if (action === 'settings') showSettings();
  else if (action === 'install') triggerInstall();
  else if (action === 'levelselect') showLevelSelect();
}

function showLevelSelect() {
  gameState = 'levelSelect';
  var itemsHtml = LEVELS.map(function(lv, i) {
    return '<div class="menu-item" data-idx="' + i + '">' + (i + 1) + '. ' + escapeHtml(lv.name) + '</div>';
  }).join('');
  overlay.innerHTML =
    '<div class="overlay-title">PALYA VALASZTO</div>' +
    '<div class="menu-list level-select-list">' + itemsHtml + '</div>' +
    '<div class="menu-list"><div class="menu-item selected" id="levelSelectBack">VISSZA</div></div>';
  overlay.classList.remove('hidden');
  Array.prototype.forEach.call(overlay.querySelectorAll('[data-idx]'), function(el) {
    el.addEventListener('click', function() {
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      if (!playerIdentity) { pendingLevelIdx = idx; showNamePrompt(); return; }
      startAtLevel(idx);
    });
  });
  var backBtn = document.getElementById('levelSelectBack');
  if (backBtn) backBtn.addEventListener('click', function() { showMenu(); });
}

function startNewGame() {
  if (!playerIdentity) {
    showNamePrompt();
    return;
  }
  startRun();
}

function showNamePrompt(errorMsg) {
  gameState = 'nameEntry';
  nameSubmitInFlight = false;
  overlay.innerHTML =
    '<div class="overlay-title">SPLAT RUN</div>' +
    '<div>ADD MEG A NEVED</div>' +
    '<input type="text" class="menu-name-input" id="nameInput" maxlength="20" autocomplete="off">' +
    '<div class="menu-list">' +
      '<div class="menu-item selected" id="nameSubmit">KEZDES</div>' +
      '<div class="menu-item" id="nameCancel">VISSZA</div>' +
    '</div>' +
    '<div class="menu-msg error">' + (errorMsg ? escapeHtml(errorMsg) : '') + '</div>';
  overlay.classList.remove('hidden');
  var input = document.getElementById('nameInput');
  input.focus();
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); submitName(); }
    e.stopPropagation();
  });
  input.addEventListener('keyup', function(e) { e.stopPropagation(); });
  document.getElementById('nameSubmit').addEventListener('click', submitName);
  document.getElementById('nameCancel').addEventListener('click', function() { showMenu(); });
}

function submitName() {
  if (nameSubmitInFlight) return;
  var input = document.getElementById('nameInput');
  var name = input ? input.value.trim() : '';
  if (!name) { showNamePrompt('Adj meg egy nevet!'); return; }
  if (!supabaseClient) { showNamePrompt('Nincs kapcsolat a szerverrel.'); return; }
  nameSubmitInFlight = true;
  var submitBtn = document.getElementById('nameSubmit');
  if (submitBtn) submitBtn.classList.add('disabled');
  var myToken = ++asyncOpToken;
  var id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('id-' + Date.now() + '-' + Math.random().toString(16).slice(2));
  supabaseClient.from('players').insert({ id: id, name: name }).then(function(res) {
    if (myToken !== asyncOpToken) return;
    if (res.error) {
      if (res.error.code === '23505') {
        showNamePrompt('Ez a nev mar foglalt, valassz mast!');
      } else {
        showNamePrompt('Hiba tortent, probald ujra!');
      }
      return;
    }
    playerIdentity = { id: id, name: name };
    localStorage.setItem('splatRunPlayer', JSON.stringify(playerIdentity));
    if (pendingLevelIdx !== null) {
      var idxToStart = pendingLevelIdx;
      pendingLevelIdx = null;
      startAtLevel(idxToStart);
    } else {
      startRun();
    }
  }).catch(function() {
    if (myToken !== asyncOpToken) return;
    showNamePrompt('Nincs kapcsolat a szerverrel.');
  });
}

function saveGame() {
  if (savingInFlight) return;
  if (!playerIdentity) { showNamePrompt(); return; }
  if (!supabaseClient) { showMenu('Nincs kapcsolat a szerverrel.', true); return; }
  savingInFlight = true;
  renderMenu();
  var myToken = ++asyncOpToken;
  supabaseClient.from('players').update({
    level_index: levelIndex,
    total_time: elapsed,
    total_deaths: deaths,
    updated_at: new Date().toISOString()
  }).eq('id', playerIdentity.id).then(function(res) {
    savingInFlight = false;
    if (myToken !== asyncOpToken) return;
    if (res.error) { showMenu('Mentesi hiba!', true); return; }
    showMenu('JATEKALLAS MENTVE');
  });
}

function loadGame() {
  if (!playerIdentity) { showNamePrompt(); return; }
  if (!supabaseClient) { showMenu('Nincs kapcsolat a szerverrel.', true); return; }
  var myToken = ++asyncOpToken;
  supabaseClient.from('players').select('level_index, total_time, total_deaths').eq('id', playerIdentity.id).single()
    .then(function(res) {
      if (myToken !== asyncOpToken) return;
      if (res.error || !res.data) { showMenu('Nincs elmentett allas.', true); return; }
      pausedGame = false;
      gameState = 'playing';
      deaths = res.data.total_deaths || 0;
      elapsed = res.data.total_time || 0;
      transitioning = false;
      allDone = false;
      loadLevel(res.data.level_index || 0);
      beginLoop();
      startMusic();
    });
}

function showRanking() {
  gameState = 'ranking';
  var myToken = ++asyncOpToken;
  overlay.innerHTML = '<div class="overlay-title">RANGSOR</div><div class="menu-msg">Betoltes...</div>';
  overlay.classList.remove('hidden');
  if (!supabaseClient) {
    renderRankingList([], true);
    return;
  }
  supabaseClient.from('players')
    .select('name, level_index, total_time, total_deaths')
    .order('level_index', { ascending: false })
    .order('total_time', { ascending: true })
    .then(function(res) {
      if (myToken !== asyncOpToken) return;
      renderRankingList(res.data || [], !!res.error);
    });
}

function renderRankingList(list, hadError) {
  var rowsHtml = list.map(function(p) {
    return '<div class="rank-row">' +
      '<span class="rname">' + escapeHtml(p.name) + '</span>' +
      '<span>PALYA ' + (p.level_index + 1) + '/' + LEVELS.length + '</span>' +
      '<span>IDO ' + pad1(p.total_time) + 's</span>' +
      '<span>HALALOK ' + p.total_deaths + '</span>' +
      '</div>';
  }).join('');
  overlay.innerHTML =
    '<div class="overlay-title">RANGSOR</div>' +
    '<div class="rank-table">' +
      '<div class="rank-row header"><span class="rname">NEV</span><span>PALYA</span><span>IDO</span><span>HALALOK</span></div>' +
      (rowsHtml || '<div class="menu-msg">Meg nincs jatekos a rangsorban.</div>') +
    '</div>' +
    (hadError ? '<div class="menu-msg error">Hiba a rangsor betoltesekor.</div>' : '') +
    '<div class="menu-list"><div class="menu-item selected" id="rankBack">VISSZA</div></div>';
  var btn = document.getElementById('rankBack');
  if (btn) btn.addEventListener('click', function() { showMenu(); });
}


document.addEventListener('keydown', function(e) {
  var key = e.key.toLowerCase();

  if (key === 'escape') {
    if (gameState === 'playing') { openPauseMenu(); e.preventDefault(); return; }
    if (gameState === 'menu' && pausedGame) { resumeGame(); e.preventDefault(); return; }
  }

  if (gameState === 'menu') { handleMenuKeydown(e); return; }
  if (gameState === 'nameEntry') { return; }
  if (gameState === 'reposition') { if (key === 'escape' || key === 'enter') exitRepositionMode(); return; }
  if (gameState === 'settings') {
    if (key === 'escape') { e.preventDefault(); showMenu(); }
    return;
  }
  if (gameState === 'ranking' || gameState === 'install' || gameState === 'levelSelect') {
    if (key === 'enter' || key === ' ' || key === 'escape' || key === 'arrowup' || key === 'arrowdown') {
      e.preventDefault();
      showMenu();
    }
    return;
  }

  if (!running && !transitioning) {
    startRun();
    return;
  }
  if (!running && transitioning) {
    advanceAfterOverlay();
    return;
  }

  if (key === 'arrowleft' || key === 'a') keys.left = true;
  if (key === 'arrowright' || key === 'd') keys.right = true;
  if (key === 'arrowup' || key === 'w') keys.up = true;
  if (key === 'arrowdown' || key === 's') keys.down = true;

  if (key === ' ') {
    if (player.onRope) {
      keys.up = true;
    } else if (!spaceDown) {
      handleJumpPress();
    }
    spaceDown = true;
    keys.jumpHeld = true;
    e.preventDefault();
  }
  if (key === 'shift') {
    if (!e.repeat) handleDashPress();
    e.preventDefault();
  }
  if (key.indexOf('arrow') === 0) e.preventDefault();
});

document.addEventListener('keyup', function(e) {
  var key = e.key.toLowerCase();
  if (key === 'arrowleft' || key === 'a') keys.left = false;
  if (key === 'arrowright' || key === 'd') keys.right = false;
  if (key === 'arrowup' || key === 'w') keys.up = false;
  if (key === 'arrowdown' || key === 's') keys.down = false;
  if (key === ' ') { keys.up = false; keys.jumpHeld = false; spaceDown = false; }
});

// ===================== VEZERLO BEALLITASOK =====================
var CTRL_KEY = 'splatControls';
var touchControlsEl = document.getElementById('touchControls');
var dpadEl = document.getElementById('dpad');
var stickEl = document.getElementById('stick');
var stickKnobEl = document.getElementById('stickKnob');
var moveControlEl = document.getElementById('moveControl');
var jumpBtnEl = document.getElementById('btnJump');
var dashBtnEl = document.getElementById('btnDash');
var editBannerEl = document.getElementById('editBanner');

function defaultControlSettings() { return { mode: 'dpad', scale: 1, pos: null }; }

function loadControlSettings() {
  try {
    var raw = localStorage.getItem(CTRL_KEY);
    if (raw) {
      var s = JSON.parse(raw);
      var pos = (s.pos && s.pos.move && s.pos.jump && s.pos.dash) ? s.pos : null;
      return {
        mode: s.mode === 'stick' ? 'stick' : 'dpad',
        scale: Math.min(1.4, Math.max(0.6, parseFloat(s.scale) || 1)),
        pos: pos
      };
    }
  } catch (e) {}
  return defaultControlSettings();
}

var controlSettings = loadControlSettings();

function saveControlSettings() {
  try { localStorage.setItem(CTRL_KEY, JSON.stringify(controlSettings)); } catch (e) {}
}

function setGroupPos(el, p) { el.style.left = p.x + '%'; el.style.top = p.y + '%'; }

// Meret- (scale-) valtas vagy kepernyo-atmeretezes utan a korabban elmentett
// szazalekos pozicio mar nagyobb/kisebb gombot es/vagy mas konteneretmeretet
// takarhat el -- ezert minden alkalmazas utan visszaigazitjuk, hogy a gomb
// teljes egeszeben a lathato touchControls teruleten belul maradjon.
function clampCustomPositions() {
  if (!controlSettings.pos) return;
  if (touchControlsEl.classList.contains('editing')) return; // szerkesztes kozben a sajat drag/pinch-kezelo mar clampel
  var tc = touchControlsEl.getBoundingClientRect();
  if (tc.width <= 0 || tc.height <= 0) return;
  [[moveControlEl, 'move'], [jumpBtnEl, 'jump'], [dashBtnEl, 'dash']].forEach(function(pair) {
    var el = pair[0], key = pair[1];
    var r = el.getBoundingClientRect();
    var left = r.left - tc.left, top = r.top - tc.top;
    var maxLeft = Math.max(0, tc.width - r.width), maxTop = Math.max(0, tc.height - r.height);
    var clampedLeft = Math.max(0, Math.min(maxLeft, left));
    var clampedTop = Math.max(0, Math.min(maxTop, top));
    if (Math.abs(clampedLeft - left) > 0.5 || Math.abs(clampedTop - top) > 0.5) {
      var p = { x: clampedLeft / tc.width * 100, y: clampedTop / tc.height * 100 };
      controlSettings.pos[key] = p;
      setGroupPos(el, p);
    }
  });
}

function applyControlSettings() {
  touchControlsEl.style.setProperty('--ctrl-scale', controlSettings.scale);
  var stick = controlSettings.mode === 'stick';
  dpadEl.style.display = stick ? 'none' : '';
  stickEl.style.display = stick ? 'block' : 'none';
  if (controlSettings.pos) {
    touchControlsEl.classList.add('custom-layout');
    setGroupPos(moveControlEl, controlSettings.pos.move);
    setGroupPos(jumpBtnEl, controlSettings.pos.jump);
    setGroupPos(dashBtnEl, controlSettings.pos.dash);
    if (!touchControlsEl.classList.contains('editing')) {
      clampCustomPositions();
      saveControlSettings();
    }
  } else {
    touchControlsEl.classList.remove('custom-layout');
    moveControlEl.style.left = moveControlEl.style.top = '';
    jumpBtnEl.style.left = jumpBtnEl.style.top = '';
    dashBtnEl.style.left = dashBtnEl.style.top = '';
  }
  if (!stick) stickEnd();
}

window.addEventListener('resize', function() {
  if (!touchControlsEl.classList.contains('editing')) clampCustomPositions();
});

// ---- Analog stick input ----
var stickActive = false, stickTouchId = null, stickCX = 0, stickCY = 0, stickRad = 60;

function stickBegin(clientX, clientY) {
  var rect = stickEl.getBoundingClientRect();
  stickCX = rect.left + rect.width / 2;
  stickCY = rect.top + rect.height / 2;
  stickRad = rect.width * 0.42;
  stickActive = true;
  stickApply(clientX, clientY);
}

function stickApply(clientX, clientY) {
  if (!stickActive) return;
  var dx = clientX - stickCX, dy = clientY - stickCY;
  var dist = Math.hypot(dx, dy) || 0.0001;
  var max = stickRad;
  var cx = dx, cy = dy;
  if (dist > max) { cx = dx / dist * max; cy = dy / dist * max; }
  stickKnobEl.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
  var nx = cx / max, ny = cy / max, dz = 0.30;
  keys.left = nx < -dz;
  keys.right = nx > dz;
  keys.up = ny < -dz;
  keys.down = ny > dz;
}

function stickEnd() {
  stickActive = false;
  stickTouchId = null;
  keys.left = keys.right = keys.up = keys.down = false;
  stickKnobEl.style.transform = 'translate(0px,0px)';
}

function stickEditing() { return touchControlsEl.classList.contains('editing'); }

stickEl.addEventListener('touchstart', function(e) {
  if (stickEditing()) return; // athelyezes/atmeretezes mod: hagyjuk a szulo drag/pinch-kezelojere
  e.preventDefault();
  if (stickTouchId !== null) return;
  var t = e.changedTouches[0];
  stickTouchId = t.identifier;
  stickBegin(t.clientX, t.clientY);
}, { passive: false });
stickEl.addEventListener('touchmove', function(e) {
  if (stickEditing()) return;
  e.preventDefault();
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    if (t.identifier === stickTouchId) stickApply(t.clientX, t.clientY);
  }
}, { passive: false });
function stickTouchEnd(e) {
  for (var i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === stickTouchId) stickEnd();
  }
}
stickEl.addEventListener('touchend', stickTouchEnd, { passive: false });
stickEl.addEventListener('touchcancel', stickTouchEnd, { passive: false });
stickEl.addEventListener('mousedown', function(e) {
  if (stickEditing()) return;
  e.preventDefault();
  stickBegin(e.clientX, e.clientY);
  function mm(ev) { stickApply(ev.clientX, ev.clientY); }
  function mu() { stickEnd(); window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); }
  window.addEventListener('mousemove', mm);
  window.addEventListener('mouseup', mu);
});

// ---- Beallitas kepernyo ----
function showSettings() {
  gameState = 'settings';
  renderSettings();
  overlay.classList.remove('hidden');
}

function renderSettings() {
  var s = controlSettings;
  overlay.innerHTML =
    '<div class="overlay-title">BEALLITASOK</div>' +
    '<div class="set-row"><span class="set-label">VEZERLES</span><div class="set-seg">' +
      '<div class="seg ' + (s.mode === 'dpad' ? 'on' : '') + '" data-mode="dpad">D-PAD</div>' +
      '<div class="seg ' + (s.mode === 'stick' ? 'on' : '') + '" data-mode="stick">STICK</div>' +
    '</div></div>' +
    '<div class="set-row"><span class="set-label">GOMBMERET</span><div class="set-step">' +
      '<div class="stepbtn" data-step="-1">&minus;</div>' +
      '<div class="stepval">' + Math.round(s.scale * 100) + '%</div>' +
      '<div class="stepbtn" data-step="1">+</div>' +
    '</div></div>' +
    '<div class="menu-list">' +
      '<div class="menu-item" data-act="reposition">GOMBOK ATHELYEZESE</div>' +
      '<div class="menu-item" data-act="resetpos">ELRENDEZES ALAPHELYZET</div>' +
      '<div class="menu-item selected" data-act="back">VISSZA</div>' +
    '</div>' +
    '<div class="menu-msg">A VALTOZASOK AZONNAL ELMENTODNEK</div>';
  Array.prototype.forEach.call(overlay.querySelectorAll('.seg'), function(el) {
    el.addEventListener('click', function() {
      controlSettings.mode = el.getAttribute('data-mode');
      saveControlSettings(); applyControlSettings(); renderSettings();
    });
  });
  Array.prototype.forEach.call(overlay.querySelectorAll('.stepbtn'), function(el) {
    el.addEventListener('click', function() {
      var d = parseInt(el.getAttribute('data-step'), 10) * 0.1;
      controlSettings.scale = Math.min(1.4, Math.max(0.6, Math.round((controlSettings.scale + d) * 10) / 10));
      saveControlSettings(); applyControlSettings(); renderSettings();
    });
  });
  Array.prototype.forEach.call(overlay.querySelectorAll('.menu-item'), function(el) {
    el.addEventListener('click', function() {
      var act = el.getAttribute('data-act');
      if (act === 'back') { showMenu(); }
      else if (act === 'reposition') { enterRepositionMode(); }
      else if (act === 'resetpos') { controlSettings.pos = null; saveControlSettings(); applyControlSettings(); renderSettings(); }
    });
  });
}

// ---- Gombok athelyezese (drag szerkeszto) ----
function bakeCurrentPositions() {
  var tc = touchControlsEl.getBoundingClientRect();
  function pct(el) {
    var r = el.getBoundingClientRect();
    return { x: (r.left - tc.left) / tc.width * 100, y: (r.top - tc.top) / tc.height * 100 };
  }
  controlSettings.pos = { move: pct(moveControlEl), jump: pct(jumpBtnEl), dash: pct(dashBtnEl) };
}

var dragCleanup = [];
function enableDrag(el, keyName) {
  function startDrag(clientX, clientY, onMove, onEnd) {
    var tc = touchControlsEl.getBoundingClientRect();
    var er = el.getBoundingClientRect();
    var offX = clientX - er.left, offY = clientY - er.top;
    var w = er.width, h = er.height;
    function moveTo(cx, cy) {
      var left = Math.max(0, Math.min(tc.width - w, cx - offX - tc.left));
      var top = Math.max(0, Math.min(tc.height - h, cy - offY - tc.top));
      var px = left / tc.width * 100, py = top / tc.height * 100;
      el.style.left = px + '%'; el.style.top = py + '%';
      controlSettings.pos[keyName] = { x: px, y: py };
    }
    onMove(moveTo); onEnd();
  }
  function td(e) {
    e.preventDefault();
    var t = e.changedTouches[0], id = t.identifier;
    startDrag(t.clientX, t.clientY, function(moveTo) {
      el._dragMove = function(ev) {
        for (var i = 0; i < ev.changedTouches.length; i++) {
          var ct = ev.changedTouches[i];
          if (ct.identifier === id) { ev.preventDefault(); moveTo(ct.clientX, ct.clientY); }
        }
      };
      el._dragEnd = function(ev) {
        for (var i = 0; i < ev.changedTouches.length; i++) {
          if (ev.changedTouches[i].identifier === id) endTouch();
        }
      };
      window.addEventListener('touchmove', el._dragMove, { passive: false });
      window.addEventListener('touchend', el._dragEnd);
      window.addEventListener('touchcancel', el._dragEnd);
    }, function() {});
    function endTouch() {
      window.removeEventListener('touchmove', el._dragMove);
      window.removeEventListener('touchend', el._dragEnd);
      window.removeEventListener('touchcancel', el._dragEnd);
    }
  }
  function md(e) {
    e.preventDefault();
    startDrag(e.clientX, e.clientY, function(moveTo) {
      function mm(ev) { moveTo(ev.clientX, ev.clientY); }
      function mu() { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); }
      window.addEventListener('mousemove', mm);
      window.addEventListener('mouseup', mu);
    }, function() {});
  }
  el.addEventListener('touchstart', td, { passive: false });
  el.addEventListener('mousedown', md);
  dragCleanup.push(function() {
    el.removeEventListener('touchstart', td);
    el.removeEventListener('mousedown', md);
  });
}

function enterRepositionMode() {
  gameState = 'reposition';
  overlay.classList.add('hidden');
  stickEnd();
  touchControlsEl.classList.add('editing');
  if (!controlSettings.pos) {
    // varjunk egy frame-et hogy az editing-layout kiszamolodjon, majd bake
    requestAnimationFrame(function() {
      bakeCurrentPositions();
      touchControlsEl.classList.add('custom-layout');
      setGroupPos(moveControlEl, controlSettings.pos.move);
      setGroupPos(jumpBtnEl, controlSettings.pos.jump);
      setGroupPos(dashBtnEl, controlSettings.pos.dash);
    });
  } else {
    touchControlsEl.classList.add('custom-layout');
    setGroupPos(moveControlEl, controlSettings.pos.move);
    setGroupPos(jumpBtnEl, controlSettings.pos.jump);
    setGroupPos(dashBtnEl, controlSettings.pos.dash);
  }
  editBannerEl.classList.remove('hidden');
  enableDrag(moveControlEl, 'move');
  enableDrag(jumpBtnEl, 'jump');
  enableDrag(dashBtnEl, 'dash');
}

function exitRepositionMode() {
  dragCleanup.forEach(function(fn) { fn(); });
  dragCleanup = [];
  touchControlsEl.classList.remove('editing');
  editBannerEl.classList.add('hidden');
  pinchTouches = {};
  pinchStartDist = null;
  saveControlSettings();
  applyControlSettings();
  showSettings();
}

// ---- Ket ujjas csippentes: meretezes athelyezes kozben ----
var pinchTouches = {};
var pinchStartDist = null;
var pinchStartScale = 1;

function pinchIds() { return Object.keys(pinchTouches); }
function pinchDist() {
  var ids = pinchIds();
  var a = pinchTouches[ids[0]], b = pinchTouches[ids[1]];
  return Math.hypot(a.x - b.x, a.y - b.y);
}

document.addEventListener('touchstart', function(e) {
  if (!touchControlsEl.classList.contains('editing')) return;
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    pinchTouches[t.identifier] = { x: t.clientX, y: t.clientY };
  }
  if (pinchIds().length === 2) {
    pinchStartDist = pinchDist();
    pinchStartScale = controlSettings.scale;
  }
}, { passive: true });

document.addEventListener('touchmove', function(e) {
  if (!touchControlsEl.classList.contains('editing')) return;
  var changed = false;
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    if (pinchTouches[t.identifier]) {
      pinchTouches[t.identifier] = { x: t.clientX, y: t.clientY };
      changed = true;
    }
  }
  if (changed && pinchIds().length === 2 && pinchStartDist) {
    e.preventDefault();
    var ratio = pinchDist() / pinchStartDist;
    controlSettings.scale = Math.min(1.4, Math.max(0.6, pinchStartScale * ratio));
    applyControlSettings();
  }
}, { passive: false });

function pinchRelease(e) {
  for (var i = 0; i < e.changedTouches.length; i++) {
    delete pinchTouches[e.changedTouches[i].identifier];
  }
  if (pinchIds().length < 2) {
    if (pinchStartDist) {
      controlSettings.scale = Math.round(controlSettings.scale * 20) / 20;
      applyControlSettings();
      saveControlSettings();
    }
    pinchStartDist = null;
  }
}
document.addEventListener('touchend', pinchRelease, { passive: true });
document.addEventListener('touchcancel', pinchRelease, { passive: true });

editBannerEl.querySelector('#editDone').addEventListener('click', exitRepositionMode);
editBannerEl.querySelector('#editReset').addEventListener('click', function() {
  controlSettings.pos = null;
  touchControlsEl.classList.remove('custom-layout');
  moveControlEl.style.left = moveControlEl.style.top = '';
  jumpBtnEl.style.left = jumpBtnEl.style.top = '';
  dashBtnEl.style.left = dashBtnEl.style.top = '';
  requestAnimationFrame(function() {
    bakeCurrentPositions();
    touchControlsEl.classList.add('custom-layout');
    setGroupPos(moveControlEl, controlSettings.pos.move);
    setGroupPos(jumpBtnEl, controlSettings.pos.jump);
    setGroupPos(dashBtnEl, controlSettings.pos.dash);
  });
});

function bindHold(el, onDown, onUp) {
  el.addEventListener('touchstart', function(e) { e.preventDefault(); onDown(); }, { passive: false });
  el.addEventListener('touchend', function(e) { e.preventDefault(); onUp(); }, { passive: false });
  el.addEventListener('mousedown', function(e) { e.preventDefault(); onDown(); });
  el.addEventListener('mouseup', function(e) { e.preventDefault(); onUp(); });
}

bindHold(document.getElementById('btnLeft'), function() { keys.left = true; }, function() { keys.left = false; });
bindHold(document.getElementById('btnRight'), function() { keys.right = true; }, function() { keys.right = false; });
bindHold(document.getElementById('btnUp'), function() { keys.up = true; }, function() { keys.up = false; });
bindHold(document.getElementById('btnDown'), function() { keys.down = true; }, function() { keys.down = false; });

document.getElementById('btnJump').addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (gameState === 'menu' || gameState === 'nameEntry' || gameState === 'ranking' || gameState === 'install' || gameState === 'settings' || gameState === 'reposition' || gameState === 'levelSelect') return;
  if (!running && !transitioning) { startRun(); return; }
  if (!running && transitioning) { advanceAfterOverlay(); return; }
  if (player.onRope) { keys.up = true; setTimeout(function() { keys.up = false; }, 50); return; }
  handleJumpPress();
  keys.jumpHeld = true;
}, { passive: false });

document.getElementById('btnJump').addEventListener('touchend', function(e) {
  e.preventDefault();
  keys.jumpHeld = false;
}, { passive: false });

document.getElementById('btnJump').addEventListener('mousedown', function(e) {
  e.preventDefault();
  if (gameState === 'menu' || gameState === 'nameEntry' || gameState === 'ranking' || gameState === 'install' || gameState === 'settings' || gameState === 'reposition' || gameState === 'levelSelect') return;
  if (!running && !transitioning) { startRun(); return; }
  if (!running && transitioning) { advanceAfterOverlay(); return; }
  if (player.onRope) { keys.up = true; setTimeout(function() { keys.up = false; }, 50); return; }
  handleJumpPress();
  keys.jumpHeld = true;
});

document.getElementById('btnJump').addEventListener('mouseup', function(e) {
  e.preventDefault();
  keys.jumpHeld = false;
});

document.getElementById('pauseToggle').addEventListener('click', function() {
  if (gameState === 'playing') openPauseMenu();
  else if (gameState === 'menu' && pausedGame) resumeGame();
});

document.getElementById('btnDash').addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (gameState === 'menu' || gameState === 'nameEntry' || gameState === 'ranking' || gameState === 'install' || gameState === 'settings' || gameState === 'reposition' || gameState === 'levelSelect') return;
  if (!running) return;
  handleDashPress();
}, { passive: false });

document.getElementById('btnDash').addEventListener('mousedown', function(e) {
  e.preventDefault();
  if (gameState === 'menu' || gameState === 'nameEntry' || gameState === 'ranking' || gameState === 'install' || gameState === 'settings' || gameState === 'reposition' || gameState === 'levelSelect') return;
  if (!running) return;
  handleDashPress();
});

deaths = 0;
elapsed = 0;
running = false;
transitioning = false;
allDone = false;
applyControlSettings();
showMenu();
