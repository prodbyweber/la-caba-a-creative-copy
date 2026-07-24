import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { resolveTrackBySlugOrId } from "@/lib/trackSlug";
import { computeStats, dailySeries } from "@/lib/analyticsStats";
import { refererLabel, platformMeta } from "@/lib/releaseUtils";

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
      {hint && <p className="text-[10px] text-white/30 mt-0.5">{hint}</p>}
    </div>
  );
}

function BarRow({ label, count, total, color = "#facc15" }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-28 text-xs text-white/60 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-24 text-right text-xs text-white/50 flex-shrink-0">{count} · {pct}%</span>
    </div>
  );
}

function Chart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-1 h-28 mt-2">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center justify-end" title={`${d.date}: ${d.count}`}>
          <div
            className="w-full rounded-t-sm transition-all"
            style={{ height: `${(d.count / max) * 100}%`, background: d.count ? "#facc15" : "rgba(255,255,255,0.08)", minHeight: 2 }}
          />
        </div>
      ))}
    </div>
  );
}

// Conversión por canal: visitas → clics → tasa, con desglose por plataforma.
function ConversionSection({ sources, sourceClicks, sourcePlatformClicks, totalVisits }) {
  if (!sources.length) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-sm text-white/30 py-4 text-center">Aún no hay datos de conversión.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {sources.map(([src, visits]) => {
        const clicks = sourceClicks[src] || 0;
        const rate = visits ? Math.round((clicks / visits) * 100) : 0;
        const plBreakdown = sourcePlatformClicks[src] || {};
        const plEntries = Object.entries(plBreakdown).sort((a, b) => b[1] - a[1]);
        return (
          <div key={src} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white/80">{refererLabel(src)}</span>
              <span className="text-xs text-white/40">{visits} visitas · {clicks} clics · <span className="text-yellow-400 font-semibold">{rate}%</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
              <div className="h-full rounded-full" style={{ width: `${rate}%`, background: "#facc15" }} />
            </div>
            {plEntries.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {plEntries.map(([pl, n]) => {
                  const meta = platformMeta(pl);
                  return (
                    <span key={pl} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] text-white/70" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                      {meta.label} · {n}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TrackAnalytics() {
  const { slug, id } = useParams();
  const routeKey = slug || id;

  const { data: track } = useQuery({
    queryKey: ["track-analytics", routeKey],
    queryFn: () => resolveTrackBySlugOrId(routeKey),
    enabled: !!routeKey,
    retry: false,
  });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
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
  const series = useMemo(() => dailySeries(sessions, 14), [sessions]);

  const title = track?.title || "Soundtrack";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="sticky top-0 z-20 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link to="/ArtistDashboard" className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold truncate max-w-[180px]">{title}</span>
          </div>
          {track?.slug && (
            <a href={`/t/${track.slug}`} target="_blank" rel="noreferrer" className="text-xs text-white/40 hover:text-white">
              Abrir página ↗
            </a>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-8">
        {/* Resumen */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Resumen</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Visitas" value={stats.views} />
            <Stat label="Únicos" value={stats.uniqueVisitors} />
            <Stat label="Clics" value={stats.clicks} />
            <Stat label="CTR" value={`${stats.ctr}%`} hint="clics / visitas" />
          </div>
        </section>

        {/* Evolución */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Visitas · últimos 14 días</p>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <Chart data={series} />
            <div className="flex justify-between text-[9px] text-white/25 mt-2">
              <span>{series[0]?.date?.slice(5)}</span>
              <span>{series[series.length - 1]?.date?.slice(5)}</span>
            </div>
          </div>
        </section>

        {/* Tráfico por canal */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Tráfico por canal</p>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            {stats.sources.length === 0 ? (
              <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p>
            ) : (
              stats.sources.map(([src, n]) => (
                <BarRow key={src} label={refererLabel(src)} count={n} total={stats.views} color="#facc15" />
              ))
            )}
          </div>
        </section>

        {/* Conversión por canal */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Conversión por canal</p>
          <ConversionSection
            sources={stats.sources}
            sourceClicks={stats.sourceClicks}
            sourcePlatformClicks={stats.sourcePlatformClicks}
            totalVisits={stats.views}
          />
        </section>

        {/* Clics por plataforma */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Clics por plataforma</p>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            {stats.platforms.length === 0 ? (
              <p className="text-sm text-white/30 py-4 text-center">Aún no hay clics registrados.</p>
            ) : (
              stats.platforms.map(({ key, meta, count }) => (
                <div key={key} className="py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-2 text-sm text-white/70">
                      <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                      {meta.label}
                    </span>
                    <span className="text-xs text-white/50">{count} · {stats.platformTotal ? Math.round((count / stats.platformTotal) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${stats.platformTotal ? (count / stats.platformTotal) * 100 : 0}%`, background: meta.color }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Geografía */}
        <section className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Países</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.countries.length === 0 ? (
                <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p>
              ) : (
                stats.countries.map(([c, n]) => <BarRow key={c} label={c} count={n} total={stats.views} color="#a78bfa" />)
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Ciudades</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.cities.length === 0 ? (
                <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p>
              ) : (
                stats.cities.map(([c, n]) => <BarRow key={c} label={c} count={n} total={stats.views} color="#34d399" />)
              )}
            </div>
          </div>
        </section>

        {/* Dispositivos / OS / Navegadores */}
        <section className="grid sm:grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Dispositivos</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.devices.length === 0 ? <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p> :
                stats.devices.map(([d, n]) => <BarRow key={d} label={d.charAt(0).toUpperCase() + d.slice(1)} count={n} total={stats.views} color="#60a5fa" />)}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Sistemas</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.osList.length === 0 ? <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p> :
                stats.osList.map(([o, n]) => <BarRow key={o} label={o} count={n} total={stats.views} color="#fb923c" />)}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Navegadores</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.browsers.length === 0 ? <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p> :
                stats.browsers.map(([b, n]) => <BarRow key={b} label={b} count={n} total={stats.views} color="#f472b6" />)}
            </div>
          </div>
        </section>

        {/* Visitantes */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Visitantes</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Nuevos" value={stats.newVisitors} />
            <Stat label="Recurrentes" value={stats.returning} />
            <Stat label="Registrados" value={stats.registered} />
            <Stat label="Invitados" value={stats.guests} />
          </div>
        </section>

        {loadingSessions && <p className="text-center text-white/30 text-sm">Cargando analíticas…</p>}
      </div>
    </div>
  );
}