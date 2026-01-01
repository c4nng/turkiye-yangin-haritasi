import axios from "axios";

const ARCGIS_URL =
  "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/Satellite_VIIRS_Thermal_Hotspots_and_Fire_Activity/FeatureServer/0/query";

export const getFiresInTurkey = async () => {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data } = await axios.get(ARCGIS_URL, {
      params: {
        where: `acq_date >= timestamp '${yesterday.toISOString().slice(0, 19).replace('T', ' ')}'`,
        geometry: "25,35,45,43.5", // Türkiye bbox
        geometryType: "esriGeometryEnvelope",
        inSR: 4326,
        spatialRel: "esriSpatialRelIntersects",
        outFields: "latitude,longitude,bright_ti4,acq_date,acq_time",
        returnGeometry: true,
        orderByFields: "acq_date DESC",
        f: "json",
      },
    });

    if (!data.features) return [];

    const enrichedFeatures = await Promise.all(
      data.features.map(async (e) => {
        const coordinates = [e.attributes.longitude, e.attributes.latitude];

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates,
          },
          properties: {
            brightness: e.attributes.bright_ti4,
            date: e.attributes.acq_date,
            time: e.attributes.acq_time,
          },
        };
      })
    );

    return enrichedFeatures;
  } catch (err) {
    console.error("Yangın verisi alınamadı:", err);
    return [];
  }
};
