import React, { useEffect, useState } from "react";
import StartNav from "@/components/start/StartNav";
import StartHero from "@/components/start/StartHero";
import StartBrandsCarousel from "@/components/start/StartBrandsCarousel";
import CatalogoCarousel from "@/components/start/CatalogoCarousel";
import ProblemSolution from "@/components/start/ProblemSolution";
import DeliverablesAndProcess from "@/components/start/DeliverablesAndProcess";
import StartCreadores from "@/components/start/StartCreadores";
import StartExplorar from "@/components/start/StartExplorar";
import PricingPlans from "@/components/start/PricingPlans";
import FAQSection from "@/components/start/FAQSection";
import StartChoosePath from "@/components/start/StartChoosePath";
import StickyCtaBar from "@/components/start/StickyCtaBar";
import StartFooter from "@/components/start/StartFooter";
import WhyStructure from "@/components/start/WhyStructure";
import HowItWorksAccordion from "@/components/start/HowItWorksAccordion";
import ApplicationModal from "@/components/start/ApplicationModal";

export default function Start() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Global event so any child component can open the modal
  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("open-application-modal", handler);
    return () => window.removeEventListener("open-application-modal", handler);
  }, []);

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

      {/* 1b. Why Structure */}
      <WhyStructure />

      {/* 1c. How It Works Accordion */}
      <HowItWorksAccordion />

      {/* 2. Social proof bar */}
      <section style={{
        background: "#0a0a0a",
        padding: "36px 0",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <StartBrandsCarousel />
      </section>

      {/* 2b. Catálogo de producciones */}
      <CatalogoCarousel />

      {/* 3. Problema → Solución */}
      <ProblemSolution />

      {/* 4. Deliverables + Proceso */}
      <DeliverablesAndProcess />

      {/* 5. Creadores / Testimonios */}
      <StartCreadores hideServices />

      {/* 6. Resultados / Casos */}
      <StartExplorar showButton={false} />

      {/* 7. Pricing */}
      <PricingPlans />

      {/* 8. FAQ */}
      <FAQSection />

      {/* 9. CTA Final + formulario */}
      <div id="contacto">
        <StartChoosePath />
      </div>

      <StartFooter />

      {/* Mobile sticky CTA */}
      <StickyCtaBar />

      {/* Application Modal — controlled from here */}
      <ApplicationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}