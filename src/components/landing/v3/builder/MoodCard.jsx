import React from "react";
import { inkFor } from "./PillCard";

/** Tarjeta de mood: chips de estado de ánimo + referencias e instrucciones. */
export default function MoodCard({
  card,
  index = 0,
  moods = [],
  onToggle,
  references = "",
  onReferences,
  instructions = "",
  onInstructions,
  onInteract,
}) {
  return (
    <div
      className={`ccl-bcard ccl-bcard--dark`}
      style={{ background: card.color || "#1e1e1e", color: inkFor(card.color) }}
    >
      <div className="ccl-bcard__head">
        <span className="ccl-bcard__num">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="ccl-bcard__title">{card.title}</h3>
      </div>

      <div className="ccl-bcard__pills">
        {(card.options || []).map((option) => {
          const on = moods.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`ccl-pill ${on ? "is-on" : ""}`}
              onClick={() => {
                onToggle(option);
                onInteract?.();
              }}
              aria-pressed={on}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="ccl-mood__fields">
        <input
          className="ccl-mood__input"
          placeholder="Referencias (artistas, canciones, links)"
          value={references}
          onChange={(e) => {
            onReferences(e.target.value);
            onInteract?.();
          }}
          aria-label="Referencias"
        />
        <textarea
          className="ccl-mood__input ccl-mood__textarea"
          rows={2}
          placeholder="Instrucciones personalizadas"
          value={instructions}
          onChange={(e) => {
            onInstructions(e.target.value);
            onInteract?.();
          }}
          aria-label="Instrucciones personalizadas"
        />
      </div>
    </div>
  );
}