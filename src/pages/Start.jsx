import React, { useEffect } from "react";
import StartNav from "@/components/start/StartNav";
import StartHero from "@/components/start/StartHero";
import StartBrandsCarousel from "@/components/start/StartBrandsCarousel";
import StartWhatWeDo from "@/components/start/StartWhatWeDo";
import ProblemSolution from "@/components/start/ProblemSolution";
import DeliverablesAndProcess from "@/components/start/DeliverablesAndProcess";
import StartCreadores from "@/components/start/StartCreadores";
import StartExplorar from "@/components/start/StartExplorar";
import PricingPlans from "@/components/start/PricingPlans";
import FAQSection from "@/components/start/FAQSection";
import StartChoosePath from "@/components/start/StartChoosePath";
import StickyCtaBar from "@/components/start/StickyCtaBar";
import StartFooter from "@/components/start/StartFooter";

export default function Start() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{
      background: "#080808",
      color: "#f0ede8",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      overflowX: "hidden",
      minHeight: "100dvh",
    }}>
      <StartNav />

      {/* 1. Hero */}
      <StartHero />

      {/* 2. Social proof bar */}
      <section style={{
        background: "#0a0a0a",
        padding: "36px 0",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <p style={{
          textAlign: "center",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(240,237,232,0.18)",
          marginBottom: "20px",
          fontFamily: "'Helvetica Neue', sans-serif",
        }}>
          Artistas, marcas y sellos que han confiado en nosotros
        </p>
        <StartBrandsCarousel />
      </section>

      {/* 3. Quiénes somos */}
      <StartWhatWeDo />

      {/* 4. Problema → Solución */}
      <ProblemSolution />

      {/* 5. Deliverables + Proceso */}
      <DeliverablesAndProcess />

      {/* 6. Creadores / Testimonios */}
      <StartCreadores hideServices />

      {/* 7. Resultados / Casos */}
      <StartExplorar showButton={false} />

      {/* 8. Pricing */}
      <PricingPlans />

      {/* 9. FAQ */}
      <FAQSection />

      {/* 10. CTA Final + formulario */}
      <div id="contacto">
        <StartChoosePath />
      </div>

      <StartFooter />

      {/* Mobile sticky CTA */}
      <StickyCtaBar />
    </div>
  );
}