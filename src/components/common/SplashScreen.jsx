import React from "react";

export default function SplashScreen() {
  return (
    <div
      id="cabana-splash"
      style={{
        position: "fixed",
        inset: 0,
        background: "#080808",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: 1,
        transition: "opacity 0.4s ease-out",
      }}
    >
      <style>{`
        @keyframes cabanaFadeIn {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes cabanaLoader {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        .cabana-logo {
          animation: cabanaFadeIn 0.8s ease-out forwards;
        }
        .cabana-dot {
          display: inline-block;
          width: 2px;
          height: 2px;
          margin: 0 1.5px;
          background: rgba(240, 237, 232, 0.5);
          border-radius: 50%;
          animation: cabanaLoader 1.2s ease-in-out infinite;
        }
        .cabana-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .cabana-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>
      
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <img
          className="cabana-logo"
          src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
          alt="Cabaña Creative"
          style={{
            height: "clamp(3rem, 8vw, 5rem)",
            width: "auto",
            objectFit: "contain",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", height: "6px" }}>
          <span className="cabana-dot"></span>
          <span className="cabana-dot"></span>
          <span className="cabana-dot"></span>
        </div>
      </div>
    </div>
  );
}