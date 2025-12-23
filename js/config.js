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
    STARTING_BALANCE: 0,
    
    // Scoring (for display only, not money)
    SCORE_PERFECT: 1000,
    SCORE_GOOD: 500,
    SCORE_MISS: 0,
    
    // Accuracy Tiers for Gig Payout
    ACCURACY_POOR_MAX: 33,      // 0-33% = Poor (lose 50%)
    ACCURACY_GOOD_MAX: 65,      // 34-65% = Good (100%)
    ACCURACY_GREAT_MAX: 99,     // 66-99% = Great (150%)
    // 100% = Perfect (200%)
    
    // Timing Windows (milliseconds)
    TIMING_PERFECT: 200,
    TIMING_GOOD: 400,
    
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
