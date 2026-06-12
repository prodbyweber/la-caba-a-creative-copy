import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const COUNTRIES = [
  "España","México","Argentina","Colombia","Chile","Perú","Venezuela","Ecuador","Bolivia","Paraguay","Uruguay","Cuba","República Dominicana","Guatemala","Honduras","El Salvador","Nicaragua","Costa Rica","Panamá","Puerto Rico","Estados Unidos","Reino Unido","Francia","Alemania","Italia","Portugal","Países Bajos","Bélgica","Suiza","Austria","Polonia","Rumania","Suecia","Noruega","Dinamarca","Finlandia","Japón","China","India","Brasil","Australia","Canadá","Otro"
];

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
  { id: 3, label: "Tu proyecto" },
];

const GENEROS = [
  "Reggaetón","Trap","Pop","R&B","House","Afrobeats","Drill","Indie",
  "Electrónica","Hip-Hop","Dancehall","Latin Pop","Urbano","Experimental",
  "Jersey Club","Salsa","Flamenco","Rock","Soul","Otro",
];

const FASES_PROYECTO = [
  "Quiero crear canciones desde cero y empezar a construir",
  "Tengo maquetas o demos sin producir",
  "Tengo canciones producidas que nunca lancé bien",
  "Tengo releases publicados pero no estoy creciendo",
];

const OBJETIVOS = [
  "Lanzar mi primer proyecto de forma profesional",
  "Construir una identidad artística sólida",
  "Crecer mi audiencia",
  "Mejorar la calidad de mi música y mi sonido",
  "Preparar mi proyecto para presentarlo a sellos",
];

const PRESUPUESTOS = [
  "Sí, puedo invertir si el proyecto tiene sentido para mí",
  "Sí, pero necesitaría dividirlo en dos pagos",
  "Todavía no estoy en posición de invertir",
];

const TIMINGS = [
  "Ahora mismo, estoy listo",
  "La semana que viene",
  "El próximo mes (Plazas limitadas)",
  "Todavía no quiero comenzar",
];

const PRESUPUESTO_BLOQUEANTE = "Todavía no estoy en posición de invertir";
const TIMING_BLOQUEANTE = "Todavía no quiero comenzar";
const TIMING_LIMITADAS = "El próximo mes (Plazas limitadas)";

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

