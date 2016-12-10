//// Crime Data Loaded
// http://eloquentjavascript.net/1st_edition/chapter14.html
var request = new XMLHttpRequest();
request.open("GET", "REAL/logs.txt", false);
request.send(null);

var crime_data = request.responseText;
crime_data = crime_data.split("\n");

crime_data_index = {
  "datetime": 0,
  "crimetype": 1,
  "address": 2,
  "lat": 3,
  "lng": 4,
  "status": 5,
  "description": 6
};

for (i = 0; i < crime_data.length; i++) {
  crime_data[i] = crime_data[i].split("\t");
  crime_data[i][crime_data_index["lat"]] = parseFloat(crime_data[i][crime_data_index["lat"]]);
  crime_data[i][crime_data_index["lng"]] = parseFloat(crime_data[i][crime_data_index["lng"]]);
  crime_data[i][crime_data_index["datetime"]] = new Date(crime_data[i][crime_data_index["datetime"]]);
};

console.log(crime_data);
console.log(crime_data_index);


//// Makes a latlng object
function make_latlng (lat, lng) {
  return {lat: lat, lng: lng}
}

//// Crime Unique Locations
function unique_locations_set (data) {
  var unique_locations = {};
  for (i = 0; i < data.length; i++) {
    index = [data[i][crime_data_index["lat"]], data[i][crime_data_index["lng"]]]
    if (unique_locations[index] == undefined) {
      unique_locations[index] = [data[i]];
    }
    else {
      unique_locations[index].push(data[i]);
    }
  }

  return unique_locations;
}


/**
 * The CenterControl adds a control to the map that recenters the map on
 * Chicago.
 * This constructor takes the control DIV as an argument.
 * @constructor
 */
// function CenterControl(controlDiv, map) {
//   var html_bar = '<input type="submit" value="Store State 1" onclick="store(1)"><input type="submit" value="Store State 2" onclick="store(2)"><input type="submit" value="Toggle On State 1" onclick="toggle(1)"><input type="submit" value="Toggle On State 2" onclick="toggle(2)"><input type="submit" value="Activate Cluster at Current Level" onclick="clusterActivate_CurrentLevel()"><input type="submit" value="Deactivate Cluster" onclick="clusterDeactivate()"><input type="submit" value="Filter" id="filter_window" onclick="appear()">'


//   // Set CSS for the control border.
//   var controlUI = document.createElement('div');
//   controlUI.style.backgroundColor = '#fff';
//   controlUI.style.border = '1px solid #fff';
//   controlUI.style.borderRadius = '2px';
//   controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
//   controlUI.style.cursor = 'pointer';
//   controlUI.style.marginBottom = '14px';
//   controlUI.style.textAlign = 'left';
//   controlUI.title = 'Options: Filtering/Clustering/Store';
//   controlDiv.appendChild(controlUI);

//   // Set CSS for the control interior.
//   var controlText = document.createElement('div');
//   controlText.style.color = 'rgb(25,25,25)';
//   controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
//   controlText.style.fontSize = '12px';
//   controlText.style.lineHeight = '20px';
//   controlText.style.paddingLeft = '5px';
//   controlText.style.paddingRight = '5px';
//   controlText.innerHTML = html_bar;
//   controlUI.appendChild(controlText);
// }

var map;
var markers = [];
function initMap() {
  var Harvard = {lat: 42.374, lng: -71.117};

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: Harvard,
    mapTypeId: 'roadmap',
 
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.BOTTOM_CENTER
    },

    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER
    },
    
    scaleControl: true,
    
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.CENTER_BOTTOM
    },
    
    fullscreenControl: true
  });

  // // Create the DIV to hold the control and call the CenterControl()
  // // constructor passing in this DIV.
  // var centerControlDiv = document.createElement('div');
  // var centerControl = new CenterControl(centerControlDiv, map);

  // centerControlDiv.index = 1;
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(centerControlDiv);

  data = unique_locations_set(crime_data);
  addSetMarkers(data)
}

