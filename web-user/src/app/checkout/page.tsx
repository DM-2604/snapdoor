"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  Lock,
  Plus,
  Edit2,
  Truck,
  Zap,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { FaGooglePay, FaPaypal } from "react-icons/fa";
import { SiPhonepe, SiPaytm } from "react-icons/si";
import { useStore } from "@/store/useStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems } = useStore();
  const [selectedAddress, setSelectedAddress] = useState("home");
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [instructions, setInstructions] = useState("");

  const subtotal = 617;
  const discount = couponApplied ? 100 : 81;
  const deliveryCharge = deliveryOption === "express" ? 49 : 0;
  const platformFee = 10;
  const totalAmount = subtotal - discount + deliveryCharge + platformFee;

  const handlePlaceOrder = () => {
    router.push("/account/orders/GM1234567890/track");
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <Link href="/cart" className="hover:text-primary">Cart</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Checkout</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-6">
        
        {/* Step Progress Bar */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary text-white font-black flex items-center justify-center text-xs shadow-md">
              1
            </div>
            <span className="font-extrabold text-neutral-900 dark:text-white text-xs">Delivery Address</span>
          </div>

          <div className="h-0.5 w-12 md:w-24 bg-primary/40 shrink-0 mx-2" />

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-bold flex items-center justify-center text-xs">
              2
            </div>
            <span className="font-semibold text-neutral-500 dark:text-neutral-400 text-xs">Payment Method</span>
          </div>

          <div className="h-0.5 w-12 md:w-24 bg-neutral-200 shrink-0 mx-2" />

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-bold flex items-center justify-center text-xs">
              3
            </div>
            <span className="font-semibold text-neutral-500 dark:text-neutral-400 text-xs">Review & Place Order</span>
          </div>

          <div className="h-0.5 w-12 md:w-24 bg-neutral-200 shrink-0 mx-2" />

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-bold flex items-center justify-center text-xs">
              4
            </div>
            <span className="font-semibold text-neutral-500 dark:text-neutral-400 text-xs">Order Confirmed</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Address + Delivery Options */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: Delivery Address */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-extrabold text-neutral-900 dark:text-white text-sm">
                <MapPin size={18} className="text-primary" />
                <h3>Delivery Address</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Home Address Card */}
                <div
                  onClick={() => setSelectedAddress("home")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative space-y-2 ${
                    selectedAddress === "home"
                      ? "border-primary bg-emerald-50/40 shadow-xs"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full inline-block ${selectedAddress === "home" ? "bg-primary" : "bg-neutral-300"}`} />
                      <span className="font-extrabold text-xs text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        HOME
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                      Default
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">Rahul Sharma</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 font-medium text-[11px]">+91 98765 43210</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-1 leading-relaxed">
                      101, Park View Apartments, Connaught Place<br />
                      New Delhi - 110001, Delhi
                    </p>
                  </div>
                </div>

                {/* Work Address Card */}
                <div
                  onClick={() => setSelectedAddress("work")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative space-y-2 ${
                    selectedAddress === "work"
                      ? "border-primary bg-emerald-50/40 shadow-xs"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full inline-block ${selectedAddress === "work" ? "bg-primary" : "bg-neutral-300"}`} />
                      <span className="font-extrabold text-xs text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        WORK
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">Rahul Sharma</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 font-medium text-[11px]">+91 98765 43210</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-1 leading-relaxed">
                      Tower B, Cyber City, DLF Phase 2<br />
                      Gurugram - 122002, Haryana
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Instructions */}
              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-neutral-700 dark:text-neutral-300 text-[11px]">
                  Delivery Instructions (Optional)
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    maxLength={150}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="E.g. Please ring the bell, leave near the gate, etc."
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-primary text-neutral-800 dark:text-neutral-100 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                  <span className="absolute right-3 bottom-2 text-[10px] text-neutral-400 font-medium">
                    {instructions.length}/150
                  </span>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <label className="font-bold text-neutral-800 dark:text-neutral-100 text-xs block">Delivery Options</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Standard Delivery */}
                  <div
                    onClick={() => setDeliveryOption("standard")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      deliveryOption === "standard"
                        ? "border-primary bg-emerald-50/50"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        deliveryOption === "standard" ? "border-primary bg-primary" : "border-neutral-400"
                      }`}>
                        {deliveryOption === "standard" && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck size={20} className="text-emerald-700" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Standard Delivery</h4>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Delivery in 20-30 min</p>
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-primary">FREE</span>
                  </div>

                  {/* Express Delivery */}
                  <div
                    onClick={() => setDeliveryOption("express")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      deliveryOption === "express"
                        ? "border-primary bg-emerald-50/50"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        deliveryOption === "express" ? "border-primary bg-primary" : "border-neutral-400"
                      }`}>
                        {deliveryOption === "express" && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap size={20} className="text-amber-500 fill-amber-500" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Express Delivery</h4>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Delivery in 10-15 min</p>
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-neutral-900 dark:text-white">₹49</span>
                  </div>

                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="font-bold text-neutral-800 dark:text-neutral-100 text-xs">Have a coupon code?</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="px-3 py-1.5 uppercase bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-primary w-36 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                    <button
                      onClick={() => setCouponApplied(true)}
                      className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors text-xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg w-full sm:w-auto justify-center">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>You will save <strong className="text-primary">₹{discount}</strong></span>
                </div>
              </div>

            </div>

            {/* Section 2: Payment Method */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2 font-extrabold text-neutral-900 dark:text-white text-sm">
                  <Lock size={18} className="text-primary" />
                  <h3>Payment Method</h3>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck size={14} />
                  <span>100% Secure Payments</span>
                </div>
              </div>

              <div className="space-y-3">
                
                {/* UPI Option */}
                <div
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "border-primary bg-emerald-50/40"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "upi" ? "border-primary bg-primary" : "border-neutral-400"
                      }`}>
                        {paymentMethod === "upi" && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900" />}
                      </div>
                      <span className="font-extrabold text-neutral-900 dark:text-white text-xs">UPI</span>
                    </div>
                    
                    {/* UPI Icons */}
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-blue-600">GPay</span>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-purple-700">PhonePe</span>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-cyan-600">Paytm</span>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-amber-600">BHIM</span>
                    </div>
                  </div>
                </div>

                {/* Credit / Debit Card Option */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-primary bg-emerald-50/40"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "card" ? "border-primary bg-primary" : "border-neutral-400"
                      }`}>
                        {paymentMethod === "card" && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900" />}
                      </div>
                      <span className="font-extrabold text-neutral-900 dark:text-white text-xs">Credit / Debit Card</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-blue-800">VISA</span>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-red-600">Mastercard</span>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-emerald-700">RuPay</span>
                    </div>
                  </div>
                </div>

                {/* Net Banking */}
                <div
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === "netbanking"
                      ? "border-primary bg-emerald-50/40"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "netbanking" ? "border-primary bg-primary" : "border-neutral-400"
                      }`}>
                        {paymentMethod === "netbanking" && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900" />}
                      </div>
                      <span className="font-extrabold text-neutral-900 dark:text-white text-xs">Net Banking</span>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400" />
                  </div>
                </div>

                {/* Wallets */}
                <div
                  onClick={() => setPaymentMethod("wallet")}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === "wallet"
                      ? "border-primary bg-emerald-50/40"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "wallet" ? "border-primary bg-primary" : "border-neutral-400"
                      }`}>
                        {paymentMethod === "wallet" && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900" />}
                      </div>
                      <span className="font-extrabold text-neutral-900 dark:text-white text-xs">Wallets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-cyan-600">Paytm</span>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-purple-700">PhonePe</span>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === "cod"
                      ? "border-primary bg-emerald-50/40"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "cod" ? "border-primary bg-primary" : "border-neutral-400"
                      }`}>
                        {paymentMethod === "cod" && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900" />}
                      </div>
                      <div>
                        <span className="font-extrabold text-neutral-900 dark:text-white text-xs block">Cash on Delivery</span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Pay on delivery</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Safe & Secure Box */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-3 text-emerald-900 text-[11px]">
                <ShieldCheck size={24} className="text-primary shrink-0" />
                <div>
                  <h5 className="font-bold">Safe & Secure Payments</h5>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-400">
                    Your payment information is 100% secure and encrypted.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4 sticky top-24">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">Order Summary</h3>
                <Link href="/cart" className="text-primary font-bold text-xs hover:underline">
                  Edit Cart
                </Link>
              </div>

              {/* Items preview list */}
              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h5 className="font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1">{item.name}</h5>
                        <p className="text-[10px] text-neutral-400">{item.pack} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-neutral-900 dark:text-white">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800/80 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900 dark:text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Item Discount</span>
                  <span>- ₹{discount}</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600">{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Platform Fee</span>
                  <span className="font-bold text-neutral-900 dark:text-white">₹{platformFee}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">Total Amount</span>
                  <span className="text-xl font-black text-neutral-900 dark:text-white">₹{totalAmount}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  ₹{discount} saved
                </span>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={handlePlaceOrder}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock size={16} />
                <span>Place Order</span>
              </button>

              <p className="text-[10px] text-center text-neutral-400">
                By placing this order, you agree to our{" "}
                <Link href="/support?tab=terms" className="underline hover:text-primary transition-colors">Terms &amp; Conditions</Link>
                {" "}&amp;{" "}
                <Link href="/support?tab=privacy" className="underline hover:text-primary transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}
