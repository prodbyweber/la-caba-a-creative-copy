import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

// ── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Contacto" },
  { id: 2, label: "Empresa" },
  { id: 3, label: "Tu Marca" },
];

// ── Form options ─────────────────────────────────────────────────────────────
const CARGOS = [
  "CEO / Fundador",
  "Socio / Co-fundador",
  "Director General",
  "Director de Marketing",
  "Director Creativo",
  "Responsable de Marca",
  "Responsable de Comunicación",
  "Responsable de Contenido / Social Media",
  "Otro",
];

const SECTORES = [
  "Moda", "Belleza", "Tecnología", "Hostelería", "Fitness",
  "Educación", "Inmobiliaria", "Salud", "Entretenimiento", "Retail",
  "Automoción", "Finanzas", "Gastronomía", "Turismo", "Marca personal",
  "Música y Audio", "Otro",
];

const TAMANO_EQUIPO = [
  "Solo yo o un equipo muy pequeño",
  "Entre 2 y 10 personas",
  "Entre 11 y 50 personas",
  "Más de 50 personas",
];

const UBICACION = [
  "Sí, estoy en Madrid o cerca",
  "Sí, tengo disposición de viajar",
  "No, prefiero trabajar de forma remota",
];

const PRESENCIA_DIGITAL = [
  "Apenas tenemos presencia, queremos arrancar",
  "Tenemos redes pero no conectan con la Gen Z",
  "Tenemos contenido pero no convierte",
  "Ya tenemos tracción y queremos escalar",
];

const OBJETIVO = [
  "Conectar con audiencia Gen Z",
  "Aumentar ventas y conversión",
  "Construir una identidad de marca sólida",
  "Crear contenido recurrente y consistente",
];

const PRESUPUESTO = [
  "Sí, puedo invertir si el proyecto tiene sentido para mí",
  "Sí, pero necesitaría dividirlo en dos pagos",
  "Todavía no estoy en posición de invertir",
];

const BLOCKED_PRESUPUESTO = "Todavía no estoy en posición de invertir";

const TIMING = [
  "Ahora mismo, estoy listo",
  "La semana que viene",
  "El próximo mes",
  "Todavía no quiero comenzar",
];

const BLOCKED_TIMING = "Todavía no quiero comenzar";

// ── Styles ───────────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "#141414", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", padding: "10px 13px", fontSize: "14px", color: "#f0ede8",
  fontFamily: "'Helvetica Neue', sans-serif", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle = {
  fontFamily: "'Helvetica Neue', sans-serif", fontSize: "12px", fontWeight: 600,
  color: "rgba(240,237,232,0.6)", marginBottom: "5px", display: "block",
};

const fieldWrap = { display: "flex", flexDirection: "column", gap: "4px" };

// ── Sub-components ───────────────────────────────────────────────────────────
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
                fontFamily: "'Helvetica Neue', sans-serif", fontSize: "10px",
                fontWeight: active ? 700 : 400,
                color: active ? "#f0ede8" : "rgba(240,237,232,0.3)",
              }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: "1px", margin: "0 6px",
                background: done ? "#ff5833" : "rgba(255,255,255,0.1)",
                marginBottom: "18px", transition: "background 0.3s",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** Dropdown / accordion selector — closed by default, click to open */
function AccordionSelect({ value, onChange, options, placeholder = "Selecciona una opción", hasError = false }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          ...inputStyle,
          borderColor: hasError ? "#ff5833" : open ? "rgba(255,88,51,0.5)" : "rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", textAlign: "left", paddingRight: "10px",
        }}
      >
        <span style={{ color: value ? "#f0ede8" : "rgba(240,237,232,0.25)" }}>
          {value || placeholder}
        </span>
        <ChevronDown size={15} style={{
          color: "rgba(240,237,232,0.3)",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s", flexShrink: 0,
        }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px", marginTop: "4px", maxHeight: "200px", overflowY: "auto",
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        }}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                width: "100%", textAlign: "left", background: value === opt ? "rgba(255,88,51,0.12)" : "transparent",
                border: "none", padding: "10px 13px", fontSize: "13px", color: value === opt ? "#ff5833" : "rgba(240,237,232,0.7)",
                fontFamily: "'Helvetica Neue', sans-serif", cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
              onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = "transparent"; }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Multi-select chip group — always visible */
