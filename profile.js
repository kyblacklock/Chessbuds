/* Chessbuds — Profile & Persistence */

const STORAGE_KEY = 'chessbuds';

const DEFAULT_DATA = {
  stats: {
    gamesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    recentGames: []
  },
  preferences: {
    opponent: 'bot',
    difficulty: 2,
    playerColor: 'w',
    timeControl: 0,
    environment: 0,
    cameraPreset: 0
  }
};

// ── Storage ──────────────────────────────────────────────────

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
    const data = JSON.parse(raw);
    return {
      stats: { ...DEFAULT_DATA.stats, ...data.stats,
        recentGames: data.stats?.recentGames || []
      },
      preferences: { ...DEFAULT_DATA.preferences, ...data.preferences }
    };
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function saveProfile(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* private browsing or storage full — fail silently */ }
}

function determineResult(gameResult, settings) {
  if (gameResult.includes('stalemate') || gameResult.includes('Draw')) {
    return 'draw';
  }
  if (settings.opponent === 'human') return 'pvp';
  const whiteWins = gameResult.includes('White wins');
  const playerIsWhite = settings.playerColor === 'w';
  return (whiteWins === playerIsWhite) ? 'win' : 'loss';
}

function recordGameResult(result, resultDetail, settings, moveCount) {
  const data = loadProfile();
  const s = data.stats;

  if (result !== 'pvp') {
    s.gamesPlayed++;
    if (result === 'win') {
      s.wins++;
      s.currentStreak = Math.max(0, s.currentStreak) + 1;
      s.bestStreak = Math.max(s.bestStreak, s.currentStreak);
    } else if (result === 'loss') {
      s.losses++;
      s.currentStreak = Math.min(0, s.currentStreak) - 1;
    } else {
      s.draws++;
      s.currentStreak = 0;
    }
  }

  s.recentGames.unshift({
    result,
    resultDetail,
    opponent: settings.opponent,
    difficulty: settings.opponent === 'bot' ? settings.difficulty : null,
    playerColor: settings.playerColor,
    timeControl: settings.timeControl,
    moves: moveCount,
    timestamp: Date.now()
  });

  if (s.recentGames.length > 20) s.recentGames = s.recentGames.slice(0, 20);

  saveProfile(data);
  return { data, result };
}

function savePreferences(prefs) {
  const data = loadProfile();
  data.preferences = { ...data.preferences, ...prefs };
  saveProfile(data);
}

function loadPreferences() {
  return loadProfile().preferences;
}

// ── Profile Drawer ───────────────────────────────────────────

let profileDrawerOpen = false;

function toggleProfileDrawer() {
  profileDrawerOpen ? closeProfileDrawer() : openProfileDrawer();
}

function openProfileDrawer() {
  profileDrawerOpen = true;
  refreshProfileDrawer();
  document.getElementById('profile-drawer').classList.add('open');
  document.getElementById('profile-overlay').classList.add('active');
  document.getElementById('profile-node').classList.add('active');
}

function closeProfileDrawer() {
  profileDrawerOpen = false;
  document.getElementById('profile-drawer').classList.remove('open');
  document.getElementById('profile-overlay').classList.remove('active');
  document.getElementById('profile-node').classList.remove('active');
}

const DIFFICULTY_NAMES = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert' };

