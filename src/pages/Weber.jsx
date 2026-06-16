import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// ── Design tokens (scoped, no global styles) ──────────────────────────────────
const T = {
  bg: "#050505",
  text: "#F3EFE7",
  accent: "#3D5A3E",
  earth: "#8B7355",
  muted: "rgba(243,239,231,0.35)",
  subtle: "rgba(243,239,231,0.12)",
  overlay: "rgba(5,5,5,0.7)",
};

// ── YouTube Lightbox ──────────────────────────────────────────────────────────
function YouTubeLightbox({ videoId, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        backdropFilter: "blur(12px)", cursor: "pointer",
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: "absolute", top: 24, right: 24, width: 44, height: 44,
          borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
          color: T.text, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10,
        }}
      >
        ✕
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 960, aspectRatio: "16/9", cursor: "default" }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// ── Intersection Observer hook ─────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
}

// ── Extract YouTube ID ─────────────────────────────────────────────────────────
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:embed\/|watch\?v=|\/v\/|youtu\.be\/)([a-zA-Z0-9_-]{6,12})/);
  return m ? m[1] : null;
}

// ── NAV ────────────────────────────────────────────────────────────────────────
function WeberNav({ scrolled }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = ["Work", "Studio", "Projects", "Journal", "Contact"];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(5,5,5,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      transition: "all 0.35s ease",
      borderBottom: scrolled ? "1px solid rgba(243,239,231,0.06)" : "1px solid transparent",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <a href="/weber" style={{
          fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: 22,
          letterSpacing: "0.35em", color: T.text, textDecoration: "none",
        }}>
          WEBER
        </a>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{
              fontFamily: "'Helvetica Neue', sans-serif", fontSize: 12, fontWeight: 500,
              color: T.muted, textDecoration: "none", letterSpacing: "0.05em",
              transition: "color 0.2s",
            }}
              onMouseEnter={(e) => e.target.style.color = T.text}
              onMouseLeave={(e) => e.target.style.color = T.muted}
            >
              {l}
            </a>
          ))}
          <a href="#contact" style={{
            fontFamily: "'Helvetica Neue', sans-serif", fontSize: 12, fontWeight: 600,
            color: T.text, textDecoration: "none", padding: "8px 20px",
            border: `1px solid ${T.subtle}`, borderRadius: 99,
            transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.target.style.background = T.subtle; }}
            onMouseLeave={(e) => { e.target.style.background = "transparent"; }}
          >
            Book a Session
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", flexDirection: "column", gap: 5, padding: 8 }}
          className="mobile-hamburger"
        >
          <span style={{ display: "block", width: 22, height: 2, background: T.text, transition: "all 0.3s", transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
          <span style={{ display: "block", width: 22, height: 2, background: T.text, transition: "all 0.3s", opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: 22, height: 2, background: T.text, transition: "all 0.3s", transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: "rgba(5,5,5,0.97)", backdropFilter: "blur(20px)",
          padding: "24px 32px", borderTop: `1px solid ${T.subtle}`,
        }}>
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileOpen(false)} style={{
              display: "block", padding: "14px 0", fontFamily: "'Helvetica Neue', sans-serif",
              fontSize: 16, fontWeight: 500, color: T.text, textDecoration: "none",
              borderBottom: `1px solid ${T.subtle}`,
            }}>{l}</a>
          ))}
          <a href="#contact" onClick={() => setMobileOpen(false)} style={{
            display: "block", marginTop: 16, padding: "14px 0", fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: 16, fontWeight: 600, color: T.accent, textDecoration: "none", textAlign: "center",
            border: `1px solid ${T.accent}`, borderRadius: 99,
          }}>Book a Session</a>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .mobile-hamburger { display: flex !important; }
          nav > div > div:nth-child(2) { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

// ── WORK CARD ──────────────────────────────────────────────────────────────────
function WorkCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [imgVisible, setImgVisible] = useState(true);
  const videoRef = useRef(null);
  const ytId = getYouTubeId(item.youtube_url);

  useEffect(() => {
    if (hovered && item.preview_video && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setTimeout(() => setImgVisible(false), 200);
    } else if (!hovered) {
      setImgVisible(true);
      if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
    }
  }, [hovered, item.preview_video]);

  return (
    <div
      onClick={() => ytId && onClick(ytId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 8, overflow: "hidden",
        cursor: ytId ? "pointer" : "default",
        aspectRatio: "4/3", background: "#0a0a0a",
        transform: hovered ? "scale(1.03)" : "scale(1)",
        transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Cover image */}
      {item.cover_image && (
        <img
          src={item.cover_image}
          alt={item.title}
          loading="lazy"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", opacity: imgVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      )}
      {/* Preview video */}
      {item.preview_video && (
        <video
          ref={videoRef}
          src={item.preview_video}
          muted
          playsInline
          loop
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", opacity: imgVisible ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        />
      )}
      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.2) 50%, transparent 100%)",
      }} />
      {/* Labels */}
      <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
        {item.category && (
          <span style={{
            fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.15em", textTransform: "uppercase", color: T.accent,
          }}>
            {item.category}
          </span>
        )}
        <h3 style={{
          fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: 20,
          color: T.text, margin: "4px 0 0", lineHeight: 1.1,
        }}>
          {item.title}
        </h3>
        {item.year && (
          <span style={{
            fontFamily: "'Helvetica Neue', sans-serif", fontSize: 11, color: T.muted,
            position: "absolute", bottom: 0, right: 0,
          }}>
            {item.year}
          </span>
        )}
      </div>
    </div>
  );
}

