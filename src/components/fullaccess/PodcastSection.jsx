import React, { useState } from "react";
import { Play } from "lucide-react";
import useVimeoThumb from "@/hooks/useVimeoThumb";
import { parseVideoSource } from "@/lib/videoEmbed";

/** Podcast: portada cinematográfica con play, vídeo 16:9 y créditos. */
export default function PodcastSection({ podcast }) {
  const [started, setStarted] = useState(false);

  const source = parseVideoSource(podcast.video_url);
  const embed = parseVideoSource(podcast.video_url, { autoplay: true });
  const vimeoForThumb = !podcast.cover_url && source?.kind === "vimeo" ? podcast.video_url : "";
  const { poster } = useVimeoThumb(vimeoForThumb, podcast.cover_url || source?.thumb || "");

  if (podcast.is_visible === false || !source) return null;

  return (
    <section className="fa-block fa-podcast" id="podcast">
      <div className="fa-wrap">
        <div className="fa-podcast__head">
          <h2 className="fa-display fa-h2">{podcast.title}</h2>
          {podcast.description ? <p className="fa-lead">{podcast.description}</p> : null}
        </div>

        <div className="fa-podcast__player">
          {started ? (
            <iframe
              src={embed.embedUrl}
              title={podcast.title}
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <button
              type="button"
              className="fa-podcast__cover"
              onClick={() => setStarted(true)}
              aria-label="Reproducir el vídeo del podcast"
            >
              {poster ? <img src={poster} alt="" loading="lazy" /> : null}
              <span className="fa-podcast__veil" aria-hidden="true" />
              <span className="fa-glass fa-podcast__play" aria-hidden="true">
                <Play size={26} fill="currentColor" strokeWidth={0} />
              </span>
            </button>
          )}
        </div>

        {podcast.credits || podcast.logo_jbl_url || podcast.logo_academy_url ? (
          <p className="fa-podcast__credits">
            {podcast.credits ? <span>{podcast.credits}</span> : null}
            {podcast.logo_jbl_url ? (
              <img className="fa-podcast__logo" src={podcast.logo_jbl_url} alt="JBL" loading="lazy" />
            ) : null}
            {podcast.logo_academy_url ? (
              <img
                className="fa-podcast__logo"
                src={podcast.logo_academy_url}
                alt="Martin Garrix Academy"
                loading="lazy"
              />
            ) : null}
          </p>
        ) : null}
      </div>
    </section>
  );
}