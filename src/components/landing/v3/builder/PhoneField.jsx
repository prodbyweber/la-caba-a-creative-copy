import React, { useMemo, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRIES, flagSvg } from "@/lib/countries";
import { formatAsYouType } from "@/lib/phone";

/** Campo de WhatsApp con selector de prefijo y bandera SVG. */
export default function PhoneField({ countryCode = "ES", onCountryChange, value = "", onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const current = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.dial.includes(q));
  }, [query]);

  const pickCountry = (country) => {
    onCountryChange(country.code);
    setOpen(false);
    setQuery("");
    if (value) onChange(formatAsYouType(value, country.code));
  };

  return (
    <div className="ccl-phone">
      <div className="ccl-phone__row">
        <button
          type="button"
          className="ccl-phone__country"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Elegir prefijo"
        >
          <img className="ccl-flag" src={flagSvg(current.code)} alt="" />
          <span>+{current.dial}</span>
          <ChevronDown size={13} />
        </button>

        <input
          className="ccl-phone__input"
          inputMode="tel"
          autoComplete="tel"
          placeholder="600 000 000"
          value={value}
          onChange={(e) => onChange(formatAsYouType(e.target.value, countryCode))}
          aria-invalid={!!error}
        />
      </div>

      {open && (
        <div className="ccl-phone__panel">
          <div className="ccl-phone__search">
            <Search size={13} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca tu país"
              aria-label="Buscar país del prefijo"
            />
          </div>
          <div className="ccl-phone__list">
            {results.map((country) => (
              <button
                key={country.code}
                type="button"
                className={`ccl-phone__item ${country.code === countryCode ? "is-on" : ""}`}
                onClick={() => pickCountry(country)}
              >
                <img className="ccl-flag" src={flagSvg(country.code)} alt="" loading="lazy" />
                <span>{country.name}</span>
                <span className="ccl-phone__dial">+{country.dial}</span>
                {country.code === countryCode && <Check size={12} />}
              </button>
            ))}
            {results.length === 0 && <span className="ccl-phone__empty">Sin resultados</span>}
          </div>
        </div>
      )}
    </div>
  );
}