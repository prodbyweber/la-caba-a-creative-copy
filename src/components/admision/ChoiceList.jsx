import React from "react";

const LETTERS = "ABCDEFGHIJKL";

/** Opciones con letra A/B/C. `multi` permite varias respuestas y `grid` dos columnas. */
export default function ChoiceList({
  options,
  value,
  onChange,
  multi = false,
  grid = false,
  error,
}) {
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
      <div className={`adm-choices${grid ? " adm-choices--grid" : ""}`}>
        {options.map((option, index) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`adm-choice${active ? " is-active" : ""}`}
              aria-pressed={active}
              onClick={() => toggle(option)}
            >
              <span className="adm-choice__letter">{LETTERS[index]}</span>
              <span className="adm-choice__label">{option}</span>
            </button>
          );
        })}
      </div>
      {error ? <p className="adm-error">{error}</p> : null}
    </div>
  );
}