// Adds a marker to the map and push to the array.
function addMarker(location) {  
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  markers.push(marker);
}

// Adds markers from a set of locations
function addSetMarkers(data) {
  var locations = Object.keys(data);
  var marker, i;
  for (i = 0; i < locations.length; i++) {
    var point = locations[i].split(',');
    var marker = new google.maps.Marker({
      position: make_latlng(parseFloat(point[0]), parseFloat(point[1])),
      map: map,
      icon: 'https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png'
      // label: String(data[locations[1]].length)
    }); 
    markers.push(marker);

    info(marker, i, data[locations[i]]);
  }
}

// Creates infowindows for each marker
function info (marker, i, location) {
  var infowindow = new google.maps.InfoWindow();
  google.maps.event.addListener(marker, 'click', (function(marker, i) {
    return function() {
      infowindow.setContent(content(location));
      infowindow.open(map, marker);
    }
  })(marker, i));

  google.maps.event.addListener(map, "click", function(event) {
    infowindow.close();
  });

  // google.maps.event.addListener(infowindow, 'click', (function(marker, i) {
  //   return function() {
  //     infowindow.close(map, marker);
  //   }
  // })(marker, i));
}



// Generates content for markers
function content (location) {
  var content = "<h3>Crimes:</h3>";

  for (i = 0; i < location.length; i++) {
    content += 
      "<div>" + location[i][crime_data_index["description"]] + "</div>" +
      "<div>" + location[i][crime_data_index["datetime"]] + "</div>" +
      "<div>" + location[i][crime_data_index["crimetype"]] + "</div>" +
      "<div>" + location[i][crime_data_index["address"]] + "</div>" +
      "<br>";
  }

  return content;
}



// //// Query Function
// function query (filter) {
//   filter = JSON.parse(filter);
//   filter = filter.filter;
//   var filtered_data = JSON.parse(JSON.stringify(crime_data));
//   if (filter.length == 0) {
//     return filtered_data;
//   }
//   for (i = 0; i < filter.length; i++) {
//     var indices_to_remove = new Set([]);

//     index = crime_data_index[filter[i].column]

//     // Point filter
//     for (j = 0; j < filter[i].point.length; j++) {
//       for (k = 0; k < filtered_data.length; k++) {
//         if (filtered_data[k][index] == filter[i].point[j]) {
//           indices_to_remove.add(k);
//         }
//       }
//     }

//     // Range filter (need to quantify range)
//     for (j = 0; j < filter[i].range.length; j++) {
//       for (k = 0; k < filtered_data.length; k++) {
//         if (filter[i].column == "Time Occurred" || filter[i].column == "Time Reported") {
//           if ((time_in_range(filtered_data[k][index], filter[i].range[j][0], filter[i].range[j][1]))) {
//             indices_to_remove.add(k);
//           }
//         }
//         if (filter[i].column == "Date Occurred" || filter[i].column == "Date Reported") {
//           if ((date_in_range(filtered_data[k][index], filter[i].range[j][0], filter[i].range[j][1]))) {
//             indices_to_remove.add(k);
//           }
//         }
//       }
//     }


//     // Contains filter (need to qualify contain function)
//     for (j = 0; j < filter[i].contains.length; j++) {
//       for (k = 0; k < filtered_data.length; k++) {
//         if (filter[i].column == "Time Occurred" || filter[i].column == "Time Reported") {
//           if ((time_contains(filtered_data[k][index], filter[i].contains[j][0], filter[i].contains[j][1]))) {
//             indices_to_remove.add(k);
//           }
//         }
//         if (filter[i].column == "Date Occurred" || filter[i].column == "Date Reported") {
//           if ((date_contains(filtered_data[k][index], filter[i].contains[j][0], filter[i].contains[j][1]))) {
//             indices_to_remove.add(k);
//           }
//         }
//         if (filter[i].contains[j][0] == "TEXT" && filtered_data[k][index].includes(filter[i].contains[j][1])) {
//           indices_to_remove.add(k);
//         }
//       }
//     }

