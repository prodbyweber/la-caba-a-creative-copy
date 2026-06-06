import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MarcasHero from "@/components/marcas/MarcasHero";
import MarcasDiferenciador from "@/components/marcas/MarcasDiferenciador";
import MarcasServicios from "@/components/marcas/MarcasServicios";
import MarcasSectores from "@/components/marcas/MarcasSectores";
import MarcasManifiesto from "@/components/marcas/MarcasManifiesto";
import MarcasContacto from "@/components/marcas/MarcasContacto";
import StartFooter from "@/components/start/StartFooter";
import StickyCtaBar from "@/components/start/StickyCtaBar";
import ApplicationModal from "@/components/start/ApplicationModal";

const LOGO = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/cabana-creative-logo-simple.png";

export default function Marcas() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

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
      position: "relative",
    }}>
      {/* Fixed Logo Header */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "80px",
        background: "rgba(8,8,8,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        paddingLeft: "clamp(24px, 6vw, 64px)",
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            height: "45px",
          }}
        >
          <img 
            src={LOGO} 
            alt="Cabaña Creative" 
            style={{
              height: "100%",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </button>
      </div>
      {/* 1. Hero */}
      <div style={{ marginTop: "80px" }}>
        <MarcasHero />
      </div>

      {/* 2. Sectores (moved up) */}
      <MarcasSectores />

      {/* 3. Diferenciador */}
      <MarcasDiferenciador />

      {/* 4. Servicios */}
      <MarcasServicios />

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