import React, { useState } from "react";
import { Play } from "lucide-react";

/** Vídeo de YouTube con portada limpia y botón de play de cristal. */
export default function StageVideo({ youtubeId, title = "FLOW CAMP" }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="fa-yt">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="fa-yt__cover"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir ${title}`}
        >
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
            alt=""
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
            }}
          />
          <span className="fa-yt__shade" aria-hidden="true" />
          <span className="fa-glass fa-yt__play">
            <Play size={26} fill="currentColor" strokeWidth={0} />
          </span>
        </button>
      )}
    </div>
  );
}