import React, { useState } from "react";
import { Play } from "lucide-react";

const VIDEO_ID = "5x2e8RIdILU";

/** Tarjeta cinemática tipo Netflix con vídeo de YouTube. */
export default function NetflixCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="ccl-nf">
      {open ? (
        <iframe
          className="ccl-nf__frame"
          src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
          title="Cabaña Creative"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" className="ccl-nf__card" onClick={() => setOpen(true)}>
          <img
            className="ccl-nf__img"
            src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
            alt="Cabaña Creative"
            loading="lazy"
          />
          <span className="ccl-nf__veil" aria-hidden="true" />
          <span className="ccl-nf__body">
            <span className="ccl-nf__title">Así se trabaja en La Cabaña</span>
            <span className="ccl-nf__meta">Producción · Mezcla · Master</span>
          </span>
          <span className="ccl-nf__play" aria-hidden="true">
            <Play size={18} fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}