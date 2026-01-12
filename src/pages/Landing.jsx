import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Hero from "@/components/landing/Hero";
import PlatformPreview from "@/components/landing/PlatformPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import ForSeriousArtists from "@/components/landing/ForSeriousArtists";
import MembershipPlans from "@/components/landing/MembershipPlans";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <LandingNav />
      
      <main>
        <Hero />
        <PlatformPreview />
        <HowItWorks />
        <Features />
        <ForSeriousArtists />
        <MembershipPlans />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}