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
import LandingContact from "@/components/landing/LandingContact";
import LandingStickyNav from "@/components/landing/LandingStickyNav";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import SplashScreen from "@/components/common/SplashScreen";

const SnapSection = ({ children }) => (
  <div style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}>
    {children}
  </div>
);

// Sección libre: entra en el snap flow pero NO fuerza stop, permite scroll libre interno
const FreeSection = ({ children }) => (
  <div style={{ scrollSnapAlign: "none" }}>
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
        minHeight: "100dvh",
      }}
    >
      <SplashScreen />
      
      {/* Nav original de la landing (con menú hamburguesa, botón Explorar, perfil, registro) */}
      <LandingNav />

      {/* Sticky scroll nav de Landing */}
      <LandingStickyNav />

      <div>
        <LandingHero bottomOffset="clamp(90px, 12vw, 140px)" />
        <StartExplorar showButton={true} allowMobileScroll={true} />
        <StartCreadores hideServices />
        <StartWhatWeDo />
        <StartChoosePath />
        <LandingContact />
        <StartFooter />
      </div>

      <MobileBottomNav artistId={null} isAdmin={isAdmin} />
    </div>
  );
}