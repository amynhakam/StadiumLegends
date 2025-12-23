/* ============================================
   Stadium Legends - UI Module
   ============================================ */

var UI = (function() {
  'use strict';

  var currentScreen = null;
  var selectedCharacter = null;
  var selectedStadium = null;
  var selectedSong = null;

  /**
   * Initialize UI
   */
  function init() {
    setupEventListeners();
    updateAllBalanceDisplays();
  }

  /**
   * Setup all event listeners
   */
  function setupEventListeners() {
    // Title screen buttons
    var btnPlay = document.getElementById('btn-play');
    var btnShop = document.getElementById('btn-shop');
    var btnReset = document.getElementById('btn-reset');
    
    if (btnPlay) {
      btnPlay.addEventListener('click', function() {
        Audio.playClick();
        showScreen('character-select');
      });
    }
    
    if (btnShop) {
      btnShop.addEventListener('click', function() {
        Audio.playClick();
        showScreen('upgrade-shop');
        populateUpgradeShop();
      });
    }
    
    if (btnReset) {
      btnReset.addEventListener('click', function() {
        Audio.playClick();
        if (confirm('Are you sure you want to start over? This will reset all your progress, money, and unlocks.')) {
          Storage.reset();
          updateAllBalanceDisplays();
          showToast('Game progress has been reset!', 'success');
        }
      });
    }

    // Back buttons
    var backButtons = document.querySelectorAll('.btn--back');
    backButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        Audio.playClick();
        var targetScreen = this.getAttribute('data-screen');
        showScreen(targetScreen);
      });
    });

    // Results screen buttons
    var btnRetry = document.getElementById('btn-retry');
    var btnContinue = document.getElementById('btn-continue');
    
    if (btnRetry) {
      btnRetry.addEventListener('click', function() {
        Audio.playClick();
        if (selectedCharacter && selectedStadium && selectedSong) {
          Game.startGame(selectedCharacter, selectedStadium, selectedSong);
        }
      });
    }
    
    if (btnContinue) {
      btnContinue.addEventListener('click', function() {
        Audio.playClick();
        showScreen('title-screen');
      });
    }

    // Pause overlay buttons
    var btnResume = document.getElementById('btn-resume');
    var btnRestart = document.getElementById('btn-restart');
    var btnQuit = document.getElementById('btn-quit');
    
    if (btnResume) {
      btnResume.addEventListener('click', function() {
        Audio.playClick();
        Game.resume();
      });
    }
    
    if (btnRestart) {
      btnRestart.addEventListener('click', function() {
        Audio.playClick();
        Game.restart();
      });
    }
    
    if (btnQuit) {
      btnQuit.addEventListener('click', function() {
        Audio.playClick();
        Game.quit();
        showScreen('title-screen');
      });
    }

    // Pause button
    var btnPause = document.getElementById('btn-pause');
    if (btnPause) {
      btnPause.addEventListener('click', function() {
        Audio.playClick();
        Game.pause();
      });
    }
  }

  /**
   * Show a screen
   */
  function showScreen(screenId) {
    // Hide all screens
    var screens = document.querySelectorAll('.screen');
    screens.forEach(function(screen) {
      screen.classList.remove('active');
    });

    // Show target screen
    var targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add('active');
      currentScreen = screenId;
      
      // Populate content based on screen
      if (screenId === 'character-select') {
        populateCharacterGrid();
      } else if (screenId === 'stadium-select') {
        populateStadiumList();
      } else if (screenId === 'song-select') {
        populateSongList();
      }
      
      updateAllBalanceDisplays();
    }
  }

  /**
   * Update all balance displays
   */
  function updateAllBalanceDisplays() {
    var balance = Storage.getBalance();
    var formattedBalance = '$' + Storage.formatMoney(balance);
    
    var balanceElements = [
      'title-balance',
      'char-balance',
      'stadium-balance',
      'song-balance',
      'shop-balance'
    ];
    
    balanceElements.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.textContent = formattedBalance;
      }
    });
  }

  /**
   * Populate character selection grid
   */
  function populateCharacterGrid() {
    var grid = document.getElementById('character-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    var characters = Characters.getAll();
    characters.forEach(function(character) {
      var card = createCharacterCard(character);
      grid.appendChild(card);
    });
  }

  /**
   * Create a character card element
   */
  function createCharacterCard(character) {
    var upgradeLevel = Storage.getUpgradeLevel(character.id);
    var currentInstrument = Characters.getCurrentInstrument(character.id);
    
    var card = document.createElement('div');
    card.className = 'character-card';
    card.style.setProperty('--character-color', character.colors.accent);
    
    // Build upgrade dots
    var upgradeDots = '';
    for (var i = 0; i < 3; i++) {
      upgradeDots += '<span class="upgrade-dot' + (i <= upgradeLevel ? ' filled' : '') + '"></span>';
    }
    
    card.innerHTML = 
      '<div class="character-card__icon">' + character.icon + '</div>' +
      '<h3 class="character-card__name">' + character.name + '</h3>' +
      '<p class="character-card__instrument">' + currentInstrument + '</p>' +
      '<p class="character-card__style">' + character.style + '</p>' +
      '<div class="character-card__upgrade">' + upgradeDots + '</div>';
    
    card.addEventListener('click', function() {
      Audio.playClick();
      selectedCharacter = character;
      showScreen('stadium-select');
    });
    
    return card;
  }

  /**
   * Populate stadium selection list
   */
  function populateStadiumList() {
    var list = document.getElementById('stadium-list');
    var preview = document.getElementById('selected-character-preview');
    
    if (!list) return;
    
    // Update character preview
    if (preview && selectedCharacter) {
      preview.innerHTML = 
        '<span class="preview-icon">' + selectedCharacter.icon + '</span>' +
        '<div class="preview-info">' +
          '<div class="preview-name">' + selectedCharacter.name + '</div>' +
          '<div class="preview-instrument">' + Characters.getCurrentInstrument(selectedCharacter.id) + '</div>' +
          '<div class="preview-hometown">📍 ' + selectedCharacter.hometown + '</div>' +
        '</div>';
    }
    
    list.innerHTML = '';
    
    var stadiums = Stadiums.getAvailable();
    stadiums.forEach(function(item) {
      var card = createStadiumCard(item.stadium, item.unlocked, item.canUnlock);
      list.appendChild(card);
    });
    
    // Fetch real venues for each venue type
    if (selectedCharacter) {
      // Fetch bars for Local Bar venue
      LocalBars.findVenuesNearCharacter(selectedCharacter, 'bar', function(result) {
        if (result.success && result.venues.length > 0) {
          var randomVenue = result.venues[Math.floor(Math.random() * result.venues.length)];
          var nameEl = document.getElementById('local-bar-name');
          var locationEl = document.getElementById('local-bar-location');
          
          if (nameEl) nameEl.textContent = randomVenue.name;
          if (locationEl) locationEl.textContent = randomVenue.distanceText + ' away • ' + selectedCharacter.hometown;
        }
      });
      
      // Fetch clubs for Club Venue
      LocalBars.findVenuesNearCharacter(selectedCharacter, 'club', function(result) {
        if (result.success && result.venues.length > 0) {
          var randomVenue = result.venues[Math.floor(Math.random() * result.venues.length)];
          var nameEl = document.getElementById('club-venue-name');
          var locationEl = document.getElementById('club-venue-location');
          
          if (nameEl) nameEl.textContent = randomVenue.name;
          if (locationEl) locationEl.textContent = randomVenue.distanceText + ' away • ' + selectedCharacter.hometown;
        }
      });
      
      // Fetch theaters for Grand Theater
      LocalBars.findVenuesNearCharacter(selectedCharacter, 'theater', function(result) {
        if (result.success && result.venues.length > 0) {
          var randomVenue = result.venues[Math.floor(Math.random() * result.venues.length)];
          var nameEl = document.getElementById('theater-venue-name');
          var locationEl = document.getElementById('theater-venue-location');
          
          if (nameEl) nameEl.textContent = randomVenue.name;
          if (locationEl) locationEl.textContent = randomVenue.distanceText + ' away • ' + selectedCharacter.hometown;
        }
      });
      
      // Fetch arenas/stadiums for Metro Arena
      LocalBars.findVenuesNearCharacter(selectedCharacter, 'arena', function(result) {
        if (result.success && result.venues.length > 0) {
          var randomVenue = result.venues[Math.floor(Math.random() * result.venues.length)];
          var nameEl = document.getElementById('arena-venue-name');
          var locationEl = document.getElementById('arena-venue-location');
          
          if (nameEl) nameEl.textContent = randomVenue.name;
          if (locationEl) locationEl.textContent = randomVenue.distanceText + ' away • ' + selectedCharacter.hometown;
        }
      });
    }
  }

  /**
   * Create a stadium card element
   */
  function createStadiumCard(stadium, unlocked, canUnlock) {
    var card = document.createElement('div');
    // Only show as locked/blocked if player cannot afford it
    var isBlocked = !unlocked && !canUnlock;
    card.className = 'stadium-card' + (isBlocked ? ' locked' : '');
    
    var actionContent = '';
    if (unlocked) {
      actionContent = '<span class="stadium-card__payout">$' + Storage.formatMoney(stadium.gigPayout) + ' gig</span>';
    } else if (canUnlock) {
      actionContent = '<span class="stadium-card__cost">Unlock: $' + Storage.formatMoney(stadium.unlockCost) + '</span>';
    } else {
      actionContent = '<span class="stadium-card__lock">🔒</span>' +
        '<span class="stadium-card__cost">$' + Storage.formatMoney(stadium.unlockCost) + '</span>';
    }
    
    // Special handling for venues with real location lookups
    var displayName = stadium.name;
    var displayLocation = stadium.location + ' • ' + Stadiums.formatCapacity(stadium.capacity) + ' capacity';
    
    if (stadium.id === 'local-bar') {
      card.innerHTML = 
        '<div class="stadium-card__icon">' + stadium.icon + '</div>' +
        '<div class="stadium-card__info">' +
          '<h3 class="stadium-card__name" id="local-bar-name">Finding local bar...</h3>' +
          '<p class="stadium-card__details" id="local-bar-location">Searching near hometown...</p>' +
          (unlocked ? '<p class="stadium-card__gig-info">Promised: $' + Storage.formatMoney(stadium.gigPayout) + '</p>' : '') +
        '</div>' +
        '<div class="stadium-card__action">' + actionContent + '</div>';
    } else if (stadium.id === 'club-venue') {
      card.innerHTML = 
        '<div class="stadium-card__icon">' + stadium.icon + '</div>' +
        '<div class="stadium-card__info">' +
          '<h3 class="stadium-card__name" id="club-venue-name">Finding local club...</h3>' +
          '<p class="stadium-card__details" id="club-venue-location">Searching near hometown...</p>' +
          (unlocked ? '<p class="stadium-card__gig-info">Promised: $' + Storage.formatMoney(stadium.gigPayout) + '</p>' : '') +
        '</div>' +
        '<div class="stadium-card__action">' + actionContent + '</div>';
    } else if (stadium.id === 'theater') {
      card.innerHTML = 
        '<div class="stadium-card__icon">' + stadium.icon + '</div>' +
        '<div class="stadium-card__info">' +
          '<h3 class="stadium-card__name" id="theater-venue-name">Finding local theater...</h3>' +
          '<p class="stadium-card__details" id="theater-venue-location">Searching near hometown...</p>' +
          (unlocked ? '<p class="stadium-card__gig-info">Promised: $' + Storage.formatMoney(stadium.gigPayout) + '</p>' : '') +
        '</div>' +
        '<div class="stadium-card__action">' + actionContent + '</div>';
    } else if (stadium.id === 'arena') {
      card.innerHTML = 
        '<div class="stadium-card__icon">' + stadium.icon + '</div>' +
        '<div class="stadium-card__info">' +
          '<h3 class="stadium-card__name" id="arena-venue-name">Finding major stadium...</h3>' +
          '<p class="stadium-card__details" id="arena-venue-location">Searching for arenas...</p>' +
          (unlocked ? '<p class="stadium-card__gig-info">Promised: $' + Storage.formatMoney(stadium.gigPayout) + '</p>' : '') +
        '</div>' +
        '<div class="stadium-card__action">' + actionContent + '</div>';
    } else {
      card.innerHTML = 
        '<div class="stadium-card__icon">' + stadium.icon + '</div>' +
        '<div class="stadium-card__info">' +
          '<h3 class="stadium-card__name">' + displayName + '</h3>' +
          '<p class="stadium-card__details">' + displayLocation + '</p>' +
          (unlocked ? '<p class="stadium-card__gig-info">Promised: $' + Storage.formatMoney(stadium.gigPayout) + '</p>' : '') +
        '</div>' +
        '<div class="stadium-card__action">' + actionContent + '</div>';
    }
    
    card.addEventListener('click', function() {
      Audio.playClick();
      
      if (unlocked) {
        selectedStadium = stadium;
        showScreen('song-select');
      } else if (canUnlock) {
        var result = Stadiums.tryUnlock(stadium.id);
        if (result.success) {
          showToast(result.message, 'success');
          populateStadiumList();
          updateAllBalanceDisplays();
        } else {
          showToast(result.message, 'error');
        }
      } else {
        showToast('Not enough money to unlock!', 'error');
      }
    });
    
    return card;
  }

  /**
   * Populate song selection list
   */
  function populateSongList() {
    var list = document.getElementById('song-list');
    var preview = document.getElementById('venue-preview');
    
    if (!list || !selectedCharacter) return;
    
    // Update venue preview
    if (preview && selectedStadium) {
      preview.innerHTML = 
        '<span class="preview-icon">' + selectedStadium.icon + '</span>' +
        '<div class="preview-name">' + selectedStadium.name + ' (' + selectedStadium.multiplier + 'x)</div>';
    }
    
    list.innerHTML = '';
    
    var songs = Songs.getForCharacter(selectedCharacter.id);
    songs.forEach(function(song) {
      var card = createSongCard(song);
      list.appendChild(card);
    });
  }

  /**
   * Create a song card element
   */
  function createSongCard(song) {
    var highScore = Storage.getHighScore(song.id);
    
    var card = document.createElement('div');
    card.className = 'song-card';
    
    // Get difficulty label and class
    var difficultyLabel = Songs.getDifficultyLabel(song.difficulty);
    var difficultyClass = Songs.getDifficultyClass(song.difficulty);
    
    var bestScore = highScore ? (highScore.accuracy + '%') : '-';
    
    card.innerHTML = 
      '<h3 class="song-card__title">' + song.title + '</h3>' +
      '<div class="song-card__info">' +
        '<span class="song-card__difficulty difficulty--' + difficultyClass + '">' + difficultyLabel + '</span>' +
        '<span>' + Songs.formatDuration(song.duration) + '</span>' +
        '<span class="song-card__best">Best: ' + bestScore + '</span>' +
      '</div>';
    
    card.addEventListener('click', function() {
      Audio.playClick();
      selectedSong = song;
      
      // Start the game!
      Game.startGame(selectedCharacter, selectedStadium, selectedSong);
    });
    
    return card;
  }

  /**
   * Populate upgrade shop
   */
  function populateUpgradeShop() {
    var list = document.getElementById('upgrade-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    var characters = Characters.getAll();
    characters.forEach(function(character) {
      var card = createUpgradeCard(character);
      list.appendChild(card);
    });
  }

  /**
   * Create an upgrade card element
   */
  function createUpgradeCard(character) {
    var upgradeLevel = Storage.getUpgradeLevel(character.id);
    var currentInstrument = Characters.getCurrentInstrument(character.id);
    var nextUpgrade = Characters.getNextUpgradeName(character.id);
    var upgradeCost = Characters.getUpgradeCost(character.id);
    var canAfford = upgradeCost ? Storage.getBalance() >= upgradeCost : false;
    
    var card = document.createElement('div');
    card.className = 'upgrade-card';
    card.style.setProperty('--character-color', character.colors.accent);
    
    // Build tier badges with prices
    var tierBadges = '';
    var tierNames = ['Basic', 'Pro', 'Legend'];
    var tierPrices = ['Free', '$' + Storage.formatMoney(Config.UPGRADE_COST_PRO), '$' + Storage.formatMoney(Config.UPGRADE_COST_LEGEND)];
    for (var i = 0; i < 3; i++) {
      var badgeClass = 'tier-badge';
      if (i <= upgradeLevel) {
        badgeClass += ' active';
      } else if (i === upgradeLevel + 1) {
        badgeClass += ' available';
      }
      tierBadges += '<span class="' + badgeClass + '">' + 
        '<span class="tier-name">' + tierNames[i] + '</span>' +
        '<span class="tier-price">' + tierPrices[i] + '</span>' +
      '</span>';
    }
    
    var actionContent = '';
    if (upgradeLevel >= 2) {
      actionContent = '<span class="upgrade-maxed">✓ Maxed Out</span>';
    } else {
      actionContent = 
        '<span class="upgrade-next">Next: ' + nextUpgrade + '</span>' +
        '<span class="upgrade-cost">$' + Storage.formatMoney(upgradeCost) + '</span>' +
        '<button class="btn btn--primary' + (canAfford ? '' : '" disabled') + '">Upgrade</button>';
    }
    
    card.innerHTML = 
      '<div class="upgrade-card__header">' +
        '<span class="upgrade-card__icon">' + character.icon + '</span>' +
        '<div>' +
          '<h3 class="upgrade-card__name">' + character.name + '</h3>' +
          '<p class="upgrade-card__current">' + currentInstrument + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="upgrade-card__tiers">' + tierBadges + '</div>' +
      '<div class="upgrade-card__action">' + actionContent + '</div>';
    
    // Add upgrade button handler
    var upgradeBtn = card.querySelector('.btn--primary');
    if (upgradeBtn && !upgradeBtn.disabled) {
      upgradeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        Audio.playClick();
        
        // Deduct cost and upgrade
        Storage.updateBalance(-upgradeCost);
        Storage.upgradeInstrument(character.id);
        
        Audio.playSuccess();
        showToast('Upgraded to ' + Characters.getCurrentInstrument(character.id) + '!', 'success');
        
        // Refresh shop
        populateUpgradeShop();
        updateAllBalanceDisplays();
      });
    }
    
    return card;
  }

  /**
   * Show results screen
   */
  function showResults(results) {
    // Calculate grade
    var grade = calculateGrade(results.accuracy);
    
    // Update results display
    document.getElementById('stat-perfect').textContent = results.perfect;
    document.getElementById('stat-good').textContent = results.good;
    document.getElementById('stat-miss').textContent = results.miss;
    document.getElementById('stat-combo').textContent = results.maxCombo;
    document.getElementById('stat-accuracy').textContent = results.accuracy + '%';
    
    // Update performance rating and payout breakdown
    var performanceEl = document.getElementById('results-performance');
    if (performanceEl && results.performanceRating) {
      var multiplierText = Math.round(results.payoutMultiplier * 100) + '%';
      performanceEl.innerHTML = '<span class="performance-rating performance-' + results.performanceRating.toLowerCase() + '">' + 
        results.performanceRating + ' Performance!</span>' +
        '<span class="payout-breakdown">$' + Storage.formatMoney(results.gigPayout) + ' × ' + multiplierText + '</span>';
      performanceEl.hidden = false;
    }
    
    // Update earnings
    var earningsEl = document.getElementById('results-earnings');
    earningsEl.textContent = '+$' + Storage.formatMoney(results.earnings);
    earningsEl.className = 'earnings-amount positive';
    
    // Update balance
    document.getElementById('results-balance').textContent = '$' + Storage.formatMoney(Storage.getBalance());
    
    // Update grade
    var gradeEl = document.getElementById('results-grade');
    gradeEl.querySelector('.grade-letter').textContent = grade.letter;
    gradeEl.querySelector('.grade-label').textContent = grade.label;
    
    // Check for unlocks
    var unlockEl = document.getElementById('results-unlock');
    var nextStadium = Stadiums.getNextToUnlock();
    if (nextStadium && Storage.getBalance() >= nextStadium.unlockCost) {
      unlockEl.hidden = false;
      document.getElementById('unlock-text').textContent = 'You can now unlock ' + nextStadium.name + '!';
    } else {
      unlockEl.hidden = true;
    }
    
    showScreen('results-screen');
    Audio.playSuccess();
  }

  /**
   * Calculate grade based on accuracy
   */
  function calculateGrade(accuracy) {
    if (accuracy >= Config.GRADE_S) {
      return { letter: 'S', label: 'Perfect!' };
    } else if (accuracy >= Config.GRADE_A) {
      return { letter: 'A', label: 'Amazing!' };
    } else if (accuracy >= Config.GRADE_B) {
      return { letter: 'B', label: 'Great!' };
    } else if (accuracy >= Config.GRADE_C) {
      return { letter: 'C', label: 'Good' };
    } else {
      return { letter: 'D', label: 'Try Again' };
    }
  }

  /**
   * Show/hide pause overlay
   */
  function showPause(show) {
    var pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
      if (show) {
        pauseOverlay.classList.remove('hidden');
      } else {
        pauseOverlay.classList.add('hidden');
      }
    }
  }

  /**
   * Show toast notification
   */
  function showToast(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) return;
    
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'info');
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(function() {
      toast.style.opacity = '0';
      setTimeout(function() {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Get current selections
   */
  function getSelections() {
    return {
      character: selectedCharacter,
      stadium: selectedStadium,
      song: selectedSong
    };
  }

  // Public API
  return {
    init: init,
    showScreen: showScreen,
    showResults: showResults,
    showPause: showPause,
    showToast: showToast,
    updateAllBalanceDisplays: updateAllBalanceDisplays,
    getSelections: getSelections
  };
})();
