import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, Building2, CreditCard, Banknote } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getPaymentConfig, clearPaymentConfigCache } from "@/lib/reservations";

// Panel de configuración de pagos para el admin.
// Datos bancarios (transferencia), link de tarjeta, y activación de métodos.
export default function PaymentConfigPanel() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: ["payment-config"],
    queryFn: getPaymentConfig,
    staleTime: 0,
  });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config !== undefined) {
      setForm({
        transfer_enabled: config?.transfer_enabled !== false,
        account_holder: config?.account_holder || "",
        bank_name: config?.bank_name || "",
        iban: config?.iban || "",
        bic_swift: config?.bic_swift || "",
        concept_instructions: config?.concept_instructions || "",
        transfer_extra_instructions: config?.transfer_extra_instructions || "",
        cash_enabled: config?.cash_enabled !== false,
        card_enabled: config?.card_enabled !== false,
        card_payment_link: config?.card_payment_link || "",
      });
    }
  }, [config]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const toggle = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.checked }));

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setSaved(false);
    try {
      if (config?.id) {
        await base44.entities.PaymentConfig.update(config.id, form);
      } else {
        await base44.entities.PaymentConfig.create(form);
      }
      clearPaymentConfigCache();
      queryClient.invalidateQueries({ queryKey: ["payment-config"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert("No se pudo guardar: " + (e?.message || "error"));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !form) return <p className="text-white/40 text-sm">Cargando configuración…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Configuración de pagos</h2>
          <p className="text-white/40 text-xs mt-0.5">Datos bancarios, link de tarjeta y métodos disponibles.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#ff5833] hover:bg-[#ff6b4a] text-white text-xs font-bold transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} {saved ? "Guardado ✓" : "Guardar"}
        </button>
      </div>

      {/* Transferencia */}
      <Section icon={Building2} title="Transferencia bancaria" enabled={form.transfer_enabled} onToggle={toggle("transfer_enabled")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Titular"><input value={form.account_holder} onChange={set("account_holder")} className="pcinp" placeholder="Cabaña Creative S.L." /></Field>
          <Field label="Banco"><input value={form.bank_name} onChange={set("bank_name")} className="pcinp" placeholder="BBVA" /></Field>
          <Field label="IBAN" full><input value={form.iban} onChange={set("iban")} className="pcinp" style={{ fontFamily: "ui-monospace, monospace" }} placeholder="ES00 0000 0000 0000 0000 0000" /></Field>
          <Field label="BIC/SWIFT"><input value={form.bic_swift} onChange={set("bic_swift")} className="pcinp" style={{ fontFamily: "ui-monospace, monospace" }} placeholder="BBVAESMMXXX" /></Field>
          <Field label="Concepto (instrucción)"><input value={form.concept_instructions} onChange={set("concept_instructions")} className="pcinp" placeholder="Nombre del cliente / número de reserva" /></Field>
          <Field label="Instrucciones adicionales" full><textarea value={form.transfer_extra_instructions} onChange={set("transfer_extra_instructions")} rows={2} className="pcinp resize-none" placeholder="Indicaciones extra para el cliente…" /></Field>
        </div>
      </Section>

      {/* Efectivo */}
      <Section icon={Banknote} title="Pago en efectivo" enabled={form.cash_enabled} onToggle={toggle("cash_enabled")}>
        <p className="text-white/40 text-xs">Activa o desactiva la opción de pago en efectivo para los clientes.</p>
      </Section>

      {/* Tarjeta */}
      <Section icon={CreditCard} title="Pago con tarjeta" enabled={form.card_enabled} onToggle={toggle("card_enabled")}>
        <Field label="Link de la plataforma de pago" full>
          <input value={form.card_payment_link} onChange={set("card_payment_link")} className="pcinp" placeholder="https://checkout.stripe.com/…" />
        </Field>
        <p className="text-white/40 text-xs mt-1">URL a la que se redirigirá al cliente en una nueva pestaña para completar el pago.</p>
      </Section>

      <style>{`.pcinp{width:100%;padding:0.6rem 0.9rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:0.7rem;color:white;font-size:0.85rem;outline:none}.pcinp:focus{border-color:rgba(255,88,51,0.5)}`}</style>
    </div>
  );
}

function Section({ icon: Icon, title, enabled, onToggle, children }) {
  return (
    <div className="rounded-xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-[#ff5833]" />
          <span className="text-white font-semibold text-sm">{title}</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input type="checkbox" checked={enabled} onChange={onToggle} className="sr-only peer" />
            <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-[#ff5833] transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: enabled ? "#ff5833" : "rgba(255,255,255,0.3)" }}>{enabled ? "Activo" : "Inactivo"}</span>
        </label>
      </div>
      <div className={`p-4 ${enabled ? "" : "opacity-40 pointer-events-none"}`}>{children}</div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}