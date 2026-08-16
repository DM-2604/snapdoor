"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Truck, Smartphone, HelpCircle, Store } from "lucide-react";
import { useStore } from "@/store/useStore";

export const TopHeader = () => {
  const { location, setIsLocationModalOpen } = useStore();

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-800 text-xs py-1.5 px-4 md:px-8 flex justify-between items-center text-neutral-600 dark:text-neutral-400">
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-primary" />
        <span>Delivering to: <strong className="text-neutral-800 dark:text-neutral-100">{location}</strong></span>
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="text-primary font-semibold hover:underline ml-1 cursor-pointer"
        >
          Change
        </button>
      </div>
      {/* Removed TopHeader Links */}
    </div>
  );
};
