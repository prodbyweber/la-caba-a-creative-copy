import React from "react";
import { Pencil } from "lucide-react";
import { summaryModules } from "./briefConfig";

export default function BriefSummary({ data, onEdit }) {
  return (
    <div className="fa-summary">
      {summaryModules(data).map((module) => (
        <div className="fa-summary__block" key={module.title}>
          <div className="fa-summary__head">
            <span className="fa-summary__title">
              {String(module.step + 1).padStart(2, "0")} · {module.title}
            </span>
            <button
              type="button"
              className="fa-summary__edit"
              onClick={() => onEdit(module.step)}
            >
              <Pencil size={12} /> Editar
            </button>
          </div>
          <dl className="fa-summary__rows">
            {module.rows
              .filter((row) => String(row.value || "").trim())
              .map((row) => (
                <div className="fa-summary__row" key={`${module.title}-${row.label}`}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
          </dl>
        </div>
      ))}
    </div>
  );
}