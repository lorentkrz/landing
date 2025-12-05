import type { Venue } from "../types";

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export const computeRegion = (venues: Venue[]): MapRegion => {
  if (!venues.length) {
    return {
      latitude: 42.6629,
      longitude: 21.1655,
      latitudeDelta: 1.2,
      longitudeDelta: 1.2,
    };
  }

  const latitudes = venues.map((v) => v.latitude ?? 0);
  const longitudes = venues.map((v) => v.longitude ?? 0);

  const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
  const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

  return {
    latitude: avgLat,
    longitude: avgLng,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };
};
