import React, { useEffect, useMemo, useRef, useState } from "react";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import { ChevronDown, Search, X } from "lucide-react";
import Flag from "@/components/admision/Flag";
import {
  PHONE_COUNTRIES,
  MAIN_COUNTRY_CODES,
  countryByCode,
  foldText,
} from "@/lib/phoneCountries";

const MAIN_SET = new Set(MAIN_COUNTRY_CODES);

const orderedCountries = () => {
  const main = MAIN_COUNTRY_CODES.map((code) => countryByCode(code)).filter(Boolean);
  return [...main, ...PHONE_COUNTRIES.filter((country) => !MAIN_SET.has(country.code))];
};

/**
 * Teléfono con selector de país (bandera SVG + prefijo), lista buscable en
 * hoja inferior y validación real con libphonenumber-js. Guarda E.164.
 */
export default function PhoneField({ id, value, country, onNumber, onCountry, error }) {
  const current = countryByCode(country) || countryByCode("ES");
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const list = useMemo(orderedCountries, []);

  useEffect(() => {
    if (!value) return;
    const parsed = parsePhoneNumberFromString(value);
    if (!parsed) return;
    const shown = parsePhoneNumberFromString(text, current.code);
    if (shown?.number !== parsed.number) setText(parsed.formatNATIONAL());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleChange = (event) => {
    const raw = event.target.value;
    const international = raw.trim().startsWith("+");
    const formatter = new AsYouType(international ? undefined : current.code);
    setText(formatter.input(raw));

    const parsed = parsePhoneNumberFromString(raw, current.code);
    if (international && parsed?.country && parsed.country !== current.code) {
      onCountry(parsed.country);
    }
    onNumber(parsed && parsed.isValid() ? parsed.number : "");
  };

  const choose = (next) => {
    onCountry(next.code);
    setOpen(false);
    setQuery("");
    const digits = text.replace(/[^\d+]/g, "");
    const parsed = digits ? parsePhoneNumberFromString(digits, next.code) : null;
    if (parsed) {
      setText(parsed.formatNATIONAL());
      onNumber(parsed.isValid() ? parsed.number : "");
    }
  };

  const results = useMemo(() => {
    const clean = foldText(query).trim();
    if (!clean) return list;
    const digits = clean.replace(/\D/g, "");
    return list.filter(
      (item) =>
        foldText(item.name).includes(clean) ||
        (digits && item.dial.replace(/\D/g, "").startsWith(digits)) ||
        item.code.toLowerCase() === clean
    );
  }, [query, list]);

  return (
    <>
      <div className={`adm-phone${error ? " has-error" : ""}`}>
        <button
          type="button"
          className="adm-phone__country"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`País del teléfono: ${current.name} (${current.dial})`}
        >
          <Flag code={current.code} />
          <span className="adm-phone__dial">{current.dial}</span>
          <ChevronDown size={13} aria-hidden="true" />
        </button>

        <input
          id={id}
          ref={undefined}
          type="tel"
          value={text}
          onChange={handleChange}
          placeholder="612 34 56 78"
          autoComplete="tel-national"
          inputMode="tel"
        />
      </div>

      {open ? (
        <div className="adm-sheet" role="dialog" aria-modal="true" aria-label="Elige el país">
          <div className="adm-sheet__panel">
            <div className="adm-sheet__head">
              <div className="adm-sheet__search">
                <Search size={15} aria-hidden="true" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar país o prefijo"
                  autoFocus
                  aria-label="Buscar país o prefijo"
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
              {results.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    className={`adm-sheet__option${item.code === current.code ? " is-active" : ""}`}
                    onClick={() => choose(item)}
                    aria-current={item.code === current.code}
                  >
                    <Flag code={item.code} />
                    <span className="adm-sheet__name">{item.name}</span>
                    <span className="adm-sheet__dial">{item.dial}</span>
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