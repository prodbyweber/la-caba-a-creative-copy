import React, { useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { COUNTRIES, MAIN_COUNTRIES, flagUrl } from "@/lib/countries";
import { inkFor } from "./PillCard";

export default function CountryPicker({ card, index = 0, value = "", onChange, onInteract }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  const pick = (country) => {
    onChange(country.name);
    setOpen(false);
    setQuery("");
    onInteract?.();
  };

  return (
    <div
      className={`ccl-bcard ${inkFor(card.color) === "#f1efe8" ? "ccl-bcard--dark" : ""}`}
      style={{ background: card.color || "#1e1e1e", color: inkFor(card.color) }}
    >
      <div className="ccl-bcard__head">
        <span className="ccl-bcard__num">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="ccl-bcard__title">{card.title}</h3>
      </div>

      <div className="ccl-bcard__pills">
        {MAIN_COUNTRIES.map((country) => (
          <button
            key={country.code}
            type="button"
            className={`ccl-pill ${value === country.name ? "is-on" : ""}`}
            onClick={() => pick(country)}
            aria-pressed={value === country.name}
          >
            <img className="ccl-flag" src={flagUrl(country.code)} alt="" /> {country.name}
          </button>
        ))}
        <button
          type="button"
          className={`ccl-pill ${open ? "is-on" : ""}`}
          onClick={() => {
            setOpen((o) => !o);
            onInteract?.();
          }}
          aria-expanded={open}
        >
          + más <ChevronDown size={12} />
        </button>
      </div>

      {value && !open && (
        <p className="ccl-bcard__selected">
          Tu ubicación: <b>{value}</b>
        </p>
      )}

      {open && (
        <div className="ccl-country">
          <div className="ccl-country__search">
            <Search size={13} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca tu país"
              aria-label="Buscar país"
            />
          </div>
          <div className="ccl-country__list">
            {results.map((country) => (
              <button
                key={country.code}
                type="button"
                className={`ccl-country__item ${value === country.name ? "is-on" : ""}`}
                onClick={() => pick(country)}
              >
                <img className="ccl-flag" src={flagUrl(country.code)} alt="" /> {country.name}
              </button>
            ))}
            {results.length === 0 && <span className="ccl-country__empty">Sin resultados</span>}
          </div>
        </div>
      )}
    </div>
  );
}