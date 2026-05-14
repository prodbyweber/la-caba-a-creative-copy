import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import StartWhatWeDo from "@/components/start/StartWhatWeDo";
import StartCreadores from "@/components/start/StartCreadores";
import StartExplorar from "@/components/start/StartExplorar";
import StartChoosePath from "@/components/start/StartChoosePath";
import StartFooter from "@/components/start/StartFooter";
import LandingStickyNav from "@/components/landing/LandingStickyNav";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import SplashScreen from "@/components/common/SplashScreen";

// Sección snap: ocupa exactamente 100dvh y centra el contenido
const SnapSection = ({ children }) => (
  <div style={{
    scrollSnapAlign: "start",
    scrollSnapStop: "always",
    height: "100dvh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  }}>
    {children}
  </div>
);

export default function Landing() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => { if (u?.role === 'admin') setIsAdmin(true); }).catch(() => {});
    const timer = setTimeout(() => {
      const splash = document.getElementById("cabana-splash");
      if (splash) {
        splash.style.opacity = "0";
        splash.style.pointerEvents = "none";
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        background: "#080808",
        color: "#f0ede8",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        overflowX: "hidden",
        // Contenedor principal con snap scroll estilo TikTok
        height: "100dvh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <SplashScreen />

      {/* Nav fijo sobre el contenido */}
      <LandingNav />
      <LandingStickyNav />

      {/* Hero — snap */}
      <SnapSection>
        <LandingHero bottomOffset="clamp(90px, 12vw, 140px)" />
      </SnapSection>

      {/* Explorar — scroll libre, sin snap */}
      <div style={{ scrollSnapAlign: "none" }}>
        <StartExplorar showButton={true} allowMobileScroll={true} />
      </div>

      {/* Resto de secciones — snap */}
      <SnapSection><StartCreadores /></SnapSection>
      <SnapSection><StartWhatWeDo /></SnapSection>
      <SnapSection><StartChoosePath /></SnapSection>
      <SnapSection><StartFooter /></SnapSection>

      <MobileBottomNav artistId={null} isAdmin={isAdmin} />
    </div>
  );
}