import React from "react";
import { motion } from "framer-motion";

export default function StartNav() {

  return (
    <>
      {/* Fixed nav bar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between"
        style={{ padding: "clamp(20px, 4vw, 32px) clamp(24px, 6vw, 56px)", pointerEvents: "all" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Logo — same style as LandingNav */}
        <a
          href="/start"
          className="flex items-center gap-2 select-none"
          style={{ textDecoration: "none" }}
        >
          <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, lineHeight: 1, display: "flex", flexDirection: "column" }}>
            <span style={{ letterSpacing: "-0.04em", display: "inline-flex", alignItems: "flex-start", lineHeight: 1, color: "#ff5833", fontWeight: 900, fontSize: "1.1rem" }}>
              Cabaña<sup style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.55rem", fontWeight: 400, marginLeft: "3px", verticalAlign: "top", position: "relative", top: "2px" }}>®</sup>
            </span>
            <span style={{ letterSpacing: "-0.04em", display: "block", lineHeight: 1, color: "white", fontWeight: 900, fontSize: "1.1rem" }}>Creative</span>
          </div>
        </a>

      </motion.header>
    </>
  );
}