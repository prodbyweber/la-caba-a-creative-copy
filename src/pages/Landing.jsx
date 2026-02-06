import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Hero from "@/components/landing/Hero";
import OffersCarousel from "@/components/landing/OffersCarousel";
import FilterSection from "@/components/landing/FilterSection";
import LocationSection from "@/components/landing/LocationSection";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      if (configs.length > 0) {
        console.log('Loaded config:', configs[0]);
        return configs[0];
      }
      
      return {
        sections_order: ["hero", "features", "howItWorks", "forSeriousArtists", "platformPreview", "membershipPlans", "finalCTA"],
        sections_enabled: {
          hero: true,
          features: true,
          howItWorks: true,
          forSeriousArtists: true,
          platformPreview: true,
          membershipPlans: true,
          finalCTA: true
        }
      };
    },
    staleTime: 5000,
    refetchOnWindowFocus: true
  });

  const sectionComponents = {
    hero: (props) => <Hero config={config} {...props} />,
    features: (props) => <Features config={config} {...props} />,
    howItWorks: (props) => <HowItWorks config={config} {...props} />,
    forSeriousArtists: (props) => <ForSeriousArtists config={config} {...props} />,
    platformPreview: PlatformPreview,
    membershipPlans: (props) => <MembershipPlans config={config} {...props} />,
    finalCTA: (props) => <FinalCTA config={config} {...props} />
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <LandingNav />
      
      <main>
        <Hero config={config} />
        <OffersCarousel />
        <FilterSection />
        <LocationSection />
      </main>

      <Footer />
    </div>
  );
}