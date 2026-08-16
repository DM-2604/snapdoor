"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/home/HeroBanner";
import { UspBar } from "@/components/home/UspBar";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { StoreCarousel } from "@/components/home/StoreCarousel";
import { PromoBanners } from "@/components/home/PromoBanners";
import { useLocationStore } from "@/stores/location.store";

export default function Home() {
  const { permissionRequested, openModal } = useLocationStore();

  // On first visit, auto-open location modal
  useEffect(() => {
    if (!permissionRequested) {
      openModal();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <CategoryNav />
      <HeroBanner />
      <UspBar />
      <CategoryGrid />
      <StoreCarousel />
      <PromoBanners />
      <Footer />
    </main>
  );
}
