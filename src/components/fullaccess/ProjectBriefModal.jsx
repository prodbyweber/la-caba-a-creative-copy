import React, { useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import "@/components/landing/v3/landing3.css";
import { useHomeContent } from "@/hooks/useHomeContent";
import BuilderSection from "@/components/landing/v3/builder/BuilderSection";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ProjectBriefModal({ onClose }) {
  const panelRef = useRef(null);
  const { content } = useHomeContent();

  const section = useMemo(() => {
    const base = content?.sections?.find((item) => item.key === "comenzar") || {};
    return { ...base, title: "Cuéntanos tu proyecto en minutos", subtitle: "" };
  }, [content]);

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
          {content ? (
            <div className="ccl">
              <BuilderSection section={section} cards={content.builder} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}