"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Star, Edit3, Trash2, ChevronRight, CheckCircle2 } from "lucide-react";

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("published");

  const reviews = [
    {
      id: "1",
      item: "Aashirvaad Whole Wheat Atta 5kg",
      type: "Product",
      rating: 5,
      comment: "Superb quality atta! Rotis turn out extremely soft and fresh every time. Highly recommended.",
      date: "14 May 2024",
      icon: "🌾",
    },
    {
      id: "2",
      item: "Gupta Kirana Store",
      type: "Store",
      rating: 5,
      comment: "Super fast 20-min delivery and genuine packed products. Best local grocery store in Connaught Place!",
      date: "12 May 2024",
      icon: "🏪",
    },
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
        <span className="text-neutral-900 dark:text-white font-bold">My Reviews</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar activeTab="reviews" />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* Header Bar */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">My Reviews & Ratings</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Manage feedback you submitted for products and local store partners</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 font-bold text-xs">
              <button
                onClick={() => setActiveTab("published")}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === "published"
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                Published Reviews (2)
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === "pending"
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                Pending Reviews (1)
              </button>
            </div>

            {/* Published Reviews List */}
            {activeTab === "published" ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{rev.icon}</span>
                        <div>
                          <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">{rev.item}</h4>
                          <span className="text-[10px] text-neutral-400 font-medium">{rev.type} Review • {rev.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-neutral-800 dark:text-neutral-100 text-xs">
                        <Star size={12} className="text-warning fill-warning" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed italic">&quot;{rev.comment}&quot;</p>

                    <div className="pt-2 flex items-center justify-end gap-3 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-danger transition-colors">
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌻</span>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Fortune Sunlite Refined Oil 1L</h4>
                    <p className="text-[10px] text-neutral-400">Delivered on 10 May 2024</p>
                  </div>
                </div>

                <button className="px-4 py-1.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors text-xs">
                  Write Review
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
