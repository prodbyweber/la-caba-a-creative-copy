import React from "react";

// Paso 4: Información del cliente.
export default function StepInfo({ info, onChange }) {
  const set = (field) => (e) => onChange({ ...info, [field]: e.target.value });

  const fields = [
    { key: "customer_name", label: "Nombre", required: true, type: "text", placeholder: "Tu nombre" },
    { key: "customer_last_name", label: "Apellidos", required: false, type: "text", placeholder: "Tus apellidos" },
    { key: "email", label: "Email", required: true, type: "email", placeholder: "tu@email.com" },
    { key: "phone", label: "Teléfono", required: false, type: "tel", placeholder: "+34 600 000 000" },
    { key: "artist_project", label: "Nombre artístico / proyecto", required: false, type: "text", placeholder: "Tu proyecto musical" },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>Tus datos</h2>
        <p className="text-white/40 text-sm">Necesitamos algunos datos para gestionar tu reserva.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className={f.key === "artist_project" ? "sm:col-span-2" : ""}>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              {f.label} {f.required && <span className="text-[#ff5833]">*</span>}
            </label>
            <input
              type={f.type}
              value={info[f.key] || ""}
              onChange={set(f.key)}
              placeholder={f.placeholder}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#ff5833]/50 transition-colors"
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Notas adicionales</label>
          <textarea
            value={info.notes || ""}
            onChange={set("notes")}
            placeholder="Cuéntanos algo sobre tu proyecto o necesidades…"
            rows={3}
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#ff5833]/50 transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
}