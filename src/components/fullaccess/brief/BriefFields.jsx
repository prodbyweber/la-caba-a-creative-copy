import React from "react";

export function Field({ label, hint, wide, children }) {
  return (
    <label className={`fa-field${wide ? " fa-field--wide" : ""}`}>
      <span className="fa-label">{label}</span>
      {children}
      {hint ? <span className="fa-field__hint">{hint}</span> : null}
    </label>
  );
}

export function ChipGroup({ options, value, onChange, multiple = false, max }) {
  const list = multiple ? value || [] : [value];
  const toggle = (option) => {
    if (!multiple) {
      onChange(option);
      return;
    }
    if (list.includes(option)) {
      onChange(list.filter((item) => item !== option));
      return;
    }
    if (max && list.length >= max) return;
    onChange([...list, option]);
  };

  return (
    <div className="fa-chips">
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;
        const on = list.includes(optionValue);
        return (
          <button
            type="button"
            key={optionValue}
            className={`fa-chip${on ? " is-on" : ""}`}
            onClick={() => toggle(optionValue)}
            aria-pressed={on}
          >
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}