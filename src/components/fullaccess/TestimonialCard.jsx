import React from "react";
import { Play } from "lucide-react";
import useVimeoThumb from "@/hooks/useVimeoThumb";
import useInlinePlayer from "@/hooks/useInlinePlayer";
import { parseVideoSource } from "@/lib/videoEmbed";

/** Tarjeta cinemática vertical: portada con play, vídeo sin controles y pausa al tocar. */
export default function TestimonialCard({ item }) {
  const source = parseVideoSource(item.video_url);
  const vimeoForThumb = !item.cover_url && source?.kind === "vimeo" ? item.video_url : "";
  const { poster } = useVimeoThumb(
    vimeoForThumb,
    item.cover_url || source?.thumb || "",
    "640x1136"
  );
  const {
    mounted,
    engaged,
    playing,
    interactive,
    containerRef,
    iframeRef,
    embedUrl,
    play,
    pause,
    reloadKey,
    handleIframeLoad,
  } = useInlinePlayer(item.video_url);

  if (!source) return null;

  return (
    <article className="fa-tcard" ref={containerRef}>
      {mounted ? (
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={embedUrl}
          onLoad={handleIframeLoad}
          title={item.name || "Testimonio"}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}

      {engaged ? (
        !interactive ? null : playing ? (
          <button
            type="button"
            className="fa-tcard__tap"
            onClick={pause}
            aria-label="Pausar el vídeo"
          />
        ) : (
          <button
            type="button"
            className="fa-tcard__resume"
            onClick={play}
            aria-label="Reanudar el vídeo"
          >
            <span className="fa-glass fa-tcard__play" aria-hidden="true">
              <Play size={20} fill="currentColor" strokeWidth={0} />
            </span>
          </button>
        )
      ) : (
        <button
          type="button"
          className="fa-tcard__cover"
          onClick={play}
          aria-label={item.name ? `Reproducir el testimonio de ${item.name}` : "Reproducir testimonio"}
        >
          {poster ? <img src={poster} alt="" loading="lazy" /> : null}
          <span className="fa-tcard__veil" aria-hidden="true" />
          <span className="fa-glass fa-tcard__play" aria-hidden="true">
            <Play size={20} fill="currentColor" strokeWidth={0} />
          </span>
        </button>
      )}
    </article>
  );
}