import React from "react";
import { Play, X } from "lucide-react";
import { getYouTubeId } from "@/lib/landingMedia";

export default function ProjectModal({ project, onClose }) {
  if (!project) return null;
  const id = getYouTubeId(project.youtube_url);

  return (
    <div className="fa-modal" onClick={onClose}>
      <div className="fa-modal__inner" onClick={(event) => event.stopPropagation()}>
        <div className="fa-modal__frame">
          {id ? (
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
              title={`${project.artist} — ${project.song}`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
              <a href={project.youtube_url} target="_blank" rel="noreferrer" className="fa-btn">
                Abrir vídeo
              </a>
            </div>
          )}
        </div>
        <div className="fa-modal__bar">
          <div>
            <span className="fa-micro">{project.credit}</span>
            <p style={{ marginTop: 6, fontSize: 15 }}>
              {project.artist} · {project.song}
            </p>
          </div>
          <button type="button" className="fa-btn fa-btn--ghost" onClick={onClose}>
            <X size={15} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectPlayIcon() {
  return <Play size={22} />;
}