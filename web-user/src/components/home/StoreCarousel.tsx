import React from "react";
import Link from "next/link";
import { ChevronRight, Star, Clock, MapPin } from "lucide-react";
import { useStore } from "@/store/useStore";

export const StoreCarousel = () => {
  const { location } = useStore();
  
  const stores = [
    { name: "Gupta Kirana Store", category: "Kirana & Grocery", rating: 4.6, distance: "0.8 km", time: "20-30 min", open: true, discount: "10% OFF" },
    { name: "Apollo Pharmacy", category: "Medical & Pharmacy", rating: 4.7, distance: "1.2 km", time: "30 min", open: true, discount: "20% OFF" },
    { name: "City Stationers", category: "Stationery & Books", rating: 4.4, distance: "0.6 km", time: "15-20 min", open: true, discount: "5% OFF" },
    { name: "Quality Bakery", category: "Bakery & Dairy", rating: 4.8, distance: "1.5 km", time: "25-35 min", open: true, discount: "15% OFF" },
    { name: "Sharma Electronics", category: "Electronics", rating: 4.2, distance: "1.0 km", time: "30-40 min", open: true, discount: "10% OFF" },
    { name: "Fashion Point", category: "Clothing & Fashion", rating: 4.3, distance: "1.2 km", time: "30 min", open: true, discount: "50% OFF" },
  ];

  return (
    <div className="w-full px-4 md:px-8 pb-12 relative">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Shops Near You</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Based on your location: <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[200px] inline-block align-bottom">{location}</span></p>
        </div>
        <Link href="/search?tab=shops" className="flex items-center text-sm font-medium text-primary hover:underline">
          View All Shops <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
        {stores.map((store, index) => (
          <div key={index} className="min-w-[260px] md:min-w-[280px] bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden cursor-pointer hover:shadow-md transition-all group">
            {/* Image Placeholder */}
            <div className="h-36 bg-neutral-100 dark:bg-neutral-800 relative">
              <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
                [Store Image]
              </div>
              {store.discount && (
                <div className="absolute bottom-2 right-2 bg-warning text-neutral-900 dark:text-white text-xs font-bold px-2 py-1 rounded">
                  {store.discount}
                </div>
              )}
            </div>
            
            {/* Store Details */}
            <div className="p-4">
              <h4 className="font-bold text-neutral-800 dark:text-neutral-100 mb-1 group-hover:text-primary transition-colors">{store.name}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{store.category}</p>
              
              <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-warning fill-warning" />
                  <span className="font-medium">{store.rating}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{store.distance}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{store.time}</span>
                </div>
              </div>
              
              <div className="text-xs font-medium text-success">
                {store.open ? "Open" : <span className="text-danger">Closed</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Right Scroll Arrow (Desktop) */}
      <button className="hidden md:flex absolute right-4 top-1/2 translate-y-4 w-10 h-10 bg-white dark:bg-neutral-900 shadow-lg border border-neutral-100 dark:border-neutral-800 rounded-full items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-primary z-10">
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
