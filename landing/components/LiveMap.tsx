/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibre } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapVenue = {
  id: string;
  name: string;
  city: string;
  type?: string;
  latitude: number;
  longitude: number;
  activeUsers?: number;
  rating?: number;
  openHours?: string;
  address?: string;
  image?: string;
  phone?: string;
};

type LiveMapProps = {
  venues: MapVenue[];
};

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const LiveMap = ({ venues }: LiveMapProps) => {
  const mapRef = useRef<MapLibre | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [20.9, 42.6],
      zoom: 7.2,
      pitch: 20
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    venues.forEach((venue) => {
      if (typeof venue.longitude !== "number" || typeof venue.latitude !== "number") return;

      const el = document.createElement("div");
      el.className = "map-marker animate-pulse";

      const popup = new maplibregl.Popup({ offset: 16 }).setHTML(
        `
          <div style="display:flex;flex-direction:column;gap:6px;min-width:200px;">
            <strong style="font-size:14px;color:#e9ecff">${venue.name}</strong>
            <span style="color:#8ea0d8;font-size:12px;">${venue.type ?? "Venue"} - ${venue.city}</span>
            <div style="display:flex;gap:10px;font-size:12px;color:#e9ecff;">
              <span>Rating: ${venue.rating?.toFixed?.(1) ?? "4.7"}</span>
              <span>People: ${venue.activeUsers ?? 0}</span>
            </div>
            ${venue.openHours ? `<span style="color:#8ea0d8;font-size:12px;">Hours: ${venue.openHours}</span>` : ""}
          </div>
        `
      );

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([venue.longitude, venue.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    if (venues.length) {
      const [first] = venues;
      map.easeTo({
        center: [first.longitude, first.latitude],
        zoom: 8.2,
        duration: 1200
      });
    }
  }, [venues]);

  return (
    <div
      ref={containerRef}
      className="relative h-[460px] w-full overflow-hidden rounded-[28px] border border-border shadow-plasma backdrop-blur-2xl bg-space-800/60"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand-primary/10 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,248,255,0.12),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(180,255,92,0.12),transparent_40%)]" />
    </div>
  );
};

export default LiveMap;
