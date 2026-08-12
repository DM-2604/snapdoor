import React from "react";

export const PromoBanners = () => {
  return (
    <div className="w-full px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Banner 1 */}
        <div className="bg-primary rounded-xl p-6 md:p-8 flex items-center justify-between text-white relative overflow-hidden h-40">
          <div className="z-10 relative">
            <h3 className="text-xl md:text-2xl font-bold mb-1">Flat 20% OFF</h3>
            <p className="font-medium text-primary-subtle mb-4">On Medicines</p>
            <p className="text-xs text-primary-muted mb-4">Order delivers fast easily</p>
            <button className="bg-white dark:bg-neutral-900 text-primary text-xs font-bold px-4 py-2 rounded-md shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors">
              Order Now
            </button>
          </div>
          {/* Graphic placeholder */}
          <div className="absolute -right-4 bottom-0 h-[120%] w-1/2 opacity-90 flex items-end justify-center">
             <div className="text-xl">💊🩺</div>
          </div>
        </div>

        {/* Banner 2 */}
        <div className="bg-yellow-100 rounded-xl p-6 md:p-8 flex items-center justify-between text-neutral-800 dark:text-neutral-100 relative overflow-hidden h-40">
          <div className="z-10 relative">
            <h3 className="text-xl md:text-2xl font-bold mb-1">Bakery Special</h3>
            <p className="font-bold text-warning-dark mb-4">Up to 15% OFF</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">Fresh & Tasty Every Day</p>
            <button className="bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-md shadow-sm hover:bg-black transition-colors">
              Order Now
            </button>
          </div>
          {/* Graphic placeholder */}
          <div className="absolute -right-4 bottom-0 h-full w-1/2 opacity-90 flex items-center justify-center">
             <div className="text-4xl">🍞🍰</div>
          </div>
        </div>

        {/* Banner 3 */}
        <div className="bg-blue-800 rounded-xl p-6 md:p-8 flex items-center justify-between text-white relative overflow-hidden h-40">
          <div className="z-10 relative">
            <h3 className="text-xl md:text-2xl font-bold mb-1">Electronics Deals</h3>
            <p className="font-medium text-blue-200 mb-4">Up to 25% OFF</p>
            <p className="text-xs text-blue-300 mb-4">Best Brands, Best Prices</p>
            <button className="bg-blue-600 text-white border border-blue-400 text-xs font-bold px-4 py-2 rounded-md shadow-sm hover:bg-blue-500 transition-colors">
              Shop Now
            </button>
          </div>
          {/* Graphic placeholder */}
          <div className="absolute -right-4 bottom-0 h-[110%] w-1/2 opacity-90 flex items-center justify-center">
             <div className="text-4xl">🎧📱</div>
          </div>
        </div>

      </div>
    </div>
  );
};
