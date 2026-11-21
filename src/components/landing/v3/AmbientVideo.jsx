import React, { useEffect, useRef, useState } from "react";

// Un solo vídeo de fondo activo a la vez en toda la página.
let currentVideo = null;

/**
 * Vídeo de fondo decorativo: sin controles nativos, sin interacción posible.
 * Si el navegador rechaza la reproducción (ahorro de batería en iPhone),
 * se muestra el póster como imagen fija.
 */
export default function AmbientVideo({ src, poster = "", className = "" }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.playsInline = true;

    let visible = false;

    const tryPlay = () => {
      if (!visible || document.hidden) return;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt
          .then(() => {
            if (currentVideo && currentVideo !== video) {
              try {
                currentVideo.pause();
              } catch (e) {
                /* noop */
              }
            }
            currentVideo = video;
          })
          .catch(() => setFailed(true));
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) tryPlay();
        else {
          try {
            video.pause();
          } catch (e) {
            /* noop */
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(video);

    const onVisibility = () => {
      if (!document.hidden) tryPlay();
      else {
        try {
          video.pause();
        } catch (e) {
          /* noop */
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (currentVideo === video) currentVideo = null;
      try {
        video.pause();
      } catch (e) {
        /* noop */
      }
    };
  }, [src]);

  if (!src || failed) {
    return poster ? (
      <img className={`ccl-media__el ${className}`} src={poster} alt="" aria-hidden="true" loading="lazy" />
    ) : null;
  }

  return (
    <>
      <video
        ref={ref}
        className={`ccl-media__el ccl-amb ${className}`}
        src={src}
        poster={poster || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
        tabIndex={-1}
        aria-hidden="true"
        onError={() => setFailed(true)}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => e.preventDefault()}
      />
      <span className="ccl-amb__shield" aria-hidden="true" />
    </>
  );
}