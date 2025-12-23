/* ============================================
   Stadium Legends - Local Venues Module
   Uses OpenStreetMap Overpass API (free, no key)
   ============================================ */

var LocalBars = (function() {
  'use strict';

  var OVERPASS_API = 'https://overpass-api.de/api/interpreter';
  var SEARCH_RADIUS = 10000; // 10km radius

  /**
   * Find venues near a character's hometown by type
   */
  function findVenuesNearCharacter(character, venueType, callback) {
    if (!character || !character.coordinates) {
      callback({ error: 'No coordinates available' });
      return;
    }

    var lat = character.coordinates.lat;
    var lon = character.coordinates.lon;
    var query;

    if (venueType === 'bar') {
      // Bars, pubs, and small music venues
      query = '[out:json][timeout:10];' +
        '(' +
        'node["amenity"="bar"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        'node["amenity"="pub"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        ');' +
        'out body 30;';
    } else if (venueType === 'club') {
      // Nightclubs and music venues
      query = '[out:json][timeout:10];' +
        '(' +
        'node["amenity"="nightclub"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        'node["amenity"="music_venue"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        'node["leisure"="dance"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        ');' +
        'out body 30;';
    } else if (venueType === 'theater') {
      // Theaters and concert halls
      query = '[out:json][timeout:10];' +
        '(' +
        'node["amenity"="theatre"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        'node["amenity"="cinema"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        'node["amenity"="concert_hall"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
        ');' +
        'out body 30;';
    } else if (venueType === 'arena') {
      // Major sports stadiums - search globally with larger radius
      var arenaRadius = 50000; // 50km radius for arenas
      query = '[out:json][timeout:15];' +
        '(' +
        'node["leisure"="stadium"](around:' + arenaRadius + ',' + lat + ',' + lon + ');' +
        'way["leisure"="stadium"](around:' + arenaRadius + ',' + lat + ',' + lon + ');' +
        'node["building"="stadium"](around:' + arenaRadius + ',' + lat + ',' + lon + ');' +
        'way["building"="stadium"](around:' + arenaRadius + ',' + lat + ',' + lon + ');' +
        'node["amenity"="stadium"](around:' + arenaRadius + ',' + lat + ',' + lon + ');' +
        'way["amenity"="stadium"](around:' + arenaRadius + ',' + lat + ',' + lon + ');' +
        ');' +
        'out center body 50;';
    } else {
      callback({ error: 'Unknown venue type' });
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', OVERPASS_API, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

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
