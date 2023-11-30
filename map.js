function process(data, hour) {
    console.log(hour)
    var div = document.getElementById("result");
    div.innerHTML = "";

    var table = document.createElement("table");
    table.style.border = "1px solid black";
    table.style.borderCollapse = "collapse";

    var tbody = document.createElement("tbody");

    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.style.border = "1px solid black";
    td1.style.padding = "5px";
    td1.textContent = "Координаты";
    var td2 = document.createElement("td");
    td2.style.border = "1px solid black";
    td2.style.padding = "5px";
    td2.textContent = data.latitude + ", " + data.longitude;
    tr.appendChild(td1);
    tr.appendChild(td2);
    tbody.appendChild(tr);

    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.style.border = "1px solid black";
    td1.style.padding = "5px";
    td1.textContent = "Высота";
    var td2 = document.createElement("td");
    td2.style.border = "1px solid black";
    td2.style.padding = "5px";
    td2.textContent = data.elevation + " м.";
    tr.appendChild(td1);
    tr.appendChild(td2);
    tbody.appendChild(tr);

    for (var key in data.hourly_units) {
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.style.border = "1px solid black";
        td1.style.padding = "5px";
        td1.textContent = key + " (" + data.hourly_units[key] + ")";
        var td2 = document.createElement("td");
        td2.style.border = "1px solid black";
        td2.style.padding = "5px";
        td2.textContent = data.hourly[key][hour];
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    div.appendChild(table);
}

function addMarker(lat, lon) {
    if (map == null) {
        return;
    }
    var style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 9,
            fill: new ol.style.Fill({
                color: 'blue'
            }),
            stroke: new ol.style.Stroke({
                color: 'white',
                width: 3
            })
        })
    });

    map.getLayers().getArray()
        .filter(layer => layer.get('name') === 'SelectedPoint')
        .forEach(layer => map.removeLayer(layer));
    var coordinates = ol.proj.transform([parseFloat(lon), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857');
    console.log(ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326'));

    var point = new ol.geom.Point(coordinates);
    var feature = new ol.Feature({
        geometry: point
    });
    feature.setStyle(style);

    var layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [feature]
        }),
        name: "SelectedPoint"
    });
    map.addLayer(layer);
    map.getView().setCenter(coordinates);
}

function find() {
    var xhr = new XMLHttpRequest();

    var latitude = document.getElementById("latitude").value;
    var longitude = document.getElementById("longitude").value;
    var date = document.getElementById("date").value;

    addMarker(latitude, longitude);

    var start_date = date.slice(0, 10);
    var end_date = date.slice(0, 10);

    var hourly = "temperature_2m,relative_humidity_2m,precipitation,rain,snowfall,snow_depth,weather_code,cloud_cover,wind_speed_10m";

    var timezone = "Europe%2FMoscow";

    var url = "https://archive-api.open-meteo.com/v1/archive?latitude=" + latitude
        + "&longitude=" + longitude
        + "&start_date=" + start_date
        + "&end_date=" + end_date
        + "&hourly=" + hourly
        + "&timezone=" + timezone;

    xhr.open("GET", url, true);
    xhr.onload = function () {
        if (xhr.status == 200) {
            var data = JSON.parse(xhr.responseText);
            console.log(data);
            process(data, (new Date(date)).getHours());
        } else {
            console.error("Open Meteo Error: " + xhr.status);
        }
    };
    xhr.send();
}

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([30.305035, 59.943685]),
        zoom: 16
    })
});