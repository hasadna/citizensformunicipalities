var KEY = 'AIzaSyBurnP2Y9-YavLSun_85ZntENUfF4w45OE'; // only works on production domains
// use these for the labels numbering
var hebrewLetters = 'אבגדהוזחטיכלמנסעפצקרשת';

if(location.hostname.indexOf("localhost") > -1) { // development key
  KEY = "AIzaSyAvH9YqCyrBQoZeXlfNnYDRpngdwYmZEnw";
}

function _generateRandomString() {
  return Math.random().toString(36).substring(2);
}

function _getInput() {
  return document.getElementById('search');
}

function getSearchText() {
  return document.getElementById('search').value;
}

function jsonp(url, cb) {
  var cbName = _generateRandomString();
  window[cbName] = function () {
    cb();
    delete window[cbName];
  }

  var script = document.createElement('script');
  script.src = url + '&callback=' + cbName;
  document.body.appendChild(script);
}

/**
 * gets a template string and creates a html render of it,
 * with the obj as params.
 * @param {string} template 
 * @param {object} obj
 */
function render(templateString, obj) {
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  return templateString.replace(/{{.+}}/g, function (found) {
    var content = obj[found.replace('{{', '').replace('}}', '')];
    for (var el in entityMap) {
      content = content.replace(new RegExp(el, 'g'), entityMap[el]);
    }
    return content;
  })
}

var template = document.getElementById('sidebartemplate').innerHTML


function renderSideBar (data) {
  var rendered = render(template, data)
  $('#slide-out').html(rendered)
  $('.button-collapse').click()
}

function downloadPlaces (cb) {
  if(window.SAMPLE_DATA) cb(null, window.SAMPLE_DATA)

  var xhr = new XMLHttpRequest
  xhr.open('GET', 'http://cfm-csv-proxy.hstatic.org')
  xhr.onload = function (e) {
    cb(null, parse(xhr.responseText));
  }
  xhr.onerror = function (e) {
    var err = new Error('Unable to download CSV')
    err.data = e;
    cb(err);
  }
  xhr.send();
  function parse(text) {
    var csv = Papa.parse(text).data.slice(1);
    var objects = csv.slice(1).map(function (arr) {
      return {
        dateAdded: new Date(arr[0]),
        name: arr[1],
        sector: arr[2],
        description: arr[3],
        mainClaims: arr[4],
        address: arr[5],
        emailAddress: arr[6],
        facebookGroup: arr[7],
        otherLinks: arr[8]
      }
    })
    return objects;
  }
}

$(".button-collapse").sideNav();
var geocoder;
jsonp('https://maps.googleapis.com/maps/api/js?libraries=places&key=' + KEY, function initMap () {
  // init map
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: { lat: 32.071127, lng: 34.776744 }
  });
  var input = _getInput();
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

  geocoder = new google.maps.Geocoder();

  // get the places where things happened from the "backend" (excel file)
  downloadPlaces(function findAddresses(err, data) {
    console.log('le data', data)
    data.forEach(function processEachMaavak(datum, index) {
      var address = datum.address;
      var name = datum.name;
      // get the latitude-longitutde for each address, because thats the format 
      // new Marker wants it in
      geocoder.geocode({ address }, function (results, status) {
        if (status == 'OK') {
          var result = results[0];
          var position = result.geometry.location;
          var marker = new google.maps.Marker({ map: map, position: position });
          marker.addListener('click', function handleClick() {
            renderSideBar(datum);
          });
        } else {
          console.warn('Error :(')
        }
      });
    });
  });
});

function howToSubmit () {
  $('#how-to-submit').modal()
  $.get('how-to-submit.html').then(function (content) {
    $('#how-to-submit .content').html(content);
    $('#how-to-submit').modal('open');
  })
}
