import React from "react";

export default function ChoiceList({ options, value, onChange }) {
  return (
    <div className="adm-choices">
      {options.map((option, index) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            className={`adm-choice${active ? " is-active" : ""}`}
            onClick={() => onChange(option)}
            aria-pressed={active}
          >
            <span className="adm-choice__letter">{String.fromCharCode(65 + index)}</span>
            <span className="adm-choice__label">{option}</span>
          </button>
        );
      })}
    </div>
  );
}