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

const SECTION_COMPONENTS = {
  explorar:    <StartExplorar key="explorar" showButton={true} allowMobileScroll={true} />,
  creadores:   <StartCreadores key="creadores" />,
  whatwedo:    <StartWhatWeDo key="whatwedo" />,
  choosepath:  <StartChoosePath key="choosepath" />,
  footer:      <StartFooter key="footer" />,
};

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

  const { data: config } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 60000,
  });

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

  // Build ordered section list from config
  const sectionsOrder = config?.sections_order?.length > 0
    ? config.sections_order
    : ["explorar", "creadores", "whatwedo", "choosepath", "footer"];
  const sectionsEnabled = config?.sections_enabled || {};
  const orderedSections = sectionsOrder
    .filter(key => sectionsEnabled[key] !== false)
    .map(key => SECTION_COMPONENTS[key])
    .filter(Boolean);

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
        {orderedSections}
      </div>

      <MobileBottomNav artistId={null} isAdmin={isAdmin} />
    </div>
  );
}