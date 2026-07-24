import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { computeStats } from "@/lib/analyticsStats";
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
      <span className="w-20 text-right text-xs text-white/50 flex-shrink-0">{count} · {pct}%</span>
    </div>
  );
}

function ConversionSection({ sources, sourceClicks, sourcePlatformClicks }) {
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

export default function Analytics() {
  const [selectedTrackId, setSelectedTrackId] = useState("all");

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  // Tracks del usuario
  const { data: tracks = [] } = useQuery({
    queryKey: ["analytics-tracks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Track.list("-created_date", 200);
      return all.filter((t) => t.created_by_id === user.id);
    },
    enabled: !!user,
  });

  // Sesiones y clics del usuario (RLS restringe a owner_id === user.id)
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["analytics-sessions", user?.id],
    queryFn: () => base44.entities.ReleaseSession.list("-created_date", 1000),
    enabled: !!user,
  });

  const { data: clicks = [] } = useQuery({
    queryKey: ["analytics-clicks", user?.id],
    queryFn: () => base44.entities.ReleaseClick.list("-created_date", 1000),
    enabled: !!user,
  });

  const trackMap = useMemo(() => {
    const m = {};
    tracks.forEach((t) => { m[t.id] = t; });
    return m;
  }, [tracks]);

  const filteredSessions = useMemo(
    () => selectedTrackId === "all" ? sessions : sessions.filter((s) => s.track_id === selectedTrackId),
    [sessions, selectedTrackId]
  );
  const filteredClicks = useMemo(
    () => selectedTrackId === "all" ? clicks : clicks.filter((c) => c.track_id === selectedTrackId),
    [clicks, selectedTrackId]
  );

  const stats = useMemo(() => computeStats(filteredSessions, filteredClicks), [filteredSessions, filteredClicks]);

  // Ranking de soundtracks por visitas (sesiones)
  const topTracks = useMemo(() => {
    const counts = {};
    sessions.forEach((s) => { if (s.track_id) counts[s.track_id] = (counts[s.track_id] || 0) + 1; });
    return Object.entries(counts)
      .map(([tid, n]) => ({ track: trackMap[tid], views: n, clicks: clicks.filter((c) => c.track_id === tid).length }))
      .filter((x) => x.track)
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);
  }, [sessions, clicks, trackMap]);

  const mainCountry = stats.countries[0]?.[0] || "—";
  const mainSource = stats.sources[0]?.[0] || "—";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="sticky top-0 z-20 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link to="/ArtistDashboard" className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold">Analytics</span>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-8">
        {/* Resumen global */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Resumen del catálogo</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Visitas totales" value={stats.views} />
            <Stat label="Únicos" value={stats.uniqueVisitors} />
            <Stat label="Clics totales" value={stats.clicks} />
            <Stat label="CTR medio" value={`${stats.ctr}%`} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            <Stat label="País principal" value={mainCountry} />
            <Stat label="Fuente principal" value={refererLabel(mainSource)} />
            <Stat label="Soundtracks" value={tracks.length} hint="con release" />
          </div>
        </section>

        {/* Top soundtracks */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Top Soundtracks</p>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
            {topTracks.length === 0 ? (
              <p className="text-sm text-white/30 py-6 text-center">Aún no hay datos de visitas.</p>
            ) : topTracks.map(({ track, views, clicks }, i) => (
              <Link
                key={track.id}
                to={track.slug ? `/t/${track.slug}/analytics` : `/track/${track.id}/analytics`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-xs font-bold text-white/30 w-5">{i + 1}</span>
                <div className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0 bg-white/5">
                  {track.cover_url && <img src={track.cover_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">{track.title}</p>
                  <p className="text-[10px] text-white/30">{track.display_artist || ""}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-white/70">{views} visitas</p>
                  <p className="text-[10px] text-white/30">{clicks} clics</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Filtro por soundtrack */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Detalle por soundtrack</p>
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-white/20"
            >
              <option value="all">Todos</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Visitas" value={stats.views} />
            <Stat label="Únicos" value={stats.uniqueVisitors} />
            <Stat label="Clics" value={stats.clicks} />
            <Stat label="CTR" value={`${stats.ctr}%`} />
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
                <BarRow key={key} label={meta.label} count={count} total={stats.platformTotal} color={meta.color} />
              ))
            )}
          </div>
        </section>

        {/* Geografía */}
        <section className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Países</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.countries.length === 0 ? <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p> :
                stats.countries.map(([c, n]) => <BarRow key={c} label={c} count={n} total={stats.views} color="#a78bfa" />)}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Ciudades</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.cities.length === 0 ? <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p> :
                stats.cities.map(([c, n]) => <BarRow key={c} label={c} count={n} total={stats.views} color="#34d399" />)}
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

        {isLoading && <p className="text-center text-white/30 text-sm">Cargando analíticas…</p>}
      </div>
    </div>
  );
}