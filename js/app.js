/* ============================================
   Stadium Legends - Main Application
   ============================================ */

var App = (function() {
  'use strict';

  /**
   * Initialize the application
   */
  function init() {
    console.log(Config.GAME_NAME + ' v' + Config.VERSION);
    
    // Initialize modules
    Storage.init();
    Audio.init();
    Game.init();
    UI.init();
    
    // Hide loading overlay
    hideLoading();
    
    // Show title screen
    UI.showScreen('title-screen');
    
    console.log('Game initialized successfully!');
  }

  /**
   * Hide the loading overlay
   */
  function hideLoading() {
    var loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }

  /**
   * Show the loading overlay
   */
  function showLoading(text) {
    var loadingOverlay = document.getElementById('loading-overlay');
    var loadingText = loadingOverlay ? loadingOverlay.querySelector('.loading-text') : null;
    
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
    }
    if (loadingText && text) {
      loadingText.textContent = text;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    init: init,
    showLoading: showLoading,
    hideLoading: hideLoading
  };
})();
