(function () {
  var places = window.placeData;
  if (!places || !places.length) return;

  // 默认视角：上海（国内点在高德瓦片上，这里固定视角、不 fitBounds 全部点，
  // 否则会被欧洲的标记拉成欧亚大远景）
  var map = L.map("map-container", {
    center: [31.2304, 121.4737],
    zoom: 10,
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

  gaodeLayer.addTo(map);

  L.control.layers({
    "高德地图": gaodeLayer,
    "ArcGIS": arcgisLayer,
    "OpenStreetMap": osmLayer
  }, null, { position: "topright" }).addTo(map);

  // 左下角图例：圆点直接复用上面的标记类，颜色和暗色模式自动跟随
  var legend = L.control({ position: "bottomleft" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "map-legend");
    div.innerHTML =
      '<span><i class="map-visited-icon"></i>去过</span>' +
      '<span><i class="map-star-icon"></i>星标</span>' +
      '<span><i class="map-fav-icon"></i>收藏</span>';
    return div;
  };
  legend.addTo(map);

  var starIcon = L.divIcon({
    className: "map-star-icon",
    html: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -12],
  });

  var visitedIcon = L.divIcon({
    className: "map-visited-icon",
    html: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -12],
  });

  var heartIcon = L.divIcon({
    className: "map-fav-icon",
    html: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -12],
  });

  // 交互：悬停即看细节，移开就收；点击 = 钉住气泡（可多开，互不挤掉），
  // 钉住后移开鼠标也不关，再点一次同一个点才收。触屏没悬停，点击逻辑照常工作。
  var pinned = new Set();

  places.forEach(function (place) {
    var icon = place.star ? starIcon : (place.fav ? heartIcon : visitedIcon);
    var marker = L.marker([place.lat, place.lng], { icon: icon }).addTo(map);
    var popup = "<strong>" + place.name + "</strong>";

    marker.bindPopup(popup, { autoClose: false, closeOnClick: false, closeButton: false });

    marker.on("mouseover", function () { marker.openPopup(); });
    marker.on("mouseout", function () {
      if (!pinned.has(marker)) marker.closePopup();
    });
    marker.on("click", function () {
      if (pinned.has(marker)) {
        pinned.delete(marker);
        marker.closePopup();
      } else {
        pinned.add(marker);
        marker.openPopup();
      }
    });
  });
})();
