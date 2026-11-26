import React from "react";

/**
 * Chips de selección con el mismo lenguaje visual de la landing (.fa-chip).
 * `stack` los muestra en filas para opciones largas.
 */
export default function ChoiceChips({ options, value, onChange, multi = false, stack = false, error }) {
  const selected = multi ? value || [] : [value];

  const toggle = (option) => {
    if (!multi) {
      onChange(option);
      return;
    }
    const list = value || [];
    onChange(list.includes(option) ? list.filter((item) => item !== option) : [...list, option]);
  };

  return (
    <div>
      <div className={stack ? "adm-stack" : "fa-chips"}>
        {options.map((option) => {
          const isOn = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`fa-chip${isOn ? " is-on" : ""}`}
              aria-pressed={isOn}
              onClick={() => toggle(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error ? <p className="fa-error">{error}</p> : null}
    </div>
  );
}