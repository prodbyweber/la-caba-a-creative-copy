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
      <StartHero />
      <StartWhatWeDo />
      <StartBrandsCarousel />
      <StartArtists />
      <StartBrands />
      <StartChoosePath />
      <StartFooter />
    </div>
  );
}