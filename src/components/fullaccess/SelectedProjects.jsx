import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import ProjectModal from "@/components/fullaccess/ProjectModal";
import { getYouTubeId } from "@/lib/landingMedia";
import { projectCover } from "@/lib/fullAccess";

const DESCRIPTION =
  "Una selección de proyectos en los que he participado desde la producción musical y la composición.";

export default function SelectedProjects({ settings, projects }) {
  const [open, setOpen] = useState(null);

  return (
    <section className="fa-block" id="proyectos">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <span className="fa-eyebrow">Créditos</span>
          <h2 className="fa-display fa-h2">{settings.projects_title}</h2>
          <p className="fa-lead">{DESCRIPTION}</p>
        </div>

        <div className="fa-pgrid">
          {projects.map((project, index) => {
            const image = projectCover(project);
            return (
              <motion.button
                type="button"
                className="fa-pcard"
                key={`${project.artist}-${project.song}-${index}`}
                onClick={() => setOpen(project)}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.65, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                aria-label={`${project.artist} · ${project.song}`}
              >
                {image ? (
                  <img
                    src={image}
                    alt={`${project.artist} · ${project.song}`}
                    loading="lazy"
                    onError={(event) => {
                      const id = getYouTubeId(project.youtube_url);
                      if (id && event.currentTarget.src !== `https://img.youtube.com/vi/${id}/hqdefault.jpg`) {
                        event.currentTarget.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                      }
                    }}
                  />
                ) : null}
                <span className="fa-pcard__veil" aria-hidden="true" />
                <span className="fa-pcard__play" aria-hidden="true">
                  <Play size={15} />
                </span>
                <span className="fa-pcard__body">
                  <span className="fa-pcard__title">{project.artist}</span>
                  <span className="fa-pcard__rule" aria-hidden="true" />
                  <span className="fa-pcard__sub">
                    {[project.song, project.year].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
    </section>
  );
}