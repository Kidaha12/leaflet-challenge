window.onload = function() {
    // Store our API endpoint inside queryUrl
    var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

    // Perform a GET request to the query URL
    d3.json(queryUrl).then(function(data) {
        // Once we get a response, send the data.features object to the createFeatures function
        createFeatures(data.features);
    }).catch(function(error) {
        console.error("Error fetching the GeoJSON data: ", error);
    });

    function createFeatures(earthquakeData) {
        // Give each feature a popup describing the place and time of the earthquake
        function onEachFeature(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
                "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }

        // Create a GeoJSON layer containing the features array on the earthquakeData object
        // Run the onEachFeature function once for each piece of data in the array
        var earthquakes = L.geoJSON(earthquakeData, {
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
                var color;
                var r = 255;
                var g = Math.floor(255 - 80 * feature.properties.mag);
                var b = Math.floor(255 - 80 * feature.properties.mag);
                color = "rgb(" + r + "," + g + "," + b + ")";
                
                var geojsonMarkerOptions = {
                    radius: 5 * feature.properties.mag,
                    fillColor: color,
                    color: "black",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        });

        // Sending our earthquakes layer to the createMap function
        createMap(earthquakes);
    }

    function createMap(earthquakes) {
        // Define streetmap layer
        var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ.T6YbdDixkOBWH_k9GbS8JQ");

        // Create our map, giving it the streetmap and earthquakes layers to display on load
        var myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 4,
            layers: [streetmap, earthquakes]
        });

        // Create a legend to display information about our map
        var legend = L.control({ position: 'bottomleft' });

        legend.onAdd = function(map) {
            var div = L.DomUtil.create('div', 'info legend');
            var grades = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            var labels = [];

            div.innerHTML += 'Magnitude<br><hr>';

            // Loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(myMap);
    }

    function getColor(d) {
        return d < 1 ? 'rgb(255,255,255)' :
            d < 2 ? 'rgb(255,225,225)' :
            d < 3 ? 'rgb(255,195,195)' :
            d < 4 ? 'rgb(255,165,165)' :
            d < 5 ? 'rgb(255,135,135)' :
            d < 6 ? 'rgb(255,105,105)' :
            d < 7 ? 'rgb(255,75,75)' :
            d < 8 ? 'rgb(255,45,45)' :
            d < 9 ? 'rgb(255,15,15)' :
            'rgb(255,0,0)';
    }
};