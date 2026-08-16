'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, MapPin, Search, Check, Navigation, Loader2, Map } from 'lucide-react';
import { useLocationStore, NominatimResult } from '@/stores/location.store';

// Leaflet requires browser APIs — load with ssr: false
const MapPicker = dynamic(
  () => import('@/components/location/MapPicker').then((m) => m.MapPicker),
  { ssr: false, loading: () => <div className="w-full h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" /> }
);

export const LocationModal = () => {
  const {
    lat,
    lng,
    city,
    address,
    isLoading,
    error,
    isLocationModalOpen,
    permissionRequested,
    setLocation,
    detectLocation,
    searchAddress,
    closeModal,
  } = useLocationStore();

  const [tab, setTab] = useState<'search' | 'map'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const results = await searchAddress(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchAddress]);

  if (!isLocationModalOpen) return null;

  const handleSelectResult = (result: NominatimResult) => {
    const parsedLat = parseFloat(result.lat);
    const parsedLng = parseFloat(result.lon);
    
    // Extract city from result — fall back to last meaningful part of display_name (country excluded)
    const a = result.address;
    const parts = result.display_name.split(',').map((p) => p.trim()).filter(Boolean);
    // City is address.city/town/village/state, or the second-to-last part of display_name (skip country)
    const c = a?.city ?? a?.town ?? a?.village ?? a?.state ?? (parts.length > 1 ? parts[parts.length - 2] : parts[0]) ?? '';
    
    // Short address: first 2 parts of display_name
    const shortAdd = parts.slice(0, 2).join(', ');
    
    setLocation(parsedLat, parsedLng, shortAdd, c);
    closeModal();
  };

  const handleSaveCustomAddress = () => {
    setLocation(lat ?? 0, lng ?? 0, tempAddress || address, city);
    closeModal();
  };

  const handleMapConfirm = () => {
    // lat/lng already updated by reverseGeocode in MapPicker
    closeModal();
  };

  // First-visit screen: shown when location permission has never been requested
  if (!permissionRequested) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center space-y-3 pt-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <Navigation size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Allow location access?
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Green Mart needs your location to show stores that can deliver to you.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-xs text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={detectLocation}
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Navigation size={18} />
              )}
              {isLoading ? 'Detecting...' : 'Use my current location'}
            </button>

            <button
              onClick={() => {
                // Mark as requested (skip the first-visit gate) and show city picker
                useLocationStore.setState({ permissionRequested: true });
              }}
              className="w-full py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Enter manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <MapPin size={22} className="text-primary" />
            Select Delivery Location
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Choose your city to see available shops, products and delivery times.
          </p>
        </div>

        {/* GPS detect button */}
        <button
          onClick={detectLocation}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-sm rounded-xl transition-colors disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Navigation size={15} />
          )}
          {isLoading ? 'Detecting location...' : 'Use my current location'}
        </button>

        {error && (
          <p className="text-xs text-red-500 text-center -mt-2">{error}</p>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setTab('search')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'search'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Search size={13} /> Search City
          </button>
          <button
            onClick={() => setTab('map')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'map'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Map size={13} /> Pick on Map
          </button>
        </div>

        {/* Search City Tab */}
        {tab === 'search' && (
          <>
            {/* City Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Search Results
              </label>
              <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4 text-neutral-500">
                    <Loader2 size={16} className="animate-spin mr-2" /> Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleSelectResult(result)}
                      className="flex items-start gap-3 p-3 rounded-xl border text-xs font-semibold text-left transition-all border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-tight">{result.display_name}</span>
                    </button>
                  ))
                ) : searchQuery ? (
                  <div className="text-xs text-neutral-500 text-center py-4">No results found</div>
                ) : (
                  <div className="text-xs text-neutral-500 text-center py-4">Type a location to search</div>
                )}
              </div>
            </div>

            {/* Custom Address Input */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Detailed Address / Pincode
              </label>
              <input
                type="text"
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                placeholder="Enter area, street or pincode"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
            </div>

            <button
              onClick={handleSaveCustomAddress}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
            >
              Confirm Custom Location
            </button>
          </>
        )}

        {/* Map Tab */}
        {tab === 'map' && (
          <div className="space-y-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Drag the pin or click the map to set your delivery location.
            </p>
            <MapPicker />
            {address && (
              <div className="flex items-start gap-2 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-700 dark:text-neutral-300">{address}</p>
              </div>
            )}
            <button
              onClick={handleMapConfirm}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
            >
              Confirm Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
