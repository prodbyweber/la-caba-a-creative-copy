import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

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
  { id: 3, label: "Experiencia" },
];

const inputStyle = {
  width: "100%",
  background: "#141414",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  padding: "13px 16px",
  fontSize: "15px",
  color: "#f0ede8",
  fontFamily: "'Helvetica Neue', sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle = {
  fontFamily: "'Helvetica Neue', sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  color: "rgba(240,237,232,0.7)",
  marginBottom: "6px",
  display: "block",
};

const fieldWrap = { display: "flex", flexDirection: "column", gap: "6px" };

function Label({ children, required }) {
  return (
    <label style={labelStyle}>
      {children}{required && <span style={{ color: "#ff5833", marginLeft: 3 }}>*</span>}
    </label>
  );
}

function StepIndicator({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "32px" }}>
      {STEPS.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: done || active ? "#ff5833" : "#1a1a1a",
                border: done || active ? "none" : "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 700,
                color: done || active ? "#fff" : "rgba(240,237,232,0.3)",
                fontFamily: "'Helvetica Neue', sans-serif",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : s.id}
              </div>
              <span style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "11px",
                fontWeight: active ? 700 : 400,
                color: active ? "#f0ede8" : "rgba(240,237,232,0.3)",
              }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: "1px", margin: "0 8px",
                background: done ? "#ff5833" : "rgba(255,255,255,0.1)",
                marginBottom: "22px",
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
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1
    nombre: "", apellidos: "", email: "", phoneCode: "+34", phone: "", birthdate: "",
    // Step 2
    pais_residencia: "", nacionalidad: "", viaje_madrid: "",
    // Step 3
    situacion_laboral: "", experiencia_musica: "", presupuesto: false,
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
    if (!form.situacion_laboral) e.situacion_laboral = true;
    if (!form.experiencia_musica) e.experiencia_musica = true;
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
      situacion_laboral: form.situacion_laboral,
      experiencia_musica: form.experiencia_musica,
      presupuesto_minimo: form.presupuesto,
    });
    setSending(false);
    setSent(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep(1); setForm({ nombre:"",apellidos:"",email:"",phoneCode:"+34",phone:"",birthdate:"",pais_residencia:"",nacionalidad:"",viaje_madrid:"",situacion_laboral:"",experiencia_musica:"",presupuesto:false }); setSent(false); setErrors({}); }, 300);
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
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          padding: "0",
        }}
        onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "#0e0e0e",
            borderRadius: "20px 20px 0 0",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "92dvh",
            overflowY: "auto",
            padding: "28px 24px calc(28px + env(safe-area-inset-bottom, 0px))",
            boxSizing: "border-box",
            border: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "none",
          }}
        >
          {/* Handle */}
          <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, margin: "0 auto 24px" }} />

          {sent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#f0ede8", marginBottom: "10px" }}>¡Solicitud enviada!</h3>
              <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "rgba(240,237,232,0.5)", lineHeight: 1.6 }}>Nuestro equipo revisará tu solicitud y te contactará en menos de 24h.</p>
              <button onClick={handleClose} style={{ marginTop: "28px", background: "#ff5833", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 32px", fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>Cerrar</button>
            </div>
          ) : (
            <>
              <StepIndicator current={step} />

              {/* Step 1 — Datos */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.25rem", color: "#f0ede8", margin: "0 0 4px" }}>Datos personales</h3>
                    <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.82rem", color: "rgba(240,237,232,0.35)", margin: 0 }}>Información de contacto</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
                    <Label required>Número de teléfono</Label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <select
                        value={form.phoneCode}
                        onChange={e => set("phoneCode", e.target.value)}
                        style={{ ...inputStyle, width: "110px", flexShrink: 0 }}
                      >
                        {PHONE_CODES.map(p => <option key={p.code} value={p.code} style={{ background: "#141414" }}>{p.country} {p.code}</option>)}
                      </select>
                      <input type="tel" style={{ ...inputStyle, borderColor: errors.phone ? "#ff5833" : "rgba(255,255,255,0.1)" }} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="612 345 678" />
                    </div>
                  </div>
                  <div style={fieldWrap}>
                    <Label required>Fecha de nacimiento</Label>
                    <input type="date" style={{ ...inputStyle, borderColor: errors.birthdate ? "#ff5833" : "rgba(255,255,255,0.1)", colorScheme: "dark" }} value={form.birthdate} onChange={e => set("birthdate", e.target.value)} max={new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split("T")[0]} />
                    {errors.birthdate === "minor" && <span style={{ fontSize: "12px", color: "#ff5833", fontFamily: "'Helvetica Neue', sans-serif" }}>Debes ser mayor de 18 años para solicitar plaza.</span>}
                  </div>
                </div>
              )}

              {/* Step 2 — Ubicación */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.25rem", color: "#f0ede8", margin: "0 0 4px" }}>Ubicación</h3>
                    <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.82rem", color: "rgba(240,237,232,0.35)", margin: 0 }}>Ubicación y disponibilidad</p>
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
                    <Label required>¿Tienes disposición de viajar a Madrid para trabajar juntos?</Label>
                    <select value={form.viaje_madrid} onChange={e => set("viaje_madrid", e.target.value)} style={{ ...inputStyle, borderColor: errors.viaje_madrid ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                      <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                      <option value="si" style={{ background: "#141414" }}>Sí</option>
                      <option value="no" style={{ background: "#141414" }}>No</option>
                    </select>
                    {errors.viaje_madrid === "no" && (
                      <div style={{ background: "rgba(255,88,51,0.08)", border: "1px solid rgba(255,88,51,0.25)", borderRadius: "8px", padding: "12px 14px", marginTop: "4px" }}>
                        <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "13px", color: "rgba(255,88,51,0.9)", margin: 0, lineHeight: 1.5 }}>
                          Nuestro programa de desarrollo artístico requiere sesiones presenciales en Madrid. Es necesaria disponibilidad para desplazarse.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 — Experiencia */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.25rem", color: "#f0ede8", margin: "0 0 4px" }}>Experiencia</h3>
                    <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.82rem", color: "rgba(240,237,232,0.35)", margin: 0 }}>Tu situación profesional actual</p>
                  </div>
                  <div style={fieldWrap}>
                    <Label required>Situación laboral actual</Label>
                    <select value={form.situacion_laboral} onChange={e => set("situacion_laboral", e.target.value)} style={{ ...inputStyle, borderColor: errors.situacion_laboral ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                      <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                      <option value="empleado" style={{ background: "#141414" }}>Empleado/a</option>
                      <option value="autonomo" style={{ background: "#141414" }}>Autónomo/a</option>
                      <option value="estudiante" style={{ background: "#141414" }}>Estudiante</option>
                      <option value="desempleado" style={{ background: "#141414" }}>Desempleado/a</option>
                      <option value="artista_activo" style={{ background: "#141414" }}>Artista activo/a</option>
                      <option value="otro" style={{ background: "#141414" }}>Otro</option>
                    </select>
                  </div>
                  <div style={fieldWrap}>
                    <Label required>Experiencia creando música</Label>
                    <select value={form.experiencia_musica} onChange={e => set("experiencia_musica", e.target.value)} style={{ ...inputStyle, borderColor: errors.experiencia_musica ? "#ff5833" : "rgba(255,255,255,0.1)" }}>
                      <option value="" style={{ background: "#141414" }}>Selecciona una opción</option>
                      <option value="ninguna" style={{ background: "#141414" }}>Sin experiencia previa</option>
                      <option value="menos_1" style={{ background: "#141414" }}>Menos de 1 año</option>
                      <option value="1_3" style={{ background: "#141414" }}>1 – 3 años</option>
                      <option value="3_5" style={{ background: "#141414" }}>3 – 5 años</option>
                      <option value="mas_5" style={{ background: "#141414" }}>Más de 5 años</option>
                    </select>
                  </div>
                  <div style={{ background: "#141414", border: errors.presupuesto ? "1px solid #ff5833" : "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px" }}>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
                      <div
                        onClick={() => set("presupuesto", !form.presupuesto)}
                        style={{
                          width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                          background: form.presupuesto ? "#ff5833" : "transparent",
                          border: form.presupuesto ? "none" : "2px solid rgba(255,255,255,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s", cursor: "pointer",
                        }}
                      >
                        {form.presupuesto && <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "14px", color: "rgba(240,237,232,0.75)", lineHeight: 1.5 }}>
                        Confirmo que cuento con un presupuesto mínimo de <strong style={{ color: "#ff5833" }}>2.000€</strong> para invertir en mi desarrollo artístico.
                      </span>
                    </label>
                    {errors.presupuesto && <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "12px", color: "#ff5833", margin: "10px 0 0" }}>Es necesario confirmar el presupuesto mínimo para continuar.</p>}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
                {step > 1 && (
                  <button
                    onClick={() => { setStep(s => s - 1); setErrors({}); }}
                    style={{
                      flex: "0 0 auto", background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "10px", padding: "14px 20px", color: "rgba(240,237,232,0.5)",
                      fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 600, fontSize: "0.9rem",
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
                      flex: 1, background: "#ff5833", border: "none", borderRadius: "10px",
                      padding: "14px 20px", color: "#fff",
                      fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "0.95rem",
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
                    disabled={sending || !form.presupuesto}
                    style={{
                      flex: 1, borderRadius: "10px", padding: "14px 20px", fontWeight: 900,
                      fontFamily: "'Helvetica Neue', sans-serif", fontSize: "0.95rem",
                      border: "none", cursor: form.presupuesto ? "pointer" : "not-allowed",
                      background: form.presupuesto ? "#ff5833" : "#2a2a2a",
                      color: form.presupuesto ? "#fff" : "rgba(240,237,232,0.25)",
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
      </motion.div>
    </AnimatePresence>
  );
}