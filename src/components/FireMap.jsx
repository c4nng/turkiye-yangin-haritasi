import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getFiresInTurkey } from "../api/fireData";
import { getWindData } from "../api/getWindData";

const FireMap = () => {
  const mapRef = useRef(null);
  const [mode, setMode] = useState("heat");

  useEffect(() => {
    const map = new maplibregl.Map({
      container: "map-container",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [35, 38.5],
      zoom: 6.3,
    });

    mapRef.current = map;

    const loadFires = async () => {
      const data = await getFiresInTurkey();

      const geojson = {
        type: "FeatureCollection",
        features: data.map((item) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: item.geometry.coordinates,
          },
          properties: {
            ...item.properties,
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
            "heatmap-weight": 0.5,
            "heatmap-intensity": 1,
            "heatmap-radius": 20,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(0,0,0,0)",
              0.3, "royalblue",
              0.6, "orange",
              1, "red",
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

        map.on("click", "fire-points", async (e) => {
          const coordinates = e.features[0].geometry.coordinates;
          const [lng, lat] = coordinates;

          try {
            const wind = await getWindData(lat, lng);
            new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
                <strong>🔥 Yangın Noktası</strong><br/>
                Parlaklık: ${e.features[0].properties.brightness ?? "?"}<br/>
                Koordinatlar: [${lat.toFixed(4)}, ${lng.toFixed(4)}]<br/><br/>
                <strong>Rüzgar:</strong><br/>
                Hız: ${wind.speed} m/s<br/>
                Yön: ${wind.deg}°
            `)
            .addTo(map);

          } catch (err) {
            console.error("Rüzgar verisi alınamadı:", err.message);
          }
        });
      }

      toggleLayers(map);
    };

    map.on("load", loadFires);

    const toggleLayers = (map) => {
      if (!map.getLayer("heatmap") || !map.getLayer("fire-points")) return;
      map.setLayoutProperty("heatmap", "visibility", mode === "heat" ? "visible" : "none");
      map.setLayoutProperty("fire-points", "visibility", mode === "points" ? "visible" : "none");
    };

    const interval = setInterval(() => {
      if (mapRef.current?.isStyleLoaded()) {
        loadFires();
      }
    }, 10 * 60 * 1000);

    return () => {
      map.remove();
      clearInterval(interval);
    };
  }, [mode]);

  return (
    <>
      <div style={switchStyle}>
        <button onClick={() => setMode("heat")} style={mode === "heat" ? activeBtn : btn}>
          Isı Haritası
        </button>
        <button onClick={() => setMode("points")} style={mode === "points" ? activeBtn : btn}>
          Nokta Görünüm
        </button>
      </div>
      <div id="map-container" style={{ height: "100vh", width: "100%" }} />
    </>
  );
};

const switchStyle = {
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 1000,
  display: "flex",
  gap: "10px",
};

const btn = {
  background: "#e1e1e1",
  border: "none",
  borderRadius: "6px",
  padding: "10px 14px",
  fontWeight: "bold",
  cursor: "pointer",
};

const activeBtn = {
  ...btn,
  background: "black",
  color: "white",
};

export default FireMap;
