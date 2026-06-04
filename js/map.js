(function () {
  var places = window.placeData;
  if (!places || !places.length) return;

  var map = L.map("map-container", {
    center: [30, 110],
    zoom: 4,
    zoomControl: true,
    scrollWheelZoom: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

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
