/* ============================================
   Stadium Legends - Storage Module
   ============================================ */

var Storage = (function() {
  'use strict';

  var defaultState = {
    balance: Config.STARTING_BALANCE,
    unlockedStadiums: ['local-bar'],
    instrumentUpgrades: {
      'stella-luna': 0,
      'k-fire': 0,
      'el-conejo': 0,
      'ziggy-flash': 0,
      'dolly-mae': 0
    },
    highScores: {},
    totalEarnings: 0,
    gamesPlayed: 0
  };

  var gameState = null;

  /**
   * Initialize storage and load saved data
   */
  function init() {
    load();
    console.log('Storage initialized. Balance: $' + formatMoney(gameState.balance));
  }

  /**
   * Load game state from LocalStorage
   */
  function load() {
    try {
      var saved = localStorage.getItem(Config.STORAGE_KEY);
      if (saved) {
        gameState = JSON.parse(saved);
        // Merge with defaults in case new properties were added
        gameState = mergeDefaults(gameState, defaultState);
      } else {
        gameState = JSON.parse(JSON.stringify(defaultState));
      }
    } catch (e) {
      console.error('Error loading save data:', e);
      gameState = JSON.parse(JSON.stringify(defaultState));
    }
  }

  /**
   * Save game state to LocalStorage
   */
  function save() {
    try {
      localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.error('Error saving data:', e);
    }
  }

  /**
   * Merge saved state with defaults
   */
  function mergeDefaults(saved, defaults) {
    var result = JSON.parse(JSON.stringify(defaults));
    for (var key in saved) {
      if (saved.hasOwnProperty(key)) {
        if (typeof saved[key] === 'object' && !Array.isArray(saved[key]) && saved[key] !== null) {
          result[key] = mergeDefaults(saved[key], defaults[key] || {});
        } else {
          result[key] = saved[key];
        }
      }
    }
    return result;
  }

  /**
   * Get current balance
   */
  function getBalance() {
    return gameState.balance;
  }

  /**
   * Update balance
   */
  function updateBalance(amount) {
    gameState.balance += amount;
    if (gameState.balance < 0) {
      gameState.balance = 0;
    }
    save();
    return gameState.balance;
  }

  /**
   * Set balance directly
   */
  function setBalance(amount) {
    gameState.balance = amount;
    save();
    return gameState.balance;
  }

  /**
   * Check if stadium is unlocked
   */
  function isStadiumUnlocked(stadiumId) {
    return gameState.unlockedStadiums.indexOf(stadiumId) !== -1;
  }

  /**
   * Unlock a stadium
   */
  function unlockStadium(stadiumId) {
    if (!isStadiumUnlocked(stadiumId)) {
      gameState.unlockedStadiums.push(stadiumId);
      save();
      return true;
    }
    return false;
  }

  /**
   * Get unlocked stadiums
   */
  function getUnlockedStadiums() {
    return gameState.unlockedStadiums.slice();
  }

  /**
   * Get instrument upgrade level (0, 1, or 2)
   */
  function getUpgradeLevel(characterId) {
    return gameState.instrumentUpgrades[characterId] || 0;
  }

  /**
   * Upgrade instrument
   */
  function upgradeInstrument(characterId) {
    var currentLevel = getUpgradeLevel(characterId);
    if (currentLevel < 2) {
      gameState.instrumentUpgrades[characterId] = currentLevel + 1;
      save();
      return true;
    }
    return false;
  }

  /**
   * Get high score for a song
   */
  function getHighScore(songId) {
    return gameState.highScores[songId] || null;
  }

  /**
   * Set high score for a song
   */
  function setHighScore(songId, score) {
    var current = getHighScore(songId);
    if (!current || score.accuracy > current.accuracy) {
      gameState.highScores[songId] = score;
      save();
      return true;
    }
    return false;
  }

  /**
   * Record game played
   */
  function recordGame(earnings) {
    gameState.gamesPlayed++;
    gameState.totalEarnings += earnings;
    save();
  }

  /**
   * Get stats
   */
  function getStats() {
    return {
      gamesPlayed: gameState.gamesPlayed,
      totalEarnings: gameState.totalEarnings
    };
  }

  /**
   * Reset all data
   */
  function reset() {
    gameState = JSON.parse(JSON.stringify(defaultState));
    save();
    console.log('Game data reset');
  }

  /**
   * Format money for display
   */
  function formatMoney(amount) {
    return amount.toLocaleString();
  }

  // Public API
  return {
    init: init,
    save: save,
    load: load,
    getBalance: getBalance,
    updateBalance: updateBalance,
    setBalance: setBalance,
    isStadiumUnlocked: isStadiumUnlocked,
    unlockStadium: unlockStadium,
    getUnlockedStadiums: getUnlockedStadiums,
    getUpgradeLevel: getUpgradeLevel,
    upgradeInstrument: upgradeInstrument,
    getHighScore: getHighScore,
    setHighScore: setHighScore,
    recordGame: recordGame,
    getStats: getStats,
    reset: reset,
    formatMoney: formatMoney
  };
})();
