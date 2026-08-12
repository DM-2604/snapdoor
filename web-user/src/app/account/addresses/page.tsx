"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home as HomeIcon,
  Briefcase,
  Heart,
  Gift,
  MoreVertical,
  ChevronRight,
  Headphones,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/store/useStore";

export default function MyAddressesPage() {
  const { incrementCart } = useStore();

  const [addresses, setAddresses] = useState([
    {
      id: "1",
      title: "Home",
      isDefault: true,
      name: "Rahul Sharma",
      mobile: "+91 98765 43210",
      line1: "101, Park View Apartments, Connaught Place",
      city: "New Delhi",
      pincode: "110001",
      state: "Delhi",
      icon: HomeIcon,
    },
    {
      id: "2",
      title: "Work",
      isDefault: false,
      name: "Rahul Sharma",
      mobile: "+91 97123 45678",
      line1: "C-45, Sector 62",
      city: "Noida",
      pincode: "201301",
      state: "Uttar Pradesh",
      icon: Briefcase,
    },
    {
      id: "3",
      title: "Parents Home",
      isDefault: false,
      name: "Rahul Sharma",
      mobile: "+91 98123 65432",
      line1: "12, Model Town",
      city: "Ludhiana",
      pincode: "141002",
      state: "Punjab",
      icon: Heart,
    },
    {
      id: "4",
      title: "Gift Address",
      isDefault: false,
      name: "Rahul Sharma",
      mobile: "+91 99999 88888",
      line1: "52, Green Park Extension",
      city: "New Delhi",
      pincode: "110016",
      state: "Delhi",
      icon: Gift,
    },
  ]);

  const recommendations = [
    { name: "Fortune Sunlite Oil", pack: "1 L", price: 145, icon: "🌻" },
    { name: "Tata Salt Iodised", pack: "1 kg", price: 20, icon: "🧂" },
    { name: "Aashirvaad Whole Wheat Atta", pack: "5 kg", price: 265, icon: "🌾" },
    { name: "Ariel Matic Front Load", pack: "1.5 kg", price: 487, icon: "🧺" },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <Link href="/account" className="hover:text-primary">My Account</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">My Addresses</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Account Sidebar */}
          <AccountSidebar activeTab="addresses" />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">My Addresses</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Manage your saved addresses for a faster checkout experience.</p>
              </div>

              <button 
                onClick={() => alert("Opening Add New Address Modal...")}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus size={16} />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => {
                const IconComponent = addr.icon;

                return (
                  <div
                    key={addr.id}
                    className={`bg-white dark:bg-neutral-900 border-2 rounded-2xl p-5 shadow-xs space-y-4 relative flex flex-col justify-between transition-all ${
                      addr.isDefault
                        ? "border-primary/80 bg-emerald-50/20"
                        : "border-neutral-200 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-primary flex items-center justify-center font-bold">
                            <IconComponent size={16} />
                          </div>
                          <span className="font-extrabold text-neutral-900 dark:text-white text-xs">{addr.title}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {addr.isDefault ? (
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Default
                            </span>
                          ) : (
                            <button
                              onClick={() => setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === addr.id })))}
                              className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 hover:text-primary bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider transition-colors"
                            >
                              Set as Default
                            </button>
                          )}
                          <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs">{addr.name}</h4>
                        <p className="text-neutral-600 dark:text-neutral-400 text-[11px] font-medium">{addr.line1}</p>
                        <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                          {addr.city} - {addr.pincode}, {addr.state}
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-400 text-[11px] pt-1">
                          Mobile: <strong className="text-neutral-800 dark:text-neutral-100">{addr.mobile}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">
                      <button 
                        onClick={() => alert(`Opening Edit Modal for ${addr.title} address.`)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => setAddresses(addresses.filter(a => a.id !== addr.id))}
                        className="flex items-center gap-1 hover:text-danger transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Summary Panel */}
          <div className="w-full md:w-72 space-y-6 shrink-0">
            
            {/* Deliver to More Places Box */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <MapPin size={16} />
                <span>Deliver to more places</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Save multiple addresses and enjoy faster checkouts for your home, office or loved ones.
              </p>
            </div>

            {/* You Might Also Like */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">You might also like</h4>
                <Link href="/search" className="text-primary font-bold text-[11px] hover:underline">View All</Link>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-neutral-50 last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{rec.icon}</span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-neutral-800 dark:text-neutral-100 truncate text-[11px]">{rec.name}</h5>
                        <p className="text-[10px] text-neutral-400">{rec.pack}</p>
                        <span className="font-extrabold text-neutral-900 dark:text-white text-[11px]">₹{rec.price}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => incrementCart(rec.name)}
                      className="px-2.5 py-1 text-[11px] font-bold text-primary border border-primary/50 hover:bg-primary hover:text-white rounded-lg transition-colors shrink-0"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Need Help? Box */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-primary flex items-center justify-center mx-auto">
                <Headphones size={20} />
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-neutral-900 dark:text-white text-xs">Need Help?</h5>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Our customer support is available 24/7 to assist you.
                </p>
              </div>
              <button className="w-full py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-100 font-bold rounded-xl text-xs transition-colors">
                Contact Support
              </button>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
