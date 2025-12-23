/* ============================================
   Stadium Legends - Characters Module
   ============================================ */

var Characters = (function() {
  'use strict';

  var characters = [
    {
      id: 'stella-luna',
      name: 'Stella Luna',
      icon: '🖤',
      instrument: 'Dark Synth',
      style: 'Dark pop, electronic, atmospheric',
      hometown: 'Seattle, WA',
      coordinates: { lat: 47.6062, lon: -122.3321 },
      colors: {
        primary: '#1a1a2e',
        accent: '#16c172',
        highlight: '#9b5de5'
      },
      instrumentTiers: [
        { name: 'Basic Synth', bonus: 0 },
        { name: 'Pro Synth', bonus: Config.TIMING_BONUS_PRO },
        { name: 'Legend Synth', bonus: Config.TIMING_BONUS_LEGEND }
      ]
    },
    {
      id: 'k-fire',
      name: 'K-Fire',
      icon: '🔥',
      instrument: 'Beat Pad',
      style: 'Hip-hop, rap, conscious beats',
      hometown: 'Atlanta, GA',
      coordinates: { lat: 33.7490, lon: -84.3880 },
      colors: {
        primary: '#1a0a0a',
        accent: '#ef4444',
        highlight: '#f59e0b'
      },
      instrumentTiers: [
        { name: 'Basic Beat Pad', bonus: 0 },
        { name: 'Pro Beat Pad', bonus: Config.TIMING_BONUS_PRO },
        { name: 'Legend Beat Pad', bonus: Config.TIMING_BONUS_LEGEND }
      ]
    },
    {
      id: 'el-conejo',
      name: 'El Conejo',
      icon: '🐰',
      instrument: 'Reggaeton Drums',
      style: 'Reggaeton, Latin trap, dance',
      hometown: 'San Juan, Puerto Rico',
      coordinates: { lat: 18.4655, lon: -66.1057 },
      colors: {
        primary: '#1a1a0a',
        accent: '#ec4899',
        highlight: '#fbbf24'
      },
      instrumentTiers: [
        { name: 'Basic Drums', bonus: 0 },
        { name: 'Pro Drums', bonus: Config.TIMING_BONUS_PRO },
        { name: 'Legend Drums', bonus: Config.TIMING_BONUS_LEGEND }
      ]
    },
    {
      id: 'ziggy-flash',
      name: 'Ziggy Flash',
      icon: '⚡',
      instrument: 'Electric Guitar',
      style: 'Glam rock, art rock, experimental',
      hometown: 'London, UK',
      coordinates: { lat: 51.5074, lon: -0.1278 },
      colors: {
        primary: '#0a1a2e',
        accent: '#3b82f6',
        highlight: '#f97316'
      },
      instrumentTiers: [
        { name: 'Basic Guitar', bonus: 0 },
        { name: 'Pro Guitar', bonus: Config.TIMING_BONUS_PRO },
        { name: 'Legend Guitar', bonus: Config.TIMING_BONUS_LEGEND }
      ]
    },
    {
      id: 'dolly-mae',
      name: 'Dolly Mae',
      icon: '🦋',
      instrument: 'Acoustic Guitar',
      style: 'Country, folk, Americana',
      hometown: 'Nashville, TN',
      coordinates: { lat: 36.1627, lon: -86.7816 },
      colors: {
        primary: '#2e1a1a',
        accent: '#f472b6',
        highlight: '#fcd34d'
      },
      instrumentTiers: [
        { name: 'Basic Acoustic', bonus: 0 },
        { name: 'Pro Acoustic', bonus: Config.TIMING_BONUS_PRO },
        { name: 'Legend Acoustic', bonus: Config.TIMING_BONUS_LEGEND }
      ]
    }
  ];

  /**
   * Get all characters
   */
  function getAll() {
    return characters.slice();
  }

  /**
   * Get character by ID
   */
  function getById(id) {
    for (var i = 0; i < characters.length; i++) {
      if (characters[i].id === id) {
        return characters[i];
      }
    }
    return null;
  }

  /**
   * Get character's current instrument name
   */
  function getCurrentInstrument(characterId) {
    var character = getById(characterId);
    if (!character) return null;
    
    var upgradeLevel = Storage.getUpgradeLevel(characterId);
    return character.instrumentTiers[upgradeLevel].name;
  }

  /**
   * Get character's timing bonus based on upgrade level
   */
  function getTimingBonus(characterId) {
    var character = getById(characterId);
    if (!character) return 0;
    
    var upgradeLevel = Storage.getUpgradeLevel(characterId);
    return character.instrumentTiers[upgradeLevel].bonus;
  }

  /**
   * Get upgrade cost for character
   */
  function getUpgradeCost(characterId) {
    var upgradeLevel = Storage.getUpgradeLevel(characterId);
    
    if (upgradeLevel === 0) {
      return Config.UPGRADE_COST_PRO;
    } else if (upgradeLevel === 1) {
      return Config.UPGRADE_COST_LEGEND;
    }
    return null; // Already maxed
  }

  /**
   * Get next upgrade tier name
   */
  function getNextUpgradeName(characterId) {
    var character = getById(characterId);
    if (!character) return null;
    
    var upgradeLevel = Storage.getUpgradeLevel(characterId);
    if (upgradeLevel >= 2) return null;
    
    return character.instrumentTiers[upgradeLevel + 1].name;
  }

  // Public API
  return {
    getAll: getAll,
    getById: getById,
    getCurrentInstrument: getCurrentInstrument,
    getTimingBonus: getTimingBonus,
    getUpgradeCost: getUpgradeCost,
    getNextUpgradeName: getNextUpgradeName
  };
})();
