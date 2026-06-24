import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Save, Eye, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// ─── Field component ──────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <label style={{
        display: "block", fontFamily: "'Helvetica Neue', sans-serif",
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.25em",
        textTransform: "uppercase", color: "rgba(240,237,232,0.4)",
        marginBottom: "8px",
      }}>
        {label}
      </label>
      {hint && (
        <p style={{
          fontFamily: "'Helvetica Neue', sans-serif",
          fontSize: "11px", color: "rgba(240,237,232,0.25)",
          marginBottom: "10px", lineHeight: 1.5,
        }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── Input styles ─────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: "10px",
  padding: "12px 14px",
  color: "#f0ede8",
  fontSize: "13px",
  fontFamily: "'Helvetica Neue', sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

export default function StudioSessionEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    bg_image_url: "",
    overlay_opacity: 0.72,
    iframe_2h: "",
    iframe_4h: "",
    iframe_6h: "",
  });
  const [uploading, setUploading] = useState(false);
  const [recordId, setRecordId] = useState(null);

  // Fetch config
  const { data: cfg, isLoading } = useQuery({
    queryKey: ["studioSessionConfig"],
    queryFn: async () => {
      const rows = await base44.entities.StudioSessionConfig.list();
      return rows[0] || null;
    },
  });

  // Populate form when data arrives
  useEffect(() => {
    if (cfg) {
      setRecordId(cfg.id);
      setForm({
        bg_image_url: cfg.bg_image_url || "",
        overlay_opacity: cfg.overlay_opacity ?? 0.72,
        iframe_2h: cfg.iframe_2h || "",
        iframe_4h: cfg.iframe_4h || "",
        iframe_6h: cfg.iframe_6h || "",
      });
    }
  }, [cfg]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (recordId) {
        await base44.entities.StudioSessionConfig.update(recordId, data);
      } else {
        await base44.entities.StudioSessionConfig.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studioSessionConfig"] });
      toast({ description: "Configuración guardada correctamente." });
    },
    onError: () => {
      toast({ description: "Error al guardar. Inténtalo de nuevo.", variant: "destructive" });
    },
  });

  const handleSave = () => saveMutation.mutate(form);

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, bg_image_url: file_url }));
      toast({ description: "Imagen subida correctamente." });
    } catch {
      toast({ description: "Error al subir la imagen.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100dvh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid #ff5833", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const opacityPct = Math.round((form.overlay_opacity ?? 0.72) * 100);

  return (
    <div style={{ minHeight: "100dvh", background: "#080808", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: "#f0ede8" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus { border-color: rgba(255,88,51,0.4) !important; }
        input[type="range"] { accent-color: #ff5833; }
      `}</style>

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "18px clamp(16px, 4vw, 40px)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(8,8,8,0.96)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            to="/AdminDashboard"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              color: "rgba(240,237,232,0.35)", textDecoration: "none",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "rgba(240,237,232,0.7)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(240,237,232,0.35)"}
          >
            <ArrowLeft size={12} />
            Admin
          </Link>
          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,232,0.5)" }}>
            Studio Session — Editor
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <a
            href="/StudioSession"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em",
              color: "rgba(240,237,232,0.4)", textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
              padding: "8px 14px", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f0ede8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(240,237,232,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <Eye size={13} />
            Vista previa
            <ExternalLink size={11} />
          </a>

          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "#ff5833", color: "#fff", border: "none",
              borderRadius: "8px", padding: "9px 18px",
              fontSize: "12px", fontWeight: 700, cursor: "pointer",
              transition: "background 0.2s, opacity 0.2s",
              opacity: saveMutation.isPending ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!saveMutation.isPending) e.currentTarget.style.background = "#e04a28"; }}
            onMouseLeave={(e) => e.currentTarget.style.background = "#ff5833"}
          >
            <Save size={13} />
            {saveMutation.isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "clamp(28px, 5vw, 48px) clamp(16px, 4vw, 40px)" }}>

        {/* SECTION: Fondo visual */}
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)", letterSpacing: "-0.03em", marginBottom: "6px" }}>
            Fondo visual
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(240,237,232,0.35)", marginBottom: "28px", lineHeight: 1.55 }}>
            Imagen de alta resolución que se muestra como fondo cinematográfico del estudio.
          </p>

          {/* Preview */}
          {form.bg_image_url && (
            <div style={{
              width: "100%", aspectRatio: "16/6", borderRadius: "12px",
              overflow: "hidden", marginBottom: "16px",
              border: "1px solid rgba(255,255,255,0.07)",
              position: "relative",
            }}>
              <img
                src={form.bg_image_url}
                alt="Preview fondo"
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: `brightness(${1 - form.overlay_opacity * 0.5})` }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: `rgba(8,8,8,${form.overlay_opacity * 0.7})`,
                display: "flex", alignItems: "flex-end", padding: "12px",
              }}>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
                  Vista previa con overlay aplicado
                </span>
              </div>
            </div>
          )}

          <Field
            label="Imagen de fondo del estudio"
            hint="Sube una foto del estudio en alta resolución (JPG/PNG recomendado, mínimo 1920×1080 px)."
          >
            <label style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: uploading ? "rgba(255,88,51,0.07)" : "rgba(255,255,255,0.04)",
              border: "1px dashed rgba(255,255,255,0.12)",
              borderRadius: "10px", padding: "16px 20px",
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {uploading ? (
                <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid #ff5833", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
              ) : (
                <Upload size={16} color="rgba(240,237,232,0.35)" />
              )}
              <span style={{ fontSize: "12px", color: "rgba(240,237,232,0.4)", fontWeight: 600 }}>
                {uploading ? "Subiendo imagen…" : form.bg_image_url ? "Cambiar imagen" : "Subir imagen del estudio"}
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
            </label>

            {form.bg_image_url && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  value={form.bg_image_url}
                  onChange={(e) => setForm((f) => ({ ...f, bg_image_url: e.target.value }))}
                  placeholder="O pega aquí una URL de imagen…"
                  style={inputStyle}
                />
              </div>
            )}
            {!form.bg_image_url && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  value={form.bg_image_url}
                  onChange={(e) => setForm((f) => ({ ...f, bg_image_url: e.target.value }))}
                  placeholder="O pega aquí una URL de imagen…"
                  style={inputStyle}
                />
              </div>
            )}
          </Field>

          {/* Overlay opacity slider */}
          <Field
            label={`Opacidad del sombreado — ${opacityPct}%`}
            hint="Controla la oscuridad del overlay sobre la imagen. A mayor valor, más oscuro y más legible el texto."
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "11px", color: "rgba(240,237,232,0.25)", width: "32px", flexShrink: 0 }}>0%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={form.overlay_opacity}
                onChange={(e) => setForm((f) => ({ ...f, overlay_opacity: parseFloat(e.target.value) }))}
                style={{ flex: 1, height: "4px", cursor: "pointer" }}
              />
              <span style={{ fontSize: "11px", color: "rgba(240,237,232,0.25)", width: "36px", flexShrink: 0 }}>100%</span>
              <span style={{
                fontSize: "12px", fontWeight: 700, color: "#ff5833",
                background: "rgba(255,88,51,0.1)", borderRadius: "6px",
                padding: "4px 10px", flexShrink: 0,
              }}>
                {opacityPct}%
              </span>
            </div>
          </Field>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "48px" }} />

        {/* SECTION: URLs de reserva */}
        <div>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)", letterSpacing: "-0.03em", marginBottom: "6px" }}>
            URLs de Google Calendar
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(240,237,232,0.35)", marginBottom: "28px", lineHeight: 1.55 }}>
            Pega aquí los enlaces <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>src</code> de cada iframe de Google Calendar Appointments. Se cargan de forma diferida al abrir el modal de reserva.
          </p>

          <Field
            label="Sesión de 2 Horas — URL del calendario"
            hint="Consultoría, estrategia o feedback de proyecto."
          >
            <textarea
              value={form.iframe_2h}
              onChange={(e) => setForm((f) => ({ ...f, iframe_2h: e.target.value }))}
              placeholder="https://calendar.google.com/calendar/appointments/schedules/…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </Field>

          <Field
            label="Sesión de 4 Horas — URL del calendario"
            hint="Producción activa, grabación de voz o refinamiento de mezcla."
          >
            <textarea
              value={form.iframe_4h}
              onChange={(e) => setForm((f) => ({ ...f, iframe_4h: e.target.value }))}
              placeholder="https://calendar.google.com/calendar/appointments/schedules/…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </Field>

          <Field
            label="Sesión de 6 Horas — URL del calendario"
            hint="Jornada intensiva: grabación de catálogo, mezcla o film scoring."
          >
            <textarea
              value={form.iframe_6h}
              onChange={(e) => setForm((f) => ({ ...f, iframe_6h: e.target.value }))}
              placeholder="https://calendar.google.com/calendar/appointments/schedules/…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </Field>
        </div>

        {/* Save bottom */}
        <div style={{ paddingTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#ff5833", color: "#fff", border: "none",
              borderRadius: "10px", padding: "13px 28px",
              fontSize: "13px", fontWeight: 700, cursor: "pointer",
              transition: "background 0.2s, opacity 0.2s",
              opacity: saveMutation.isPending ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!saveMutation.isPending) e.currentTarget.style.background = "#e04a28"; }}
            onMouseLeave={(e) => e.currentTarget.style.background = "#ff5833"}
          >
            <Save size={15} />
            {saveMutation.isPending ? "Guardando…" : "Guardar todos los cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}