//     var filtered_data_buffer = []
//     indices_to_remove = Array.from(indices_to_remove);
//     // console.log(indices_to_remove)
//     for (j = 0; j < indices_to_remove.length; j++) {
//       var item = filtered_data[indices_to_remove[j]];
//       filtered_data_buffer.push(item);
//     }
//     // console.log(filtered_data_buffer)
//     filtered_data = JSON.parse(JSON.stringify(filtered_data_buffer));
//   }
//   return filtered_data;
// }

// //// FILTERS
// // var filter = '{"filter": [{"column": "name", "point": [point1, point2], "range": [[start,end], [start, end]], "contains": [[part, value]]}]}'
// // var filter1 = '{"filter": []}';
// // var filter2 = '{"filter": [{"column": "Incident Type", "point": ["UNWANTED GUEST"], "range": [], "contains": []}]}'
// // console.log(query(filter2));

// //// Converts place address to Coordinates
// function LatLng (location) {
//   for (i = 0; i < address_data.length; i++) {
//     if (address_data[i][0].toUpperCase() == location.toUpperCase()) {
//       return new google.maps.LatLng(address_data[i][2], address_data[i][1]);
//     }
//   }
//   // return {lat: -42.374, lng: 71.117};
//   return new google.maps.LatLng(-42.374, 71.117);
// }

// //// Crime Unique Locations
// function unique_locations_set (data) {
//   var unique_locations = {};
//   for (i = 0; i < data.length; i++) {
//     index = crime_data_index["Location"]
//     if (unique_locations[data[i][index]] == undefined) {
//       unique_locations[data[i][index]] = [data[i]];
//     }
//     else {
//       unique_locations[data[i][index]].push(data[i]);
//     }
//   }

//   return unique_locations;
// }

// // Generates content for markers
// function content (location) {
//   var content = "<h3>Crimes:</h3>";

//   for (i = 0; i < location.length; i++) {
//     content += 
//       "<div>" + location[i][crime_data_index["Description"]] + "</div>" +
//       "<div>" + location[i][crime_data_index["Date Occurred"]] + "</div>" +
//       "<div>" + location[i][crime_data_index["Time Occurred"]] + "</div>" +
//       "<div>" + location[i][crime_data_index["Incident Type"]] + "</div>" +
//       "<br>";
//   }

//   return content;
// }

// // In the following example, markers appear when the user clicks on the map.
// // The markers are stored in an array.
// // The user can then click an option to hide, show or delete the markers.
// // Source: https://jsfiddle.net/api/post/library/pure/
// // https://developers.google.com/maps/documentation/javascript/examples/control-positioning
// // https://developers.google.com/maps/documentation/javascript/examples/control-custom-state
// var map;
// var markers = [];
// var markerCluster;


// /**
//  * The CenterControl adds a control to the map that recenters the map on
//  * Chicago.
//  * This constructor takes the control DIV as an argument.
//  * @constructor
//  */
// function CenterControl(controlDiv, map) {
//   // var html_full = '<div id="filter">Filter: <br><div id="filter1">Type: <select id="filter1_column">' + column_select(1) + '</select>Values: <input id="filter1_point" type="text">Ranges: <input id="filter1_range" type="text">Contains: <input id="filter1_contains" type="text"> <input id="addrow" type="submit" value="Add Row" onclick="addrow()"><br></div></div><div id="filter_submit"><input type="submit" onclick="search()"><input type="submit" value="Reset" onclick="reset()"></div><br><div id="clustering">Cluster Zoom:<select id="cluster_zoom"><option value="7">7 (tri-state)</option><option value="8">8</option><option value="9">9 (state)</option><option value="10">10</option><option value="11">11 (cities)</option><option value="12">12</option><option value="13">13</option><option value="14">14 (districts)</option><option selected value="15">15 (neighborhoods)</option><option value="16">16 (blocks)</option><option value="17">17 (street)</option><option value="18">18</option></select><input type="submit" value="Activate Cluster" onclick="clusterActivate()"><input type="submit" value="Activate Cluster at Current Level" onclick="clusterActivate_CurrentLevel()"><input type="submit" value="Deactivate Cluster" onclick="clusterDeactivate()"></div><br><div id="storeState"><input type="submit" value="Store State 1" onclick="store(1)"><input type="submit" value="Store State 2" onclick="store(2)"><input type="submit" value="Toggle On State 1" onclick="toggle(1)"><input type="submit" value="Toggle On State 2" onclick="toggle(2)"><input type="submit" value="See State 2 on Separate Map" onclick="newMap()"></div><div id="storeStateInfo">State 1: <br>State 2: </div>'

