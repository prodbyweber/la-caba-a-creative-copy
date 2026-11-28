import React, { useState } from "react";
import { Play } from "lucide-react";
import useVimeoThumb from "@/hooks/useVimeoThumb";
import { parseVideoSource } from "@/lib/videoEmbed";

/** Tarjeta cinemática vertical: solo portada, velo oscuro y play. */
export default function TestimonialCard({ item }) {
  const [started, setStarted] = useState(false);

  const source = parseVideoSource(item.video_url);
  const embed = parseVideoSource(item.video_url, { autoplay: true });
  const vimeoForThumb = !item.cover_url && source?.kind === "vimeo" ? item.video_url : "";
  const { poster } = useVimeoThumb(
    vimeoForThumb,
    item.cover_url || source?.thumb || "",
    "640x1136"
  );

  if (!source) return null;

  return (
    <article className="fa-tcard">
      {started ? (
        <iframe
          src={embed.embedUrl}
          title={item.name || "Testimonio"}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          className="fa-tcard__cover"
          onClick={() => setStarted(true)}
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