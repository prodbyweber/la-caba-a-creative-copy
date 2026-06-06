import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function CatalogoCarousel({ items }) {
  const [playingId, setPlayingId] = useState(null);
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
    setPlayingId(playingId === id ? null : id);
  };

  const handleMouseDown = (e) => {
    if (playingId) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || playingId) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
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

  return (
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
        <div style={{ position: "relative" }}>
          {/* Left Arrow (Desktop only) */}
          {!isMobile && (
            <button
              onClick={() => scroll("left")}
              style={{
                position: "absolute",
                left: "-20px",
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
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              cursor: isDragging ? "grabbing" : "grab",
              padding: "10px 0",
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
                    width: isMobile ? "calc(100vw - 40px)" : "calc(33.333% - 10.667px)",
                    minWidth: isMobile ? "calc(100vw - 40px)" : "400px",
                    maxWidth: isMobile ? "calc(100vw - 40px)" : "500px",
                    aspectRatio: "16/9",
                    borderRadius: "12px",
                    overflow: "hidden",
                    position: "relative",
                    background: "#141414",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    cursor: "pointer",
                    transition: "transform 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isDragging && !playingId) {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDragging && !playingId) {
                      e.currentTarget.style.transform = "scale(1)";
                    }
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
                right: "-20px",
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
  );
}