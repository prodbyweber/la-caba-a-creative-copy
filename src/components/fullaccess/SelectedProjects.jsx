import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import ProjectModal from "@/components/fullaccess/ProjectModal";
import { getYouTubeId } from "@/lib/landingMedia";
import { projectCover } from "@/lib/fullAccess";

const DESCRIPTION =
  "Una selección de proyectos en los que he participado desde la producción musical y la composición.";

export default function SelectedProjects({ projects }) {
  const [open, setOpen] = useState(null);

  return (
    <section className="fa-block" id="proyectos">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <h2 className="fa-display fa-h2">Selected Projects</h2>
          <p className="fa-lead">{DESCRIPTION}</p>
        </div>

        <div className="fa-projects">
          {projects.map((project, index) => (
            <motion.button
              type="button"
              className={`fa-proj${index % 2 === 1 ? " is-flip" : ""}`}
              key={`${project.artist}-${project.song}-${index}`}
              onClick={() => setOpen(project)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              aria-label={`${project.artist} · ${project.song}`}
            >
              <div className="fa-proj__media">
                {projectCover(project) ? (
                  <img
                    src={projectCover(project)}
                    alt={`${project.artist} · ${project.song}`}
                    loading="lazy"
                    onError={(event) => {
                      const id = getYouTubeId(project.youtube_url);
                      if (
                        id &&
                        event.currentTarget.src !== `https://img.youtube.com/vi/${id}/hqdefault.jpg`
                      ) {
                        event.currentTarget.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                      }
                    }}
                  />
                ) : null}
                <span className="fa-proj__play" aria-hidden="true">
                  <Play size={26} />
                </span>
              </div>
              <div>
                <h3 className="fa-display fa-proj__artist">{project.artist}</h3>
                <p className="fa-proj__song">
                  {project.song}
                  {project.year ? ` · ${project.year}` : ""}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
    </section>
  );
}