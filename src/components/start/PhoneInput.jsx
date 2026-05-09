import React, { useState, useRef, useEffect } from "react";

const COUNTRIES = [
  { code: "ES", name: "España", dial: "+34" },
  { code: "MX", name: "México", dial: "+52" },
  { code: "CO", name: "Colombia", dial: "+57" },
  { code: "AR", name: "Argentina", dial: "+54" },
  { code: "VE", name: "Venezuela", dial: "+58" },
  { code: "CL", name: "Chile", dial: "+56" },
  { code: "PE", name: "Perú", dial: "+51" },
  { code: "EC", name: "Ecuador", dial: "+593" },
  { code: "BO", name: "Bolivia", dial: "+591" },
  { code: "PY", name: "Paraguay", dial: "+595" },
  { code: "UY", name: "Uruguay", dial: "+598" },
  { code: "CR", name: "Costa Rica", dial: "+506" },
  { code: "PA", name: "Panamá", dial: "+507" },
  { code: "GT", name: "Guatemala", dial: "+502" },
  { code: "HN", name: "Honduras", dial: "+504" },
  { code: "SV", name: "El Salvador", dial: "+503" },
  { code: "NI", name: "Nicaragua", dial: "+505" },
  { code: "DO", name: "Rep. Dominicana", dial: "+1809" },
  { code: "CU", name: "Cuba", dial: "+53" },
  { code: "PR", name: "Puerto Rico", dial: "+1787" },
  { code: "US", name: "Estados Unidos", dial: "+1" },
  { code: "CA", name: "Canadá", dial: "+1" },
  { code: "GB", name: "Reino Unido", dial: "+44" },
  { code: "FR", name: "Francia", dial: "+33" },
  { code: "DE", name: "Alemania", dial: "+49" },
  { code: "IT", name: "Italia", dial: "+39" },
  { code: "PT", name: "Portugal", dial: "+351" },
  { code: "NL", name: "Países Bajos", dial: "+31" },
  { code: "BE", name: "Bélgica", dial: "+32" },
  { code: "CH", name: "Suiza", dial: "+41" },
  { code: "AT", name: "Austria", dial: "+43" },
  { code: "SE", name: "Suecia", dial: "+46" },
  { code: "NO", name: "Noruega", dial: "+47" },
  { code: "DK", name: "Dinamarca", dial: "+45" },
  { code: "FI", name: "Finlandia", dial: "+358" },
  { code: "PL", name: "Polonia", dial: "+48" },
  { code: "RO", name: "Rumanía", dial: "+40" },
  { code: "CZ", name: "República Checa", dial: "+420" },
  { code: "HU", name: "Hungría", dial: "+36" },
  { code: "GR", name: "Grecia", dial: "+30" },
  { code: "TR", name: "Turquía", dial: "+90" },
  { code: "RU", name: "Rusia", dial: "+7" },
  { code: "UA", name: "Ucrania", dial: "+380" },
  { code: "BR", name: "Brasil", dial: "+55" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "NZ", name: "Nueva Zelanda", dial: "+64" },
  { code: "JP", name: "Japón", dial: "+81" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "KR", name: "Corea del Sur", dial: "+82" },
  { code: "SG", name: "Singapur", dial: "+65" },
  { code: "AE", name: "Emiratos Árabes", dial: "+971" },
  { code: "SA", name: "Arabia Saudita", dial: "+966" },
  { code: "IL", name: "Israel", dial: "+972" },
  { code: "ZA", name: "Sudáfrica", dial: "+27" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "EG", name: "Egipto", dial: "+20" },
  { code: "MA", name: "Marruecos", dial: "+212" },
];

function FlagImg({ code, size = 16 }) {
  return (
    <img
      src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w40/${code.toLowerCase()}.png 2x`}
      width={size + 4}
      height={size}
      alt={code}
      style={{ objectFit: "cover", borderRadius: "2px", flexShrink: 0 }}
    />
  );
}

export default function PhoneInput({ value, onChange, inputStyle }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(COUNTRIES[0]);
  const dropRef = useRef(null);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (country) => {
    setSelected(country);
    setOpen(false);
    setSearch("");
    onChange(country.dial + " " + (value.replace(/^\+\d+\s*/, "")));
  };

  const handleNumberChange = (e) => {
    onChange(selected.dial + " " + e.target.value);
  };

  const numberOnly = value.replace(/^\+\d+\s*/, "");

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: "0", borderBottom: "1px solid rgba(12,12,12,0.2)" }} ref={dropRef}>
      {/* Country selector button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          border: "none",
          borderRight: "1px solid rgba(12,12,12,0.12)",
          padding: "12px 10px 12px 0",
          cursor: "pointer",
          flexShrink: 0,
          marginRight: "10px",
        }}
      >
        <FlagImg code={selected.code} />
        <span style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "clamp(0.8rem, 1.5vw, 0.9rem)",
          fontWeight: 400,
          color: "rgba(12,12,12,0.6)",
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}>
          {selected.dial}
        </span>
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ opacity: 0.35, marginLeft: "2px" }}>
          <path d="M1 1l3 3 3-3" stroke="#0c0c0c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Number input */}
      <input
        type="tel"
        placeholder="600 000 000"
        value={numberOnly}
        onChange={handleNumberChange}
        style={{
          ...inputStyle,
          border: "none",
          borderBottom: "none",
          flex: 1,
          padding: "12px 0",
        }}
      />

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          zIndex: 100,
          background: "#fff",
          border: "1px solid rgba(12,12,12,0.1)",
          borderRadius: "8px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          width: "260px",
          maxHeight: "300px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Search */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(12,12,12,0.08)" }}>
            <input
              autoFocus
              placeholder="Buscar país..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: "12px",
                color: "#0c0c0c",
                background: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
                letterSpacing: "0.01em",
              }}
            />
          </div>
          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.map(country => (
              <button
                key={country.code + country.dial}
                type="button"
                onClick={() => handleSelect(country)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "9px 12px",
                  background: selected.code === country.code ? "rgba(12,12,12,0.04)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,88,51,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = selected.code === country.code ? "rgba(12,12,12,0.04)" : "transparent"}
              >
                <FlagImg code={country.code} />
                <span style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: "12px",
                  color: "#0c0c0c",
                  flex: 1,
                  letterSpacing: "-0.01em",
                }}>
                  {country.name}
                </span>
                <span style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: "11px",
                  color: "rgba(12,12,12,0.35)",
                  letterSpacing: "0",
                }}>
                  {country.dial}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}