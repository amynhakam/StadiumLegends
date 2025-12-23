/* ============================================
   Stadium Legends - Game Module
   ============================================ */

var Game = (function() {
  'use strict';

  // Game state
  var gameState = {
    playing: false,
    paused: false,
    character: null,
    stadium: null,
    song: null,
    notes: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    good: 0,
    miss: 0,
    earnings: 0,
    startTime: 0,
    currentTime: 0,
    timingBonus: 0
  };

  // DOM elements
  var elements = {};

  // Animation frame ID
  var animationId = null;

  // Note highway height
  var highwayHeight = 0;

  // Hit zone Y position
  var hitZoneY = 0;

  /**
   * Initialize game
   */
  function init() {
    cacheElements();
    setupInputHandlers();
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements.gameScreen = document.getElementById('gameplay-screen');
    elements.highway = document.getElementById('note-highway');
    elements.hitZone = document.getElementById('hit-zone');
    elements.touchControls = document.getElementById('touch-controls');
    elements.hudScore = document.getElementById('hud-score');
    elements.hudCombo = document.getElementById('hud-combo');
    elements.hudAccuracy = document.getElementById('hud-accuracy');
    elements.moneyTotal = document.getElementById('money-total');
    elements.moneyChange = document.getElementById('money-change');
    elements.progressFill = document.getElementById('progress-fill');
    elements.lanes = document.querySelectorAll('.lane');
    elements.hitTargets = document.querySelectorAll('.hit-target');
    elements.touchButtons = document.querySelectorAll('.touch-btn');
  }

  /**
   * Setup input handlers
   */
  function setupInputHandlers() {
    // Keyboard input
    document.addEventListener('keydown', function(e) {
      if (!gameState.playing || gameState.paused) return;
      
      var lane = -1;
      switch (e.key) {
        case '1': lane = 0; break;
        case '2': lane = 1; break;
        case '3': lane = 2; break;
        case '4': lane = 3; break;
        case 'Escape':
        case 'p':
        case 'P':
          pause();
          return;
      }
      
      if (lane >= 0) {
        e.preventDefault();
        handleInput(lane);
      }
    });

    document.addEventListener('keyup', function(e) {
      var lane = -1;
      switch (e.key) {
        case '1': lane = 0; break;
        case '2': lane = 1; break;
        case '3': lane = 2; break;
        case '4': lane = 3; break;
      }
      
      if (lane >= 0 && elements.hitTargets[lane]) {
        elements.hitTargets[lane].classList.remove('active');
      }
    });

    // Touch input
    if (elements.touchButtons) {
      elements.touchButtons.forEach(function(btn) {
        btn.addEventListener('touchstart', function(e) {
          e.preventDefault();
          if (!gameState.playing || gameState.paused) return;
          
          var lane = parseInt(this.getAttribute('data-lane'));
          this.classList.add('pressed');
          handleInput(lane);
        });
        
        btn.addEventListener('touchend', function(e) {
          e.preventDefault();
          this.classList.remove('pressed');
          var lane = parseInt(this.getAttribute('data-lane'));
          if (elements.hitTargets[lane]) {
            elements.hitTargets[lane].classList.remove('active');
          }
        });
      });
    }
  }

  /**
   * Handle lane input
   */
  function handleInput(lane) {
    if (!gameState.playing || gameState.paused) return;
    
    // Visual feedback
    if (elements.hitTargets[lane]) {
      elements.hitTargets[lane].classList.add('active');
    }

    // Find closest note in this lane
    var timingPerfect = Config.TIMING_PERFECT * (1 + gameState.timingBonus);
    var timingGood = Config.TIMING_GOOD * (1 + gameState.timingBonus);
    var currentTime = gameState.currentTime;
    var closestNote = null;
    var closestDiff = Infinity;

    for (var i = 0; i < gameState.notes.length; i++) {
      var note = gameState.notes[i];
      if (note.lane === lane && !note.hit) {
        var diff = Math.abs(note.time - currentTime);
        if (diff < closestDiff && diff <= timingGood) {
          closestDiff = diff;
          closestNote = note;
        }
      }
    }

    if (closestNote) {
      closestNote.hit = true;
      
      if (closestDiff <= timingPerfect) {
        // Perfect hit
        closestNote.result = 'perfect';
        gameState.perfect++;
        gameState.combo++;
        addScore(Config.SCORE_PERFECT);
        showHitFeedback(lane, 'perfect');
        Audio.playHit(lane, 'perfect');
      } else {
        // Good hit
        closestNote.result = 'good';
        gameState.good++;
        gameState.combo++;
        addScore(Config.SCORE_GOOD);
        showHitFeedback(lane, 'good');
        Audio.playHit(lane, 'good');
      }
      
      // Update max combo
      if (gameState.combo > gameState.maxCombo) {
        gameState.maxCombo = gameState.combo;
      }
      
      // Check combo milestones
      if (Config.COMBO_THRESHOLDS.indexOf(gameState.combo) !== -1) {
        Audio.playCombo();
      }
      
      // Remove note visual
      removeNoteVisual(closestNote);
    }
  }

  /**
   * Add score and update money
   */
  function addScore(amount) {
    var multiplier = gameState.stadium ? gameState.stadium.multiplier : 1;
    var comboMultiplier = getComboMultiplier();
    var finalAmount = Math.round(amount * multiplier * comboMultiplier);
    
    gameState.score += Math.abs(finalAmount);
    gameState.earnings += finalAmount;
    
    // Update balance
    Storage.updateBalance(finalAmount);
    
    // Update HUD
    updateHUD();
    
    // Show money change
    showMoneyChange(finalAmount);
  }

  /**
   * Get combo multiplier
   */
  function getComboMultiplier() {
    var combo = gameState.combo;
    var thresholds = Config.COMBO_THRESHOLDS;
    var multipliers = Config.COMBO_MULTIPLIERS;
    
    for (var i = thresholds.length - 1; i >= 0; i--) {
      if (combo >= thresholds[i]) {
        return multipliers[i + 1];
      }
    }
    return multipliers[0];
  }

  /**
   * Handle missed note
   */
  function handleMiss(note) {
    note.hit = true;
    note.result = 'miss';
    gameState.miss++;
    gameState.combo = 0;
    
    addScore(Config.SCORE_MISS);
    showHitFeedback(note.lane, 'miss');
    Audio.playMiss();
    
    removeNoteVisual(note);
  }

  /**
   * Show hit feedback text
   */
  function showHitFeedback(lane, quality) {
    if (!elements.hitTargets[lane]) return;
    
    elements.hitTargets[lane].classList.add(quality);
    setTimeout(function() {
      elements.hitTargets[lane].classList.remove(quality);
    }, 300);
  }

  /**
   * Show money change popup
   */
  function showMoneyChange(amount) {
    if (!elements.moneyChange) return;
    
    elements.moneyChange.textContent = (amount >= 0 ? '+' : '') + '$' + Storage.formatMoney(Math.abs(amount));
    elements.moneyChange.className = 'money-change show ' + (amount >= 0 ? 'positive' : 'negative');
    
    setTimeout(function() {
      elements.moneyChange.classList.remove('show');
    }, 500);
  }

  /**
   * Update HUD displays
   */
  function updateHUD() {
    if (elements.hudScore) {
      elements.hudScore.textContent = gameState.score.toLocaleString();
    }
    if (elements.hudCombo) {
      elements.hudCombo.textContent = gameState.combo;
    }
    if (elements.hudAccuracy) {
      var total = gameState.perfect + gameState.good + gameState.miss;
      var accuracy = total > 0 ? Math.round(((gameState.perfect + gameState.good * 0.5) / total) * 100) : 100;
      elements.hudAccuracy.textContent = accuracy + '%';
    }
    if (elements.moneyTotal) {
      elements.moneyTotal.textContent = '$' + Storage.formatMoney(Storage.getBalance());
    }
  }

  /**
   * Update progress bar
   */
  function updateProgress() {
    if (!elements.progressFill || !gameState.song) return;
    
    var progress = (gameState.currentTime / gameState.song.duration) * 100;
    elements.progressFill.style.width = Math.min(100, progress) + '%';
  }

  /**
   * Start a new game
   */
  function startGame(character, stadium, song) {
    // Reset state
    gameState.playing = false;
    gameState.paused = false;
    gameState.character = character;
    gameState.stadium = stadium;
    gameState.song = Songs.getById(character.id, song.id);
    gameState.notes = gameState.song.notePattern.slice();
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.perfect = 0;
    gameState.good = 0;
    gameState.miss = 0;
    gameState.earnings = 0;
    gameState.timingBonus = Characters.getTimingBonus(character.id);

    // Set character for instrument sounds
    Audio.setCharacter(character.id);

    // Clear any existing notes
    clearAllNotes();
    
    // Show game screen
    UI.showScreen('gameplay-screen');
    
    // Calculate dimensions
    calculateDimensions();
    
    // Reset HUD
    updateHUD();
    if (elements.progressFill) {
      elements.progressFill.style.width = '0%';
    }

    // Start countdown
    startCountdown(function() {
      gameState.playing = true;
      gameState.startTime = performance.now();
      
      // Start background music
      Audio.startBackgroundMusic(character.id);
      
      gameLoop();
    });
  }

  /**
   * Calculate highway dimensions and position buffer lines
   */
  function calculateDimensions() {
    if (elements.highway) {
      highwayHeight = elements.highway.offsetHeight;
    }
    hitZoneY = highwayHeight - 80; // Position near bottom
    
    // Position buffer lines to show timing window
    var bufferTop = document.getElementById('buffer-top');
    var bufferBottom = document.getElementById('buffer-bottom');
    var hitZoneGlow = document.getElementById('hit-zone-glow');
    
    if (bufferTop && bufferBottom && hitZoneGlow) {
      // Calculate pixel positions based on timing windows
      var travelTime = 2000; // ms for note to travel
      var timingGood = Config.TIMING_GOOD * (1 + gameState.timingBonus);
      var pixelsPerMs = highwayHeight / travelTime;
      var bufferHeight = timingGood * 2 * pixelsPerMs;
      
      // Position both buffer lines above the hit buttons
      var topOffset = -bufferHeight - 70; // EARLY line
      var bottomOffset = -70; // LATE line just above buttons
      
      bufferTop.style.top = topOffset + 'px';
      bufferBottom.style.top = bottomOffset + 'px';
      
      // Glow area between lines
      hitZoneGlow.style.top = topOffset + 'px';
      hitZoneGlow.style.height = (bottomOffset - topOffset) + 'px';
    }
  }

  /**
   * Start countdown before game
   */
  function startCountdown(callback) {
    var count = 3;
    
    function tick() {
      if (count > 0) {
        Audio.playCountdown(false);
        // Could show countdown visual here
        count--;
        setTimeout(tick, 1000);
      } else {
        Audio.playCountdown(true);
        callback();
      }
    }
    
    setTimeout(tick, 500);
  }

  /**
   * Main game loop
   */
  function gameLoop() {
    if (!gameState.playing) return;
    
    if (gameState.paused) {
      animationId = requestAnimationFrame(gameLoop);
      return;
    }
    
    // Update time
    gameState.currentTime = performance.now() - gameState.startTime;
    
    // Spawn notes
    spawnNotes();
    
    // Update note positions
    updateNotes();
    
    // Check for missed notes
    checkMissedNotes();
    
    // Update progress
    updateProgress();
    
    // Check if song is complete
    if (gameState.currentTime >= gameState.song.duration) {
      endGame();
      return;
    }
    
    animationId = requestAnimationFrame(gameLoop);
  }

  /**
   * Spawn notes that should appear
   */
  function spawnNotes() {
    var lookAhead = 2000; // Spawn notes 2 seconds ahead
    
    for (var i = 0; i < gameState.notes.length; i++) {
      var note = gameState.notes[i];
      
      if (!note.spawned && note.time <= gameState.currentTime + lookAhead) {
        note.spawned = true;
        createNoteVisual(note);
      }
    }
  }

  /**
   * Create note visual element
   */
  function createNoteVisual(note) {
    var lane = elements.lanes[note.lane];
    if (!lane) return;
    
    var noteEl = document.createElement('div');
    noteEl.className = 'note';
    noteEl.setAttribute('data-note-id', gameState.notes.indexOf(note));
    noteEl.style.top = '-30px';
    
    lane.appendChild(noteEl);
    note.element = noteEl;
  }

  /**
   * Update note positions
   */
  function updateNotes() {
    var travelTime = 2000; // Time for note to travel down highway
    
    for (var i = 0; i < gameState.notes.length; i++) {
      var note = gameState.notes[i];
      
      if (note.spawned && note.element && !note.hit) {
        var timeUntilHit = note.time - gameState.currentTime;
        var progress = 1 - (timeUntilHit / travelTime);
        var y = progress * hitZoneY;
        
        note.element.style.top = y + 'px';
      }
    }
  }

  /**
   * Check for missed notes
   */
  function checkMissedNotes() {
    var missWindow = Config.TIMING_GOOD * (1 + gameState.timingBonus);
    
    for (var i = 0; i < gameState.notes.length; i++) {
      var note = gameState.notes[i];
      
      if (!note.hit && note.spawned && gameState.currentTime > note.time + missWindow) {
        handleMiss(note);
      }
    }
  }

  /**
   * Remove note visual
   */
  function removeNoteVisual(note) {
    if (note.element) {
      note.element.classList.add('hit-' + note.result);
      
      setTimeout(function() {
        if (note.element && note.element.parentNode) {
          note.element.parentNode.removeChild(note.element);
        }
      }, 300);
    }
  }

  /**
   * Clear all note visuals
   */
  function clearAllNotes() {
    var notes = document.querySelectorAll('.note');
    notes.forEach(function(note) {
      if (note.parentNode) {
        note.parentNode.removeChild(note);
      }
    });
  }

  /**
   * End the game
   */
  function endGame() {
    gameState.playing = false;
    
    // Stop background music
    Audio.stopBackgroundMusic();
    
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    // Calculate final accuracy
    var total = gameState.perfect + gameState.good + gameState.miss;
    var accuracy = total > 0 ? Math.round(((gameState.perfect + gameState.good * 0.5) / total) * 100) : 0;
    
    // Save high score
    Storage.setHighScore(gameState.song.id, {
      accuracy: accuracy,
      score: gameState.score,
      perfect: gameState.perfect,
      good: gameState.good,
      miss: gameState.miss
    });
    
    // Record game
    Storage.recordGame(gameState.earnings);
    
    // Show results
    UI.showResults({
      perfect: gameState.perfect,
      good: gameState.good,
      miss: gameState.miss,
      maxCombo: gameState.maxCombo,
      accuracy: accuracy,
      earnings: gameState.earnings
    });
  }

  /**
   * Pause the game
   */
  function pause() {
    if (!gameState.playing) return;
    
    gameState.paused = true;
    Audio.stopBackgroundMusic();
    UI.showPause(true);
  }

  /**
   * Resume the game
   */
  function resume() {
    gameState.paused = false;
    Audio.startBackgroundMusic(gameState.character.id);
    UI.showPause(false);
  }

  /**
   * Restart the game
   */
  function restart() {
    UI.showPause(false);
    
    if (gameState.character && gameState.stadium && gameState.song) {
      startGame(gameState.character, gameState.stadium, gameState.song);
    }
  }

  /**
   * Quit the game
   */
  function quit() {
    gameState.playing = false;
    gameState.paused = false;
    
    // Stop background music
    Audio.stopBackgroundMusic();
    
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    clearAllNotes();
    UI.showPause(false);
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    init: init,
    startGame: startGame,
    pause: pause,
    resume: resume,
    restart: restart,
    quit: quit
  };
})();
