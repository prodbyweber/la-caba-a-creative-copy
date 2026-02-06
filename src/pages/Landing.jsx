import React from "react";
import Hero from "@/components/landing/Hero";
import OffersCarousel from "@/components/landing/OffersCarousel";
import FilterSection from "@/components/landing/FilterSection";
import LocationSection from "@/components/landing/LocationSection";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/landing/Footer";

export default function Landing() {

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <LandingNav />
      
      <main>
        <Hero />
        <OffersCarousel />
        <FilterSection />
        <LocationSection />
      </main>

      <Footer />
    </div>
  );
}