export default function ApplicationModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [config, setConfig] = useState(null);

  useEffect(() => {
    base44.entities.LandingConfig.filter({}).then(configs => {
      if (configs && configs.length > 0) {
        setConfig(configs[0]);
      }
    });
  }, []);

  const [form, setForm] = useState({
    nombre: "", apellidos: "", email: "", phoneCode: "+34", phone: "", birthdate: "",
    privacidad: false,
    pais_residencia: "", nacionalidad: "", viaje_madrid: "",
    generos_musicales: [], fase_proyecto: "", objetivo_cabana: "",
    presupuesto_disponible: "", timing_arranque: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
    if (!form.pais_residencia) e.pais_residencia = true;
    if (!form.nacionalidad) e.nacionalidad = true;
    if (!form.viaje_madrid) e.viaje_madrid = true;
    else if (form.viaje_madrid === "no") e.viaje_madrid = "no";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (form.generos_musicales.length === 0) e.generos_musicales = true;
    if (!form.fase_proyecto) e.fase_proyecto = true;
    if (!form.objetivo_cabana) e.objetivo_cabana = true;
    if (!form.presupuesto_disponible) e.presupuesto_disponible = true;
    if (!form.timing_arranque) e.timing_arranque = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isSubmitBlocked =
    form.presupuesto_disponible === PRESUPUESTO_BLOQUEANTE ||
    form.timing_arranque === TIMING_BLOQUEANTE;

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    if (isSubmitBlocked) return;
    setSending(true);
    await base44.entities.ApplicationForm.create({
      nombre: form.nombre,
      apellidos: form.apellidos,
      email: form.email,
      telefono: form.phoneCode + " " + form.phone,
      fecha_nacimiento: form.birthdate,
      pais_residencia: form.pais_residencia,
      nacionalidad: form.nacionalidad,
      disponibilidad_viaje_madrid: form.viaje_madrid,
      generos_musicales: form.generos_musicales,
      fase_proyecto: form.fase_proyecto,
      objetivo_cabana: form.objetivo_cabana,
      presupuesto_disponible: form.presupuesto_disponible,
      timing_arranque: form.timing_arranque,
      fecha_envio: new Date().toISOString(),
    });
    setSending(false);
    onClose();
    window.location.href = "/gracias";
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setForm({ nombre:"",apellidos:"",email:"",phoneCode:"+34",phone:"",birthdate:"",privacidad:false,pais_residencia:"",nacionalidad:"",viaje_madrid:"",generos_musicales:[],fase_proyecto:"",objetivo_cabana:"",presupuesto_disponible:"",timing_arranque:"" });
      setErrors({});
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
        onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <div style={{ position: "relative", maxWidth: "460px", width: "100%", margin: "0 auto" }}>
          {/* Close button — outside the card, aligned with step 3 */}
          <button
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            style={{
              position: "absolute", top: "-44px", right: "0", zIndex: 100,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s",
              color: "#f0ede8", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1)"; }}
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
              maxWidth: "460px",
              maxHeight: "90dvh",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "20px",
              boxSizing: "border-box",
              border: "1px solid rgba(255,255,255,0.08)",
              position: "relative",
            }}
          >

          <>
              <StepIndicator current={step} />

              {/* Step 1 — Datos */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#f0ede8", margin: "0 0 3px" }}>Datos personales</h3>
                    <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "rgba(240,237,232,0.3)", margin: 0 }}>Información de contacto</p>
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
                    <input type="email" style={{ ...inputStyle, borderColor: errors.email ? "#ff5833" : "rgba(255,255,255,0.1)" }} value={form.email} onChange={e => set("email", e.target.value)} placeholder="tu@email.com" />
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
                    <input type="date" style={{ ...inputStyle, borderColor: errors.birthdate ? "#ff5833" : "rgba(255,255,255,0.1)", colorScheme: "dark", width: "calc(100% - 26px)", margin: "0 auto", display: "block" }} value={form.birthdate} onChange={e => set("birthdate", e.target.value)} max={new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split("T")[0]} />
                    {errors.birthdate === "minor" && <span style={{ fontSize: "11px", color: "#ff5833", fontFamily: "'Helvetica Neue', sans-serif" }}>Debes ser mayor de 18 años para solicitar plaza.</span>}
                  </div>

                  {/* Política de privacidad */}
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
                    <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#f0ede8", margin: "0 0 3px" }}>Ubicación</h3>
                    <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "rgba(240,237,232,0.3)", margin: 0 }}>Residencia y disponibilidad</p>
                  </div>
                  <div style={fieldWrap}>
                    <Label required>País de residencia</Label>
                    <select value={form.pais_residencia} onChange={e => set("pais_residencia", e.target.value)} style={{ ...inputStyle, borderColor: errors.pais_residencia ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                      <option value="" style={{ background: "#141414" }}>Selecciona país</option>
                      {COUNTRIES.map(c => <option key={c} value={c} style={{ background: "#141414" }}>{c}</option>)}
                    </select>
                  </div>
                  <div style={fieldWrap}>
                    <Label required>Nacionalidad</Label>
                    <select value={form.nacionalidad} onChange={e => set("nacionalidad", e.target.value)} style={{ ...inputStyle, borderColor: errors.nacionalidad ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                      <option value="" style={{ background: "#141414" }}>Selecciona nacionalidad</option>
                      {COUNTRIES.map(c => <option key={c} value={c} style={{ background: "#141414" }}>{c}</option>)}
                    </select>
                  </div>
                  <div style={fieldWrap}>
                    <Label required>Producimos en Madrid. ¿Estás cerca o tienes disposición de viajar?</Label>
                    <select value={form.viaje_madrid} onChange={e => set("viaje_madrid", e.target.value)} style={{ ...inputStyle, borderColor: errors.viaje_madrid ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                      <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                      <option value="si" style={{ background: "#141414" }}>Sí</option>
                      <option value="no" style={{ background: "#141414" }}>No</option>
                    </select>
                    {errors.viaje_madrid === "no" && (
                      <div style={{ background: "rgba(255,88,51,0.08)", border: "1px solid rgba(255,88,51,0.25)", borderRadius: "8px", padding: "10px 12px", marginTop: "4px" }}>
                        <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "12px", color: "rgba(255,88,51,0.9)", margin: 0, lineHeight: 1.5 }}>
                          Nuestro programa requiere sesiones presenciales en Madrid.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 — Tu proyecto */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#f0ede8", margin: "0 0 3px" }}>Tu proyecto</h3>
                    <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "rgba(240,237,232,0.3)", margin: 0 }}>Cuéntanos dónde estás y qué quieres construir</p>
                  </div>

                  {/* Campo 1 — Géneros */}
                  <div style={fieldWrap}>
                    <label style={labelStyle}>
                      ¿Con qué géneros musicales conectas?
                      <span style={{ color: "rgba(240,237,232,0.35)", fontWeight: 400, marginLeft: 4 }}>(puedes elegir varios)</span>
                      <span style={{ color: "#ff5833", marginLeft: 3 }}>*</span>
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "2px" }}>
                      {GENEROS.map(g => {
                        const sel = form.generos_musicales.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => set("generos_musicales", sel
                              ? form.generos_musicales.filter(x => x !== g)
                              : [...form.generos_musicales, g]
                            )}
                            style={{
                              fontFamily: "'Helvetica Neue', sans-serif",
                              fontSize: "12px", fontWeight: sel ? 700 : 400,
                              padding: "5px 11px", borderRadius: "20px",
                              border: sel ? "1px solid #ff5833" : "1px solid rgba(255,255,255,0.12)",
                              background: sel ? "rgba(255,88,51,0.12)" : "rgba(255,255,255,0.04)",
                              color: sel ? "#ff5833" : "rgba(240,237,232,0.55)",
                              cursor: "pointer", transition: "all 0.15s",
                            }}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                    {errors.generos_musicales && (
                      <span style={{ fontSize: "11px", color: "#ff5833", fontFamily: "'Helvetica Neue', sans-serif" }}>Selecciona al menos un género.</span>
                    )}
                  </div>

                  {/* Campo 2 — Fase */}
                  <div style={fieldWrap}>
                    <Label required>¿En qué fase está tu proyecto?</Label>
                    <select value={form.fase_proyecto} onChange={e => set("fase_proyecto", e.target.value)} style={{ ...inputStyle, borderColor: errors.fase_proyecto ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                      <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                      {FASES_PROYECTO.map(f => <option key={f} value={f} style={{ background: "#141414" }}>{f}</option>)}
                    </select>
                  </div>

                  {/* Campo 3 — Objetivo */}
                  <div style={fieldWrap}>
                    <Label required>¿Cuál es tu objetivo?</Label>
                    <select value={form.objetivo_cabana} onChange={e => set("objetivo_cabana", e.target.value)} style={{ ...inputStyle, borderColor: errors.objetivo_cabana ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                      <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                      {OBJETIVOS.map(o => <option key={o} value={o} style={{ background: "#141414" }}>{o}</option>)}
                    </select>
                  </div>

                  {/* Campo 4 — Presupuesto */}
                  <div style={fieldWrap}>
                    <Label required>¿Estás listo para invertir en tu proyecto?</Label>
                    <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.35)", margin: "0 0 5px" }}>Nuestros planes arrancan desde 3.000€</p>
                    <select value={form.presupuesto_disponible} onChange={e => set("presupuesto_disponible", e.target.value)} style={{ ...inputStyle, borderColor: errors.presupuesto_disponible ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                      <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                      {PRESUPUESTOS.map(p => <option key={p} value={p} style={{ background: "#141414" }}>{p}</option>)}
                    </select>
                    {form.presupuesto_disponible === PRESUPUESTO_BLOQUEANTE && (
                      <div style={{ background: "rgba(255,88,51,0.08)", border: "1px solid rgba(255,88,51,0.25)", borderRadius: "8px", padding: "10px 12px", marginTop: "4px" }}>
                        <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "12px", color: "rgba(255,88,51,0.9)", margin: 0, lineHeight: 1.5 }}>
                          Solo trabajamos con artistas listos para apostar por su proyecto.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Campo 5 — Timing */}
                  <div style={fieldWrap}>
                    <Label required>¿Cuándo quieres arrancar?</Label>
                    <select value={form.timing_arranque} onChange={e => set("timing_arranque", e.target.value)} style={{ ...inputStyle, borderColor: errors.timing_arranque ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                      <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                      {TIMINGS.map(t => (
                        <option key={t} value={t} style={{ background: "#141414" }}>{t}</option>
                      ))}
                    </select>
                    {form.timing_arranque === "El próximo mes (Plazas limitadas)" && (
                      <div style={{
                        background: "rgba(255, 88, 51, 0.08)",
                        border: "0.5px solid rgba(255, 88, 51, 0.25)",
                        borderRadius: "8px", padding: "8px 12px", marginTop: "6px",
                      }}>
                        <p style={{
                          fontFamily: "'Helvetica Neue', sans-serif",
                          fontSize: "12px", color: "#FF5833", margin: 0, lineHeight: 1.5,
                        }}>
                          Abrimos un número cerrado de plazas cada año. Para el próximo mes puede que ya no quede ninguna.
                        </p>
                      </div>
                    )}
                    {form.timing_arranque === TIMING_BLOQUEANTE && (
                      <div style={{ background: "rgba(255,88,51,0.08)", border: "1px solid rgba(255,88,51,0.25)", borderRadius: "8px", padding: "10px 12px", marginTop: "4px" }}>
                        <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "12px", color: "rgba(255,88,51,0.9)", margin: 0, lineHeight: 1.5 }}>
                          Solo trabajamos con artistas que saben cuándo quieren empezar.
                        </p>
                      </div>
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
                    disabled={sending || isSubmitBlocked}
                    style={{
                      flex: 1, borderRadius: "9px", padding: "12px 20px", fontWeight: 900,
                      fontFamily: "'Helvetica Neue', sans-serif", fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                      border: "none", cursor: (sending || isSubmitBlocked) ? "not-allowed" : "pointer",
                      background: isSubmitBlocked ? "rgba(255,88,51,0.25)" : "#ff5833",
                      color: isSubmitBlocked ? "rgba(255,255,255,0.35)" : "#fff",
                      transition: "all 0.2s",
                    }}
                  >
                    {sending ? "Enviando..." : "Agendar videollamada →"}
                  </button>
                )}
              </div>
            </>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}