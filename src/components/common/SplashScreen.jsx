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
        @keyframes cabanaLoadingCinematic {
          0% { 
            opacity: 0.4;
            transform: scale(0.98);
          }
          50% { 
            opacity: 1;
            transform: scale(1);
          }
          100% { 
            opacity: 0.4;
            transform: scale(0.98);
          }
        }
        .cabana-logo-loading {
          animation: cabanaLoadingCinematic 2s ease-in-out infinite;
        }
      `}</style>
      
      <img
        className="cabana-logo-loading"
        src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
        alt="Cabaña Creative"
        style={{
          height: "clamp(3rem, 8vw, 5rem)",
          width: "auto",
          objectFit: "contain",
        }}
      />
    </div>
  );
}