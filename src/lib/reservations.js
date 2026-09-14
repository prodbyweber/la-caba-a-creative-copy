import { base44 } from "@/api/base44Client";

// Pasos del wizard de reservas
export const STEPS = [
  { key: "service", label: "Servicio", short: "Servicio" },
  { key: "extras", label: "Extras", short: "Extras" },
  { key: "datetime", label: "Fecha y hora", short: "Fecha" },
  { key: "info", label: "Información", short: "Info" },
  { key: "payment", label: "Pago / Reserva", short: "Pago" },
  { key: "confirmation", label: "Confirmación", short: "Hecho" },
];

// Horario operativo por defecto del estudio (fallback si no hay config en admin).
export const WORKING_HOURS = { start: "15:00", end: "23:00" };

// Horario operativo del estudio por día de la semana (configurable desde Admin).
let _operatingHoursCache = null;
export async function getOperatingHours() {
  if (_operatingHoursCache) return _operatingHoursCache;
  try {
    const rows = await base44.entities.StudioOperatingHours.list("day_of_week");
    const map = {};
    rows.forEach(r => { map[r.day_of_week] = { start: r.start_time, end: r.end_time, is_open: r.is_open !== false }; });
    _operatingHoursCache = map;
    return map;
  } catch {
    return null;
  }
}
export function clearOperatingHoursCache() { _operatingHoursCache = null; }

// Devuelve el horario operativo de una fecha concreta (con fallback al por defecto).
export async function getHoursForDate(date) {
  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const hours = (await getOperatingHours()) || {};
  const day = hours[dayOfWeek];
  if (!day) return { is_open: true, start: WORKING_HOURS.start, end: WORKING_HOURS.end };
  return { is_open: !!day.is_open, start: day.start || WORKING_HOURS.start, end: day.end || WORKING_HOURS.end };
}

export const CATEGORY_LABELS = {
  estudio: "Reservas de estudio",
  mix_master: "Mix & Mastering",
  digital: "Productos digitales",
};

export const STATUS_LABELS = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  pagada: "Pagada",
  completada: "Completada",
  cancelada: "Cancelada",
};

export const STATUS_COLORS = {
  pendiente: "#facc15",
  confirmada: "#60a5fa",
  pagada: "#34d399",
  completada: "#a78bfa",
  cancelada: "#f87171",
};

export const PAYMENT_METHOD_LABELS = {
  online: "Pago online",
  manual: "Reserva manual",
  contact: "Contacto / pago manual",
};

// Conversión de tiempo
export function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Solapamiento de dos intervalos [s1,e1) y [s2,e2)
export function overlaps(s1, e1, s2, e2) {
  return timeToMinutes(s1) < timeToMinutes(e2) && timeToMinutes(s2) < timeToMinutes(e1);
}

// Comprueba disponibilidad de un slot contra reservas existentes y horarios bloqueados
export async function checkAvailability(date, startTime, durationHours, excludeId = null) {
  const { is_open, start, end } = await getHoursForDate(date);
  const endSlot = minutesToTime(timeToMinutes(startTime) + Math.round(durationHours * 60));
  if (!is_open) return { available: false, end: endSlot, reason: "Día no disponible" };
  if (timeToMinutes(startTime) < timeToMinutes(start) || timeToMinutes(endSlot) > timeToMinutes(end)) {
    return { available: false, end: endSlot, reason: `Fuera del horario operativo (${start}–${end})` };
  }
  const [reservations, blocked] = await Promise.all([
    base44.entities.Reservation.filter({ date }),
    base44.entities.BlockedTime.filter({ date, active: true }),
  ]);
  const active = reservations.filter(r => r.reservation_status !== "cancelada" && r.id !== excludeId);
  const conflict = active.find(r => overlaps(startTime, endSlot, r.start_time, r.end_time));
  if (conflict) return { available: false, end: endSlot, reason: "Horario ya reservado", conflict };
  const bConflict = blocked.find(b => overlaps(startTime, endSlot, b.start_time, b.end_time));
  if (bConflict) return { available: false, end: endSlot, reason: "Horario bloqueado", conflict: bConflict };
  return { available: true, end: endSlot };
}

