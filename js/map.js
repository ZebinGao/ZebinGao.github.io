(function () {
  var places = window.placeData;
  if (!places || !places.length) return;

  var map = L.map("map-container", {
    center: [30, 110],
    zoom: 4,
    zoomControl: true,
    scrollWheelZoom: true,
  });

  var arcgisLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 18,
  });

  var osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18,
  });

  var gaodeLayer = L.tileLayer("https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
    subdomains: "1234",
    maxZoom: 18,
  });

  arcgisLayer.addTo(map);

  L.control.layers({
    "ArcGIS": arcgisLayer,
    "OpenStreetMap": osmLayer,
    "高德地图": gaodeLayer
  }, null, { position: "topright" }).addTo(map);

  var starIcon = L.divIcon({
    className: "map-star-icon",
    html: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });

  var visitedIcon = L.divIcon({
    className: "map-visited-icon",
    html: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });

  var heartIcon = L.divIcon({
    className: "map-fav-icon",
    html: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });

  var wantIcon = L.divIcon({
    className: "map-want-icon",
    html: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });

  var markers = [];
  places.forEach(function (place) {
    var icon = place.star ? starIcon : (place.want ? wantIcon : (place.fav ? heartIcon : visitedIcon));
    var marker = L.marker([place.lat, place.lng], { icon: icon }).addTo(map);
    var popup = "<strong>" + place.name + "</strong>";
    if (place.address) popup += "<br><span style='color:#888;font-size:0.9em'>" + place.address + "</span>";
    if (place.date) popup += "<br><span style='color:#888'>" + place.date + "</span>";
    if (place.note) popup += "<br>" + place.note;
    marker.bindPopup(popup);
    markers.push(marker);
  });

  if (markers.length > 0) {
    var group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
  }
})();
