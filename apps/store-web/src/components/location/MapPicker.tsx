'use client';

// Dynamic-imported with ssr: false — Leaflet requires browser APIs.
// Shows OSM tiles. Draggable marker updates address via Nominatim reverse geocode.

import React, { useEffect, useRef } from 'react';
import { useLocationStore } from '@/stores/location.store';

let L: typeof import('leaflet');

export const MapPicker = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const { lat, lng, reverseGeocode } = useLocationStore();

  const centerLat = lat ?? 28.6139;
  const centerLng = lng ?? 77.209;

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mapRef.current || leafletMapRef.current) return;

      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      L = leaflet.default ?? leaflet;

      if (!mounted || !mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([centerLat, centerLng], { draggable: true }).addTo(map);

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        await reverseGeocode(pos.lat, pos.lng);
      });

      map.on('click', async (e: any) => {
        marker.setLatLng(e.latlng);
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      leafletMapRef.current = map;
      markerRef.current = marker;
    };

    init();

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (markerRef.current && lat && lng) {
      markerRef.current.setLatLng([lat, lng]);
      leafletMapRef.current?.setView([lat, lng], 15);
    }
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700"
      style={{ minHeight: 256 }}
    />
  );
};
