import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const COUNTRIES_CITIES = {
  "España": ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Málaga", "Zaragoza", "Murcia", "Palma", "Las Palmas", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón", "Granada", "Otra"],
  "México": ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Cancún", "Mérida", "Querétaro", "Otra"],
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán", "La Plata", "Mar del Plata", "Salta", "Santa Fe", "Otra"],
  "Colombia": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales", "Otra"],
  "Chile": ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Iquique", "Puerto Montt", "Otra"],
  "Perú": ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Iquitos", "Cusco", "Piura", "Otra"],
  "Venezuela": ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Otra"],
  "Ecuador": ["Quito", "Guayaquil", "Cuenca", "Ambato", "Santo Domingo", "Otra"],
  "Bolivia": ["La Paz", "Santa Cruz", "Cochabamba", "Sucre", "Oruro", "Otra"],
  "Paraguay": ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Otra"],
  "Uruguay": ["Montevideo", "Salto", "Paysandú", "Las Piedras", "Otra"],
  "Cuba": ["La Habana", "Santiago de Cuba", "Holguín", "Camagüey", "Otra"],
  "República Dominicana": ["Santo Domingo", "Santiago", "La Romana", "San Pedro de Macorís", "Otra"],
  "Guatemala": ["Ciudad de Guatemala", "Mixco", "Villa Nueva", "Antigua", "Otra"],
  "Honduras": ["Tegucigalpa", "San Pedro Sula", "Choloma", "Otra"],
  "El Salvador": ["San Salvador", "Santa Ana", "San Miguel", "Otra"],
  "Nicaragua": ["Managua", "León", "Masaya", "Chinandega", "Otra"],
  "Costa Rica": ["San José", "Alajuela", "Desamparados", "San Carlos", "Otra"],
  "Panamá": ["Ciudad de Panamá", "San Miguelito", "Colón", "David", "Otra"],
  "Puerto Rico": ["San Juan", "Bayamón", "Carolina", "Ponce", "Otra"],
  "Estados Unidos": ["Nueva York", "Los Ángeles", "Chicago", "Miami", "Houston", "Phoenix", "Philadelphia", "Dallas", "San Antonio", "San Diego", "San José", "Austin", "Jacksonville", "Otra"],
  "Reino Unido": ["Londres", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Sheffield", "Edinburgh", "Otra"],
  "Francia": ["París", "Marsella", "Lyon", "Toulouse", "Niza", "Nantes", "Estrasburgo", "Burdeos", "Otra"],
  "Alemania": ["Berlín", "Hamburgo", "Múnich", "Colonia", "Frankfurt", "Stuttgart", "Düsseldorf", "Otra"],
  "Italia": ["Roma", "Milán", "Nápoles", "Turín", "Palermo", "Génova", "Bolonia", "Otra"],
  "Portugal": ["Lisboa", "Oporto", "Braga", "Setúbal", "Coímbra", "Otra"],
  "Países Bajos": ["Ámsterdam", "Rotterdam", "La Haya", "Utrecht", "Eindhoven", "Otra"],
  "Bélgica": ["Bruselas", "Amberes", "Gante", "Lieja", "Brujas", "Otra"],
  "Suiza": ["Zúrich", "Ginebra", "Basilea", "Berna", "Lausana", "Otra"],
  "Austria": ["Viena", "Graz", "Linz", "Salzburgo", "Innsbruck", "Otra"],
  "Polonia": ["Varsovia", "Cracovia", "Lodz", "Wroclaw", "Poznan", "Otra"],
  "Rumania": ["Bucarest", "Cluj-Napoca", "Timisoara", "Iasi", "Otra"],
  "Suecia": ["Estocolmo", "Gotemburgo", "Malmö", "Uppsala", "Otra"],
  "Noruega": ["Oslo", "Bergen", "Trondheim", "Stavanger", "Otra"],
  "Dinamarca": ["Copenhague", "Aarhus", "Odense", "Aalborg", "Otra"],
  "Finlandia": ["Helsinki", "Espoo", "Tampere", "Vantaa", "Otra"],
  "Japón": ["Tokio", "Osaka", "Kioto", "Yokohama", "Kobe", "Sapporo", "Otra"],
  "China": ["Pekín", "Shanghái", "Cantón", "Shenzhen", "Chengdu", "Otra"],
  "India": ["Bombay", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Otra"],
  "Brasil": ["São Paulo", "Río de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Belo Horizonte", "Otra"],
  "Australia": ["Sídney", "Melbourne", "Brisbane", "Perth", "Adelaida", "Otra"],
  "Canadá": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Otra"],
  "Otro": ["Otra"],
};

const COUNTRIES = Object.keys(COUNTRIES_CITIES);

const PHONE_CODES = [
  { code: "+34", country: "🇪🇸 ES" },
  { code: "+52", country: "🇲🇽 MX" },
  { code: "+54", country: "🇦🇷 AR" },
  { code: "+57", country: "🇨🇴 CO" },
  { code: "+56", country: "🇨🇱 CL" },
  { code: "+51", country: "🇵🇪 PE" },
  { code: "+58", country: "🇻🇪 VE" },
  { code: "+593", country: "🇪🇨 EC" },
  { code: "+1", country: "🇺🇸 US" },
  { code: "+44", country: "🇬🇧 UK" },
  { code: "+33", country: "🇫🇷 FR" },
  { code: "+49", country: "🇩🇪 DE" },
  { code: "+55", country: "🇧🇷 BR" },
];

const STEPS = [
  { id: 1, label: "Datos" },
  { id: 2, label: "Ubicación" },
  { id: 3, label: "Experiencia" },
];

const SECTORES_EMPRESA = [
  "Moda y Streetwear",
  "Calzado",
  "Bebidas",
  "Belleza y Cosmética",
  "Audio y Tecnología",
  "Eventos y Conciertos",
  "Hostelería",
  "Otro",
];

const PRESUPUESTO_OPTIONS = [
  "Cuento con un presupuesto de 5.000€ o más para mi proyecto.",
  "Cuento con un presupuesto mínimo de 3.000€ para comenzar.",
  "Estoy comprometido y abierto a explorar un plan de financiamiento.",
  "Por ahora no cuento con presupuesto disponible.",
];

const BLOCKED_PRESUPUESTO = "Por ahora no cuento con presupuesto disponible.";

const inputStyle = {
  width: "100%",
  background: "#141414",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  padding: "10px 13px",
  fontSize: "14px",
  color: "#f0ede8",
  fontFamily: "'Helvetica Neue', sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle = {
  fontFamily: "'Helvetica Neue', sans-serif",
  fontSize: "12px",
  fontWeight: 600,
  color: "rgba(240,237,232,0.6)",
  marginBottom: "5px",
  display: "block",
};

const fieldWrap = { display: "flex", flexDirection: "column", gap: "4px" };

function Label({ children, required }) {
  return (
    <label style={labelStyle}>
      {children}{required && <span style={{ color: "#ff5833", marginLeft: 3 }}>*</span>}
    </label>
  );
}

function StepIndicator({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
      {STEPS.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done || active ? "#ff5833" : "#1a1a1a",
                border: done || active ? "none" : "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700,
                color: done || active ? "#fff" : "rgba(240,237,232,0.3)",
                fontFamily: "'Helvetica Neue', sans-serif",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : s.id}
              </div>
              <span style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "10px",
                fontWeight: active ? 700 : 400,
                color: active ? "#f0ede8" : "rgba(240,237,232,0.3)",
              }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: "1px", margin: "0 6px",
                background: done ? "#ff5833" : "rgba(255,255,255,0.1)",
                marginBottom: "18px",
                transition: "background 0.3s",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const INITIAL_FORM = {
  nombre: "", apellidos: "", email: "", phoneCode: "+34", phone: "", birthdate: "",
  privacidad: false,
  pais_empresa: "", ciudad_empresa: "",
  gestion_produccion: "",
  trayectoria: "", sector_empresa: "", presupuesto: "",
};

export default function MarcasApplicationModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Reset ciudad when country changes
  const setCountry = (v) => setForm(f => ({ ...f, pais_empresa: v, ciudad_empresa: "" }));

  const isAdult = (dateStr) => {
    if (!dateStr) return false;
    const birth = new Date(dateStr);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    return age > 18 || (age === 18 && m >= 0 && today.getDate() >= birth.getDate());
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = true;
    if (!form.apellidos.trim()) e.apellidos = true;
    if (!form.email.trim() || !form.email.includes("@")) e.email = true;
    if (!form.phone.trim()) e.phone = true;
    if (!form.birthdate) e.birthdate = true;
    else if (!isAdult(form.birthdate)) e.birthdate = "minor";
    if (!form.privacidad) e.privacidad = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.pais_empresa) e.pais_empresa = true;
    if (!form.ciudad_empresa) e.ciudad_empresa = true;
    if (!form.gestion_produccion) e.gestion_produccion = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.trayectoria) e.trayectoria = true;
    if (!form.sector_empresa) e.sector_empresa = true;
    if (!form.presupuesto) e.presupuesto = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    if (form.presupuesto === BLOCKED_PRESUPUESTO) return;
    setSending(true);
    await base44.entities.ApplicationForm.create({
      nombre: form.nombre,
      apellidos: form.apellidos,
      email: form.email,
      telefono: form.phoneCode + " " + form.phone,
      fecha_nacimiento: form.birthdate,
      pais_residencia: form.pais_empresa + (form.ciudad_empresa ? ` — ${form.ciudad_empresa}` : ""),
      nacionalidad: form.gestion_produccion,
      disponibilidad_viaje_madrid: form.trayectoria,
      situacion_laboral: form.sector_empresa,
      presupuesto: form.presupuesto,
      tipo: "Marca",
    });
    setSending(false);
    setSent(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setForm(INITIAL_FORM);
      setSent(false);
      setErrors({});
    }, 300);
  };

  const isBlocked = form.presupuesto === BLOCKED_PRESUPUESTO;

  const cities = form.pais_empresa ? (COUNTRIES_CITIES[form.pais_empresa] || ["Otra"]) : [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="marcas-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
          overflowY: "auto",
        }}
        onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <div
          style={{ position: "relative", maxWidth: "460px", width: "100%", margin: "auto" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: "absolute", top: "-44px", right: "0", zIndex: 100,
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s",
              color: "#f0ede8", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            aria-label="Cerrar"
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "#0e0e0e",
              borderRadius: "18px",
              width: "100%",
              maxHeight: "90dvh",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "20px",
              boxSizing: "border-box",
              border: "1px solid rgba(255,255,255,0.08)",
              position: "relative",
            }}
          >
            {sent ? (
              /* ── SUCCESS STATE ── */
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ textAlign: "center" }}>
                  <h2 style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontWeight: 900, fontSize: "1.5rem", color: "#f0ede8",
                    margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.3
                  }}>
                    Tu solicitud ha llegado a Cabaña.
                  </h2>
                  <p style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontWeight: 400, fontSize: "0.95rem",
                    color: "rgba(240,237,232,0.5)", margin: 0, lineHeight: 1.5
                  }}>
                    Agenda una reunión con nuestro equipo para aterrizar tu proyecto y recibir un presupuesto personalizado.
                  </p>
                </div>

                {/* Calendly */}
                <div style={{
                  borderRadius: "14px", overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.07)",
                  height: "500px", background: "#080808"
                }}>
                  <iframe
                    src="https://calendly.com/hola-cabanacreative/creadores?embed_type=Inline&hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=080808&text_color=f0ede8&primary_color=ff4300"
                    width="100%" height="100%" frameBorder="0"
                    title="Agendar videollamada" style={{ display: "block" }}
                  />
                </div>

                <button
                  onClick={handleClose}
                  style={{
                    background: "transparent", color: "rgba(240,237,232,0.3)",
                    border: "1px solid rgba(255,255,255,0.07)", borderRadius: "9px",
                    padding: "10px 20px", fontFamily: "'Helvetica Neue', sans-serif",
                    fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", width: "100%",
                  }}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <StepIndicator current={step} />

                {/* Step 1 — Datos */}
                {step === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#f0ede8", margin: "0 0 3px" }}>Datos de contacto</h3>
                      <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "rgba(240,237,232,0.3)", margin: 0 }}>Información de la persona de contacto</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div style={fieldWrap}>
                        <Label required>Nombre</Label>
                        <input style={{ ...inputStyle, borderColor: errors.nombre ? "#ff5833" : "rgba(255,255,255,0.1)" }} value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Tu nombre" />
                      </div>
                      <div style={fieldWrap}>
                        <Label required>Apellidos</Label>
                        <input style={{ ...inputStyle, borderColor: errors.apellidos ? "#ff5833" : "rgba(255,255,255,0.1)" }} value={form.apellidos} onChange={e => set("apellidos", e.target.value)} placeholder="Tus apellidos" />
                      </div>
                    </div>
                    <div style={fieldWrap}>
                      <Label required>Email</Label>
                      <input type="email" style={{ ...inputStyle, borderColor: errors.email ? "#ff5833" : "rgba(255,255,255,0.1)" }} value={form.email} onChange={e => set("email", e.target.value)} placeholder="tu@empresa.com" />
                    </div>
                    <div style={fieldWrap}>
                      <Label required>Teléfono</Label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select value={form.phoneCode} onChange={e => set("phoneCode", e.target.value)} style={{ ...inputStyle, width: "105px", flexShrink: 0 }}>
                          {PHONE_CODES.map(p => <option key={p.code} value={p.code} style={{ background: "#141414" }}>{p.country} {p.code}</option>)}
                        </select>
                        <input type="tel" style={{ ...inputStyle, borderColor: errors.phone ? "#ff5833" : "rgba(255,255,255,0.1)" }} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="612 345 678" />
                      </div>
                    </div>
                    <div style={fieldWrap}>
                      <Label required>Fecha de nacimiento</Label>
                      <input type="date" style={{ ...inputStyle, borderColor: errors.birthdate ? "#ff5833" : "rgba(255,255,255,0.1)", colorScheme: "dark" }} value={form.birthdate} onChange={e => set("birthdate", e.target.value)} max={new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split("T")[0]} />
                      {errors.birthdate === "minor" && <span style={{ fontSize: "11px", color: "#ff5833", fontFamily: "'Helvetica Neue', sans-serif" }}>Debes ser mayor de 18 años.</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        onClick={() => set("privacidad", !form.privacidad)}
                        style={{
                          width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                          background: form.privacidad ? "#ff5833" : "transparent",
                          border: form.privacidad ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s", cursor: "pointer",
                        }}
                      >
                        {form.privacidad && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "11px", color: errors.privacidad ? "#ff5833" : "rgba(240,237,232,0.5)", lineHeight: 1.4, cursor: "pointer" }} onClick={() => set("privacidad", !form.privacidad)}>
                        Acepto la{" "}
                        <Link to="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "#ff5833", textDecoration: "underline", textDecorationColor: "rgba(255,88,51,0.4)" }}>
                          política de privacidad y protección de datos
                        </Link>
                      </span>
                    </div>
                  </div>
                )}

                {/* Step 2 — Ubicación */}
                {step === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#f0ede8", margin: "0 0 3px" }}>Ubicación de la empresa</h3>
                      <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "rgba(240,237,232,0.3)", margin: 0 }}>Dónde opera tu marca</p>
                    </div>
                    <div style={fieldWrap}>
                      <Label required>País de la empresa</Label>
                      <select value={form.pais_empresa} onChange={e => setCountry(e.target.value)} style={{ ...inputStyle, borderColor: errors.pais_empresa ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                        <option value="" style={{ background: "#141414" }}>Selecciona país</option>
                        {COUNTRIES.map(c => <option key={c} value={c} style={{ background: "#141414" }}>{c}</option>)}
                      </select>
                    </div>
                    <div style={fieldWrap}>
                      <Label required>Ciudad de la empresa</Label>
                      <select value={form.ciudad_empresa} onChange={e => set("ciudad_empresa", e.target.value)} style={{ ...inputStyle, borderColor: errors.ciudad_empresa ? "#ff5833" : "rgba(255,255,255,0.1)" }} disabled={!form.pais_empresa}>
                        <option value="" style={{ background: "#141414" }}>{form.pais_empresa ? "Selecciona ciudad" : "Selecciona primero un país"}</option>
                        {cities.map(c => <option key={c} value={c} style={{ background: "#141414" }}>{c}</option>)}
                      </select>
                    </div>
                    <div style={fieldWrap}>
                      <Label required>¿Cómo gestionamos la producción de contenido?</Label>
                      <select value={form.gestion_produccion} onChange={e => set("gestion_produccion", e.target.value)} style={{ ...inputStyle, borderColor: errors.gestion_produccion ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                        <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                        <option value="Tenemos disposición de viajar a Madrid para producir el contenido." style={{ background: "#141414" }}>Tenemos disposición de viajar a Madrid para producir el contenido.</option>
                        <option value="Preferimos cubrir los costes de desplazamiento para que el equipo venga a nosotros." style={{ background: "#141414" }}>Preferimos cubrir los costes de desplazamiento para que el equipo venga a nosotros.</option>
                        <option value="Aún no lo hemos definido, lo valoramos en la reunión." style={{ background: "#141414" }}>Aún no lo hemos definido, lo valoramos en la reunión.</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 3 — Experiencia */}
                {step === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#f0ede8", margin: "0 0 3px" }}>Tu empresa</h3>
                      <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "rgba(240,237,232,0.3)", margin: 0 }}>Cuéntanos sobre tu marca</p>
                    </div>
                    <div style={fieldWrap}>
                      <Label required>Trayectoria de la empresa</Label>
                      <select value={form.trayectoria} onChange={e => set("trayectoria", e.target.value)} style={{ ...inputStyle, borderColor: errors.trayectoria ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                        <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                        <option value="Menos de 1 año" style={{ background: "#141414" }}>Menos de 1 año</option>
                        <option value="De 1 a 3 años" style={{ background: "#141414" }}>De 1 a 3 años</option>
                        <option value="De 3 a 5 años" style={{ background: "#141414" }}>De 3 a 5 años</option>
                        <option value="Más de 5 años" style={{ background: "#141414" }}>Más de 5 años</option>
                      </select>
                    </div>
                    <div style={fieldWrap}>
                      <Label required>Sector de la empresa</Label>
                      <select value={form.sector_empresa} onChange={e => set("sector_empresa", e.target.value)} style={{ ...inputStyle, borderColor: errors.sector_empresa ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                        <option value="" style={{ background: "#141414" }}>Selecciona un sector</option>
                        {SECTORES_EMPRESA.map(s => <option key={s} value={s} style={{ background: "#141414" }}>{s}</option>)}
                      </select>
                    </div>
                    <div style={fieldWrap}>
                      <Label required>Presupuesto disponible</Label>
                      <select value={form.presupuesto} onChange={e => set("presupuesto", e.target.value)} style={{ ...inputStyle, borderColor: errors.presupuesto ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                        <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                        {PRESUPUESTO_OPTIONS.map(p => <option key={p} value={p} style={{ background: "#141414" }}>{p}</option>)}
                      </select>
                      {isBlocked && (
                        <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "11px", color: "#ff5833", margin: "4px 0 0", lineHeight: 1.4 }}>
                          Actualmente solo trabajamos con marcas que buscan invertir en su proyecto.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
                  {step > 1 && (
                    <button
                      onClick={() => { setStep(s => s - 1); setErrors({}); }}
                      style={{
                        flex: "0 0 auto", background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "9px", padding: "12px 16px", color: "rgba(240,237,232,0.5)",
                        fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 600, fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      ← Atrás
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      onClick={nextStep}
                      style={{
                        flex: 1, background: "#ff5833", border: "none", borderRadius: "9px",
                        padding: "12px 20px", color: "#fff",
                        fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "0.9rem",
                        cursor: "pointer", transition: "background 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#e04a28"}
                      onMouseLeave={e => e.currentTarget.style.background = "#ff5833"}
                    >
                      Continuar →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={sending || isBlocked}
                      style={{
                        flex: 1, borderRadius: "9px", padding: "12px 20px", fontWeight: 900,
                        fontFamily: "'Helvetica Neue', sans-serif", fontSize: "0.9rem",
                        border: "none",
                        cursor: isBlocked ? "not-allowed" : "pointer",
                        background: isBlocked ? "rgba(255,255,255,0.06)" : "#ff5833",
                        color: isBlocked ? "rgba(255,255,255,0.2)" : "#fff",
                        transition: "all 0.2s",
                      }}
                    >
                      {sending ? "Enviando..." : "Enviar solicitud →"}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}