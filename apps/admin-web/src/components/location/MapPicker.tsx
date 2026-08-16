'use client';

// Dynamic-imported with ssr: false — Leaflet requires browser APIs.
// Shows OSM tiles. Draggable marker updates coordinates and reverse-geocodes.

import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

let L: typeof import('leaflet');

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onPositionChange: (lat: number, lng: number, address?: string) => void;
}

export const MapPicker = ({ lat, lng, onPositionChange }: MapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const centerLat = lat || 28.6139;
  const centerLng = lng || 77.209;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data);
      } catch (e) {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (result: any) => {
    const parsedLat = parseFloat(result.lat);
    const parsedLng = parseFloat(result.lon);
    
    // Format address
    const parts = result.display_name.split(',');
    const shortAdd = parts.slice(0, 3).join(',').trim();
    
    onPositionChange(parsedLat, parsedLng, shortAdd);
    setSearchQuery('');
    setSearchResults([]);
  };

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

      const handleUpdate = async (pos: { lat: number; lng: number }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&zoom=18&addressdetails=1`);
          const data = await res.json();
          const address = data.display_name;
          onPositionChange(pos.lat, pos.lng, address);
        } catch (e) {
          onPositionChange(pos.lat, pos.lng);
        }
      };

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        await handleUpdate(pos);
      });

      map.on('click', async (e: any) => {
        marker.setLatLng(e.latlng);
        await handleUpdate(e.latlng);
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
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search for an area or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
        
        {/* Dropdown Results */}
        {(searchResults.length > 0 || isSearching) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-[1000] max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-4 text-neutral-500 text-sm">
                <Loader2 size={16} className="animate-spin mr-2" /> Searching...
              </div>
            ) : (
              searchResults.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="w-full flex items-start gap-3 p-3 border-b last:border-0 border-neutral-100 text-left hover:bg-neutral-50 transition-colors"
                >
                  <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700 line-clamp-2 leading-tight">{result.display_name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-neutral-200 relative z-0"
        style={{ minHeight: 256 }}
      />
    </div>
  );
};
