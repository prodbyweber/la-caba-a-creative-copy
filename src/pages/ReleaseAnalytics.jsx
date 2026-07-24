import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  PLATFORMS, DEFAULT_PLATFORM_ORDER, effectivePlatformOrder,
  platformMeta, refererLabel, REFERER_LABELS,
} from "@/lib/releaseUtils";

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
      {hint && <p className="text-[10px] text-white/30 mt-0.5">{hint}</p>}
    </div>
  );
}

function BarRow({ label, count, total, color = "#ff5833" }) {
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

export default function ReleaseAnalytics() {
  const { slug } = useParams();
  const [landingId, setLandingId] = useState(null);

  const { data: landing } = useQuery({
    queryKey: ["release-landing", slug],
    queryFn: async () => {
      const r = await base44.entities.ReleaseLanding.filter({ slug });
      const l = r && r[0];
      if (l) setLandingId(l.id);
      return l || null;
    },
  });

  const { data: track } = useQuery({
    queryKey: ["release-track", landing?.track_id],
    queryFn: () => base44.entities.Track.get(landing.track_id),
    enabled: !!landing?.track_id,
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["release-events", landingId],
    queryFn: () => base44.entities.ReleaseEvent.filter({ landing_id: landingId }),
    enabled: !!landingId,
  });

  const stats = useMemo(() => {
    const views = events.filter((e) => e.event_type === "view");
    const clicks = events.filter((e) => e.event_type === "click");
    const uniqueVisitors = new Set(views.map((e) => e.visitor_id).filter(Boolean)).size;

    const platformCounts = {};
    clicks.forEach((c) => { platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1; });

    const order = effectivePlatformOrder(track?.platform_order);
    const platforms = order.map((k) => ({ key: k, meta: platformMeta(k), count: platformCounts[k] || 0 })).filter((p) => p.count > 0);

    const sourceCounts = {};
    views.forEach((v) => { const s = v.referer_source || "other"; sourceCounts[s] = (sourceCounts[s] || 0) + 1; });

    const countryCounts = {};
    const cityCounts = {};
    views.forEach((v) => {
      if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
      if (v.city) cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;
    });

    const deviceCounts = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
    views.forEach((v) => { deviceCounts[v.device_type || "unknown"]++; });

    const visitorFreq = {};
    views.forEach((v) => { if (v.visitor_id) visitorFreq[v.visitor_id] = (visitorFreq[v.visitor_id] || 0) + 1; });
    const newVisitors = Object.values(visitorFreq).filter((n) => n === 1).length;
    const returning = Object.values(visitorFreq).filter((n) => n > 1).length;
    const registered = views.filter((v) => v.is_registered).length;
    const guests = views.length - registered;

    return {
      views: views.length, uniqueVisitors, clicks: clicks.length,
      ctr: views.length ? Math.round((clicks.length / views.length) * 100) : 0,
      platforms, platformTotal: clicks.length,
      sources: Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]),
      countries: Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
      cities: Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
      devices: Object.entries(deviceCounts).filter(([, n]) => n > 0),
      newVisitors, returning, registered, guests,
    };
  }, [events, track]);

  const title = landing?.title_override || track?.title || "Landing";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="sticky top-0 z-20 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link to="/Dashboard" className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold">{title}</span>
          </div>
          {landing?.slug && (
            <a href={`/release/${landing.slug}`} target="_blank" rel="noreferrer" className="text-xs text-white/40 hover:text-white">
              Abrir landing ↗
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

        {/* Plataformas */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Plataformas</p>
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

        {/* Origen + Dispositivos */}
        <section className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Origen del tráfico</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.sources.length === 0 ? (
                <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p>
              ) : (
                stats.sources.map(([src, n]) => (
                  <BarRow key={src} label={refererLabel(src)} count={n} total={stats.views} color="#ff5833" />
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Dispositivos</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.devices.length === 0 ? (
                <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p>
              ) : (
                stats.devices.map(([d, n]) => (
                  <BarRow key={d} label={d.charAt(0).toUpperCase() + d.slice(1)} count={n} total={stats.views} color="#6C9EFF" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Países + Ciudades */}
        <section className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Países</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.countries.length === 0 ? (
                <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p>
              ) : (
                stats.countries.map(([c, n]) => <BarRow key={c} label={c} count={n} total={stats.views} color="#A238FF" />)
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Ciudades</p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              {stats.cities.length === 0 ? (
                <p className="text-sm text-white/30 py-4 text-center">Sin datos.</p>
              ) : (
                stats.cities.map(([c, n]) => <BarRow key={c} label={c} count={n} total={stats.views} color="#1DB954" />)
              )}
            </div>
          </div>
        </section>

        {/* Usuarios */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Visitantes</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Nuevos" value={stats.newVisitors} />
            <Stat label="Recurrentes" value={stats.returning} />
            <Stat label="Registrados" value={stats.registered} />
            <Stat label="Invitados" value={stats.guests} />
          </div>
        </section>

        {isLoading && (
          <p className="text-center text-white/30 text-sm">Cargando analíticas…</p>
        )}
      </div>
    </div>
  );
}