import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Hero from "@/components/landing/Hero";
import PlatformPreview from "@/components/landing/PlatformPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import ForSeriousArtists from "@/components/landing/ForSeriousArtists";
import MembershipPlans from "@/components/landing/MembershipPlans";
import FinalCTA from "@/components/landing/FinalCTA";
import ServicesCarousel from "@/components/landing/ServicesCarousel";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      if (configs.length > 0) return configs[0];
      
      return {
        sections_order: ["hero", "services", "features", "howItWorks", "forSeriousArtists", "platformPreview", "membershipPlans", "finalCTA"],
        sections_enabled: {
          hero: true,
          services: true,
          features: true,
          howItWorks: true,
          forSeriousArtists: true,
          platformPreview: true,
          membershipPlans: true,
          finalCTA: true
        }
      };
    },
    staleTime: 60000
  });

  const sectionComponents = {
    hero: (props) => <Hero config={config} {...props} />,
    services: ServicesCarousel,
    features: Features,
    howItWorks: HowItWorks,
    forSeriousArtists: ForSeriousArtists,
    platformPreview: PlatformPreview,
    membershipPlans: MembershipPlans,
    finalCTA: FinalCTA
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
        <LandingNav />
        <main>
          <Hero config={config} />
          <ServicesCarousel />
          <Features />
          <HowItWorks />
          <ForSeriousArtists />
          <PlatformPreview />
          <MembershipPlans />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <LandingNav />
      
      <main>
        {config.sections_order.map((sectionKey) => {
          if (!config.sections_enabled[sectionKey]) return null;
          const SectionComponent = sectionComponents[sectionKey];
          return SectionComponent ? <SectionComponent key={sectionKey} /> : null;
        })}
      </main>

      <Footer />
    </div>
  );
}