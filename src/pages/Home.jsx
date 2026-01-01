import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getFiresInTurkey } from "../api/fireData";
import { FiCopy } from "react-icons/fi";

const FireMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mode, setMode] = useState("heat");

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [35, 38.5],
      zoom: 6.5,
    });

    mapRef.current = map;

    const loadFires = async () => {
      const data = await getFiresInTurkey();
      console.log("Güncel yangın noktası sayısı:", data.length);

      const geojson = {
        type: "FeatureCollection",
        features: data.map((item) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: item.geometry.coordinates,
          },
          properties: {
            brightness: item.properties.brightness,
            coords: item.geometry.coordinates,
          },
        })),
      };

      if (map.getSource("fires")) {
        map.getSource("fires").setData(geojson);
      } else {
        map.addSource("fires", {
          type: "geojson",
          data: geojson,
        });

        map.addLayer({
          id: "heatmap",
          type: "heatmap",
          source: "fires",
          maxzoom: 12,
          paint: {
            "heatmap-weight": 0.8,
            "heatmap-intensity": 1.5,
            "heatmap-radius": 22,
            "heatmap-opacity": 0.6,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(0,0,0,0)",
              0.2, "#4cc9f0",
              0.4, "#f72585",
              0.6, "#ff6f00",
              1, "#ff0000"
            ],
          },
        });

        map.addLayer({
          id: "fire-points",
          type: "circle",
          source: "fires",
          paint: {
            "circle-radius": 5,
            "circle-color": "#ff0000",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
          },
        });

        map.on("click", "fire-points", (e) => {
          const { brightness, coords } = e.features[0].properties;

          const coordinates = e.features[0].geometry.coordinates.slice();

          const content = `
            <div>
              <strong>Yangın Noktası</strong><br/>
              <strong>Parlaklık:</strong> ${Number(brightness).toFixed(2)}<br/>
              <strong>Koordinatlar:</strong> ${coords}<br/>
              <button onclick="navigator.clipboard.writeText('${coords}')" style="margin-top:5px;padding:4px 8px;font-size:12px;cursor:pointer;">
                Kopyala
              </button>
            </div>
          `;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(content)
            .addTo(map);
        });
      }

      toggleLayers(map);
    };

    const toggleLayers = (map) => {
      if (!map.getLayer("heatmap") || !map.getLayer("fire-points")) return;
      map.setLayoutProperty("heatmap", "visibility", mode === "heat" ? "visible" : "none");
      map.setLayoutProperty("fire-points", "visibility", mode === "points" ? "visible" : "none");
    };

    map.on("load", loadFires);

    const interval = setInterval(loadFires, 10 * 60 * 1000);

    return () => {
      map.remove();
      clearInterval(interval);
    };
  }, [mode]);

  return (
    <>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, display: "flex", gap: "8px" }}>
        <button
          onClick={() => setMode("heat")}
          style={{
            background: mode === "heat" ? "#000" : "#ccc",
            color: mode === "heat" ? "#fff" : "#000",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Isı Haritası
        </button>
        <button
          onClick={() => setMode("points")}
          style={{
            background: mode === "points" ? "#000" : "#ccc",
            color: mode === "points" ? "#fff" : "#000",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Nokta Görünüm
        </button>
      </div>
      <div
        ref={mapContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: "100%",
          height: "100vh",
        }}
      />
    </>
  );
};

export default FireMap;
