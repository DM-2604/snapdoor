import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { ShieldCheck } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

export const Footer = () => {
  return (
    <footer className="w-full bg-neutral-50 dark:bg-neutral-950 pt-12 pb-6 border-t border-neutral-200 dark:border-neutral-800 mt-12">
      <div className="px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="col-span-1 mb-8 md:mb-0 pr-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                G
              </div>
              <h1 className="text-xl font-bold text-primary leading-none">{BRAND_CONFIG.name}</h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
              {BRAND_CONFIG.name} is a multi-vendor local marketplace that connects you with trusted shops in your city. Grocery, Medical, Stationery, Electronics and much more – sab kuch ek jagah.
            </p>
            <div className="flex gap-4 mb-6">
              <a href={BRAND_CONFIG.links.facebook} className="text-neutral-400 hover:text-primary transition-colors"><FaFacebookF size={20} /></a>
              <a href={BRAND_CONFIG.links.instagram} className="text-neutral-400 hover:text-primary transition-colors"><FaInstagram size={20} /></a>
              <a href={BRAND_CONFIG.links.twitter} className="text-neutral-400 hover:text-primary transition-colors"><FaTwitter size={20} /></a>
              <a href={BRAND_CONFIG.links.youtube} className="text-neutral-400 hover:text-primary transition-colors"><FaYoutube size={20} /></a>
            </div>
            <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <p className="font-bold text-neutral-800 dark:text-neutral-100">Contact Us:</p>
              <p>Email: support@greenmart.com</p>
              <p>Phone: 1800-123-4567</p>
              <p>GreenMart HQ, Connaught Place, New Delhi</p>
            </div>
          </div>

          {/* Shop by Category */}
          <div className="col-span-1 mb-8 md:mb-0">
            <h4 className="font-bold text-neutral-800 dark:text-neutral-100 mb-4 text-sm">Shop by Category</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/search?category=Grocery" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Grocery & Kirana</Link></li>
              <li><Link href="/search?category=Medical" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Medical & Pharmacy</Link></li>
              <li><Link href="/search?category=Stationery" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Stationery & Books</Link></li>
              <li><Link href="/search?category=Dairy" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Bakery & Dairy</Link></li>
              <li><Link href="/search?category=Personal+Care" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Personal Care</Link></li>
              <li><Link href="/search?category=Electronics" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link href="/search?category=Fashion" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Clothing & Fashion</Link></li>
              <li><Link href="/search" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">All Categories</Link></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className="col-span-1 mb-8 md:mb-0">
            <h4 className="font-bold text-neutral-800 dark:text-neutral-100 mb-4 text-sm">Useful Links</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/support" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/support?tab=contact" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/support?tab=faq" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="/support?tab=shipping" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/support?tab=returns" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/support?tab=privacy" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/support?tab=terms" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Download App */}
          <div className="col-span-1">
            <h4 className="font-bold text-neutral-800 dark:text-neutral-100 mb-4 text-sm">Download Our App</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Get the best experience on our app</p>
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <a href={BRAND_CONFIG.links.androidApp} className="block w-[130px] h-[40px] bg-neutral-900 rounded-md border border-neutral-700 flex items-center justify-center text-white text-[10px]">
                  [Google Play Image]
                </a>
                <a href={BRAND_CONFIG.links.iosApp} className="block w-[130px] h-[40px] bg-neutral-900 rounded-md border border-neutral-700 flex items-center justify-center text-white text-[10px]">
                  [App Store Image]
                </a>
              </div>
              <div className="w-[90px] h-[90px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md flex items-center justify-center">
                 <div className="text-center text-[10px] text-neutral-400">QR<br/>Code</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            © 2026 {BRAND_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
             {/* Payment Methods placeholders */}
             <div className="text-xs font-bold italic">VISA</div>
             <div className="text-xs font-bold italic">MasterCard</div>
             <div className="text-xs font-bold italic">UPI</div>
             <ShieldCheck size={20} className="text-success" />
          </div>
        </div>
      </div>
    </footer>
  );
};
