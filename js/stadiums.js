/* ============================================
   Stadium Legends - Stadiums Module
   ============================================ */

var Stadiums = (function() {
  'use strict';

  var stadiums = [
    {
      id: 'local-bar',
      name: 'Local Bar',
      icon: '🎤',
      location: 'Your Hometown',
      capacity: 100,
      multiplier: 1.0,
      unlockCost: 0,
      tier: 1
    },
    {
      id: 'club-venue',
      name: 'Club Venue',
      icon: '🎵',
      location: 'Downtown',
      capacity: 500,
      multiplier: 1.2,
      unlockCost: 500000,
      tier: 2
    },
    {
      id: 'theater',
      name: 'Grand Theater',
      icon: '🎭',
      location: 'City Center',
      capacity: 2000,
      multiplier: 1.5,
      unlockCost: 2000000,
      tier: 3
    },
    {
      id: 'arena',
      name: 'Metro Arena',
      icon: '🏟️',
      location: 'Sports District',
      capacity: 15000,
      multiplier: 2.0,
      unlockCost: 5000000,
      tier: 4
    },
    {
      id: 'madison-square-garden',
      name: 'Madison Square Garden',
      icon: '🌟',
      location: 'New York, USA',
      capacity: 20000,
      multiplier: 2.5,
      unlockCost: 10000000,
      tier: 5
    },
    {
      id: 'wembley-stadium',
      name: 'Wembley Stadium',
      icon: '🏆',
      location: 'London, UK',
      capacity: 90000,
      multiplier: 3.0,
      unlockCost: 20000000,
      tier: 6
    }
  ];

  /**
   * Get all stadiums
   */
  function getAll() {
    return stadiums.slice();
  }

  /**
   * Get stadium by ID
   */
  function getById(id) {
    for (var i = 0; i < stadiums.length; i++) {
      if (stadiums[i].id === id) {
        return stadiums[i];
      }
    }
    return null;
  }

  /**
   * Get available stadiums (with unlock status)
   */
  function getAvailable() {
    return stadiums.map(function(stadium) {
      return {
        stadium: stadium,
        unlocked: Storage.isStadiumUnlocked(stadium.id),
        canUnlock: Storage.getBalance() >= stadium.unlockCost
      };
    });
  }

  /**
   * Try to unlock a stadium
   */
  function tryUnlock(stadiumId) {
    var stadium = getById(stadiumId);
    if (!stadium) return { success: false, message: 'Stadium not found' };
    
    if (Storage.isStadiumUnlocked(stadiumId)) {
      return { success: false, message: 'Already unlocked' };
    }
    
    var balance = Storage.getBalance();
    if (balance < stadium.unlockCost) {
      return { success: false, message: 'Not enough money' };
    }
    
    Storage.updateBalance(-stadium.unlockCost);
    Storage.unlockStadium(stadiumId);
    
    return { success: true, message: stadium.name + ' unlocked!' };
  }

  /**
   * Get next stadium to unlock
   */
  function getNextToUnlock() {
    for (var i = 0; i < stadiums.length; i++) {
      if (!Storage.isStadiumUnlocked(stadiums[i].id)) {
        return stadiums[i];
      }
    }
    return null;
  }

  /**
   * Format capacity for display
   */
  function formatCapacity(capacity) {
    if (capacity >= 1000) {
      return (capacity / 1000).toFixed(0) + 'K';
    }
    return capacity.toString();
  }

  // Public API
  return {
    getAll: getAll,
    getById: getById,
    getAvailable: getAvailable,
    tryUnlock: tryUnlock,
    getNextToUnlock: getNextToUnlock,
    formatCapacity: formatCapacity
  };
})();