// Genera slots disponibles para una fecha y duración (inicios a la hora en punto).
export async function getAvailableSlots(date, durationHours, excludeId = null) {
  const { is_open, start, end } = await getHoursForDate(date);
  if (!is_open) return [];
  const stepMin = 60; // inicios a la hora en punto
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const durMin = Math.round(durationHours * 60);
  const [reservations, blocked] = await Promise.all([
    base44.entities.Reservation.filter({ date }),
    base44.entities.BlockedTime.filter({ date, active: true }),
  ]);
  const active = reservations.filter(r => r.reservation_status !== "cancelada" && r.id !== excludeId);
  const slots = [];
  for (let m = startMin; m + durMin <= endMin; m += stepMin) {
    const s = minutesToTime(m);
    const e = minutesToTime(m + durMin);
    const free = !active.some(r => overlaps(s, e, r.start_time, r.end_time)) && !blocked.some(b => overlaps(s, e, b.start_time, b.end_time));
    slots.push({ start: s, end: e, available: free });
  }
  return slots;
}

// Cálculo de totales (precios siempre desde los datos, nunca inventados)
export function calcTotals(service, extras) {
  const servicePrice = Number(service?.price) || 0;
  const extrasTotal = (extras || []).reduce((sum, e) => sum + (Number(e.price) || 0), 0);
  const subtotal = servicePrice + extrasTotal;
  return { servicePrice, extrasTotal, subtotal, total: subtotal };
}

// Construye el objeto de servicio normalizado desde una entidad ReservationService
export function normalizeService(svc) {
  return {
    id: svc.id,
    kind: "service",
    name: svc.name,
    category: svc.category,
    subcategory: svc.subcategory,
    description: svc.description,
    duration_hours: svc.duration_hours || 0,
    price: Number(svc.price) || 0,
    payment_method: svc.payment_method || "manual",
    payment_link: svc.payment_link || "",
    is_beat_picker: !!svc.is_beat_picker,
  };
}

// Construye el objeto de servicio normalizado desde un Beat
export function normalizeBeatService(beat) {
  return {
    id: beat.id,
    kind: "beat",
    name: beat.title,
    category: "digital",
    subcategory: "Beat",
    description: beat.description || "Beat del catálogo de Cabaña Creative",
    duration_hours: 0,
    price: Number(beat.reservation_price) || 75,
    payment_method: "manual",
    payment_link: beat.buy_link || "",
    is_beat_picker: false,
    beat_id: beat.id,
    cover_url: beat.cover_url,
  };
}

// Envía el email de confirmación al cliente + copia a hola@cabanacreative.es
export async function sendReservationEmail(reservation) {
  const subject = "Reserva confirmada — Cabaña Creative";
  const extrasText = (reservation.extras || []).map(e => `${e.name}${e.hours ? ` (${e.hours}h)` : ""}`).join(", ") || "—";
  const body = `Hola ${reservation.customer_name},

Tu reserva en Cabaña Creative ha sido confirmada.

DETALLES DE TU RESERVA

Servicio: ${reservation.service_name}
Fecha: ${reservation.date}
Hora: ${reservation.start_time || "—"}
Duración: ${reservation.duration_hours ? reservation.duration_hours + " horas" : "—"}
Extras: ${extrasText}
Total: ${reservation.total}€
${reservation.notes ? `\nNotas: ${reservation.notes}\n` : ""}
Te esperamos en Cabaña Creative.

Más de lo que se escucha.

Cabaña Creative
hola@cabanacreative.es`;

  const results = { toClient: false, toStudio: false };
  try {
    await base44.integrations.Core.SendEmail({ to: reservation.email, subject, body });
    results.toClient = true;
  } catch (e) {
    console.error("Email cliente fallido:", e);
  }
  try {
    await base44.integrations.Core.SendEmail({ to: "hola@cabanacreative.es", subject: `[Copia] ${subject}`, body });
    results.toStudio = true;
  } catch (e) {
    console.error("Email estudio fallido:", e);
  }
  return results;
}

export function formatPrice(n) {
  return `${Number(n || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
}