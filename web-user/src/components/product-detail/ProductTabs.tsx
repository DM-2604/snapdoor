"use client";

import React, { useState } from "react";
import { Check, Star, ChevronRight } from "lucide-react";

export const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState("details");

  const tabs = [
    { id: "details", label: "Product Details" },
    { id: "specs", label: "Specifications" },
    { id: "nutrition", label: "Nutrition Facts" },
    { id: "reviews", label: "Reviews (12.5K)" },
    { id: "qa", label: "Q&A" },
  ];

  return (
    <div className="space-y-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
      {/* Tabs Header */}
      <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 text-sm overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Description Points */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Product Description</h4>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Aashirvaad Whole Wheat Atta is made from 100% MP Sharbati wheat and is natural, pure & wholesome. It contains the goodness of wheat fibre, making your rotis soft and tasty.
            </p>
            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 font-medium">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-primary shrink-0" />
                <span>Made from 100% MP Sharbati Wheat</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-primary shrink-0" />
                <span>0% Maida, 100% Atta</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-primary shrink-0" />
                <span>High in Fibre</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-primary shrink-0" />
                <span>Rotis stay soft for long</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-primary shrink-0" />
                <span>Hygienically packed</span>
              </li>
            </ul>
          </div>

          {/* Feature Banner Card */}
          <div className="md:col-span-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 p-5 rounded-2xl space-y-4">
            <h4 className="font-extrabold text-neutral-900 dark:text-white text-sm">
              Goodness of 100% MP Sharbati Wheat
            </h4>
            
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-neutral-800 dark:text-neutral-100">
              <div className="bg-white/80 dark:bg-neutral-900/80 p-2.5 rounded-xl border border-amber-200/50 space-y-1">
                <div className="text-lg">🌾</div>
                <div>High in Fibre</div>
              </div>
              <div className="bg-white/80 dark:bg-neutral-900/80 p-2.5 rounded-xl border border-amber-200/50 space-y-1">
                <div className="text-lg">🍞</div>
                <div>Tasty & Soft Rotis</div>
              </div>
              <div className="bg-white/80 dark:bg-neutral-900/80 p-2.5 rounded-xl border border-amber-200/50 space-y-1">
                <div className="text-lg">✨</div>
                <div>0% Maida<br/><span className="text-[9px] font-normal text-neutral-500 dark:text-neutral-400">100% Atta</span></div>
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Specifications</h4>
            <div className="space-y-2 border-t border-neutral-200 dark:border-neutral-800 pt-2">
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400">Brand</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">Aashirvaad</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400">Product Type</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">Whole Wheat Atta</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400">Weight</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">5 kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400">Shelf Life</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">6 Months</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400">Ingredients</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">100% Whole Wheat</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500 dark:text-neutral-400">Pack Type</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">Pouch</span>
              </div>
            </div>
            <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              View more <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {activeTab === "specs" && (
        <div className="text-xs text-neutral-600 dark:text-neutral-400 max-w-lg space-y-2">
          <p><strong>Country of Origin:</strong> India</p>
          <p><strong>FSSAI License No:</strong> 10012031000012</p>
          <p><strong>Manufacturer:</strong> ITC Limited, 37, J.L. Nehru Road, Kolkata - 700071</p>
        </div>
      )}

      {activeTab === "nutrition" && (
        <div className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md space-y-1.5">
          <p className="font-bold text-neutral-800 dark:text-neutral-100 mb-2">Nutritional Values (Per 100g approx):</p>
          <div className="flex justify-between py-1 border-b"><span>Energy:</span><span>365 kcal</span></div>
          <div className="flex justify-between py-1 border-b"><span>Protein:</span><span>10.8 g</span></div>
          <div className="flex justify-between py-1 border-b"><span>Carbohydrate:</span><span>76.2 g</span></div>
          <div className="flex justify-between py-1 border-b"><span>Dietary Fibre:</span><span>11.1 g</span></div>
          <div className="flex justify-between py-1"><span>Fat:</span><span>1.7 g</span></div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">4.6</div>
            <div>
              <div className="flex text-warning"><Star size={14} className="fill-warning" /><Star size={14} className="fill-warning" /><Star size={14} className="fill-warning" /><Star size={14} className="fill-warning" /><Star size={14} className="fill-warning" /></div>
              <p className="text-neutral-500 dark:text-neutral-400">Based on 12,540 verified buyers</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
