"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { ChevronRight, HelpCircle, Truck, RefreshCw, FileText, Lock, Headphones, MessageSquare, Mail, Phone } from "lucide-react";

function SupportContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("faq");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);


  const tabs = [
    { id: "faq", label: "FAQs", icon: HelpCircle },
    { id: "shipping", label: "Shipping & Delivery", icon: Truck },
    { id: "returns", label: "Returns & Refunds", icon: RefreshCw },
    { id: "terms", label: "Terms & Conditions", icon: FileText },
    { id: "privacy", label: "Privacy Policy", icon: Lock },
    { id: "contact", label: "Contact Us", icon: Headphones },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Help & Support</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white mb-4 px-3">Help Center</h2>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                    activeTab === tab.id
                      ? "bg-emerald-50 text-primary"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-950 hover:text-neutral-900 dark:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 bg-neutral-50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 md:p-8">
            
            {activeTab === "faq" && (
              <div className="space-y-6 text-sm">
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-neutral-800 dark:text-neutral-100 mb-1">How can I track my order?</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">You can track your order by going to "My Account" &gt; "Orders" and clicking on the "Track Order" button next to your active order.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-800 dark:text-neutral-100 mb-1">What payment methods do you accept?</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">We accept UPI, Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery (COD) for eligible orders.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-800 dark:text-neutral-100 mb-1">Can I modify my order after placing it?</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">Orders can only be modified or cancelled within 5 minutes of placing them before the store accepts it. Please contact support for urgent changes.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6 text-sm">
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">Shipping & Delivery</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">GreenMart offers rapid delivery services through our network of local partners. We aim to deliver within 30-45 minutes for hyper-local orders.</p>
                <h4 className="font-bold text-neutral-800 dark:text-neutral-100">Delivery Charges</h4>
                <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-400 space-y-1">
                  <li>Free delivery on orders above ₹500.</li>
                  <li>A flat fee of ₹30 applies to orders below ₹500.</li>
                  <li>Surge pricing may apply during bad weather or peak hours.</li>
                </ul>
              </div>
            )}

            {activeTab === "returns" && (
              <div className="space-y-6 text-sm">
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">Returns & Refunds</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">We offer a no-questions-asked return policy for most items within 48 hours of delivery.</p>
                <h4 className="font-bold text-neutral-800 dark:text-neutral-100">Non-returnable Items:</h4>
                <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-400 space-y-1">
                  <li>Perishable goods (fresh vegetables, milk).</li>
                  <li>Personal care items (if opened).</li>
                  <li>Undergarments and socks.</li>
                </ul>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">Refunds are processed within 3-5 business days to your original payment method or GreenMart Wallet.</p>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-6 text-sm">
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">Terms & Conditions</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">By using GreenMart, you agree to these terms and conditions. GreenMart is a marketplace connecting you with local vendors.</p>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">We reserve the right to suspend accounts that violate our fair usage policy, including excessive cancellations or fraudulent activities.</p>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6 text-sm">
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">Privacy Policy</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">Your privacy is important to us. We only collect information necessary to process your orders and improve our services.</p>
                <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-400 space-y-1">
                  <li>We do not sell your personal data to third parties.</li>
                  <li>Your payment information is securely processed by our payment gateways and is not stored on our servers.</li>
                </ul>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-8 text-sm">
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">Contact Us</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-primary dark:text-emerald-400 flex items-center justify-center mb-2">
                      <Phone size={24} />
                    </div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">Call Us</h4>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">Mon-Sun, 8 AM - 10 PM</p>
                    <a href="tel:+919876543210" className="text-primary font-bold mt-1">1800-123-4567</a>
                  </div>
                  
                  <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-primary dark:text-emerald-400 flex items-center justify-center mb-2">
                      <Mail size={24} />
                    </div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">Email Us</h4>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">We reply within 24 hours</p>
                    <a href="mailto:support@greenmart.com" className="text-primary font-bold mt-1">support@greenmart.com</a>
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Send us a message</h4>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="text" placeholder="Your Name" required className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none focus:border-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600" />
                      <input type="email" placeholder="Email Address" required className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none focus:border-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600" />
                    </div>
                    <textarea placeholder="How can we help you?" required rows={4} className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none focus:border-primary resize-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600"></textarea>
                    <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors">
                      Send Message
                    </button>
                  </form>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-neutral-400">Loading...</div>}>
      <SupportContent />
    </Suspense>
  );
}
