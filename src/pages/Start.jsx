import React from "react";
import StartNav from "@/components/start/StartNav";
import StartHero from "@/components/start/StartHero";
import StartWhatWeDo from "@/components/start/StartWhatWeDo";
import StartBrandsCarousel from "@/components/start/StartBrandsCarousel";
import StartArtists from "@/components/start/StartArtists";
import StartBrands from "@/components/start/StartBrands";
import StartChoosePath from "@/components/start/StartChoosePath";
import StartFooter from "@/components/start/StartFooter";
import StickyNav from "@/components/start/StickyNav";

const SnapSection = ({ children }) => (
  <div style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}>
    {children}
  </div>
);

export default function Start() {
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
      <StartNav />
      <StickyNav />

      {/* Mobile: TikTok-style scroll snap. Desktop: normal scroll */}
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
        <div className="snap-section-full"><StartWhatWeDo /></div>
        <div className="snap-section-auto"><StartBrandsCarousel /></div>
        <div className="snap-section-full"><StartArtists /></div>
        <div className="snap-section-full"><StartBrands /></div>
        <div className="snap-section-full"><StartChoosePath /></div>
        <div className="snap-section-auto"><StartFooter /></div>
      </div>
    </div>
  );
}