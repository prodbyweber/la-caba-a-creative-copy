import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import Flag from "@/components/admision/Flag";
import { COUNTRIES } from "@/lib/countries";
import { foldText } from "@/lib/phoneCountries";

/** País de residencia: selector buscable con bandera SVG. Guarda el nombre en español. */
export default function CountryField({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = COUNTRIES.find((country) => country.name === value) || null;

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const results = useMemo(() => {
    const clean = foldText(query).trim();
    if (!clean) return COUNTRIES;
    return COUNTRIES.filter(
      (country) =>
        foldText(country.name).includes(clean) || country.code.toLowerCase() === clean
    );
  }, [query]);

  const choose = (country) => {
    onChange(country.name);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        className={`adm-country${error ? " has-error" : ""}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`País de residencia: ${current?.name || "sin elegir"}`}
      >
        {current ? <Flag code={current.code} /> : null}
        <span className={`adm-country__name${current ? "" : " is-empty"}`}>
          {current?.name || "Elige tu país"}
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open ? (
        <div className="adm-sheet" role="dialog" aria-modal="true" aria-label="Elige tu país">
          <div className="adm-sheet__panel">
            <div className="adm-sheet__head">
              <div className="adm-sheet__search">
                <Search size={15} aria-hidden="true" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar país"
                  autoFocus
                  aria-label="Buscar país"
                />
              </div>
              <button
                type="button"
                className="adm-sheet__close"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            <ul className="adm-sheet__list">
              {results.map((country) => (
                <li key={country.code}>
                  <button
                    type="button"
                    className={`adm-sheet__option${country.name === value ? " is-active" : ""}`}
                    onClick={() => choose(country)}
                    aria-current={country.name === value}
                  >
                    <Flag code={country.code} />
                    <span className="adm-sheet__name">{country.name}</span>
                  </button>
                </li>
              ))}
              {!results.length ? <li className="adm-sheet__empty">Sin resultados.</li> : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}