import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import Hero from "@/components/landing/Hero";
import OffersCarousel from "@/components/landing/OffersCarousel";
import BrandsCarousel from "@/components/landing/BrandsCarousel";
import StoriesSection from "@/components/landing/StoriesSection.jsx";
import DashboardPreview from "@/components/landing/DashboardPreview";

import AboutSection from "@/components/landing/AboutSection.jsx";
import TeamSection from "@/components/landing/TeamSection";
import MemberBanner from "@/components/landing/MemberBanner";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  const { data: config, isLoading } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <LandingNav />
      
      {isLoading && (
        <div className="min-h-[500px] flex items-center justify-center bg-black">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {!isLoading && (
        <main>
          <Hero config={config} />
        <BrandsCarousel logos={config?.brand_logos} />
        <div id="about"><AboutSection /></div>
        <div id="team"><TeamSection /></div>
        <div id="stories"><StoriesSection /></div>
        <div id="offers"><OffersCarousel /></div>
        <DashboardPreview />

        </main>
      )}

      <Footer />
    </div>
  );
}