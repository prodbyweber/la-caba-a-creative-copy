import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function CatalogoCarousel() {
  const { data: items = [] } = useQuery({
    queryKey: ['catalogo-produccion'],
    queryFn: () => base44.entities.CatalogoProduccion.list("orden"),
    initialData: [],
  });
  const [playingId, setPlayingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const carouselRef = useRef(null);

  const getVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (youtubeUrl, customUrl) => {
    if (customUrl) return customUrl;
    const videoId = getVideoId(youtubeUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const handleCardClick = (id) => {
    const item = items.find(i => i.id === id);
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setPlayingId(null);
  };

  const scroll = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.offsetWidth * 0.8;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (!items || items.length === 0) return null;

  return (
    <>
    <section style={{
      background: "#080808",
      padding: "60px 0",
      position: "relative",
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 20px",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#ffffff",
            marginBottom: "8px",
          }}>
            Prod. by Weber x Cabaña Creative
          </h2>
          <p style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
            color: "#AAAAAA",
            lineHeight: 1.5,
          }}>
            Catálogo — Producciones más recientes.
          </p>
        </div>

        {/* Carousel Container */}
        <div style={{
          position: "relative",
          maxWidth: "100vw",
          margin: "0 calc(-50vw + 50%)",
        }}>
          {/* Left Arrow (Desktop only) */}
          {!isMobile && (
            <button
              onClick={() => scroll("left")}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#FF5833",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#e04a28"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#FF5833"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Carousel Track */}
          <div
            ref={carouselRef}
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              padding: "10px 20px",
            }}
          >
            <style>{`
              .carousel-track::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {items.map((item) => {
              const videoId = getVideoId(item.youtube_url);
              const thumbnailUrl = getThumbnailUrl(item.youtube_url, item.imagen_personalizada_url);
              const isPlaying = playingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item.id)}
                  style={{
                    flex: "0 0 auto",
                    width: isMobile ? "calc(100vw - 56px)" : "calc(28.5vw - 12px)",
                    minWidth: isMobile ? "calc(100vw - 56px)" : "380px",
                    aspectRatio: "16/9",
                    borderRadius: "12px",
                    overflow: "hidden",
                    position: "relative",
                    background: "#141414",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    cursor: "pointer",
                  }}
                >
                  {isPlaying ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      title={item.artista}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      {thumbnailUrl && (
                        <img
                          src={thumbnailUrl}
                          alt={item.artista}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      
                      {/* Dark gradient overlay */}
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "60%",
                        background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
                      }} />

                      {/* Play icon */}
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
                          <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                        </svg>
                      </div>

                      {/* Artist name */}
                      <div style={{
                        position: "absolute",
                        bottom: "16px",
                        left: "16px",
                        right: "16px",
                      }}>
                        <p style={{
                          fontFamily: "'Helvetica Neue', sans-serif",
                          fontWeight: 700,
                          fontSize: "16px",
                          color: "#ffffff",
                          margin: "0 0 4px",
                        }}>
                          {item.artista}
                        </p>
                        {item.compania && (
                          <p style={{
                            fontFamily: "'Helvetica Neue', sans-serif",
                            fontWeight: 400,
                            fontSize: "12px",
                            color: "#AAAAAA",
                            margin: 0,
                          }}>
                            {item.compania}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Arrow (Desktop only) */}
          {!isMobile && (
            <button
              onClick={() => scroll("right")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#FF5833",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#e04a28"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#FF5833"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>

    {/* Modal Premium estilo Netflix */}
    {selectedItem && (
      <div
        onClick={handleCloseModal}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(40px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .modal-content {
            animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
        
        <div
          onClick={(e) => e.stopPropagation()}
          className="modal-content"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "1100px",
            background: "#0f0f0f",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          }}
        >
          {/* Close button */}
          <button
            onClick={handleCloseModal}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.9)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Video area */}
          <div style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%",
            background: "#000",
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${getVideoId(selectedItem.youtube_url)}?autoplay=1&rel=0&modestbranding=1`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title={selectedItem.artista}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Info section */}
          <div style={{
            padding: "32px 40px",
            background: "linear-gradient(to top, #0f0f0f 0%, #1a1a1a 100%)",
          }}>
            <h2 style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "#ffffff",
              marginBottom: "12px",
            }}>
              {selectedItem.artista}
            </h2>
            
            {selectedItem.compania && (
              <p style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 500,
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                color: "#AAAAAA",
                marginBottom: "24px",
              }}>
                {selectedItem.compania}
              </p>
            )}

            {/* Divider */}
            <div style={{
              width: "60px",
              height: "3px",
              background: "#FF5833",
              marginBottom: "24px",
            }} />

            {/* Metadata */}
            <div style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5833" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10 8 16 12 10 16 10 8" fill="#FF5833"/>
                </svg>
                <span style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#ffffff",
                }}>
                  Producción Original
                </span>
              </div>
              
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <line x1="2" y1="7" x2="7" y2="7"/>
                  <line x1="2" y1="17" x2="7" y2="17"/>
                  <line x1="17" y1="12" x2="22" y2="12"/>
                  <line x1="17" y1="17" x2="22" y2="17"/>
                </svg>
                <span style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#AAAAAA",
                }}>
                  Weber x Cabaña Creative
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}