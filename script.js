var KEY = 'AIzaSyBurnP2Y9-YavLSun_85ZntENUfF4w45OE'

function _generateRandomString() {
  return Math.random().toString(36).substring(2);
}

function _getInput() {
  return document.getElementById('search');
}

function jsonp(url, cb) {
  var cbName = _generateRandomString();
  window[cbName] = function () {
    cb();
    delete window[cbName];
  }

  var script = document.createElement('script')
  script.src = url + '&callback=' + cbName
  document.body.appendChild(script)
}

function initMap () {
  var uluru = { lat: 32.0853, lng: 34.7818 }
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: uluru
  });
  var input = _getInput();
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  })
}

/**
 * gets a template string and creates a html render of it,
 * with the obj as params.
 * @param {string} template 
 * @param {object} obj
 */
function render (templateString, obj) {
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }
  return templateString.replace(/{{.+}}/g, function (found) {
    var content = obj[found.replace('{{', '').replace('}}', '')]
    for (var el in entityMap) {
      content = content.replace(new RegExp(el, 'g'), entityMap[el])
    }
    return content
  });
}

var template = document.getElementById('sidebartemplate').innerHTML
var tempData = {
  address: 'החשמונאים 29',
  status: 'פעיל',
  description: 'בניין מדהים',
  claims: 'הבניין הכי טוב אי פעם'
}

var rendered = render(template, tempData);
$('#slide-out').html(rendered);


function downloadPlaces(cb) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", "http://cfm-csv-proxy.hstatic.org");
  xhr.onload = function(e) {
    cb(null, parse(xhr.responseText));
  };
  xhr.onerror = function(e) {
    var err = new Error("Unable to download CSV");
    err.data = e;
    cb(err) 
  };
  xhr.send();
  function parse(text) {
    var csv = Papa.parse(text).data.slice(1);
    var objects = csv.slice(1).map(function(arr) {
      return {
        dateAdded: new Date(arr[0]),
        name: arr[1],
        sector: arr[2],
        description: arr[3],
        mainClaims: arr[4],
        address: arr[5],
        emailAddress: arr[6],
        facebookGroup: arr[7],
        otherLinks: arr[8],
      };
    });
    return objects;
  }
}

function howToSubmit() {
  $('#how-to-submit').modal();
  $.get("how-to-submit.html").then(function(content) {
    $("#how-to-submit .content").html(content);
    $('#how-to-submit').modal('open');
  });
}
jsonp('https://maps.googleapis.com/maps/api/js?libraries=places&key=' + KEY, initMap);