//   // var html_bar = '<input type="submit" value="Store State 1" onclick="store(1)"><input type="submit" value="Store State 2" onclick="store(2)"><input type="submit" value="Toggle On State 1" onclick="toggle(1)"><input type="submit" value="Toggle On State 2" onclick="toggle(2)"><input type="submit" value="Activate Cluster at Current Level" onclick="clusterActivate_CurrentLevel()"><input type="submit" value="Full Menu" id="full_menu">'

//   var html_bar = '<input type="submit" value="Store State 1" onclick="store(1)"><input type="submit" value="Store State 2" onclick="store(2)"><input type="submit" value="Toggle On State 1" onclick="toggle(1)"><input type="submit" value="Toggle On State 2" onclick="toggle(2)"><input type="submit" value="Activate Cluster at Current Level" onclick="clusterActivate_CurrentLevel()"><input type="submit" value="Deactivate Cluster" onclick="clusterDeactivate()"><input type="submit" value="Filter" id="filter_window" onclick="appear()">'


//   // Set CSS for the control border.
//   var controlUI = document.createElement('div');
//   controlUI.style.backgroundColor = '#fff';
//   controlUI.style.border = '1px solid #fff';
//   controlUI.style.borderRadius = '2px';
//   controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
//   controlUI.style.cursor = 'pointer';
//   controlUI.style.marginBottom = '14px';
//   controlUI.style.textAlign = 'left';
//   controlUI.title = 'Options: Filtering/Clustering/Store';
//   controlDiv.appendChild(controlUI);

//   // Set CSS for the control interior.
//   var controlText = document.createElement('div');
//   controlText.style.color = 'rgb(25,25,25)';
//   controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
//   controlText.style.fontSize = '12px';
//   controlText.style.lineHeight = '20px';
//   controlText.style.paddingLeft = '5px';
//   controlText.style.paddingRight = '5px';
//   controlText.innerHTML = html_bar;
//   controlUI.appendChild(controlText);

//   // Setup the click event listeners: simply set the map to Chicago.
//   // controlUI.addEventListener('dblclick', function() {
//   //   console.log(controlText.innerHTML)
//   //   controlText.innerHTML = html_bar;
//   // });
// }



// function initMap() {
//   var Harvard = {lat: 42.374, lng: -71.117};

//   map = new google.maps.Map(document.getElementById('map'), {
//     zoom: 14,
//     center: Harvard,
//     mapTypeId: 'roadmap',
 
//     mapTypeControl: true,
//     mapTypeControlOptions: {
//       style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
//       position: google.maps.ControlPosition.BOTTOM_CENTER
//     },

//     zoomControl: true,
//     zoomControlOptions: {
//       position: google.maps.ControlPosition.LEFT_CENTER
//     },
    
//     scaleControl: true,
    
//     streetViewControl: true,
//     streetViewControlOptions: {
//       position: google.maps.ControlPosition.CENTER_BOTTOM
//     },
    
//     fullscreenControl: true
//   });



//   // Create the DIV to hold the control and call the CenterControl()
//   // constructor passing in this DIV.
//   var centerControlDiv = document.createElement('div');
//   var centerControl = new CenterControl(centerControlDiv, map);

