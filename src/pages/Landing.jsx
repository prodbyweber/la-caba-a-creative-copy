import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import StartWhatWeDo from "@/components/start/StartWhatWeDo";
import StartCreadores from "@/components/start/StartCreadores";
import StartExplorar from "@/components/start/StartExplorar";
import StartChoosePath from "@/components/start/StartChoosePath";
import StartFooter from "@/components/start/StartFooter";
import LandingStickyNav from "@/components/landing/LandingStickyNav";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import SplashScreen from "@/components/common/SplashScreen";

const SnapSection = ({ children }) => (
  <div style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}>
    {children}
  </div>
);

export default function Landing() {
  const { data: config } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  useEffect(() => {
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

      <style>{`
        .snap-scroll-container {
          overflow-x: hidden;
        }
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
        <SnapSection><Hero config={config} /></SnapSection>
        <SnapSection><StartExplorar showButton={true} allowMobileScroll={true} /></SnapSection>
        <SnapSection><StartCreadores /></SnapSection>
        <SnapSection><StartWhatWeDo /></SnapSection>
        <SnapSection><StartChoosePath /></SnapSection>
        <SnapSection><StartFooter /></SnapSection>
      </div>

      <MobileBottomNav artistId={null} isAdmin={false} />
    </div>
  );
}