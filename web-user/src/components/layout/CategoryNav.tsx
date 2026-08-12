import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";

export const CategoryNav = () => {
  const links = [
    { name: "Home", href: "/" },
    { name: "Shops Near You", href: "/shops" },
    { name: "Categories", href: "/search" },
    { name: "Best Sellers", href: "/search" },
    { name: "Flash Deals", href: "/offers" },
    { name: "New Arrivals", href: "/search" },
    { name: "Offers", href: "/offers" },
  ];

  return (
    <div className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="px-4 md:px-8 flex items-center gap-8">
        {/* All Categories Dropdown Button */}
        <Link href="/search" className="bg-primary hover:bg-primary-dark text-white flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors w-48 justify-between">
          <div className="flex items-center gap-2">
            <Menu size={18} />
            <span>All Categories</span>
          </div>
          <ChevronDown size={16} />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 overflow-x-auto no-scrollbar">
          {links.map((link, index) => (
            <Link 
              key={index} 
              href={link.href} 
              className="text-sm font-medium whitespace-nowrap py-3 border-b-2 border-transparent text-neutral-600 dark:text-neutral-400 hover:text-primary hover:border-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
