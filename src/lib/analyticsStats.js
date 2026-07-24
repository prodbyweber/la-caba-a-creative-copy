import { effectivePlatformOrder, platformMeta, refererLabel, REFERER_LABELS } from "@/lib/releaseUtils";

// Serie diaria de sesiones (visitas) para los últimos `days` días.
export function dailySeries(sessions, days = 14) {
  const map = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map[d.toISOString().slice(0, 10)] = 0;
  }
  (sessions || []).forEach((s) => {
    if (!s.created_date) return;
    const key = new Date(s.created_date).toISOString().slice(0, 10);
    if (key in map) map[key]++;
  });
  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

// Estadísticas a partir de sesiones (visitas) y clics (interacciones).
// La fuente de tráfico vive en la sesión; los clics se atribuyen a la fuente de su sesión.
export function computeStats(sessions, clicks, platformOrder) {
  sessions = sessions || [];
  clicks = clicks || [];
  const uniqueVisitors = new Set(sessions.map((s) => s.visitor_id).filter(Boolean)).size;

  // Clics por plataforma (totales)
  const order = effectivePlatformOrder(platformOrder);
  const platformCounts = {};
  clicks.forEach((c) => { if (c.platform) platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1; });
  const platforms = order
    .map((k) => ({ key: k, meta: platformMeta(k), count: platformCounts[k] || 0 }))
    .filter((p) => p.count > 0);
  const platformTotal = clicks.length;

  // Visitas por canal (fuente de tráfico — fijada en la sesión)
  const sourceCounts = {};
  sessions.forEach((s) => { const src = s.referer_source || "direct"; sourceCounts[src] = (sourceCounts[src] || 0) + 1; });
  const sources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);

  // Mapa sesión → fuente, para atribuir cada clic al canal de origen de su sesión
  const sessionSource = {};
  sessions.forEach((s) => { if (s.id) sessionSource[s.id] = s.referer_source || "direct"; });

  // Clics totales por canal + desglose por plataforma
  const sourceClicks = {};          // source -> total clics
  const sourcePlatformClicks = {};   // source -> { platform -> count }
  clicks.forEach((c) => {
    const src = sessionSource[c.session_id] || "direct";
    sourceClicks[src] = (sourceClicks[src] || 0) + 1;
    if (!sourcePlatformClicks[src]) sourcePlatformClicks[src] = {};
    const pl = c.platform || "unknown";
    sourcePlatformClicks[src][pl] = (sourcePlatformClicks[src][pl] || 0) + 1;
  });

  // Geografía (desde las sesiones)
  const countryCounts = {};
  const cityCounts = {};
  sessions.forEach((s) => {
    if (s.country) countryCounts[s.country] = (countryCounts[s.country] || 0) + 1;
    if (s.city) cityCounts[s.city] = (cityCounts[s.city] || 0) + 1;
  });

  // Dispositivos / OS / Navegadores (desde las sesiones)
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
  sessions.forEach((s) => { deviceCounts[s.device_type || "unknown"]++; });
  const devices = Object.entries(deviceCounts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);

  const osCounts = {};
  sessions.forEach((s) => { if (s.os && s.os !== "Unknown") osCounts[s.os] = (osCounts[s.os] || 0) + 1; });
  const osList = Object.entries(osCounts).sort((a, b) => b[1] - a[1]);

  const browserCounts = {};
  sessions.forEach((s) => { if (s.browser && s.browser !== "Unknown") browserCounts[s.browser] = (browserCounts[s.browser] || 0) + 1; });
  const browsers = Object.entries(browserCounts).sort((a, b) => b[1] - a[1]);

  // Visitantes
  const visitorFreq = {};
  sessions.forEach((s) => { if (s.visitor_id) visitorFreq[s.visitor_id] = (visitorFreq[s.visitor_id] || 0) + 1; });
  const newVisitors = Object.values(visitorFreq).filter((n) => n === 1).length;
  const returning = Object.values(visitorFreq).filter((n) => n > 1).length;
  const registered = sessions.filter((s) => s.is_registered).length;
  const guests = sessions.length - registered;

  return {
    views: sessions.length,
    uniqueVisitors,
    clicks: clicks.length,
    ctr: sessions.length ? Math.round((clicks.length / sessions.length) * 100) : 0,
    platforms,
    platformTotal,
    sources,
    sourceClicks,
    sourcePlatformClicks,
    countries: Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
    cities: Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
    devices,
    osList,
    browsers,
    newVisitors,
    returning,
    registered,
    guests,
  };
}