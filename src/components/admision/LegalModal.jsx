import React, { useEffect } from "react";
import { X } from "lucide-react";
import { LEGAL_DOCS } from "@/lib/legalContent";

/** Popup legal de /admision: mismo lenguaje visual que la tarjeta de admisión. */
export default function LegalModal({ doc, onClose }) {
  const content = LEGAL_DOCS[doc];

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!content) return null;

  return (
    <div
      className="adm-legalmodal"
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
      onClick={onClose}
    >
      <div className="adm-legalmodal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="adm-legalmodal__head">
          <h2 className="adm-legalmodal__title">{content.title}</h2>
          <button
            type="button"
            className="adm-legalmodal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </div>

        <div className="adm-legalmodal__body">
          <p className="adm-legalmodal__updated">{content.updated}</p>

          {content.blocks.map((block) => (
            <section className="adm-legalmodal__block" key={block.title}>
              <h3>{block.title}</h3>
              {block.text ? <p>{block.text}</p> : null}
              {block.items ? (
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}