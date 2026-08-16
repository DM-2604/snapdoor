import React from "react";
import { Store, Zap, Tag, ShieldCheck, RefreshCcw } from "lucide-react";

export const UspBar = () => {
  const usps = [
    { icon: <Store className="text-primary" size={24} />, text: "Top Local Shops" },
    { icon: <Zap className="text-warning" size={24} />, text: "Fast Delivery" },
    { icon: <Tag className="text-primary" size={24} />, text: "Best Prices" },
    { icon: <ShieldCheck className="text-success" size={24} />, text: "100% Secure Payments" },
    { icon: <RefreshCcw className="text-warning" size={24} />, text: "Easy Returns" },
  ];

  return (
    <div className="w-full px-4 md:px-8 pb-8">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-4 px-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 shadow-sm">
        {usps.map((usp, index) => (
          <div key={index} className="flex items-center gap-3 flex-1 justify-center md:justify-start last:border-0 md:border-r border-neutral-200 dark:border-neutral-800 pr-4 last:pr-0 min-w-[150px]">
            <div className="shrink-0">{usp.icon}</div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{usp.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
