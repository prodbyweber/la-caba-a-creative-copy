import React, { useState, useEffect } from "react";

export default function StickyCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      const heroEl = document.getElementById("hero");
      const contactEl = document.getElementById("contacto");
      const scrollY = window.scrollY;
      const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight - 80 : 500;
      const contactTop = contactEl ? contactEl.offsetTop - window.innerHeight + 100 : Infinity;
      setVisible(scrollY > heroBottom && scrollY < contactTop);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);

  const openModal = () => {
    window.dispatchEvent(new CustomEvent("open-application-modal"));
  };

  return (
    <>
      <style>{`
        .sticky-cta-bar {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        @media (max-width: 767px) {
          .sticky-cta-bar {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        }
      `}</style>
      <div
        className="sticky-cta-bar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 8000,
          padding: "10px 20px calc(10px + env(safe-area-inset-bottom, 0px))",
          background: "rgba(8,8,8,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          transform: visible ? "translateY(0)" : "translateY(110%)",
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <button
          onClick={openModal}
          style={{
            width: "100%",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "0.9rem",
            letterSpacing: "0.01em",
            background: "#ff5833",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "14px 24px",
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#e04a28"}
          onMouseLeave={e => e.currentTarget.style.background = "#ff5833"}
        >
          Solicitar plaza →
        </button>
      </div>
    </>
  );
}