//   centerControlDiv.index = 1;
//   map.controls[google.maps.ControlPosition.TOP_LEFT].push(centerControlDiv);



//   // This event listener will call addMarker() when the map is clicked.
//   // map.addListener('click', function(event) {
//   //   addMarker(event.latLng);
//   // });

//   // Adds a marker at the center of the map.
//   // addMarker(Harvard);

//   // Adds markers from the dataset
//   var data = unique_locations_set(query(g_filter));
//   addSetMarkers(data);
// }

// // Adds a marker to the map and push to the array.
// function addMarker(location) {  
//   var marker = new google.maps.Marker({
//     position: location,
//     map: map
//   });
//   markers.push(marker);
// }

// // Adds markers from a set of locations
// function addSetMarkers(data) {
//   var locations = Object.keys(data);
//   var marker, i;
//   for (i = 0; i < locations.length; i++) {
//     var marker = new google.maps.Marker({
//       position: LatLng(locations[i]),
//       map: map,
//       icon: 'https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png'
//       // label: String(data[locations[1]].length)
//     }); 
//     markers.push(marker);

//     info(marker, i, data[locations[i]]);
//   }
// }

// // Creates infowindows for each marker
// function info (marker, i, location) {
//   var infowindow = new google.maps.InfoWindow();
//   google.maps.event.addListener(marker, 'click', (function(marker, i) {
//     return function() {
//       infowindow.setContent(content(location));
//       infowindow.open(map, marker);
//     }
//   })(marker, i));

//   google.maps.event.addListener(map, "click", function(event) {
//     infowindow.close();
//   });

//   // google.maps.event.addListener(infowindow, 'click', (function(marker, i) {
//   //   return function() {
//   //     infowindow.close(map, marker);
//   //   }
//   // })(marker, i));
// }

// // Sets the map on all markers in the array.
// function setMapOnAll(map) {
//   for (var i = 0; i < markers.length; i++) {
//     markers[i].setMap(map);
//   }
// }

// // Removes the markers from the map, but keeps them in the array.
// function clearMarkers() {
//   setMapOnAll(null);
// }

// // Shows any markers currently in the array.
// function showMarkers() {
//   setMapOnAll(map);
// }

// // Creates marker clusters
// function createCluster (zoom) {
//   var zoom = (typeof zoom !== 'undefined') ?  zoom : 15;
//   if (markerCluster == undefined || markerCluster["markers_"].length == 0) {
//     markerCluster = new MarkerClusterer(map, markers, {
//       imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
//       maxZoom: zoom
//     });
//   }
// }

// // Deletes all markers in the array by removing references to them.
// function deleteMarkers() {
//   clearMarkers();
//   markers = [];
// }



// //// Date and Time Filter Pre-Req Functions
// function date (day) {
//   day = day.split("/").map(Number);
//   day = new Date(day[2]+2000, day[0]-1, day[1])
//   // console.log(day)
//   return day;
// }

// function date_in_range (day, start, end) {
//   day = date(day);
//   start = date(start);
//   end = date(end);
//   // console.log((start <= day && day <= end))
//   return (start <= day && day <= end);
// }

// function date_contains (day, part, value) {
//   day = date(day);
//   if (part == "YEAR") {
//     return (day.getFullYear() == value);
//   }
//   else if (part == "MONTH") {
//     return (day.getMonth() == value - 1);
//   }
//   else if (part == "DAY") {
//     return (day.getDate() == value);
//   }
// }

// // date("10/31/2016")
// // date_in_range("6/29/2016", "9/16/2016", "11/21/2016")

// function time_format (time) {
//   var num = parseInt(time.substring(0, time.length - 2).split(":").join(""))
//   if (time[time.length-2] == "P") {
//     if (num >= 1200) {
//       num = num;
//     }
//     else {
//       num = num + 1200;
//     }
//   }
//   else if (time[time.length-2] == "A" && num >= 1200) {
//     num = num - 1200;
//   }
//   // console.log(num)
//   return num;
// }

