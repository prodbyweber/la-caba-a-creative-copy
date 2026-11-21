import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { COUNTRIES, flagUrl } from "@/lib/countries";

/** WhatsApp obligatorio con selector de prefijo (banderas SVG) y validación. */
export default function WhatsAppInput({ value = "", onChange }) {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const boxRef = useRef(null);

  const digits = String(value || "").replace(/\D/g, "");
  const local = String(value || "").replace(/^\+\d+\s*/, "");
  const valid = digits.length >= 8;

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const setNumber = (next) => onChange(`${country.dial} ${next}`);

  return (
    <div>
      <div className="ccl-wa" ref={boxRef}>
        <div className="ccl-wa__pick">
          <button
            type="button"
            className="ccl-wa__btn"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Prefijo del país"
          >
            <img className="ccl-flag" src={flagUrl(country.code)} alt="" />
            {country.dial}
            <ChevronDown size={11} />
          </button>

          {open && (
            <div className="ccl-wa__list">
              {COUNTRIES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className="ccl-wa__item"
                  onClick={() => {
                    setCountry(item);
                    setOpen(false);
                    onChange(`${item.dial} ${local}`);
                  }}
                >
                  <img className="ccl-flag" src={flagUrl(item.code)} alt="" />
                  {item.name}
                  <span className="ccl-wa__dial">{item.dial}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          className="ccl-wa__input"
          type="tel"
          inputMode="tel"
          value={local}
          onChange={(e) => setNumber(e.target.value.replace(/[^\d\s]/g, ""))}
          placeholder="600 000 000"
          aria-label="Número de WhatsApp"
          required
        />
      </div>

      {local.length > 0 && !valid && (
        <span className="ccl-wa__error">Escribe un número completo, con al menos 8 dígitos.</span>
      )}
    </div>
  );
}