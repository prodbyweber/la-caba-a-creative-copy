import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Calendar, Music2, Clock, ArrowLeft, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { STATUS_LABELS, STATUS_COLORS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS, CATEGORY_LABELS, formatPrice } from "@/lib/reservations";
import ReservationDetailModal from "@/components/admin/ReservationDetailModal";
import ReservationFormModal from "@/components/admin/ReservationFormModal";
import ServiceFormModal from "@/components/admin/ServiceFormModal";
import ExtraFormModal from "@/components/admin/ExtraFormModal";
import BlockedTimeModal from "@/components/admin/BlockedTimeModal";
import StudioHoursPanel from "@/components/admin/StudioHoursPanel";
import PaymentConfigPanel from "@/components/admin/PaymentConfigPanel";

const LOGO = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";
const TABS = [
  { key: "reservas", label: "Reservas" },
  { key: "servicios", label: "Servicios" },
  { key: "extras", label: "Extras" },
  { key: "horarios", label: "Horarios" },
  { key: "config", label: "Configuración" },
];

export default function ReservasAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("reservas");
  const [detail, setDetail] = useState(null);
  const [formModal, setFormModal] = useState(null); // {type, data}
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: reservations = [], isLoading: loadingRes } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => base44.entities.Reservation.list("-created_date", 200),
  });
  const { data: services = [] } = useQuery({
    queryKey: ["reservation-services-admin"],
    queryFn: () => base44.entities.ReservationService.list("sort_order"),
  });
  const { data: extras = [] } = useQuery({
    queryKey: ["reservation-extras"],
    queryFn: () => base44.entities.ReservationExtra.list("sort_order"),
  });
  const { data: blocks = [] } = useQuery({
    queryKey: ["blocked-times"],
    queryFn: () => base44.entities.BlockedTime.list("-date"),
  });

  const filteredRes = useMemo(() => {
    return reservations.filter(r => {
      if (statusFilter !== "all" && r.reservation_status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!(`${r.customer_name} ${r.email} ${r.service_name}`.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [reservations, statusFilter, search]);

  const del = async (entity, id, name) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    await base44.entities[entity].delete(id);
    queryClient.invalidateQueries();
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0b" }}>
      {/* Header */}
      <header className="border-b border-white/[0.06] px-5 sm:px-8 py-4 flex items-center justify-between" style={{ background: "#0d0d0e" }}>
        <div className="flex items-center gap-4">
          <Link to="/AdminDashboard" className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
          </Link>
          <div className="w-px h-6 bg-white/10 hidden sm:block" />
          <img src={LOGO} alt="Cabaña Creative" className="h-7 w-auto opacity-90 hidden sm:block" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff5833]">Reservas</span>
      </header>

      {/* Tabs */}
      <div className="px-5 sm:px-8 border-b border-white/[0.06] flex gap-1 overflow-x-auto" style={{ background: "#0d0d0e" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-3.5 text-sm font-medium transition-colors relative"
            style={{ color: tab === t.key ? "#fff" : "rgba(255,255,255,0.4)" }}>
            {t.label}
            {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5833]" />}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-8 max-w-6xl mx-auto">
        {/* ── RESERVAS ── */}
        {tab === "reservas" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setStatusFilter("all")} className={chipCls(statusFilter === "all")}>Todas</button>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <button key={k} onClick={() => setStatusFilter(k)} className={chipCls(statusFilter === k)} style={statusFilter === k ? { background: (STATUS_COLORS[k] || "#999") + "22", color: STATUS_COLORS[k] } : {}}>{v}</button>
                ))}
              </div>
              <button onClick={() => setFormModal({ type: "reservation" })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ff5833] hover:bg-[#ff6b4a] text-white text-xs font-bold transition-colors">
                <Plus className="w-3.5 h-3.5" /> Nueva reserva
              </button>
            </div>

            <div className="relative mb-4 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente, email, servicio…"
                className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5833]/50" />
            </div>

            {loadingRes ? <p className="text-white/40 text-sm">Cargando…</p> : (
              <div className="space-y-2">
                {filteredRes.length === 0 && <p className="text-white/30 text-sm text-center py-12">No hay reservas.</p>}
                {filteredRes.map(r => (
                  <button key={r.id} onClick={() => setDetail(r)} className="w-full text-left flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0"><Calendar className="w-4 h-4 text-white/40" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {r.reservation_code ? <span className="text-[#ff5833] mr-1.5">#{r.reservation_code}</span> : null}
                        {r.customer_name} · {r.service_name}
                      </p>
                      <p className="text-white/40 text-xs">{r.date} {r.start_time ? `· ${r.start_time}` : ""} · {r.email} · {PAYMENT_METHOD_LABELS[r.payment_method] || r.payment_method}</p>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <p className="text-white font-bold text-sm">{formatPrice(r.total)}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: (PAYMENT_STATUS_COLORS[r.payment_status] || "#999") + "22", color: PAYMENT_STATUS_COLORS[r.payment_status] || "#999" }}>
                          {PAYMENT_STATUS_LABELS[r.payment_status] || r.payment_status}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: (STATUS_COLORS[r.reservation_status] || "#999") + "22", color: STATUS_COLORS[r.reservation_status] || "#999" }}>
                          {STATUS_LABELS[r.reservation_status] || r.reservation_status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SERVICIOS ── */}
        {tab === "servicios" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Catálogo de servicios</h2>
              <button onClick={() => setFormModal({ type: "service" })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ff5833] hover:bg-[#ff6b4a] text-white text-xs font-bold"><Plus className="w-3.5 h-3.5" /> Nuevo servicio</button>
            </div>
            <div className="space-y-2">
              {services.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">{s.duration_hours ? <Clock className="w-4 h-4 text-white/40" /> : <Music2 className="w-4 h-4 text-white/40" />}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{s.name}</p>
                    <p className="text-white/40 text-xs">{CATEGORY_LABELS[s.category]} · {s.duration_hours ? `${s.duration_hours}h · ` : ""}{formatPrice(s.price)} · {s.payment_method}</p>
                  </div>
                  {!s.active && <span className="text-[10px] text-white/30">Inactivo</span>}
                  <button onClick={() => setFormModal({ type: "service", data: s })} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-white/50" /></button>
                  <button onClick={() => del("ReservationService", s.id, s.name)} className="w-8 h-8 rounded-lg hover:bg-red-500/15 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400/70" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EXTRAS ── */}
        {tab === "extras" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Extras</h2>
              <button onClick={() => setFormModal({ type: "extra" })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ff5833] hover:bg-[#ff6b4a] text-white text-xs font-bold"><Plus className="w-3.5 h-3.5" /> Nuevo extra</button>
            </div>
            <div className="space-y-2">
              {extras.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{e.name}</p>
                    <p className="text-white/40 text-xs">{e.type} · {formatPrice(e.price)}{e.type === "hours_extra" ? "/h" : ""}</p>
                  </div>
                  {!e.active && <span className="text-[10px] text-white/30">Inactivo</span>}
                  <button onClick={() => setFormModal({ type: "extra", data: e })} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-white/50" /></button>
                  <button onClick={() => del("ReservationExtra", e.id, e.name)} className="w-8 h-8 rounded-lg hover:bg-red-500/15 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400/70" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HORARIOS ── */}
        {tab === "horarios" && (
          <div>
            <StudioHoursPanel />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Horarios bloqueados</h2>
              <button onClick={() => setFormModal({ type: "block" })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ff5833] hover:bg-[#ff6b4a] text-white text-xs font-bold"><Plus className="w-3.5 h-3.5" /> Bloquear horario</button>
            </div>
            <div className="space-y-2">
              {blocks.length === 0 && <p className="text-white/30 text-sm text-center py-8">No hay horarios bloqueados.</p>}
              {blocks.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                  <Calendar className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{b.date} · {b.start_time}–{b.end_time}</p>
                    <p className="text-white/40 text-xs">{b.reason || "Sin motivo"} {!b.active && "· Inactivo"}</p>
                  </div>
                  <button onClick={() => setFormModal({ type: "block", data: b })} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-white/50" /></button>
                  <button onClick={() => del("BlockedTime", b.id, b.date)} className="w-8 h-8 rounded-lg hover:bg-red-500/15 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400/70" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONFIGURACIÓN DE PAGOS ── */}
        {tab === "config" && <PaymentConfigPanel />}
      </div>

      {/* Modales */}
      {detail && <ReservationDetailModal reservation={detail} onClose={() => setDetail(null)} />}
      {formModal?.type === "reservation" && <ReservationFormModal onClose={() => setFormModal(null)} />}
      {formModal?.type === "reservation-edit" && <ReservationFormModal reservation={formModal.data} onClose={() => setFormModal(null)} />}
      {formModal?.type === "service" && <ServiceFormModal service={formModal.data} onClose={() => setFormModal(null)} />}
      {formModal?.type === "extra" && <ExtraFormModal extra={formModal.data} onClose={() => setFormModal(null)} />}
      {formModal?.type === "block" && <BlockedTimeModal block={formModal.data} onClose={() => setFormModal(null)} />}
    </div>
  );
}

function chipCls(active) {
  return `px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${active ? "text-white" : "text-white/40 hover:text-white/70"}`;
}