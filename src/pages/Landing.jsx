import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import Hero from "@/components/landing/Hero";
import BrandsCarousel from "@/components/landing/BrandsCarousel";
import HeroBanners from "@/components/landing/HeroBanners";
import StoriesSection from "@/components/landing/StoriesSection.jsx";

import AboutSection from "@/components/landing/AboutSection.jsx";
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
      
      <main>
        <Hero config={config} />
        <BrandsCarousel logos={config?.brand_logos} />
        <HeroBanners />
        <div id="about"><AboutSection /></div>
        <div id="stories"><StoriesSection /></div>

      </main>

      <Footer />
    </div>
  );
}