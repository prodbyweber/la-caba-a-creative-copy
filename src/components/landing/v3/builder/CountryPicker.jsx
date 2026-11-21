import React, { useMemo, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { COUNTRIES, MAIN_COUNTRIES, flagSvg } from "@/lib/countries";
import { inkFor } from "./PillCard";

export default function CountryPicker({ card, index = 0, value = "", onChange, onInteract }) {
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
    return showAll ? COUNTRIES : MAIN_COUNTRIES;
  }, [query, showAll]);

  const pick = (country) => {
    onChange(country.name);
    onInteract?.();
  };

  return (
    <div
      className={`ccl-bcard ${inkFor(card.color) === "#f1efe8" ? "ccl-bcard--dark" : ""}`}
      style={{ background: card.color || "#141414", color: inkFor(card.color) }}
    >
      <div className="ccl-bcard__head">
        <span className="ccl-bcard__num">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="ccl-bcard__title">{card.title}</h3>
      </div>

      <div className="ccl-loc">
        <div className="ccl-loc__search">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca tu país"
            aria-label="Buscar país"
          />
        </div>

        <div className="ccl-loc__grid">
          {results.map((country) => (
            <button
              key={country.code}
              type="button"
              className={`ccl-loc__card ${value === country.name ? "is-on" : ""}`}
              onClick={() => pick(country)}
              aria-pressed={value === country.name}
            >
              <img className="ccl-flag" src={flagSvg(country.code)} alt="" loading="lazy" />
              <span className="ccl-loc__name">{country.name}</span>
              {value === country.name && <Check size={13} className="ccl-loc__check" />}
            </button>
          ))}
        </div>

        {!query && !showAll && (
          <button
            type="button"
            className="ccl-loc__more"
            onClick={() => {
              setShowAll(true);
              onInteract?.();
            }}
          >
            + más <ChevronDown size={13} />
          </button>
        )}

        {results.length === 0 && <span className="ccl-loc__empty">Sin resultados</span>}
      </div>
    </div>
  );
}