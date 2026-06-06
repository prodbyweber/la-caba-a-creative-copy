import React, { useEffect, useState } from "react";
import MarcasHero from "@/components/marcas/MarcasHero";
import MarcasDiferenciador from "@/components/marcas/MarcasDiferenciador";
import MarcasServicios from "@/components/marcas/MarcasServicios";
import MarcasSectores from "@/components/marcas/MarcasSectores";
import MarcasManifiesto from "@/components/marcas/MarcasManifiesto";
import MarcasContacto from "@/components/marcas/MarcasContacto";
import StartFooter from "@/components/start/StartFooter";
import StickyCtaBar from "@/components/start/StickyCtaBar";
import ApplicationModal from "@/components/start/ApplicationModal";

export default function Marcas() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
      {/* 1. Hero */}
      <MarcasHero />

      {/* 2. Diferenciador */}
      <MarcasDiferenciador />

      {/* 3. Servicios */}
      <MarcasServicios />

      {/* 4. Sectores */}
      <MarcasSectores />

      {/* 5. Manifiesto */}
      <MarcasManifiesto />

      {/* 6. Contacto */}
      <div id="contacto">
        <MarcasContacto />
      </div>

      <StartFooter />

      {/* Mobile sticky CTA */}
      <StickyCtaBar />

      {/* Application Modal */}
      <ApplicationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}