import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import ProjectModal from "@/components/fullaccess/ProjectModal";
import { getYouTubeId } from "@/lib/landingMedia";

function cover(project) {
  if (project.cover_url) return project.cover_url;
  const id = getYouTubeId(project.youtube_url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : "";
}

export default function SelectedProjects({ settings, projects }) {
  const [open, setOpen] = useState(null);

  return (
    <section className="fa-sec fa-sec--line" id="proyectos">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <span className="fa-eyebrow">Créditos</span>
          <h2 className="fa-display fa-h2">{settings.projects_title}</h2>
          <p className="fa-lead">{settings.projects_subtitle}</p>
        </div>

        <div className="fa-projects">
          {projects.map((project, index) => (
            <motion.button
              type="button"
              className="fa-proj"
              key={`${project.artist}-${project.song}`}
              onClick={() => setOpen(project)}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="fa-proj__media">
                {cover(project) ? (
                  <img
                    src={cover(project)}
                    alt={`${project.artist} — ${project.song}`}
                    loading="lazy"
                    onError={(event) => {
                      const id = getYouTubeId(project.youtube_url);
                      if (id) event.currentTarget.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                    }}
                  />
                ) : null}
              </div>
              <span className="fa-proj__veil" aria-hidden="true" />
              <span className="fa-proj__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="fa-proj__play">
                <Play size={14} fill="currentColor" strokeWidth={0} />
              </span>
              <div className="fa-proj__body">
                <h3 className="fa-display fa-proj__artist">{project.artist}</h3>
                <p className="fa-proj__song">
                  {project.song}
                  {project.year ? ` · ${project.year}` : ""}
                </p>
                {project.credit ? <span className="fa-proj__credit">{project.credit}</span> : null}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
    </section>
  );
}