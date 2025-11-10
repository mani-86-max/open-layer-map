// --- Base Layers ---
const osmLayer = new ol.layer.Tile({ source: new ol.source.OSM(), visible: true });
const satelliteLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  }),
  visible: false
});
const terrainLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}'
  }),
  visible: false
});

// --- Vector Layer for Drawing ---
const vectorSource = new ol.source.Vector({ wrapX: false });
const vectorLayer = new ol.layer.Vector({ source: vectorSource });

// --- Map Initialization ---
const map = new ol.Map({
  target: 'map',
  layers: [osmLayer, satelliteLayer, terrainLayer, vectorLayer],
  view: new ol.View({
    center: ol.proj.fromLonLat([77.209, 28.6139]), // India
    zoom: 5
  })
});

// --- Toolbar Buttons ---
document.getElementById("homeBtn").onclick = () => {
  map.getView().animate({ center: ol.proj.fromLonLat([77.209, 28.6139]), zoom: 5, duration: 1000 });
};
document.getElementById("zoomInBtn").onclick = () => map.getView().setZoom(map.getView().getZoom() + 1);
document.getElementById("zoomOutBtn").onclick = () => map.getView().setZoom(map.getView().getZoom() - 1);
document.getElementById("locBtn").onclick = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = [pos.coords.longitude, pos.coords.latitude];
      map.getView().animate({ center: ol.proj.fromLonLat(coords), zoom: 12, duration: 1000 });
    });
  } else alert("Geolocation not supported!");
};

// --- Drawing Tools ---
let draw;
function addDrawInteraction(type) {
  if (draw) map.removeInteraction(draw);
  draw = new ol.interaction.Draw({ source: vectorSource, type });
  map.addInteraction(draw);
}
document.getElementById("pointBtn").onclick = () => addDrawInteraction("Point");
document.getElementById("polyBtn").onclick = () => addDrawInteraction("Polygon");

// --- Export GeoJSON ---
document.getElementById("exportBtn").onclick = () => {
  const format = new ol.format.GeoJSON();
  const features = vectorSource.getFeatures();
  const json = format.writeFeatures(features);
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "drawn_features.json";
  link.click();
};

// --- Basemap Gallery ---
document.getElementById("basemapSelect").onchange = (e) => {
  const value = e.target.value;
  osmLayer.setVisible(value === "osm");
  satelliteLayer.setVisible(value === "satellite");
  terrainLayer.setVisible(value === "terrain");
};

// --- Search Location ---
document.getElementById("searchBtn").onclick = async () => {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return alert("Enter a location name!");
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      const { lon, lat, display_name } = data[0];
      map.getView().animate({ center: ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]), zoom: 10, duration: 1000 });
      alert(` Found: ${display_name}`);
    } else alert("No location found!");
  } catch {
    alert(" Error fetching location. Please try again later.");
  }
};
