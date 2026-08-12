"use client";

import React, { useState } from "react";
import { X, MapPin, Search, Check } from "lucide-react";
import { useStore } from "@/store/useStore";

export const LocationModal = () => {
  const { city, setCity, location, setLocation, isLocationModalOpen, setIsLocationModalOpen, availableCities } = useStore();
  const [tempLocation, setTempLocation] = useState(location);
  const [searchCity, setSearchCity] = useState("");

  if (!isLocationModalOpen) return null;

  const handleSave = (selectedCity: string) => {
    setCity(selectedCity);
    setLocation(`${tempLocation.split(',')[0] || 'Connaught Place'}, ${selectedCity}`);
    setIsLocationModalOpen(false);
  };

  const filteredCities = availableCities.filter(c => 
    c.toLowerCase().includes(searchCity.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsLocationModalOpen(false)}
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

        {/* City Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search your city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>

        {/* Popular Cities Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Select City</label>
          <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
            {filteredCities.map((c) => {
              const isSelected = c === city;
              return (
                <button
                  key={c}
                  onClick={() => handleSave(c)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    isSelected
                      ? "border-primary bg-emerald-50 dark:bg-emerald-900/40 text-primary dark:text-emerald-400"
                      : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span>{c}</span>
                  {isSelected && <Check size={14} className="text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Address Input */}
        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Detailed Address / Pincode</label>
          <input
            type="text"
            value={tempLocation}
            onChange={(e) => setTempLocation(e.target.value)}
            placeholder="Enter area, street or pincode"
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>

        <button
          onClick={() => handleSave(city)}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
};
