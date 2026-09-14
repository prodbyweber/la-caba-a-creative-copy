import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DOW_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

// Convierte "YYYY-MM-DD" a Date local (sin desfase de zona).
function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Calendario premium editorial para selección de fecha.
// closedDays: Set de dayOfWeek (0-6) cerrados. minDate: "YYYY-MM-DD".
export default function PremiumCalendar({ selectedDate, onSelect, minDate, closedDays = new Set() }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate ? parseDate(minDate) : today;
  const initial = selectedDate ? parseDate(selectedDate) : (min > today ? min : today);
  const [view, setView] = useState({ year: initial.getFullYear(), month: initial.getMonth() });

  const grid = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    // Lunes = 0 en nuestra cuadrícula
    let offset = first.getDay() - 1;
    if (offset < 0) offset = 6;
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(view.year, view.month, d);
      cells.push(date);
    }
    return cells;
  }, [view]);

  const canGoPrev = (() => {
    const prev = new Date(view.year, view.month - 1, 1);
    const minMonth = new Date(min.getFullYear(), min.getMonth(), 1);
    return prev >= minMonth;
  })();

  const goPrev = () => {
    if (!canGoPrev) return;
    setView(v => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };
  const goNext = () => {
    setView(v => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const isDisabled = (date) => {
    if (!date) return true;
    if (date < min) return true;
    if (closedDays.has(date.getDay())) return true;
    return false;
  };

  return (
    <div className="select-none">
      {/* Cabecera mes/año + navegación */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-20"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ChevronLeft className="w-4 h-4 text-white/70" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-white uppercase tracking-[0.18em]" style={{ letterSpacing: "0.16em" }}>
            {MONTHS[view.month]}
          </p>
          <p className="text-[10px] text-white/30 tracking-wider">{view.year}</p>
        </div>
        <button
          onClick={goNext}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ChevronRight className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DOW_SHORT.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-white/25 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((date, i) => {
          if (!date) return <div key={i} />;
          const iso = toISO(date);
          const disabled = isDisabled(date);
          const isSelected = selectedDate === iso;
          const isToday = toISO(today) === iso;
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className="aspect-square rounded-full flex items-center justify-center text-sm transition-all relative"
              style={{
                background: isSelected ? "#ff5833" : "transparent",
                color: isSelected ? "#fff" : disabled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.75)",
                cursor: disabled ? "not-allowed" : "pointer",
                border: isSelected ? "none" : "1px solid transparent",
              }}
              onMouseEnter={(e) => { if (!disabled && !isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { if (!disabled && !isSelected) e.currentTarget.style.background = "transparent"; }}
            >
              {date.getDate()}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ff5833]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}