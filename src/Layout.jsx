import React from "react";

export default function Layout({ children, currentPageName }) {
  // No layout wrapper needed - pages handle their own layout
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <style>{`
        :root {
          --background: 0 0% 4%;
          --foreground: 0 0% 98%;
          --card: 0 0% 7%;
          --card-foreground: 0 0% 98%;
          --popover: 0 0% 7%;
          --popover-foreground: 0 0% 98%;
          --primary: 160 84% 39%;
          --primary-foreground: 0 0% 98%;
          --secondary: 270 70% 60%;
          --secondary-foreground: 0 0% 98%;
          --muted: 0 0% 15%;
          --muted-foreground: 0 0% 64%;
          --accent: 30 100% 50%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 84% 60%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 15%;
          --input: 0 0% 15%;
          --ring: 160 84% 39%;
          --radius: 0.75rem;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        
        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        
        /* ── Plus Jakarta Sans — Avenir-style, geometric bold ── */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap');

        body {
          background: #0a0a0b;
          color: white;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 400;
          letter-spacing: -0.015em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        h1 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.97;
        }

        h2, h3 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        h4, h5, h6, p, button, input, textarea, select, label, span, a {
          font-family: 'Plus Jakarta Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .tracking-cinematic {
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 0.62rem;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        ::selection {
          background: rgba(16, 185, 129, 0.3);
        }
      `}</style>
      {children}
    </div>
  );
}