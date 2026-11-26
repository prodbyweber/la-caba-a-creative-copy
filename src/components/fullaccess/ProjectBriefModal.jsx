import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import "@/components/fullaccess/fa.css";
import "@/components/fullaccess/fa-landing.css";
import "@/components/fullaccess/fa-v4.css";
import useFullAccessContent from "@/hooks/useFullAccessContent";
import ProjectBriefForm from "@/components/fullaccess/brief/ProjectBriefForm";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ProjectBriefModal({ onClose }) {
  const panelRef = useRef(null);
  const { settings } = useFullAccessContent();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fa-brief" role="dialog" aria-modal="true" aria-label="Cuéntanos tu proyecto">
      <div className="fa-brief__backdrop" onClick={onClose} aria-hidden="true" />

      <div className="fa-brief__panel" ref={panelRef}>
        <button type="button" className="fa-brief__close" onClick={onClose} aria-label="Cerrar">
          <X size={16} />
        </button>

        <div className="fa-brief__scroll">
          <ProjectBriefForm settings={settings} onDone={onClose} />
        </div>
      </div>
    </div>
  );
}