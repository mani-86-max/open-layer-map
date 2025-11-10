// Base map
const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM()
});

// Vector layer for drawing
const vectorSource = new ol.source.Vector({ wrapX: false });
const vectorLayer = new ol.layer.Vector({ source: vectorSource });

// Map initialization
const map = new ol.Map({
  target: 'map',
  layers: [osmLayer, vectorLayer],
  view: new ol.View({
    center: ol.proj.fromLonLat([77.209, 28.6139]), // India
    zoom: 5
  })
});

// Buttons
document.getElementById("homeBtn").onclick = () => {
  map.getView().animate({
    center: ol.proj.fromLonLat([77.209, 28.6139]),
    zoom: 5,
    duration: 1000
  });
};

document.getElementById("zoomInBtn").onclick = () => {
  map.getView().setZoom(map.getView().getZoom() + 1);
};

document.getElementById("zoomOutBtn").onclick = () => {
  map.getView().setZoom(map.getView().getZoom() - 1);
};

document.getElementById("locBtn").onclick = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = [pos.coords.longitude, pos.coords.latitude];
      map.getView().animate({
        center: ol.proj.fromLonLat(coords),
        zoom: 12,
        duration: 1000
      });
    });
  } else {
    alert("Geolocation not supported!");
  }
};

// Draw interaction
let draw;
function addDrawInteraction(type) {
  if (draw) map.removeInteraction(draw);
  draw = new ol.interaction.Draw({
    source: vectorSource,
    type: type
  });
  map.addInteraction(draw);
}

document.getElementById("pointBtn").onclick = () => addDrawInteraction("Point");
document.getElementById("polyBtn").onclick = () => addDrawInteraction("Polygon");

// Export GeoJSON
document.getElementById("exportBtn").onclick = () => {
  const format = new ol.format.GeoJSON();
  const features = vectorSource.getFeatures();
  const json = format.writeFeatures(features);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "drawn_features.json";
  link.click();
};
