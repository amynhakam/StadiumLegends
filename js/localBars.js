/* ============================================
   Stadium Legends - Local Bars Module
   Uses OpenStreetMap Overpass API (free, no key)
   ============================================ */

var LocalBars = (function() {
  'use strict';

  var OVERPASS_API = 'https://overpass-api.de/api/interpreter';
  var SEARCH_RADIUS = 5000; // 5km radius

  /**
   * Find bars near a character's hometown
   */
  function findBarsNearCharacter(character, callback) {
    if (!character || !character.coordinates) {
      callback({ error: 'No coordinates available' });
      return;
    }

    var lat = character.coordinates.lat;
    var lon = character.coordinates.lon;

    // Overpass QL query to find bars, pubs, and music venues
    var query = '[out:json][timeout:10];' +
      '(' +
      'node["amenity"="bar"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
      'node["amenity"="pub"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
      'node["amenity"="nightclub"](around:' + SEARCH_RADIUS + ',' + lat + ',' + lon + ');' +
      ');' +
      'out body 20;';

    var xhr = new XMLHttpRequest();
    xhr.open('POST', OVERPASS_API, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            var bars = parseBars(data.elements, lat, lon);
            callback({ success: true, bars: bars, hometown: character.hometown });
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
   * Parse bar data from Overpass response
   */
  function parseBars(elements, centerLat, centerLon) {
    var bars = [];

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.tags && el.tags.name) {
        var distance = calculateDistance(centerLat, centerLon, el.lat, el.lon);
        bars.push({
          name: el.tags.name,
          type: el.tags.amenity || 'bar',
          lat: el.lat,
          lon: el.lon,
          distance: distance,
          distanceText: formatDistance(distance),
          address: el.tags['addr:street'] || '',
          openingHours: el.tags.opening_hours || '',
          mapUrl: 'https://www.openstreetmap.org/?mlat=' + el.lat + '&mlon=' + el.lon + '#map=17/' + el.lat + '/' + el.lon
        });
      }
    }

    // Sort by distance
    bars.sort(function(a, b) {
      return a.distance - b.distance;
    });

    return bars;
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
    findBarsNearCharacter: findBarsNearCharacter
  };
})();
