/* ============================================
   Stadium Legends - Game Configuration
   ============================================ */

var Config = (function() {
  'use strict';

  return {
    // Game Info
    GAME_NAME: 'Stadium Legends',
    VERSION: '1.0.0',
    
    // Starting Values
    STARTING_BALANCE: 1000000,
    
    // Scoring
    SCORE_PERFECT: 500000,
    SCORE_GOOD: 100000,
    SCORE_MISS: -500000,
    
    // Timing Windows (milliseconds)
    TIMING_PERFECT: 80,
    TIMING_GOOD: 150,
    
    // Upgrade Timing Bonuses
    TIMING_BONUS_PRO: 0.2,      // +20%
    TIMING_BONUS_LEGEND: 0.4,   // +40%
    
    // Upgrade Costs
    UPGRADE_COST_PRO: 3000000,
    UPGRADE_COST_LEGEND: 10000000,
    
    // Gameplay
    NOTE_SPEED: 400,            // pixels per second
    LANES: 4,
    
    // Combo Multipliers
    COMBO_THRESHOLDS: [10, 25, 50, 100],
    COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3],
    
    // Grade Thresholds (accuracy %)
    GRADE_S: 95,
    GRADE_A: 85,
    GRADE_B: 70,
    GRADE_C: 50,
    
    // LocalStorage Keys
    STORAGE_KEY: 'stadium_legends_save',
    
    // Debug Mode
    DEBUG: false
  };
})();
