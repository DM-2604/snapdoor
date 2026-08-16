import React from "react";

export const HeroBanner = () => {
  return (
    <div className="w-full px-4 md:px-8 py-6">
      <div className="w-full rounded-2xl bg-gradient-to-r from-neutral-100 dark:from-neutral-900/60 to-primary-subtle dark:to-emerald-950/40 overflow-hidden relative flex flex-col md:flex-row items-center justify-between min-h-[360px] p-8 md:p-12 border border-transparent dark:border-neutral-800">
        {/* Text Content */}
        <div className="z-10 max-w-xl">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-100 leading-tight mb-4">
            Apne Shehar ke <br className="hidden md:block" />
            Har Shop ka <br className="hidden md:block" />
            <span className="text-primary">One Destination</span>
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 max-w-md">
            Grocery, Medical, Stationery, Electronics aur bahut kuch — sab aapke paas, ek click par!
          </p>
          <div className="flex items-center gap-4">
            <button className="bg-primary text-white font-medium px-8 py-3 rounded-md hover:bg-primary-dark transition-colors shadow-sm">
              Shop Now
            </button>
            <button className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-medium px-8 py-3 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm border border-neutral-200 dark:border-neutral-700">
              Explore Shops
            </button>
          </div>
        </div>

        {/* Image Placeholder (Representing the delivery person and mobile frame in design) */}
        <div className="relative mt-8 md:mt-0 md:absolute md:right-8 md:bottom-0 w-full max-w-md h-[300px] md:h-full flex items-end justify-center">
          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-0 bg-white dark:bg-neutral-800 p-3 rounded-full shadow-md border border-neutral-100 dark:border-neutral-700 text-primary font-bold text-xl">%</div>
          <div className="absolute top-1/3 right-12 bg-white dark:bg-neutral-800 p-3 rounded-full shadow-md border border-neutral-100 dark:border-neutral-700 text-warning font-bold text-xl">%</div>
          
          {/* Main Character Placeholder */}
          <div className="w-[80%] h-[90%] bg-primary-subtle dark:bg-emerald-900/30 rounded-t-full border-4 border-white dark:border-neutral-800 shadow-xl relative overflow-hidden flex items-end justify-center">
            <div className="text-primary-dark dark:text-emerald-400 font-medium pb-8 text-center px-4 opacity-50">
              [Delivery Partner Image Placeholder]
            </div>
            {/* Box of groceries representation */}
            <div className="absolute bottom-0 w-[120%] h-1/3 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-inner border-t border-neutral-200 dark:border-neutral-700 rounded-t-2xl flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-400">
              Products Assortment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
