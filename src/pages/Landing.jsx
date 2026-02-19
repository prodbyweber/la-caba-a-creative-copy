import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import Hero from "@/components/landing/Hero";
import OffersCarousel from "@/components/landing/OffersCarousel";
import BrandsCarousel from "@/components/landing/BrandsCarousel";
import StoriesSection from "@/components/landing/StoriesSection";
import StartupsSection from "@/components/landing/StartupsSection";
import DashboardPreview from "@/components/landing/DashboardPreview";
import ExploracionSection from "@/components/landing/ExploracionSection";
import AboutSection from "@/components/landing/AboutSection";
import TeamSection from "@/components/landing/TeamSection";
import MemberBanner from "@/components/landing/MemberBanner";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  const { data: config } = useQuery({
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
        <AboutSection />
        <TeamSection />
        <div id="stories"><StoriesSection /></div>
        <div id="offers"><OffersCarousel /></div>
        <DashboardPreview />
        <div id="exploracion"><ExploracionSection /></div>
        <div id="startups"><StartupsSection /></div>
        <MemberBanner />
      </main>

      <Footer />
    </div>
  );
}