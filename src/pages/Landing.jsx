import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import LandingNav from "@/components/landing/LandingNav";
import StartHero from "@/components/start/StartHero";
import StartWhatWeDo from "@/components/start/StartWhatWeDo";
import StartBrandsCarousel from "@/components/start/StartBrandsCarousel";
import StartCreadores from "@/components/start/StartCreadores";
import StartBrands from "@/components/start/StartBrands";
import StartExplorar from "@/components/start/StartExplorar";
import StartChoosePath from "@/components/start/StartChoosePath";
import StartFooter from "@/components/start/StartFooter";
import StickyNav from "@/components/start/StickyNav";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

export default function Landing() {
  return (
    <div
      style={{
        background: "#080808",
        color: "#f0ede8",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        overflowX: "hidden",
        minHeight: "100dvh",
      }}
    >
      {/* Nav original de la landing (con menú hamburguesa, botón Explorar, perfil, registro) */}
      <LandingNav />

      {/* Sticky scroll nav del Start */}
      <StickyNav />

      <style>{`
        @media (max-width: 767px) {
          .snap-scroll-container {
            height: 100dvh;
            overflow-y: scroll;
            scroll-snap-type: y mandatory;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-y: contain;
          }
          .snap-section-full {
            scroll-snap-align: start;
            scroll-snap-stop: always;
            height: 100dvh;
            overflow: hidden;
          }
          .snap-section-auto {
            scroll-snap-align: start;
            scroll-snap-stop: always;
            height: auto;
            overflow: hidden;
          }
        }
      `}</style>

      <div className="snap-scroll-container">
        <div className="snap-section-full"><StartHero /></div>
        <div className="snap-section-auto"><StartExplorar /></div>
        <div className="snap-section-full"><StartWhatWeDo /></div>
        <div className="snap-section-auto"><StartBrandsCarousel /></div>
        <div className="snap-section-full"><StartCreadores /></div>
        <div className="snap-section-full"><StartChoosePath /></div>

        <div className="snap-section-auto"><StartFooter /></div>
      </div>

      <MobileBottomNav artistId={null} isAdmin={false} />
    </div>
  );
}