// function time_in_range (time, start, end) {
//   time = time_format(time);
//   start = time_format(start);
//   end = time_format(end);
//   if (start <= end) {
//     return (start <= time && time <= end);
//   }
//   else {
//     return (start <= time || time <= end);
//   }
//   // console.log((start <= time && time <= end));
//   // return (start <= time && time <= end);
// }

// function time_contains (time, part, value) {
//   // value -> 0-23 or 0-59
//   time = time_format(time);
//   if (part == "HOUR") {
//     return (value*100 < time && time < (value+1)*100)
//   }
//   if (part == "MINS") {
//     return (time%100 == value)
//   }
// }



// //// Clustering Code

// // Activates the feature
// function clusterActivate (zoom) {
//   var zoom = (typeof zoom !== 'undefined') ?  zoom : document.getElementById("cluster_zoom").value;
//   if (markerCluster != undefined && markerCluster["maxZoom_"] != zoom) {
//     clusterDeactivate();
//   }
//   createCluster(zoom);
// }

// // Deactivate the feature
// function clusterDeactivate () {
//   if (markerCluster != undefined && markerCluster["markers_"].length > 0) {
//     markerCluster.clearMarkers();
//     showMarkers();
//   }
// }

// // Activate cluster at the current zoom level
// function clusterActivate_CurrentLevel () {
//   var zoom = map["zoom"];
//   clusterActivate(zoom);
// }

// //// UI work for the filter option

// // Calls all HTML generating JS function
// function form () {
//   column_select(1);
// }

// // Make list of columns to select from
// function column_select (n) {
//   var html = "<option id='default_" + n + "' value=''>---</option>";
//   var options = Object.keys(crime_data_index);
//   for (i = 0; i < options.length; i++) {
//     html += "<option id='" + options[i] + "_" + n + "' value='" + options[i] + "'>" + options[i] + "</option>";
//   }
//   $("#filter" + n + "_column").append(html);
//   return html;
// }

// // Add another row for filtering
// var filter_row = 1;
// function addrow() {
//   var n = filter_row + 1;
//   var html =
//   "<div id='filter" + n + "'>" +
//     "Type: " + 
//     "<select id='filter" + n + "_column'></select> " +
//     "Values: <input id='filter" + n + "_point' type='text'> " +
//     "Ranges: <input id='filter" + n + "_range' type='text'> " +
//     "Contains: <input id='filter" + n + "_contains' type='text'> " + 
//     "<input id='removerow" + n + "' type='submit' value='Remove Row' onclick='removerow(" + n + ")'>" +
//     "<br>" + 
//   "</div>";
//   $("#filter").append(html);
//   column_select(n);
//   filter_row++;     
// }

// // Removes the row
// function removerow (n) {
//   $("#filter" + n).remove();
// }

// // Makes changes to the map accordingly
// function search (filter) {
//   var filter = (typeof filter !== 'undefined') ?  filter : generate_filter();
//   var cluster_active = markerCluster != undefined && markerCluster["markers_"].length > 0;
//   clusterDeactivate();
//   deleteMarkers();
//   var data = unique_locations_set(query(filter));
//   addSetMarkers(data);
//   if (cluster_active) {
//     clusterActivate(markerCluster["maxZoom_"]);
//   }
//   g_filter = filter;
// }

// // Takes inputs and converts to filter JSON format
// function generate_filter () {
//   var filter = '{"filter": [';
//   for (i = 1; i <= filter_row; i++) {
//     if (document.getElementById("filter" + i) !== null) {
//       var column = document.getElementById("filter" + i + "_column").value;
//       var point = document.getElementById("filter" + i + "_point").value;
//       var range = document.getElementById("filter" + i + "_range").value;
//       var contains = document.getElementById("filter" + i + "_contains").value;

//       filter += '{"column": "' + column + '", "point": [' + point + '], "range": [' + range + '], "contains": [' + contains + ']},';
//     }
//   }
//   filter = filter.slice(0,-1);
//   filter += ']}';
//   console.log(filter);
//   return filter;
// }

