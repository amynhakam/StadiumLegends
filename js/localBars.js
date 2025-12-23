/* ============================================
   Stadium Legends - Local Venues Module
   Uses OpenStreetMap Overpass API (free, no key)
   With caching and fallback venues for speed
   ============================================ */

var LocalBars = (function() {
  'use strict';

  var OVERPASS_API = 'https://overpass-api.de/api/interpreter';
  var SEARCH_RADIUS = 5000; // 5km radius (reduced for speed)
  
  // Cache for venue results
  var venueCache = {};
  
  // Fallback venues by city for instant display
  var fallbackVenues = {
    'Seattle, WA': {
      bar: ['The Crocodile', 'Neumos', 'Tractor Tavern', 'The Showbox', 'Barboza'],
      club: ['Q Nightclub', 'Foundation Nightclub', 'Trinity Nightclub'],
      theater: ['Paramount Theatre', 'Moore Theatre', '5th Avenue Theatre'],
      arena: ['Climate Pledge Arena', 'Lumen Field', 'T-Mobile Park']
    },
    'Atlanta, GA': {
      bar: ['Eddie\'s Attic', 'Vinyl', 'Smith\'s Olde Bar', 'Terminal West'],
      club: ['Opera Nightclub', 'Ravine', 'District Atlanta'],
      theater: ['Fox Theatre', 'Tabernacle', 'The Eastern'],
      arena: ['Mercedes-Benz Stadium', 'State Farm Arena', 'Truist Park']
    },
    'San Juan, Puerto Rico': {
      bar: ['La Placita', 'El Batey', 'La Factoria', 'Jungle Bird'],
      club: ['Club Brava', 'La Respuesta', 'Club Kronos'],
      theater: ['Centro de Bellas Artes', 'Teatro Tapia', 'Coliseo de Puerto Rico'],
      arena: ['Coliseo de Puerto Rico', 'Estadio Hiram Bithorn', 'Coliseo Roberto Clemente']
    },
    'London, UK': {
      bar: ['The Dublin Castle', 'The Lexington', '100 Club', 'Jazz Cafe'],
      club: ['Fabric', 'Ministry of Sound', 'Heaven', 'KOKO'],
      theater: ['Royal Albert Hall', 'London Palladium', 'Hammersmith Apollo'],
      arena: ['Wembley Stadium', 'Tottenham Hotspur Stadium', 'Emirates Stadium', 'The O2 Arena']
    },
    'Nashville, TN': {
      bar: ['The Bluebird Cafe', 'Robert\'s Western World', 'Tootsies', 'The Stage'],
      club: ['Analog', 'Acme Feed & Seed', 'Whiskey Bent Saloon'],
      theater: ['Ryman Auditorium', 'Grand Ole Opry', 'Tennessee Performing Arts Center'],
      arena: ['Nissan Stadium', 'Bridgestone Arena', 'First Horizon Park']
    }
  };

  /**
   * Get cache key for venue lookup
   */
  function getCacheKey(characterId, venueType) {
    return characterId + '_' + venueType;
  }

  /**
   * Get fallback venue for instant display
   */
  function getFallbackVenue(character, venueType) {
    var cityVenues = fallbackVenues[character.hometown];
    if (cityVenues && cityVenues[venueType]) {
      var venues = cityVenues[venueType];
      var randomVenue = venues[Math.floor(Math.random() * venues.length)];
      return {
        name: randomVenue,
        distanceText: 'nearby',
        type: venueType
      };
    }
    return null;
  }

  /**
   * Find venues near a character's hometown by type
   * Now with caching and instant fallback
   */
  function findVenuesNearCharacter(character, venueType, callback) {
    if (!character || !character.coordinates) {
      callback({ error: 'No coordinates available' });
      return;
    }

    // Check cache first
    var cacheKey = getCacheKey(character.id, venueType);
    if (venueCache[cacheKey]) {
      callback({ success: true, venues: venueCache[cacheKey], hometown: character.hometown, cached: true });
      return;
    }

    // Return fallback immediately, then fetch real data in background
    var fallback = getFallbackVenue(character, venueType);
    if (fallback) {
      // Immediately return fallback
      callback({ success: true, venues: [fallback], hometown: character.hometown, fallback: true });
    }

    // Fetch real data in background (will be cached for next time)
    fetchRealVenues(character, venueType, function(result) {
      if (result.success && result.venues.length > 0) {
        venueCache[cacheKey] = result.venues;
        // If we didn't have a fallback, call back with real data
        if (!fallback) {
          callback(result);
        }
      }
    });
  }

  /**
   * Fetch real venues from Overpass API
   */
  function fetchRealVenues(character, venueType, callback) {
    var lat = character.coordinates.lat;
    var lon = character.coordinates.lon;
    var query;

    if (venueType === 'bar') {
      query = '[out:json][timeout:5];' +
        'node["amenity"~"bar|pub"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        'out body 10;';
    } else if (venueType === 'club') {
      query = '[out:json][timeout:5];' +
        'node["amenity"~"nightclub|music_venue"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        'out body 10;';
    } else if (venueType === 'theater') {
      query = '[out:json][timeout:5];' +
        'node["amenity"~"theatre|cinema|concert_hall"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        'out body 10;';
    } else if (venueType === 'arena') {
      var arenaRadius = 30000; // 30km for arenas
      query = '[out:json][timeout:8];' +
        '(node["leisure"="stadium"](around:' + arenaRadius + ',' + lat + ',' + lon + ');' +
        'way["leisure"="stadium"](around:' + arenaRadius + ',' + lat + ',' + lon + '););' +
        'out center body 15;';
    } else {
      callback({ error: 'Unknown venue type' });
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', OVERPASS_API, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.timeout = 8000; // 8 second timeout

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            var venues = parseVenues(data.elements, lat, lon);
            callback({ success: true, venues: venues, hometown: character.hometown });
          } catch (e) {
            callback({ error: 'Failed to parse response' });
          }
        } else {
          callback({ error: 'API request failed' });
        }
      }
    };

    xhr.ontimeout = function() {
      callback({ error: 'Request timed out' });
    };

    xhr.onerror = function() {
      callback({ error: 'Network error' });
    };

    xhr.send('data=' + encodeURIComponent(query));
  }

  /**
   * Legacy function for backwards compatibility
   */
  function findBarsNearCharacter(character, callback) {
    findVenuesNearCharacter(character, 'bar', function(result) {
      if (result.success) {
        callback({ success: true, bars: result.venues, hometown: result.hometown });
      } else {
        callback(result);
      }
    });
  }

  /**
   * Parse venue data from Overpass response
   */
  function parseVenues(elements, centerLat, centerLon) {
    var venues = [];

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.tags && el.tags.name) {
        // For ways (polygons), use center coordinates
        var elLat = el.lat || (el.center ? el.center.lat : null);
        var elLon = el.lon || (el.center ? el.center.lon : null);
        if (!elLat || !elLon) continue;
        
        var distance = calculateDistance(centerLat, centerLon, elLat, elLon);
        venues.push({
          name: el.tags.name,
          type: el.tags.amenity || el.tags.leisure || el.tags.building || 'venue',
          lat: elLat,
          lon: elLon,
          distance: distance,
          distanceText: formatDistance(distance),
          address: el.tags['addr:street'] || '',
          openingHours: el.tags.opening_hours || '',
          mapUrl: 'https://www.openstreetmap.org/?mlat=' + elLat + '&mlon=' + elLon + '#map=17/' + elLat + '/' + elLon
        });
      }
    }

    // Sort by distance
    venues.sort(function(a, b) {
      return a.distance - b.distance;
    });

    return venues;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth's radius in km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  function formatDistance(km) {
    if (km < 1) {
      return Math.round(km * 1000) + 'm';
    }
    return km.toFixed(1) + 'km';
  }

  // Public API
  return {
    findBarsNearCharacter: findBarsNearCharacter,
    findVenuesNearCharacter: findVenuesNearCharacter
  };
})();