// ── ACCORDION ROW ──────────────────────────────────────────────────────────────
function AccordionRow({ num, title, content, open, onToggle }) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 16,
          padding: "20px 0", background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{
          fontFamily: "'Helvetica Neue', sans-serif", fontSize: 14, fontWeight: 900,
          color: T.accent, fontVariantNumeric: "tabular-nums", minWidth: 32,
        }}>
          {String(num).padStart(2, "0")}
        </span>
        <span style={{
          fontFamily: "'Helvetica Neue', sans-serif", fontSize: 20, fontWeight: 700,
          color: T.text, flex: 1,
        }}>
          {title}
        </span>
        <span style={{
          display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease", color: T.muted, fontSize: 16,
        }}>
          ▼
        </span>
      </button>
      <div style={{
        height: open ? "auto" : 0, overflow: "hidden",
        transition: "height 0.35s ease", opacity: open ? 1 : 0,
      }}>
        <p style={{
          fontFamily: "'Helvetica Neue', sans-serif", fontSize: 14, lineHeight: 1.7,
          color: T.muted, padding: "0 0 20px 48px", margin: 0,
        }}>
          {content}
        </p>
      </div>
      <div style={{ height: 1, background: T.subtle }} />
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function Weber() {
  const [scrolled, setScrolled] = useState(false);
  const [lightboxId, setLightboxId] = useState(null);
  const [content, setContent] = useState({});
  const [openService, setOpenService] = useState(null);

  // ── Scroll detection ─────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Fetch content ────────────────────────────────────────────────────────
  useEffect(() => {
    base44.entities.WeberContent.filter({ visible: true }, "order", 100).then((items) => {
      const grouped = {};
      items.forEach((item) => {
        if (!grouped[item.section]) grouped[item.section] = [];
        grouped[item.section].push(item);
      });
      setContent(grouped);
    });
  }, []);

  const getSection = (section) => content[section] || [];

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", fontFamily: "'Helvetica Neue', sans-serif", WebkitFontSmoothing: "antialiased" }}>
      {/* ═══ Page-wide styles (scoped) ═══ */}
      <style>{`
        .weber-section { opacity: 0; transform: translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .weber-section.visible { opacity: 1; transform: translateY(0); }
        @media (max-width: 768px) {
          .weber-work-grid { grid-template-columns: 1fr !important; }
          .weber-journal-grid { grid-template-columns: 1fr !important; }
          .weber-about-layout { flex-direction: column !important; }
        }
      `}</style>

      {/* ═══ NAV ═══ */}
      <WeberNav scrolled={scrolled} />

      {/* ═══ HERO ═══ */}
      {(() => {
        const heroData = getSection("hero");
        const hero = heroData[0] || {};
        const heroYT = getYouTubeId(hero.youtube_url);
        return (
          <SectionWrapper>
            <section id="hero" style={{
              position: "relative", height: "100vh", minHeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              {/* Background */}
              {heroYT ? (
                <iframe
                  src={`https://www.youtube.com/embed/${heroYT}?autoplay=1&mute=1&controls=0&loop=1&playlist=${heroYT}&rel=0&showinfo=0`}
                  style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    border: "none", pointerEvents: "none", objectFit: "cover",
                  }}
                  allow="autoplay"
                  title="Hero background"
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, background: T.bg }} />
              )}
              {/* Overlay */}
              <div style={{ position: "absolute", inset: 0, background: `rgba(5,5,5,0.7)` }} />

              {/* Content */}
              <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px", maxWidth: 720 }}>
                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.35em", textTransform: "uppercase", color: T.accent,
                  marginBottom: 16, opacity: 0, animation: "weberFadeUp 0.8s 0.1s forwards",
                }}>
                  CREATIVE PRODUCER
                </p>
                <h1 style={{
                  fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900,
                  fontSize: "clamp(48px, 10vw, 120px)", letterSpacing: "-0.03em",
                  lineHeight: 0.85, color: T.text, marginBottom: 24,
                  opacity: 0, animation: "weberFadeUp 0.8s 0.2s forwards",
                }}>
                  WEBER
                </h1>
                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif", fontSize: "clamp(16px, 2.5vw, 22px)",
                  fontWeight: 300, color: T.muted, marginBottom: 12,
                  opacity: 0, animation: "weberFadeUp 0.8s 0.35s forwards",
                }}>
                  Producer. Artist. Creative Director.
                </p>
                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif", fontSize: "clamp(14px, 1.8vw, 17px)",
                  fontWeight: 300, color: T.muted, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px",
                  opacity: 0, animation: "weberFadeUp 0.8s 0.45s forwards",
                }}>
                  Creating music, visuals and experiences that leave a lasting impact.
                </p>
                <div style={{
                  display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
                  opacity: 0, animation: "weberFadeUp 0.8s 0.55s forwards",
                }}>
                  <a href="#contact" style={{
                    fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: 14,
                    padding: "14px 32px", borderRadius: 99,
                    background: T.text, color: T.bg, textDecoration: "none",
                    transition: "all 0.2s",
                  }}>
                    Work With Me
                  </a>
                  <a href="#work" style={{
                    fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 600, fontSize: 14,
                    padding: "14px 32px", borderRadius: 99,
                    background: "transparent", color: T.text,
                    border: `1px solid ${T.subtle}`, textDecoration: "none",
                    transition: "all 0.2s",
                  }}>
                    Explore Work
                  </a>
                </div>
              </div>

              {/* Scroll indicator */}
              <div style={{
                position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
                opacity: 0, animation: "weberFadeUp 0.8s 0.8s forwards",
              }}>
                <div style={{
                  width: 24, height: 40, borderRadius: 12, border: `1px solid ${T.muted}`,
                  display: "flex", justifyContent: "center", paddingTop: 8,
                }}>
                  <div style={{
                    width: 2, height: 8, borderRadius: 1, background: T.muted,
                    animation: "weberScrollDot 2s ease infinite",
                  }} />
                </div>
              </div>
            </section>
          </SectionWrapper>
        );
      })()}

      {/* ═══ SELECTED WORK ═══ */}
      {(() => {
        const workItems = getSection("work");
        if (workItems.length === 0) return null;
        return (
          <SectionWrapper>
            <section id="work" style={{ padding: "120px 32px", maxWidth: 1280, margin: "0 auto" }}>
              <h2 style={{
                fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900,
                fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: "-0.03em",
                color: T.text, marginBottom: 48,
              }}>
                SELECTED WORK
              </h2>
              <div className="weber-work-grid" style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
              }}>
                {workItems.map((item, i) => (
                  <div key={item.id || i} style={i === 0 && workItems.length % 2 !== 0 ? { gridColumn: "1 / -1" } : {}}>
                    <WorkCard item={item} onClick={setLightboxId} />
                  </div>
                ))}
              </div>
            </section>
          </SectionWrapper>
        );
      })()}

      {/* ═══ ABOUT ═══ */}
      {(() => {
        const aboutData = getSection("about");
        const about = aboutData[0] || {};
        return (
          <SectionWrapper>
            <section id="about" style={{ padding: "120px 32px", maxWidth: 1280, margin: "0 auto" }}>
              <div className="weber-about-layout" style={{
                display: "flex", gap: 64, alignItems: "center",
              }}>
                {/* Image */}
                <div style={{ flex: "0 0 45%", borderRadius: 8, overflow: "hidden", aspectRatio: "3/4", background: "#0a0a0a" }}>
                  {about.cover_image && (
                    <img src={about.cover_image} alt="Weber" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                {/* Text */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.35em", textTransform: "uppercase", color: T.accent,
                    marginBottom: 16,
                  }}>
                    WEBER
                  </p>
                  <h2 style={{
                    fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900,
                    fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.03em",
                    color: T.text, marginBottom: 24, lineHeight: 1.1,
                  }}>
                    {about.title || "About"}
                  </h2>
                  <p style={{
                    fontFamily: "'Helvetica Neue', sans-serif", fontSize: 16, lineHeight: 1.8,
                    color: T.muted,
                  }}>
                    {about.description || "Music producer, artist and composer. Venezuelan roots. Based in Madrid. Collaborations with Warner Music and Universal Music. Genres: Afro Beach, Deep House, RMV fused with urban rhythms. Producer, Artist, Composer, Creative Director."}
                  </p>
                </div>
              </div>
            </section>
          </SectionWrapper>
        );
      })()}

      {/* ═══ LA CABAÑA ═══ */}
      {(() => {
        const cabanaData = getSection("cabana");
        const cabana = cabanaData[0] || {};
        return (
          <SectionWrapper>
            <section id="cabana" style={{
              position: "relative", padding: "160px 32px",
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: "70vh", overflow: "hidden",
            }}>
              {/* Background */}
              {cabana.cover_image && (
                <img src={cabana.cover_image} alt="" loading="lazy" style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover",
                }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: `rgba(5,5,5,0.7)` }} />

              {/* Content */}
              <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 640 }}>
                <div style={{
                  width: 40, height: 2, background: T.earth, margin: "0 auto 32px",
                }} />
                <h2 style={{
                  fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900,
                  fontSize: "clamp(42px, 8vw, 80px)", letterSpacing: "-0.03em",
                  color: T.text, marginBottom: 16, lineHeight: 0.9,
                }}>
                  LA CABAÑA
                </h2>
                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif", fontSize: "clamp(16px, 2vw, 20px)",
                  fontWeight: 300, color: T.muted, marginBottom: 20,
                }}>
                  {cabana.subtitle || "A creative refuge for artists, creators and visionaries."}
                </p>
                {cabana.description && (
                  <p style={{
                    fontFamily: "'Helvetica Neue', sans-serif", fontSize: 14, lineHeight: 1.7,
                    color: T.muted,
                  }}>
                    {cabana.description}
                  </p>
                )}
              </div>
            </section>
          </SectionWrapper>
        );
      })()}

      {/* ═══ SERVICES ═══ */}
      {(() => {
        const services = getSection("services");
        if (services.length === 0) return null;
        return (
          <SectionWrapper>
            <section id="services" style={{ padding: "120px 32px", maxWidth: 720, margin: "0 auto" }}>
              <h2 style={{
                fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900,
                fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.03em",
                color: T.text, marginBottom: 48,
              }}>
                SERVICES
              </h2>
              <div>
                {services.map((s, i) => (
                  <AccordionRow
                    key={s.id || i}
                    num={i + 1}
                    title={s.title}
                    content={s.description}
                    open={openService === (s.id || i)}
                    onToggle={() => setOpenService(openService === (s.id || i) ? null : (s.id || i))}
                  />
                ))}
              </div>
            </section>
          </SectionWrapper>
        );
      })()}

      {/* ═══ CATALOG ═══ */}
      {(() => {
        const catalogItems = getSection("catalog");
        if (catalogItems.length === 0) return null;
        return (
          <SectionWrapper>
            <section id="catalog" style={{ padding: "120px 32px", maxWidth: 1280, margin: "0 auto" }}>
              <h2 style={{
                fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900,
                fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: "-0.03em",
                color: T.text, marginBottom: 48,
              }}>
                CATALOG
              </h2>
              <div className="weber-work-grid" style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
              }}>
                {catalogItems.map((item) => {
                  const ytId = getYouTubeId(item.youtube_url);
                  const spotifyId = item.spotify_url ? item.spotify_url.match(/embed\/track\/([a-zA-Z0-9]+)/)?.[1] || item.spotify_url.match(/embed\/playlist\/([a-zA-Z0-9]+)/)?.[1] : null;
                  return (
                    <div
                      key={item.id}
                      onClick={() => ytId && setLightboxId(ytId)}
                      style={{
                        position: "relative", borderRadius: 8, overflow: "hidden",
                        cursor: ytId ? "pointer" : "default", background: "#0a0a0a",
                        transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      {item.cover_image && (
                        <img src={item.cover_image} alt={item.title} loading="lazy" style={{
                          width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block",
                        }} />
                      )}
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to top, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.2) 50%, transparent 100%)",
                        display: "flex", flexDirection: "column", justifyContent: "flex-end",
                        padding: 16,
                      }}>
                        {item.category && (
                          <span style={{
                            fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10, fontWeight: 700,
                            letterSpacing: "0.15em", textTransform: "uppercase", color: T.accent,
                          }}>
                            {item.category}
                          </span>
                        )}
                        <h3 style={{
                          fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: 20,
                          color: T.text, margin: "4px 0 8px", lineHeight: 1.1,
                        }}>
                          {item.title}
                        </h3>
                        {/* Spotify embed */}
                        {spotifyId && item.spotify_url && (
                          <iframe
                            src={item.spotify_url}
                            width="100%"
                            height="80"
                            style={{ border: "none", borderRadius: 8, marginTop: 4 }}
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            title={item.title}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </SectionWrapper>
        );
      })()}

      {/* ═══ JOURNAL ═══ */}
      {(() => {
        const journalItems = getSection("journal");
        if (journalItems.length === 0) return null;
        return (
          <SectionWrapper>
            <section id="journal" style={{ padding: "120px 32px", maxWidth: 1280, margin: "0 auto" }}>
              <h2 style={{
                fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900,
                fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: "-0.03em",
                color: T.text, marginBottom: 48,
              }}>
                JOURNAL
              </h2>
              <div className="weber-journal-grid" style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
              }}>
                {journalItems.map((item) => (
                  <div key={item.id} style={{ borderRadius: 8, overflow: "hidden" }}>
                    {item.cover_image && (
                      <img src={item.cover_image} alt={item.title} loading="lazy" style={{
                        width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block",
                        marginBottom: 16, borderRadius: 4,
                      }} />
                    )}
                    {item.category && (
                      <span style={{
                        fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.15em", textTransform: "uppercase", color: T.accent,
                        display: "block", marginBottom: 8,
                      }}>
                        {item.category}
                      </span>
                    )}
                    <h3 style={{
                      fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: 18,
                      color: T.text, marginBottom: 8, lineHeight: 1.2,
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontFamily: "'Helvetica Neue', sans-serif", fontSize: 13, lineHeight: 1.6,
                      color: T.muted,
                    }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </SectionWrapper>
        );
      })()}

      {/* ═══ CONTACT ═══ */}
      {(() => {
        const contactData = getSection("contact");
        const contact = contactData[0] || {};
        return (
          <SectionWrapper>
            <section id="contact" style={{
              padding: "160px 32px", maxWidth: 640, margin: "0 auto", textAlign: "center",
            }}>
              <h2 style={{
                fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900,
                fontSize: "clamp(36px, 6vw, 56px)", letterSpacing: "-0.03em",
                color: T.text, marginBottom: 16, lineHeight: 1.05,
              }}>
                LET'S BUILD SOMETHING<br />THAT MATTERS.
              </h2>
              <p style={{
                fontFamily: "'Helvetica Neue', sans-serif", fontSize: "clamp(14px, 2vw, 17px)",
                fontWeight: 300, color: T.muted, marginBottom: 40, lineHeight: 1.6,
              }}>
                {contact.description || "Ready to bring your project to life? Let's talk."}
              </p>
              <a href="mailto:info@weber.studio" style={{
                fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: 15,
                padding: "16px 40px", borderRadius: 99,
                background: T.text, color: T.bg, textDecoration: "none",
                display: "inline-block", marginBottom: 48,
              }}>
                Book a Session
              </a>
              <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="https://instagram.com/weber" target="_blank" rel="noreferrer" style={{
                  fontFamily: "'Helvetica Neue', sans-serif", fontSize: 13, fontWeight: 500,
                  color: T.muted, textDecoration: "none", letterSpacing: "0.03em",
                }}>
                  Instagram
                </a>
                <a href="https://youtube.com/@weber" target="_blank" rel="noreferrer" style={{
                  fontFamily: "'Helvetica Neue', sans-serif", fontSize: 13, fontWeight: 500,
                  color: T.muted, textDecoration: "none", letterSpacing: "0.03em",
                }}>
                  YouTube
                </a>
                <a href="mailto:info@weber.studio" style={{
                  fontFamily: "'Helvetica Neue', sans-serif", fontSize: 13, fontWeight: 500,
                  color: T.muted, textDecoration: "none", letterSpacing: "0.03em",
                }}>
                  Email
                </a>
              </div>
            </section>
          </SectionWrapper>
        );
      })()}

      {/* ═══ KEYFRAMES ═══ */}
      <style>{`
        @keyframes weberFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes weberScrollDot {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(12px); opacity: 1; }
        }
      `}</style>

      {/* ═══ LIGHTBOX ═══ */}
      {lightboxId && <YouTubeLightbox videoId={lightboxId} onClose={() => setLightboxId(null)} />}
    </div>
  );
}

// ── Section wrapper with IntersectionObserver ─────────────────────────────────
function SectionWrapper({ children }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`weber-section${visible ? " visible" : ""}`}>
      {children}
    </div>
  );
}