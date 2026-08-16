"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown } from "lucide-react";

export const CategoryNav = () => {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Shops Near You", href: "/shops" },
    { name: "Categories", href: "/search" },
    // { name: "Offers", href: "/offers" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-30">
      <div className="px-4 md:px-8 flex items-center gap-6 overflow-x-auto no-scrollbar">
        {/* All Categories Button */}
        <Link
          href="/search"
          className="bg-primary hover:bg-primary-dark text-white flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors shrink-0"
        >
          <Menu size={18} />
          <span>All Categories</span>
          <ChevronDown size={16} />
        </Link>

        {/* Static nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium whitespace-nowrap py-3 border-b-2 transition-colors ${
                isActive(link.href)
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-primary hover:border-primary"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
