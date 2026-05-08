import React from "react";
import StartNav from "@/components/start/StartNav";
import StartHero from "@/components/start/StartHero";
import StartWhatWeDo from "@/components/start/StartWhatWeDo";
import StartArtists from "@/components/start/StartArtists";
import StartBrands from "@/components/start/StartBrands";
import StartShowcase from "@/components/start/StartShowcase";
import StartChoosePath from "@/components/start/StartChoosePath";
import StartCTA from "@/components/start/StartCTA";
import StartFooter from "@/components/start/StartFooter";

export default function Start() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#0c0c0c", color: "#f0ede8", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <StartNav />
      <StartHero />
      <StartWhatWeDo />
      <StartArtists />
      <StartBrands />
      <StartShowcase />
      <StartChoosePath />
      <StartCTA />
      <StartFooter />
    </div>
  );
}