function refreshProfileDrawer() {
  const data = loadProfile();
  const s = data.stats;

  document.getElementById('profile-wins').textContent = s.wins;
  document.getElementById('profile-draws').textContent = s.draws;
  document.getElementById('profile-losses').textContent = s.losses;
  document.getElementById('profile-games').textContent = s.gamesPlayed;

  const decided = s.wins + s.losses;
  document.getElementById('profile-winrate').textContent =
    decided > 0 ? Math.round((s.wins / decided) * 100) + '%' : '--';

  document.getElementById('profile-streak').textContent =
    s.currentStreak > 0 ? s.currentStreak + 'W'
    : s.currentStreak < 0 ? Math.abs(s.currentStreak) + 'L'
    : '0';

  document.getElementById('profile-best-streak').textContent =
    s.bestStreak > 0 ? s.bestStreak + 'W' : '0';

  const recentEl = document.getElementById('profile-recent');
  recentEl.textContent = '';
  if (s.recentGames.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'profile-empty';
    empty.textContent = 'No games yet';
    recentEl.appendChild(empty);
    return;
  }

  var VALID_RESULTS = { win: true, loss: true, draw: true, pvp: true };

  s.recentGames.slice(0, 10).forEach(function(game) {
    var opponent = game.opponent === 'bot'
      ? 'Bot (' + (DIFFICULTY_NAMES[game.difficulty] || '?') + ')'
      : 'Human';
    var ago = timeAgo(game.timestamp);
    var fullMoves = Math.ceil(game.moves / 2);
    var resultLabel = game.result === 'pvp' ? 'PvP'
      : game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D';

    var row = document.createElement('div');
    row.className = 'profile-game-row';

    var dot = document.createElement('div');
    dot.className = 'profile-game-result ' + (VALID_RESULTS[game.result] ? game.result : 'draw');

    var info = document.createElement('div');
    info.className = 'profile-game-info';

    var detail = document.createElement('div');
    detail.className = 'profile-game-detail';
    detail.textContent = resultLabel + ' vs ' + opponent;

    var meta = document.createElement('div');
    meta.className = 'profile-game-meta';
    meta.textContent = ago;

    info.appendChild(detail);
    info.appendChild(meta);

    var moves = document.createElement('div');
    moves.className = 'profile-game-moves';
    moves.textContent = fullMoves + ' moves';

    row.appendChild(dot);
    row.appendChild(info);
    row.appendChild(moves);
    recentEl.appendChild(row);
  });
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
  return new Date(timestamp).toLocaleDateString();
}

// ── Nudge Toasts ─────────────────────────────────────────────

let toastTimeout = null;

function showNudgeToast(boldText, plainText) {
  const toast = document.getElementById('nudge-toast');
  if (!toast) return;
  if (toastTimeout) clearTimeout(toastTimeout);
  const textEl = toast.querySelector('.toast-text');
  textEl.textContent = '';
  if (boldText) {
    var strong = document.createElement('strong');
    strong.textContent = boldText;
    textEl.appendChild(strong);
    textEl.appendChild(document.createTextNode(' ' + plainText));
  } else {
    textEl.textContent = plainText;
  }
  toast.classList.add('visible');
  toastTimeout = setTimeout(dismissNudgeToast, 6000);
}

function dismissNudgeToast() {
  const toast = document.getElementById('nudge-toast');
  if (!toast) return;
  toast.classList.remove('visible');
  if (toastTimeout) { clearTimeout(toastTimeout); toastTimeout = null; }
}

function checkNudgeToasts(data, result) {
  const s = data.stats;

  if (result === 'win' && s.wins === 1) {
    setTimeout(function() {
      showNudgeToast('First victory!', 'Your journey in Chessbuds Kingdom has begun.');
    }, 1500);
    return;
  }

  if (result === 'win' && (s.currentStreak === 3 || s.currentStreak === 5 || s.currentStreak === 10)) {
    setTimeout(function() {
      showNudgeToast(s.currentStreak + ' wins in a row!', 'The kingdom rallies behind you.');
    }, 1500);
    return;
  }

  if (s.gamesPlayed === 5) {
    setTimeout(function() {
      showNudgeToast('Save your progress', 'You\'ve played 5 games. Save across devices soon.');
    }, 2000);
    return;
  }
}

// ── Preference helpers for settings modal ────────────────────

function preselectSetting(group, value) {
  const container = document.getElementById('opt-' + group);
  if (!container) return;
  container.querySelectorAll('.setting-opt').forEach(function(btn) {
    btn.classList.toggle('selected', btn.dataset.val === value);
  });
}

function preselectAllSettings() {
  const prefs = loadPreferences();
  preselectSetting('opponent', prefs.opponent);
  preselectSetting('difficulty', String(prefs.difficulty));
  preselectSetting('color', prefs.playerColor);
  preselectSetting('time', String(prefs.timeControl));
  const diffGroup = document.getElementById('difficulty-group');
  const colorGroup = document.getElementById('color-group');
  if (diffGroup) diffGroup.style.display = prefs.opponent === 'bot' ? '' : 'none';
  if (colorGroup) colorGroup.style.display = prefs.opponent === 'bot' ? '' : 'none';
}

// ── Init ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('profile-overlay')?.addEventListener('click', closeProfileDrawer);
  preselectAllSettings();
});

// ── Expose to global ─────────────────────────────────────────

window.toggleProfileDrawer = toggleProfileDrawer;
window.openProfileDrawer = openProfileDrawer;
window.closeProfileDrawer = closeProfileDrawer;
window.dismissNudgeToast = dismissNudgeToast;