function ChipGroup({ options, selected = [], onChange }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: "6px 14px", borderRadius: "20px", border: active ? "1px solid rgba(255,88,51,0.35)" : "1px solid rgba(255,255,255,0.08)",
              background: active ? "rgba(255,88,51,0.15)" : "transparent",
              color: active ? "#ff5833" : "rgba(240,237,232,0.45)",
              fontSize: "12px", fontWeight: 600, fontFamily: "'Helvetica Neue', sans-serif",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ── INITIAL FORM ─────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  nombre: "", apellidos: "", email: "", telefono: "", cargo_empresa: "",
  privacidad: false,
  sector_empresa: [],
  tamano_equipo: "",
  disponibilidad_ubicacion: "",
  presencia_digital: "",
  objetivo_marca: "",
  presupuesto_disponible: "",
  timing_arranque: "",
};

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MarcasApplicationModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = true;
    if (!form.apellidos.trim()) e.apellidos = true;
    if (!form.email.trim() || !form.email.includes("@")) e.email = true;
    if (!form.telefono.trim()) e.telefono = true;
    if (!form.cargo_empresa) e.cargo_empresa = true;
    if (!form.privacidad) e.privacidad = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (form.sector_empresa.length === 0) e.sector_empresa = true;
    if (!form.tamano_equipo) e.tamano_equipo = true;
    if (!form.disponibilidad_ubicacion) e.disponibilidad_ubicacion = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.presencia_digital) e.presencia_digital = true;
    if (!form.objetivo_marca) e.objetivo_marca = true;
    if (!form.presupuesto_disponible) e.presupuesto_disponible = true;
    if (!form.timing_arranque) e.timing_arranque = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
    setErrors({});
  };

  // ── Blocking logic ────────────────────────────────────────────────────────
  const isBlockedPresupuesto = form.presupuesto_disponible === BLOCKED_PRESUPUESTO;
  const isBlockedTiming = form.timing_arranque === BLOCKED_TIMING;
  const isSubmitDisabled = isBlockedPresupuesto || isBlockedTiming || sending;

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    if (isSubmitDisabled) return;
    setSending(true);
    await base44.entities.BrandLead.create({
      nombre: form.nombre,
      apellidos: form.apellidos,
      email: form.email,
      telefono: form.telefono,
      cargo_empresa: form.cargo_empresa,
      sector_empresa: form.sector_empresa,
      tamano_equipo: form.tamano_equipo,
      disponibilidad_ubicacion: form.disponibilidad_ubicacion,
      presencia_digital: form.presencia_digital,
      objetivo_marca: form.objetivo_marca,
      presupuesto_disponible: form.presupuesto_disponible,
      timing_arranque: form.timing_arranque,
      fecha_envio: new Date().toISOString(),
    });
    setSending(false);
    onClose();
    window.location.href = "/solicitud";
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setForm(INITIAL_FORM);
      setErrors({});
    }, 300);
  };

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
          padding: "16px", overflowY: "auto",
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
              cursor: "pointer", transition: "all 0.2s", color: "#f0ede8", flexShrink: 0,
            }}
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
              background: "#0e0e0e", borderRadius: "18px", width: "100%",
              maxHeight: "90dvh", overflowY: "auto", overflowX: "hidden",
              padding: "20px", boxSizing: "border-box",
              border: "1px solid rgba(255,255,255,0.08)", position: "relative",
            }}
          >
            <StepIndicator current={step} />

            {/* ═══════════════ STEP 1 — Datos de contacto ═══════════════ */}
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
                  <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "10px", color: "rgba(240,237,232,0.25)", margin: "0 0 4px" }}>
                    Indícanos un número de contacto directo
                  </p>
                  <input type="tel" style={{ ...inputStyle, borderColor: errors.telefono ? "#ff5833" : "rgba(255,255,255,0.1)" }} value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="612 345 678" />
                </div>
                <div style={fieldWrap}>
                  <Label required>Cargo en la empresa</Label>
                  <AccordionSelect
                    value={form.cargo_empresa}
                    onChange={v => set("cargo_empresa", v)}
                    options={CARGOS}
                    placeholder="Selecciona tu cargo"
                    hasError={errors.cargo_empresa}
                  />
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

            {/* ═══════════════ STEP 2 — Tu empresa ═══════════════ */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#f0ede8", margin: "0 0 3px" }}>Tu empresa</h3>
                  <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "rgba(240,237,232,0.3)", margin: 0 }}>Cuéntanos sobre tu negocio</p>
                </div>

                {/* Sector — chips multi-select */}
                <div style={fieldWrap}>
                  <Label required>¿A qué se dedica tu empresa?</Label>
                  <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "10px", color: "rgba(240,237,232,0.25)", margin: "0 0 6px" }}>
                    (puedes elegir varios)
                  </p>
                  <ChipGroup
                    options={SECTORES}
                    selected={form.sector_empresa}
                    onChange={v => set("sector_empresa", v)}
                  />
                  {errors.sector_empresa && (
                    <span style={{ fontSize: "11px", color: "#ff5833", fontFamily: "'Helvetica Neue', sans-serif" }}>Selecciona al menos un sector</span>
                  )}
                </div>

                {/* Tamaño del equipo */}
                <div style={fieldWrap}>
                  <Label required>¿Cuántas personas tiene tu equipo?</Label>
                  <AccordionSelect
                    value={form.tamano_equipo}
                    onChange={v => set("tamano_equipo", v)}
                    options={TAMANO_EQUIPO}
                    placeholder="Selecciona una opción"
                    hasError={errors.tamano_equipo}
                  />
                </div>

                {/* Ubicación / disponibilidad */}
                <div style={fieldWrap}>
                  <Label required>Producimos en Madrid. ¿Estás cerca o tienes disposición de viajar?</Label>
                  <AccordionSelect
                    value={form.disponibilidad_ubicacion}
                    onChange={v => set("disponibilidad_ubicacion", v)}
                    options={UBICACION}
                    placeholder="Selecciona una opción"
                    hasError={errors.disponibilidad_ubicacion}
                  />
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 3 — Tu marca ═══════════════ */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#f0ede8", margin: "0 0 3px" }}>Tu marca</h3>
                  <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "rgba(240,237,232,0.3)", margin: 0 }}>Define tu estrategia de marca</p>
                </div>

                {/* Presencia digital */}
                <div style={fieldWrap}>
                  <Label required>¿En qué momento está tu presencia digital?</Label>
                  <AccordionSelect
                    value={form.presencia_digital}
                    onChange={v => set("presencia_digital", v)}
                    options={PRESENCIA_DIGITAL}
                    placeholder="Selecciona una opción"
                    hasError={errors.presencia_digital}
                  />
                </div>

                {/* Objetivo */}
                <div style={fieldWrap}>
                  <Label required>¿Qué quieres conseguir?</Label>
                  <AccordionSelect
                    value={form.objetivo_marca}
                    onChange={v => set("objetivo_marca", v)}
                    options={OBJETIVO}
                    placeholder="Selecciona una opción"
                    hasError={errors.objetivo_marca}
                  />
                </div>

                {/* Presupuesto */}
                <div style={fieldWrap}>
                  <Label required>¿Estás listo para invertir en tu marca?</Label>
                  <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "10px", color: "rgba(240,237,232,0.25)", margin: "0 0 4px" }}>
                    Nuestros planes para marcas arrancan desde 5.000€
                  </p>
                  <AccordionSelect
                    value={form.presupuesto_disponible}
                    onChange={v => set("presupuesto_disponible", v)}
                    options={PRESUPUESTO}
                    placeholder="Selecciona una opción"
                    hasError={errors.presupuesto_disponible}
                  />
                  {isBlockedPresupuesto && (
                    <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "11px", color: "#ff5833", margin: "4px 0 0", lineHeight: 1.4 }}>
                      Solo trabajamos con marcas listas para apostar por su proyecto.
                    </p>
                  )}
                </div>

                {/* Timing */}
                <div style={fieldWrap}>
                  <Label required>¿Cuándo quieres arrancar?</Label>
                  <AccordionSelect
                    value={form.timing_arranque}
                    onChange={v => set("timing_arranque", v)}
                    options={TIMING}
                    placeholder="Selecciona una opción"
                    hasError={errors.timing_arranque}
                  />
                  {form.timing_arranque === "El próximo mes" && (
                    <div style={{
                      background: "rgba(255,88,51,0.08)", border: "0.5px solid rgba(255,88,51,0.25)",
                      borderRadius: "8px", padding: "8px 12px", fontSize: "12px",
                      color: "#ff5833", fontFamily: "'Helvetica Neue', sans-serif",
                      marginTop: "4px", lineHeight: 1.4,
                    }}>
                      Abrimos un número cerrado de plazas cada año. Para el próximo mes puede que ya no quede ninguna.
                    </div>
                  )}
                  {isBlockedTiming && (
                    <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "11px", color: "#ff5833", margin: "4px 0 0", lineHeight: 1.4 }}>
                      Solo trabajamos con marcas que saben cuándo quieren empezar.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Navigation buttons ──────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => { setStep(s => s - 1); setErrors({}); }}
                  style={{
                    flex: "0 0 auto", background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "9px", padding: "12px 16px", color: "rgba(240,237,232,0.5)",
                    fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                  }}
                >
                  ← Atrás
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
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
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  style={{
                    flex: 1, borderRadius: "9px", padding: "12px 20px", fontWeight: 900,
                    fontFamily: "'Helvetica Neue', sans-serif", fontSize: "0.9rem", border: "none",
                    cursor: isSubmitDisabled ? "not-allowed" : "pointer",
                    background: isSubmitDisabled ? "rgba(255,255,255,0.06)" : "#ff5833",
                    color: isSubmitDisabled ? "rgba(255,255,255,0.2)" : "#fff",
                    transition: "all 0.2s",
                  }}
                >
                  {sending ? "Enviando..." : "Agendar videollamada →"}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}