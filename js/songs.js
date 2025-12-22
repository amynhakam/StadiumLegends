/* ============================================
   Stadium Legends - Songs Module
   ============================================ */

var Songs = (function() {
  'use strict';

  // Songs organized by character style
  var songs = {
    'stella-luna': [
      {
        id: 'midnight-dreams',
        title: 'Midnight Dreams',
        bpm: 80,
        duration: 60000, // 60 seconds
        difficulty: 2,
        notePattern: generateNotePattern(80, 60000, 2)
      },
      {
        id: 'ocean-eyes',
        title: 'Ocean Eyes',
        bpm: 75,
        duration: 55000,
        difficulty: 1,
        notePattern: generateNotePattern(75, 55000, 1)
      },
      {
        id: 'bad-guy-vibes',
        title: 'Bad Guy Vibes',
        bpm: 135,
        duration: 65000,
        difficulty: 3,
        notePattern: generateNotePattern(135, 65000, 3)
      }
    ],
    'k-fire': [
      {
        id: 'humble-beats',
        title: 'Humble Beats',
        bpm: 150,
        duration: 60000,
        difficulty: 3,
        notePattern: generateNotePattern(150, 60000, 3)
      },
      {
        id: 'dna-rhythm',
        title: 'DNA Rhythm',
        bpm: 140,
        duration: 55000,
        difficulty: 2,
        notePattern: generateNotePattern(140, 55000, 2)
      },
      {
        id: 'alright-flow',
        title: 'Alright Flow',
        bpm: 120,
        duration: 50000,
        difficulty: 1,
        notePattern: generateNotePattern(120, 50000, 1)
      }
    ],
    'el-conejo': [
      {
        id: 'reggaeton-fire',
        title: 'Reggaeton Fire',
        bpm: 95,
        duration: 60000,
        difficulty: 2,
        notePattern: generateNotePattern(95, 60000, 2)
      },
      {
        id: 'summer-vibes',
        title: 'Summer Vibes',
        bpm: 100,
        duration: 55000,
        difficulty: 1,
        notePattern: generateNotePattern(100, 55000, 1)
      },
      {
        id: 'latin-heat',
        title: 'Latin Heat',
        bpm: 105,
        duration: 65000,
        difficulty: 3,
        notePattern: generateNotePattern(105, 65000, 3)
      }
    ],
    'ziggy-flash': [
      {
        id: 'starman-riff',
        title: 'Starman Riff',
        bpm: 130,
        duration: 60000,
        difficulty: 2,
        notePattern: generateNotePattern(130, 60000, 2)
      },
      {
        id: 'space-oddity',
        title: 'Space Oddity',
        bpm: 70,
        duration: 55000,
        difficulty: 1,
        notePattern: generateNotePattern(70, 55000, 1)
      },
      {
        id: 'rebel-rock',
        title: 'Rebel Rock',
        bpm: 145,
        duration: 65000,
        difficulty: 3,
        notePattern: generateNotePattern(145, 65000, 3)
      }
    ],
    'dolly-mae': [
      {
        id: 'jolene-strum',
        title: 'Jolene Strum',
        bpm: 110,
        duration: 60000,
        difficulty: 2,
        notePattern: generateNotePattern(110, 60000, 2)
      },
      {
        id: 'nine-to-five',
        title: '9 to 5 Groove',
        bpm: 105,
        duration: 55000,
        difficulty: 1,
        notePattern: generateNotePattern(105, 55000, 1)
      },
      {
        id: 'country-roads',
        title: 'Country Roads',
        bpm: 85,
        duration: 65000,
        difficulty: 3,
        notePattern: generateNotePattern(85, 65000, 3)
      }
    ]
  };

  /**
   * Generate a note pattern based on BPM and duration
   */
  function generateNotePattern(bpm, duration, difficulty) {
    var notes = [];
    var beatInterval = 60000 / bpm; // ms per beat
    
    // Adjust note density based on difficulty
    var notesPerBeat = difficulty === 1 ? 0.5 : difficulty === 2 ? 0.75 : 1;
    var noteInterval = beatInterval / notesPerBeat;
    
    // Start time with some lead-in
    var startTime = 2000;
    var currentTime = startTime;
    
    // Track last lane to create more interesting patterns
    var lastLane = -1;
    
    while (currentTime < duration - 2000) {
      // Determine if we place a note (based on difficulty)
      var shouldPlace = Math.random() < (0.6 + difficulty * 0.1);
      
      if (shouldPlace) {
        // Choose lane (avoid too many repeats)
        var lane;
        do {
          lane = Math.floor(Math.random() * Config.LANES);
        } while (lane === lastLane && Math.random() < 0.7);
        
        notes.push({
          lane: lane,
          time: Math.round(currentTime),
          hit: false,
          result: null
        });
        
        lastLane = lane;
        
        // Sometimes add a second note for higher difficulties
        if (difficulty >= 2 && Math.random() < 0.2) {
          var secondLane;
          do {
            secondLane = Math.floor(Math.random() * Config.LANES);
          } while (secondLane === lane);
          
          notes.push({
            lane: secondLane,
            time: Math.round(currentTime),
            hit: false,
            result: null
          });
        }
      }
      
      currentTime += noteInterval;
    }
    
    return notes;
  }

  /**
   * Get songs for a character
   */
  function getForCharacter(characterId) {
    return (songs[characterId] || []).slice();
  }

  /**
   * Get song by ID for a character
   */
  function getById(characterId, songId) {
    var characterSongs = songs[characterId] || [];
    for (var i = 0; i < characterSongs.length; i++) {
      if (characterSongs[i].id === songId) {
        // Return a deep copy with fresh note pattern
        var song = JSON.parse(JSON.stringify(characterSongs[i]));
        // Regenerate notes to reset hit status
        song.notePattern = generateNotePattern(song.bpm, song.duration, song.difficulty);
        return song;
      }
    }
    return null;
  }

  /**
   * Get difficulty label
   */
  function getDifficultyLabel(difficulty) {
    switch(difficulty) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      default: return 'Easy';
    }
  }

  /**
   * Get difficulty class for styling
   */
  function getDifficultyClass(difficulty) {
    switch(difficulty) {
      case 1: return 'easy';
      case 2: return 'medium';
      case 3: return 'hard';
      default: return 'easy';
    }
  }

  /**
   * Format duration for display
   */
  function formatDuration(ms) {
    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  // Public API
  return {
    getForCharacter: getForCharacter,
    getById: getById,
    getDifficultyLabel: getDifficultyLabel,
    getDifficultyClass: getDifficultyClass,
    formatDuration: formatDuration
  };
})();
