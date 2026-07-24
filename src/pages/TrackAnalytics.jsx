import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, ExternalLink, Music2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { resolveTrackBySlugOrId } from "@/lib/trackSlug";
import { computeStats } from "@/lib/analyticsStats";
import { refererLabel, platformMeta } from "@/lib/releaseUtils";

const statusConfig = {
  idea:       { label: "Idea",          color: "#6b7280" },
  production: { label: "Producción",    color: "#60a5fa" },
  mixing:     { label: "Mezcla",        color: "#a78bfa" },
  mastering:  { label: "Masterización", color: "#fb923c" },
  completed:  { label: "Completado",    color: "#34d399" },
};

const DEVICE_LABELS = { mobile: "Móvil", desktop: "Escritorio", tablet: "Tablet", unknown: "Desconocido" };

// Tarjeta contenedora — cada bloque del dashboard es una tarjeta independiente.
function Card({ title, action, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">{title}</p>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Mini estadística dentro de la tarjeta Resumen.
function MiniStat({ label, value, hint, accent = "#ffffff" }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{label}</p>
      <p className="text-xl font-black mt-0.5" style={{ color: accent }}>{value}</p>
      {hint && <p className="text-[10px] text-white/25 mt-0.5">{hint}</p>}
    </div>
  );
}

// Barra horizontal con valor y porcentaje.
function BarRow({ label, count, total, color = "#facc15" }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-24 sm:w-28 text-xs text-white/70 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-20 text-right text-[11px] text-white/45 flex-shrink-0 tabular-nums">{count} · {pct}%</span>
    </div>
  );
}

function EmptyHint({ text = "Aún no hay datos." }) {
  return <p className="text-sm text-white/25 py-6 text-center">{text}</p>;
}

export default function TrackAnalytics() {
  const { slug, id } = useParams();
  const routeKey = slug || id;
  const navigate = useNavigate();

  const { data: track } = useQuery({
    queryKey: ["track-analytics", routeKey],
    queryFn: () => resolveTrackBySlugOrId(routeKey),
    enabled: !!routeKey,
    retry: false,
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["track-sessions", track?.id],
    queryFn: () => base44.entities.ReleaseSession.filter({ track_id: track.id }),
    enabled: !!track?.id,
  });

  const { data: clicks = [] } = useQuery({
    queryKey: ["track-clicks", track?.id],
    queryFn: () => base44.entities.ReleaseClick.filter({ track_id: track.id }),
    enabled: !!track?.id,
  });

  const stats = useMemo(() => computeStats(sessions, clicks, track?.platform_order), [sessions, clicks, track?.platform_order]);

  const status = statusConfig[track?.status] || statusConfig.idea;
  const title = track?.title || "Soundtrack";
  const coverFallback = !track?.cover_url && track?.youtube_music_url
    ? `https://img.youtube.com/vi/${(track.youtube_music_url.match(/v=([^&]+)/) || [])[1] || ""}/hqdefault.jpg`
    : null;
  const coverSrc = track?.cover_url || coverFallback;
  const sharePath = track?.slug ? `/t/${track.slug}` : (track?.id ? `/track/${track.id}` : null);

  // Volver mantiene el contexto del usuario: retrocede en el historial (de donde vino),
  // y solo cae a su dashboard si no hay historial. Nunca abre el panel de administrador.
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/Dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header compacto */}
      <div className="sticky top-0 z-20 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex-shrink-0">
              <ArrowLeft className="w-4 h-4 text-white/70" />
            </button>

            {/* Portada + título + estado */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                {coverSrc
                  ? <img src={coverSrc} alt={title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-4 h-4 text-white/20" /></div>}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white truncate leading-tight">{title}</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: status.color + "28", color: status.color }}>
                    {status.label}
                  </span>
                  {track?.is_public && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400">Público</span>
                  )}
                </div>
              </div>
            </div>

            {/* Stat chips compactos */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30 leading-none">Visitas</p>
                <p className="text-base font-black leading-tight">{stats.views}</p>
              </div>
              <div className="w-px h-7 bg-white/10" />
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30 leading-none">Clics</p>
                <p className="text-base font-black leading-tight" style={{ color: "#facc15" }}>{stats.clicks}</p>
              </div>
            </div>

            {sharePath && (
              <a href={sharePath} target="_blank" rel="noreferrer" className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex-shrink-0" title="Abrir página pública">
                <ExternalLink className="w-4 h-4 text-white/50" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-5 py-5 space-y-4">
        {/* Resumen */}
        <Card title="Resumen">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <MiniStat label="Visitas" value={stats.views} />
            <MiniStat label="Únicos" value={stats.uniqueVisitors} />
            <MiniStat label="Clics" value={stats.clicks} accent="#facc15" />
            <MiniStat label="CTR" value={`${stats.ctr}%`} hint="clics / visitas" />
          </div>
        </Card>

        {/* Plataformas + Origen del tráfico */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card title="Plataformas">
            {stats.platforms.length === 0 ? (
              <EmptyHint text="Aún no hay clics registrados." />
            ) : (
              <div>
                {stats.platforms.map(({ key, meta, count }) => (
                  <div key={key} className="py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-2 text-sm text-white/80">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                        {meta.label}
                      </span>
                      <span className="text-xs text-white/45 tabular-nums">{count} · {stats.platformTotal ? Math.round((count / stats.platformTotal) * 100) : 0}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${stats.platformTotal ? (count / stats.platformTotal) * 100 : 0}%`, background: meta.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Origen del tráfico">
            {stats.sources.length === 0 ? (
              <EmptyHint />
            ) : (
              <div>
                {stats.sources.map(([src, n]) => (
                  <BarRow key={src} label={refererLabel(src)} count={n} total={stats.views} color="#facc15" />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Ubicaciones + Dispositivos */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card title="Ubicaciones">
            {stats.countries.length === 0 && stats.cities.length === 0 ? (
              <EmptyHint text="Sin datos de ubicación." />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-1">Países</p>
                  {stats.countries.length === 0
                    ? <p className="text-xs text-white/25 py-2">Sin datos.</p>
                    : stats.countries.map(([c, n]) => <BarRow key={c} label={c} count={n} total={stats.views} color="#a78bfa" />)}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-1">Ciudades</p>
                  {stats.cities.length === 0
                    ? <p className="text-xs text-white/25 py-2">Sin datos.</p>
                    : stats.cities.map(([c, n]) => <BarRow key={c} label={c} count={n} total={stats.views} color="#34d399" />)}
                </div>
              </div>
            )}
          </Card>

          <Card title="Dispositivos">
            {stats.devices.length === 0 ? (
              <EmptyHint text="Sin datos de dispositivo." />
            ) : (
              <div>
                {stats.devices.map(([d, n]) => (
                  <BarRow key={d} label={DEVICE_LABELS[d] || d} count={n} total={stats.views} color="#60a5fa" />
                ))}
              </div>
            )}
          </Card>
        </div>

        {isLoading && <p className="text-center text-white/30 text-sm">Cargando analíticas…</p>}
      </div>
    </div>
  );
}