// // Resets to show all data points
// function reset () {
//   clusterDeactivate(); 
//   var filter = '{"filter": []}';
//   search (filter);
//   g_filter = filter;
// }


// //// Storing state function
// var stat1;
// var stat2;
// var g_filter = '{"filter": []}';
// var filter1 = "";
// var filter2 = "";
// function store (i) {
//   if (i == 1) {
//     stat1 = [markers, markerCluster != undefined && markerCluster["markers_"].length > 0];
//     filter1 = g_filter;
//   }
//   else {
//     stat2 = [markers, markerCluster != undefined && markerCluster["markers_"].length > 0];
//     filter2 = g_filter;
//   }
//   // console.log(stat1)
//   showStates();
// }

// function toggle (i) {
//   var stat;
//   if (i == 1) {
//     stat = stat1;
//   }
//   else {
//     stat = stat2;
//   }
//   clusterDeactivate();
//   deleteMarkers();
//   markers = stat[0];
//   showMarkers();
//   if (stat[1]) {
//     // ONE BUG: Uses default (15) as zoom and not actual prev. zoom.
//     clusterActivate();
//   }
// }

// function showStates () {
//   var div = document.getElementById("storeStateInfo");
//   var html = 
//     "State 1: " + filter1 +
//     "<br>" +
//     "State 2: " + filter2;
//   div.innerHTML = html;
// }






// // Make a Map Bundle
// function make_map () {

// }


// // https://www.html5rocks.com/en/tutorials/dnd/basics/




// //// Making a new map adjacent
// var map2;
// function newMap () {
//   var mapdiv = document.getElementById("map");
//   var map2div = document.getElementById("map2");
  
//   mapdiv.style.width = "49%";

//   var top = String(mapdiv.offsetTop);
//   top += "px";
  
//   map2div.style.position = "absolute";
//   map2div.style.left = "50%";
//   map2div.style.top = top;

//   // console.log(mapdiv.offsetTop)

//   var Harvard = {lat: 42.374, lng: -71.117};

//   map2 = new google.maps.Map(map2div, {
//     zoom: 14,
//     center: Harvard,
//     mapTypeId: 'roadmap'
//   });

//   var data = unique_locations_set(query(filter2));
//   addSetMarkers2(data);
// }

// function addSetMarkers2 (data) {
//   var locations = Object.keys(data);
//   var marker, i;
//   for (i = 0; i < locations.length; i++) {
//     var marker = new google.maps.Marker({
//       position: LatLng(locations[i]),
//       map: map2
//     }); 

//     info2(marker, i, data[locations[i]]);
//   }
// }

// function info2(marker, i, location) {
//   var infowindow = new google.maps.InfoWindow();
//   google.maps.event.addListener(marker, 'click', (function(marker, i) {
//     return function() {
//       infowindow.setContent(content(location));
//       infowindow.open(map2, marker);
//     }
//   })(marker, i));
// }










// // Get the modal
// var modal = document.getElementById('myModal');

// // Get the button that opens the modal
// var btn = document.getElementById("filter_window");

// // Get the <span> element that closes the modal
// var span = document.getElementsByClassName("close")[0];

// // console.log(btn)

// // // When the user clicks the button, open the modal
// // btn.onclick = function() {
// //     modal.style.display = "block";
// // }

// function appear () {
//   modal.style.display = "block";
// }

// // When the user clicks on <span> (x), close the modal
// span.onclick = function() {
//     modal.style.display = "none";
// }

// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//     if (event.target == modal) {
//         modal.style.display = "none";
//     }
// }


// // HODP
// // Modal filter -> multi map -> design -> search by month(Y) day(Y) day of the week (x) between hours (Y)

// // Transform real data to workable format (ugh make python script)

// // quick stat (Number of crime)

// // gradients



// // DP:
// // consider table/fill metadata with prev. data, limit epsilon to residue.(talk from today) (separate js files)



