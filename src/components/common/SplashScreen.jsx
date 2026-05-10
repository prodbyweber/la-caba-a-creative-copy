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
        transition: "opacity 0.6s ease-out",
      }}
    >
      <img
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