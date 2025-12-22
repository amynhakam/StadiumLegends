/* ============================================
   Stadium Legends - Audio Module
   Enhanced with realistic music & instruments
   ============================================ */

var Audio = (function() {
  'use strict';

  var audioContext = null;
  var sounds = {};
  var musicVolume = 0.4;
  var sfxVolume = 1.0;
  var initialized = false;
  
  // Background music state
  var bgMusicPlaying = false;
  var bgMusicNodes = [];
  var bgMusicIntervals = [];
  var currentCharacterId = null;

  // Musical note frequencies (full range)
  var NOTES = {
    C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77
  };
  
  // Character-specific instrument configurations
  var characterInstruments = {
    'stella-luna': {
      name: 'Dark Synth',
      hitSound: 'synth',
      // Dark, moody synth pad tones
      hitFreqs: [NOTES.C3, NOTES.E3, NOTES.G3, NOTES.B3]
    },
    'k-fire': {
      name: 'Beat Pad',
      hitSound: 'drum',
      // 808-style drum hits
      hitFreqs: [60, 100, 150, 200] // Low kicks to snares
    },
    'el-conejo': {
      name: 'Reggaeton Drums',
      hitSound: 'percussion',
      // Latin percussion sounds
      hitFreqs: [80, 120, 200, 350]
    },
    'ziggy-flash': {
      name: 'Electric Guitar',
      hitSound: 'guitar',
      // Power chord root notes
      hitFreqs: [NOTES.E2, NOTES.A2, NOTES.D3, NOTES.G3]
    },
    'dolly-mae': {
      name: 'Acoustic Guitar',
      hitSound: 'acoustic',
      // Country chord tones
      hitFreqs: [NOTES.G3, NOTES.C4, NOTES.D4, NOTES.G4]
    }
  };
  
  // Full music tracks by character (chord progressions and melodies)
  var musicTracks = {
    'stella-luna': {
      bpm: 70,
      // Dark pop/electronic - Billie Eilish style
      chords: [
        [NOTES.A2, NOTES.E3, NOTES.A3],      // Am
        [NOTES.F2, NOTES.C3, NOTES.F3],      // F
        [NOTES.C3, NOTES.G3, NOTES.C4],      // C
        [NOTES.G2, NOTES.D3, NOTES.G3]       // G
      ],
      melody: [NOTES.A4, NOTES.G4, NOTES.E4, NOTES.D4, NOTES.C4, NOTES.E4, NOTES.A4, NOTES.G4],
      bassPattern: [0, 0, 2, 0, 1, 0, 2, 3],
      style: 'darksynth'
    },
    'k-fire': {
      bpm: 90,
      // Hip-hop/trap - Kendrick style
      chords: [
        [NOTES.D2, NOTES.A2, NOTES.D3],      // Dm
        [NOTES.G2, NOTES.D3, NOTES.G3],      // Gm  
        [NOTES.C2, NOTES.G2, NOTES.C3],      // Cm
        [NOTES.F2, NOTES.C3, NOTES.F3]       // Fm
      ],
      melody: [NOTES.D4, NOTES.F4, NOTES.G4, NOTES.A4, NOTES.G4, NOTES.F4, NOTES.D4, NOTES.C4],
      bassPattern: [0, 0, 1, 0, 2, 2, 3, 0],
      style: 'hiphop'
    },
    'el-conejo': {
      bpm: 100,
      // Reggaeton/Latin - Bad Bunny style
      chords: [
        [NOTES.A2, NOTES.E3, NOTES.A3],      // Am
        [NOTES.D3, NOTES.A3, NOTES.D4],      // Dm
        [NOTES.G2, NOTES.D3, NOTES.G3],      // G
        [NOTES.C3, NOTES.G3, NOTES.C4]       // C
      ],
      melody: [NOTES.A4, NOTES.C5, NOTES.B4, NOTES.A4, NOTES.G4, NOTES.A4, NOTES.E4, NOTES.G4],
      bassPattern: [0, 0, 1, 1, 2, 2, 3, 3],
      style: 'reggaeton'
    },
    'ziggy-flash': {
      bpm: 130,
      // Glam rock - Bowie style
      chords: [
        [NOTES.E2, NOTES.B2, NOTES.E3],      // E5
        [NOTES.A2, NOTES.E3, NOTES.A3],      // A5
        [NOTES.D3, NOTES.A3, NOTES.D4],      // D5
        [NOTES.G2, NOTES.D3, NOTES.G3]       // G5
      ],
      melody: [NOTES.E5, NOTES.D5, NOTES.B4, NOTES.A4, NOTES.B4, NOTES.D5, NOTES.E5, NOTES.G5],
      bassPattern: [0, 0, 1, 1, 2, 3, 2, 1],
      style: 'rock'
    },
    'dolly-mae': {
      bpm: 110,
      // Country - Dolly style
      chords: [
        [NOTES.G2, NOTES.B2, NOTES.D3, NOTES.G3],   // G
        [NOTES.C3, NOTES.E3, NOTES.G3, NOTES.C4],   // C
        [NOTES.D3, NOTES.F3, NOTES.A3, NOTES.D4],   // D
        [NOTES.E3, NOTES.G3, NOTES.B3, NOTES.E4]    // Em
      ],
      melody: [NOTES.G4, NOTES.A4, NOTES.B4, NOTES.D5, NOTES.B4, NOTES.A4, NOTES.G4, NOTES.E4],
      bassPattern: [0, 0, 1, 1, 2, 2, 0, 3],
      style: 'country'
    }
  };

  /**
   * Initialize audio system
   */
  function init() {
    console.log('Audio.init() called');
    
    // Setup enable sound button (always, not just mobile)
    var soundBtn = document.getElementById('btn-enable-sound');
    if (soundBtn) {
      console.log('Found sound button');
      soundBtn.addEventListener('click', function() {
        console.log('Sound button clicked');
        forceUnlockAudio();
        this.textContent = '🔊 Sound Enabled!';
        this.style.background = '#4CAF50';
      });
      
      // Also handle touch
      soundBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        console.log('Sound button touched');
        forceUnlockAudio();
        this.textContent = '🔊 Sound Enabled!';
        this.style.background = '#4CAF50';
      });
    } else {
      console.log('Sound button not found!');
    }
    
    // Add listeners to ALL touch events to maximize chances of unlocking
    var unlockEvents = ['click', 'touchstart', 'touchend', 'mousedown', 'keydown'];
    
    unlockEvents.forEach(function(eventName) {
      document.addEventListener(eventName, unlockAudio, { passive: true });
    });
    
    // Also try on visibility change (coming back to tab)
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        resumeAudio();
      }
    });
    
    console.log('Audio module initialized, waiting for user interaction...');
  }
  
  /**
   * Force unlock audio - plays an actual audible tone to confirm
   */
  function forceUnlockAudio() {
    console.log('forceUnlockAudio called');
    
    // Create context
    if (!audioContext) {
      try {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
        console.log('Created audio context, state:', audioContext.state);
      } catch (e) {
        console.error('Failed to create audio context:', e);
        alert('Audio not supported on this device');
        return;
      }
    }
    
    // Resume context
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(function() {
        console.log('Audio context resumed');
        playTestTone();
      });
    } else {
      playTestTone();
    }
    
    initialized = true;
  }
  
  /**
   * Play a test tone to confirm audio works
   */
  function playTestTone() {
    if (!audioContext) return;
    
    try {
      var osc = audioContext.createOscillator();
      var gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 440; // A4 note
      
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
      
      console.log('Test tone played!');
    } catch (e) {
      console.error('Failed to play test tone:', e);
    }
  }

  /**
   * Unlock audio on mobile (needs to happen on user gesture)
   */
  function unlockAudio() {
    // Create context if needed
    if (!audioContext) {
      try {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
        console.log('Audio context created, state:', audioContext.state);
      } catch (e) {
        console.error('Web Audio API not supported:', e);
        return;
      }
    }
    
    // Resume if suspended (mobile browsers suspend by default)
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(function() {
        console.log('Audio context resumed successfully');
        initialized = true;
        // Play silent buffer to fully unlock on iOS
        playSilentBuffer();
      }).catch(function(e) {
        console.error('Failed to resume audio:', e);
      });
    } else if (audioContext.state === 'running') {
      if (!initialized) {
        // Play silent buffer to fully unlock on iOS
        playSilentBuffer();
        initialized = true;
        console.log('Audio already running, initialized');
      }
    }
  }
  
  /**
   * Play a silent buffer to unlock audio on iOS Safari
   */
  function playSilentBuffer() {
    if (!audioContext) return;
    
    try {
      var silentBuffer = audioContext.createBuffer(1, 1, 22050);
      var source = audioContext.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      console.log('Silent buffer played for iOS unlock');
    } catch (e) {
      console.log('Silent buffer failed:', e);
    }
  }

  /**
   * Initialize audio context (requires user gesture)
   */
  function initContext() {
    unlockAudio();
  }
  
  /**
   * Resume audio (call after tab becomes visible again)
   */
  function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().then(function() {
        console.log('Audio resumed after visibility change');
      });
    }
  }

  /**
   * Ensure audio context is running
   */
  function ensureContext() {
    if (!audioContext) {
      // Try to create context - may fail without user gesture
      try {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
        console.log('Audio context created in ensureContext');
      } catch (e) {
        console.log('Cannot create audio context yet');
        return;
      }
    }
    
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(function() {
        console.log('Could not resume - waiting for user gesture');
      });
    }
  }

  /**
   * Play instrument-specific hit sound
   */
  function playHit(lane, quality) {
    ensureContext();
    if (!audioContext) return;

    var instrument = characterInstruments[currentCharacterId] || characterInstruments['stella-luna'];
    var frequency = instrument.hitFreqs[lane] || 440;
    
    // Play instrument-specific sound based on quality
    if (quality === 'miss') {
      playMissSound(instrument.hitSound);
      return;
    }
    
    switch (instrument.hitSound) {
      case 'synth':
        playSynthHit(frequency, quality);
        break;
      case 'drum':
        playDrumHit(lane, quality);
        break;
      case 'percussion':
        playPercussionHit(lane, quality);
        break;
      case 'guitar':
        playElectricGuitarHit(frequency, quality);
        break;
      case 'acoustic':
        playAcousticGuitarHit(frequency, quality);
        break;
      default:
        playGenericHit(frequency, quality);
    }
  }
  
  /**
   * Synth hit - Dark, atmospheric pad sound (Stella Luna)
   */
  function playSynthHit(frequency, quality) {
    var duration = quality === 'perfect' ? 0.4 : 0.25;
    var gain = quality === 'perfect' ? 0.35 : 0.25;
    
    // Main synth tone
    var osc1 = audioContext.createOscillator();
    var osc2 = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    var filter = audioContext.createBiquadFilter();
    
    osc1.type = 'sawtooth';
    osc1.frequency.value = frequency;
    
    osc2.type = 'sine';
    osc2.frequency.value = frequency * 2; // Octave up
    osc2.detune.value = 5; // Slight detune for richness
    
    filter.type = 'lowpass';
    filter.frequency.value = quality === 'perfect' ? 2000 : 1200;
    filter.Q.value = 2;
    
    gainNode.gain.setValueAtTime(gain * sfxVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(audioContext.currentTime + duration);
    osc2.stop(audioContext.currentTime + duration);
  }
  
  /**
   * Drum hit - 808-style drums (K-Fire)
   */
  function playDrumHit(lane, quality) {
    var gain = quality === 'perfect' ? 0.5 : 0.35;
    
    if (lane === 0) {
      // Kick drum - low 808
      play808Kick(gain);
    } else if (lane === 1) {
      // Snare
      playSnare(gain);
    } else if (lane === 2) {
      // Hi-hat closed
      playHiHat(gain, false);
    } else {
      // Hi-hat open
      playHiHat(gain, true);
    }
  }
  
  /**
   * 808 Kick drum
   */
  function play808Kick(gain) {
    var osc = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(gain * sfxVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.4);
  }
  
  /**
   * Snare drum
   */
  function playSnare(gain) {
    // Noise component
    var bufferSize = audioContext.sampleRate * 0.2;
    var buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    var noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    var noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    var noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(gain * 0.7 * sfxVolume, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    // Tone component
    var osc = audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 200;
    
    var oscGain = audioContext.createGain();
    oscGain.gain.setValueAtTime(gain * 0.5 * sfxVolume, audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    
    osc.connect(oscGain);
    oscGain.connect(audioContext.destination);
    
    noise.start();
    osc.start();
    noise.stop(audioContext.currentTime + 0.2);
    osc.stop(audioContext.currentTime + 0.1);
  }
  
  /**
   * Hi-hat
   */
  function playHiHat(gain, open) {
    var bufferSize = audioContext.sampleRate * (open ? 0.3 : 0.1);
    var buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    var noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    var filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = open ? 7000 : 9000;
    
    var gainNode = audioContext.createGain();
    var duration = open ? 0.3 : 0.08;
    gainNode.gain.setValueAtTime(gain * 0.4 * sfxVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noise.start();
    noise.stop(audioContext.currentTime + duration);
  }
  
  /**
   * Percussion hit - Latin drums (El Conejo)
   */
  function playPercussionHit(lane, quality) {
    var gain = quality === 'perfect' ? 0.5 : 0.35;
    
    if (lane === 0) {
      // Bass drum (bombo)
      play808Kick(gain);
    } else if (lane === 1) {
      // Conga high
      playConga(gain, true);
    } else if (lane === 2) {
      // Conga low
      playConga(gain, false);
    } else {
      // Clap
      playClap(gain);
    }
  }
  
  /**
   * Conga drum
   */
  function playConga(gain, high) {
    var osc = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    osc.type = 'sine';
    var startFreq = high ? 350 : 250;
    osc.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.5, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(gain * sfxVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.2);
  }
  
  /**
   * Hand clap
   */
  function playClap(gain) {
    // Multiple short noise bursts
    for (var i = 0; i < 3; i++) {
      setTimeout(function(index) {
        return function() {
          var bufferSize = audioContext.sampleRate * 0.02;
          var buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          var data = buffer.getChannelData(0);
          for (var j = 0; j < bufferSize; j++) {
            data[j] = Math.random() * 2 - 1;
          }
          
          var noise = audioContext.createBufferSource();
          noise.buffer = buffer;
          
          var filter = audioContext.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 2000;
          
          var gainNode = audioContext.createGain();
          gainNode.gain.setValueAtTime(gain * 0.4 * sfxVolume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
          
          noise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          noise.start();
          noise.stop(audioContext.currentTime + 0.08);
        };
      }(i), i * 10);
    }
  }
  
  /**
   * Electric guitar hit - Distorted power chord (Ziggy Flash)
   */
  function playElectricGuitarHit(frequency, quality) {
    var duration = quality === 'perfect' ? 0.5 : 0.3;
    var gain = quality === 'perfect' ? 0.35 : 0.25;
    
    // Create power chord (root + fifth)
    var osc1 = audioContext.createOscillator();
    var osc2 = audioContext.createOscillator();
    var osc3 = audioContext.createOscillator();
    
    // Distortion via waveshaper
    var distortion = audioContext.createWaveShaper();
    distortion.curve = makeDistortionCurve(100);
    
    var gainNode = audioContext.createGain();
    var filter = audioContext.createBiquadFilter();
    
    osc1.type = 'sawtooth';
    osc1.frequency.value = frequency;
    
    osc2.type = 'sawtooth';
    osc2.frequency.value = frequency * 1.5; // Perfect fifth
    
    osc3.type = 'square';
    osc3.frequency.value = frequency * 2; // Octave for bite
    
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    
    gainNode.gain.setValueAtTime(gain * sfxVolume, audioContext.currentTime);
    gainNode.gain.setValueAtTime(gain * sfxVolume, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    osc1.connect(distortion);
    osc2.connect(distortion);
    osc3.connect(distortion);
    distortion.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc1.start();
    osc2.start();
    osc3.start();
    osc1.stop(audioContext.currentTime + duration);
    osc2.stop(audioContext.currentTime + duration);
    osc3.stop(audioContext.currentTime + duration);
  }
  
  /**
   * Create distortion curve for guitar
   */
  function makeDistortionCurve(amount) {
    var samples = 44100;
    var curve = new Float32Array(samples);
    var deg = Math.PI / 180;
    for (var i = 0; i < samples; i++) {
      var x = i * 2 / samples - 1;
      curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }
  
  /**
   * Acoustic guitar hit - Clean strum (Dolly Mae)
   */
  function playAcousticGuitarHit(frequency, quality) {
    var duration = quality === 'perfect' ? 0.6 : 0.4;
    var gain = quality === 'perfect' ? 0.4 : 0.3;
    
    // Create chord tones with slight delays (strum effect)
    var delays = [0, 0.015, 0.03, 0.045];
    var chordTones = [frequency, frequency * 1.25, frequency * 1.5, frequency * 2];
    
    for (var i = 0; i < chordTones.length; i++) {
      (function(freq, delay, idx) {
        setTimeout(function() {
          var osc = audioContext.createOscillator();
          var gainNode = audioContext.createGain();
          var filter = audioContext.createBiquadFilter();
          
          // Triangle wave for acoustic warmth
          osc.type = 'triangle';
          osc.frequency.value = freq;
          
          filter.type = 'lowpass';
          filter.frequency.value = 2500;
          filter.Q.value = 1;
          
          var vol = gain * (1 - idx * 0.1) * sfxVolume;
          gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration - delay);
          
          osc.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          osc.start();
          osc.stop(audioContext.currentTime + duration - delay);
        }, delay * 1000);
      })(chordTones[i], delays[i], i);
    }
  }
  
  /**
   * Generic hit sound (fallback)
   */
  function playGenericHit(frequency, quality) {
    var duration = quality === 'perfect' ? 0.15 : 0.1;
    var gain = quality === 'perfect' ? 0.4 : 0.3;
    playTone(frequency, duration, gain, 'sine');
  }
  
  /**
   * Miss sound for any instrument
   */
  function playMissSound(instrumentType) {
    var osc = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.value = 80;
    
    gainNode.gain.setValueAtTime(0.15 * sfxVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.15);
  }

  /**
   * Play a tone using Web Audio API
   */
  function playTone(frequency, duration, gain, type) {
    if (!audioContext) return;

    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();

    oscillator.type = type || 'sine';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(gain * sfxVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  /**
   * Play miss sound
   */
  function playMiss() {
    ensureContext();
    if (!audioContext) return;

    playMissSound('generic');
  }

  /**
   * Play combo sound
   */
  function playCombo() {
    ensureContext();
    if (!audioContext) return;

    // Ascending arpeggio
    var times = [0, 0.05, 0.1];
    var frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

    for (var i = 0; i < times.length; i++) {
      setTimeout((function(freq) {
        return function() {
          playTone(freq, 0.15, 0.3, 'sine');
        };
      })(frequencies[i]), times[i] * 1000);
    }
  }

  /**
   * Play money gain sound
   */
  function playMoneyGain() {
    ensureContext();
    if (!audioContext) return;

    playTone(880, 0.1, 0.2, 'sine');
    setTimeout(function() {
      playTone(1100, 0.1, 0.2, 'sine');
    }, 50);
  }

  /**
   * Play money loss sound
   */
  function playMoneyLoss() {
    ensureContext();
    if (!audioContext) return;

    playTone(200, 0.2, 0.2, 'sawtooth');
  }

  /**
   * Play UI click sound
   */
  function playClick() {
    ensureContext();
    if (!audioContext) return;

    playTone(600, 0.05, 0.1, 'sine');
  }

  /**
   * Play success sound
   */
  function playSuccess() {
    ensureContext();
    if (!audioContext) return;

    var times = [0, 0.1, 0.2, 0.3];
    var frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    for (var i = 0; i < times.length; i++) {
      setTimeout((function(freq) {
        return function() {
          playTone(freq, 0.2, 0.25, 'sine');
        };
      })(frequencies[i]), times[i] * 1000);
    }
  }

  /**
   * Play countdown beep
   */
  function playCountdown(final) {
    ensureContext();
    if (!audioContext) return;

    if (final) {
      playTone(880, 0.3, 0.3, 'sine');
    } else {
      playTone(440, 0.1, 0.2, 'sine');
    }
  }

  /**
   * Start background music for a character
   */
  function startBackgroundMusic(characterId) {
    ensureContext();
    if (!audioContext) return;
    
    stopBackgroundMusic();
    
    currentCharacterId = characterId;
    var track = musicTracks[characterId] || musicTracks['stella-luna'];
    bgMusicPlaying = true;
    
    var beatDuration = 60 / track.bpm; // seconds per beat
    var barDuration = beatDuration * 4; // 4 beats per bar
    var currentBeat = 0;
    var currentBar = 0;
    var melodyIndex = 0;
    
    // Play the music loop
    function playMusicLoop() {
      if (!bgMusicPlaying || !audioContext) return;
      
      var style = track.style;
      var chordIndex = track.bassPattern[currentBeat % track.bassPattern.length];
      var chord = track.chords[chordIndex];
      
      // Play style-specific music
      switch (style) {
        case 'darksynth':
          playDarkSynthMusic(track, chord, currentBeat, beatDuration);
          break;
        case 'hiphop':
          playHipHopMusic(track, chord, currentBeat, beatDuration);
          break;
        case 'reggaeton':
          playReggaetonMusic(track, chord, currentBeat, beatDuration);
          break;
        case 'rock':
          playRockMusic(track, chord, currentBeat, beatDuration);
          break;
        case 'country':
          playCountryMusic(track, chord, currentBeat, beatDuration);
          break;
      }
      
      // Play melody note every other beat
      if (currentBeat % 2 === 0) {
        var melodyNote = track.melody[melodyIndex % track.melody.length];
        playMelodyNote(style, melodyNote, beatDuration * 1.5);
        melodyIndex++;
      }
      
      currentBeat++;
      if (currentBeat >= 8) {
        currentBeat = 0;
        currentBar++;
      }
      
      var interval = setTimeout(playMusicLoop, beatDuration * 1000);
      bgMusicIntervals.push(interval);
    }
    
    playMusicLoop();
  }
  
  /**
   * Dark synth music (Stella Luna - Billie Eilish style)
   */
  function playDarkSynthMusic(track, chord, beat, duration) {
    // Deep bass pad on beats 0 and 4
    if (beat % 4 === 0) {
      playPad(chord[0] * 0.5, duration * 3, 'sine', musicVolume * 0.3);
    }
    
    // Atmospheric pad chord sustained
    if (beat === 0) {
      for (var i = 0; i < chord.length; i++) {
        playPad(chord[i], duration * 7, 'sine', musicVolume * 0.1);
      }
    }
    
    // Subtle kick on 1 and 3
    if (beat % 2 === 0) {
      playMusicKick(musicVolume * 0.25);
    }
    
    // Soft hi-hat pattern
    if (beat % 2 === 1) {
      playMusicHiHat(musicVolume * 0.1, false);
    }
  }
  
  /**
   * Hip-hop music (K-Fire - Kendrick style)
   */
  function playHipHopMusic(track, chord, beat, duration) {
    // Heavy 808 bass on beats 0 and 3
    if (beat === 0 || beat === 3 || beat === 6) {
      playMusic808(chord[0], duration * 0.8, musicVolume * 0.4);
    }
    
    // Snare on 2 and 6
    if (beat === 2 || beat === 6) {
      playMusicSnare(musicVolume * 0.35);
    }
    
    // Hi-hat pattern (trap style)
    playMusicHiHat(musicVolume * 0.15, beat % 2 === 0);
    
    // Add trap hi-hat rolls occasionally
    if (beat === 5 || beat === 7) {
      setTimeout(function() {
        playMusicHiHat(musicVolume * 0.1, false);
      }, duration * 250);
      setTimeout(function() {
        playMusicHiHat(musicVolume * 0.1, false);
      }, duration * 500);
    }
  }
  
  /**
   * Reggaeton music (El Conejo - Bad Bunny style)
   */
  function playReggaetonMusic(track, chord, beat, duration) {
    // Dembow rhythm pattern
    // Kick on 1 and 3
    if (beat === 0 || beat === 2 || beat === 4 || beat === 6) {
      playMusic808(chord[0], duration * 0.5, musicVolume * 0.35);
    }
    
    // Snare on 2 and 4 (offbeat)
    if (beat === 1 || beat === 3 || beat === 5 || beat === 7) {
      playMusicSnare(musicVolume * 0.3);
    }
    
    // Dembow clap pattern
    if (beat === 1 || beat === 5) {
      playMusicClap(musicVolume * 0.25);
    }
    
    // Constant hi-hats
    playMusicHiHat(musicVolume * 0.15, false);
    
    // Bass synth stabs
    if (beat % 4 === 0) {
      playPad(chord[0], duration * 0.3, 'square', musicVolume * 0.2);
    }
  }
  
  /**
   * Rock music (Ziggy Flash - Bowie style)
   */
  function playRockMusic(track, chord, beat, duration) {
    // Driving kick pattern
    if (beat % 2 === 0) {
      playMusicKick(musicVolume * 0.4);
    }
    
    // Snare on 2 and 6
    if (beat === 2 || beat === 6) {
      playMusicSnare(musicVolume * 0.4);
    }
    
    // Power chord hits
    if (beat === 0 || beat === 4) {
      playPowerChord(chord[0], duration * 1.5, musicVolume * 0.25);
    }
    
    // Riding hi-hat
    playMusicHiHat(musicVolume * 0.2, beat === 4);
    
    // Bass follows chord root
    if (beat % 2 === 0) {
      playPad(chord[0] * 0.5, duration * 0.8, 'sawtooth', musicVolume * 0.2);
    }
  }
  
  /**
   * Country music (Dolly Mae - Dolly style)
   */
  function playCountryMusic(track, chord, beat, duration) {
    // Boom-chick pattern
    // Bass note on 1 and 3
    if (beat === 0 || beat === 2 || beat === 4 || beat === 6) {
      playPad(chord[0], duration * 0.5, 'triangle', musicVolume * 0.25);
    }
    
    // Chord strum on 2 and 4
    if (beat === 1 || beat === 3 || beat === 5 || beat === 7) {
      playGuitarStrum(chord, duration * 0.4, musicVolume * 0.2);
    }
    
    // Kick on 1 and 3
    if (beat % 2 === 0) {
      playMusicKick(musicVolume * 0.25);
    }
    
    // Snare on 2 and 4
    if (beat === 2 || beat === 6) {
      playMusicSnare(musicVolume * 0.25);
    }
    
    // Soft hi-hat
    if (beat % 2 === 1) {
      playMusicHiHat(musicVolume * 0.1, false);
    }
  }
  
  /**
   * Play a pad/synth note
   */
  function playPad(frequency, duration, type, gain) {
    if (!audioContext || !bgMusicPlaying) return;
    
    var osc = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    var filter = audioContext.createBiquadFilter();
    
    osc.type = type || 'sine';
    osc.frequency.value = frequency;
    
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, audioContext.currentTime + 0.05);
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + duration);
    
    bgMusicNodes.push({ osc: osc, gain: gainNode });
  }
  
  /**
   * Play melody note based on style
   */
  function playMelodyNote(style, frequency, duration) {
    if (!audioContext || !bgMusicPlaying) return;
    
    var osc = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    var filter = audioContext.createBiquadFilter();
    
    // Different tones for different styles
    switch (style) {
      case 'darksynth':
        osc.type = 'sine';
        filter.frequency.value = 2000;
        break;
      case 'hiphop':
        osc.type = 'square';
        filter.frequency.value = 1500;
        break;
      case 'reggaeton':
        osc.type = 'sawtooth';
        filter.frequency.value = 2500;
        break;
      case 'rock':
        osc.type = 'sawtooth';
        filter.frequency.value = 3000;
        break;
      case 'country':
        osc.type = 'triangle';
        filter.frequency.value = 2000;
        break;
      default:
        osc.type = 'sine';
        filter.frequency.value = 2000;
    }
    
    osc.frequency.value = frequency;
    filter.type = 'lowpass';
    
    var vol = musicVolume * 0.15;
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(vol, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + duration);
    
    bgMusicNodes.push({ osc: osc, gain: gainNode });
  }
  
  /**
   * Play 808 bass
   */
  function playMusic808(frequency, duration, gain) {
    if (!audioContext || !bgMusicPlaying) return;
    
    var osc = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency * 0.5, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.25, audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + duration);
    
    bgMusicNodes.push({ osc: osc, gain: gainNode });
  }
  
  /**
   * Play music kick drum
   */
  function playMusicKick(gain) {
    if (!audioContext || !bgMusicPlaying) return;
    
    var osc = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.2);
    
    bgMusicNodes.push({ osc: osc, gain: gainNode });
  }
  
  /**
   * Play music snare
   */
  function playMusicSnare(gain) {
    if (!audioContext || !bgMusicPlaying) return;
    
    // Noise component
    var bufferSize = audioContext.sampleRate * 0.15;
    var buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    var noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    var filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    
    var gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(gain * 0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noise.start();
    noise.stop(audioContext.currentTime + 0.15);
  }
  
  /**
   * Play music hi-hat
   */
  function playMusicHiHat(gain, open) {
    if (!audioContext || !bgMusicPlaying) return;
    
    var duration = open ? 0.15 : 0.05;
    var bufferSize = audioContext.sampleRate * duration;
    var buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    var noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    var filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = open ? 7000 : 9000;
    
    var gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noise.start();
    noise.stop(audioContext.currentTime + duration);
  }
  
  /**
   * Play music clap
   */
  function playMusicClap(gain) {
    if (!audioContext || !bgMusicPlaying) return;
    
    var bufferSize = audioContext.sampleRate * 0.1;
    var buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    var noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    var filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2500;
    filter.Q.value = 1;
    
    var gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noise.start();
    noise.stop(audioContext.currentTime + 0.1);
  }
  
  /**
   * Play power chord (rock)
   */
  function playPowerChord(rootFreq, duration, gain) {
    if (!audioContext || !bgMusicPlaying) return;
    
    var freqs = [rootFreq, rootFreq * 1.5, rootFreq * 2];
    
    for (var i = 0; i < freqs.length; i++) {
      var osc = audioContext.createOscillator();
      var gainNode = audioContext.createGain();
      var distortion = audioContext.createWaveShaper();
      distortion.curve = makeDistortionCurve(50);
      
      osc.type = 'sawtooth';
      osc.frequency.value = freqs[i];
      
      gainNode.gain.setValueAtTime(gain * 0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      osc.connect(distortion);
      distortion.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start();
      osc.stop(audioContext.currentTime + duration);
      
      bgMusicNodes.push({ osc: osc, gain: gainNode });
    }
  }
  
  /**
   * Play guitar strum (country)
   */
  function playGuitarStrum(chord, duration, gain) {
    if (!audioContext || !bgMusicPlaying) return;
    
    for (var i = 0; i < chord.length; i++) {
      (function(freq, delay, idx) {
        setTimeout(function() {
          if (!bgMusicPlaying) return;
          
          var osc = audioContext.createOscillator();
          var gainNode = audioContext.createGain();
          var filter = audioContext.createBiquadFilter();
          
          osc.type = 'triangle';
          osc.frequency.value = freq;
          
          filter.type = 'lowpass';
          filter.frequency.value = 2000;
          
          var vol = gain * (1 - idx * 0.15);
          gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
          
          osc.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          osc.start();
          osc.stop(audioContext.currentTime + duration);
          
          bgMusicNodes.push({ osc: osc, gain: gainNode });
        }, delay);
      })(chord[i], i * 20, i);
    }
  }
  
  /**
   * Stop background music
   */
  function stopBackgroundMusic() {
    bgMusicPlaying = false;
    
    // Clear all intervals
    for (var i = 0; i < bgMusicIntervals.length; i++) {
      clearTimeout(bgMusicIntervals[i]);
    }
    bgMusicIntervals = [];
    
    // Clean up any lingering nodes
    bgMusicNodes.forEach(function(node) {
      try {
        if (node.osc) node.osc.stop();
      } catch(e) {}
    });
    bgMusicNodes = [];
  }

  /**
   * Set music volume
   */
  function setMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set SFX volume
   */
  function setSfxVolume(volume) {
    sfxVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Set current character (for hit sounds)
   */
  function setCharacter(characterId) {
    currentCharacterId = characterId;
  }

  /**
   * Check if audio is initialized
   */
  function isInitialized() {
    return initialized;
  }

  // Public API
  return {
    init: init,
    playHit: playHit,
    playMiss: playMiss,
    playCombo: playCombo,
    playMoneyGain: playMoneyGain,
    playMoneyLoss: playMoneyLoss,
    playClick: playClick,
    playSuccess: playSuccess,
    playCountdown: playCountdown,
    startBackgroundMusic: startBackgroundMusic,
    stopBackgroundMusic: stopBackgroundMusic,
    setMusicVolume: setMusicVolume,
    setSfxVolume: setSfxVolume,
    setCharacter: setCharacter,
    isInitialized: isInitialized
  };
})();
