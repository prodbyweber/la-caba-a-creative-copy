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
        
        /* ── Clash Display (headings) + Cabinet Grotesk (body) ── */
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=cabinet-grotesk@100,200,300,400,500,700,800,900&display=swap');

        body {
          background: #0a0a0b;
          color: white;
          font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 400;
          letter-spacing: -0.01em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Clash Display for all headings */
        h1, h2, h3 {
          font-family: 'Clash Display', sans-serif;
          letter-spacing: -0.03em;
          line-height: 1.0;
        }

        h1 {
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 0.96;
        }

        h2 {
          font-weight: 600;
          letter-spacing: -0.03em;
        }

        h3 {
          font-weight: 500;
          letter-spacing: -0.025em;
        }

        h4, h5, h6 {
          font-family: 'Clash Display', sans-serif;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        p, button, input, textarea, select, label, span, a, li {
          font-family: 'Cabinet Grotesk', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .tracking-cinematic {
          font-family: 'Cabinet Grotesk', sans-serif;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-size: 0.62rem;
          font-weight: 500;
        }
        
        ::selection {
          background: rgba(16, 185, 129, 0.3);
        }
      `}</style>
      {children}
    </div>
  );
}