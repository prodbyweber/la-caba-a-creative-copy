import { effectivePlatformOrder, platformMeta, refererLabel, REFERER_LABELS } from "@/lib/releaseUtils";

// Serie diaria de un conjunto de eventos (views) para los últimos `days` días.
export function dailySeries(views, days = 14) {
  const map = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map[d.toISOString().slice(0, 10)] = 0;
  }
  views.forEach((v) => {
    if (!v.created_date) return;
    const key = new Date(v.created_date).toISOString().slice(0, 10);
    if (key in map) map[key]++;
  });
  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

// Estadísticas completas a partir de una lista de ReleaseEvent.
export function computeStats(events, platformOrder) {
  const views = events.filter((e) => e.event_type === "view");
  const clicks = events.filter((e) => e.event_type === "click");
  const uniqueVisitors = new Set(views.map((e) => e.visitor_id).filter(Boolean)).size;

  // Plataformas (solo las 4 oficiales)
  const order = effectivePlatformOrder(platformOrder);
  const platformCounts = {};
  clicks.forEach((c) => { if (c.platform) platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1; });
  const platforms = order
    .map((k) => ({ key: k, meta: platformMeta(k), count: platformCounts[k] || 0 }))
    .filter((p) => p.count > 0);
  const platformTotal = clicks.length;

  // Origen del tráfico
  const sourceCounts = {};
  views.forEach((v) => { const s = v.referer_source || "other"; sourceCounts[s] = (sourceCounts[s] || 0) + 1; });
  const sources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);

  // Geografía
  const countryCounts = {};
  const cityCounts = {};
  views.forEach((v) => {
    if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
    if (v.city) cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;
  });

  // Dispositivos
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
  views.forEach((v) => { deviceCounts[v.device_type || "unknown"]++; });
  const devices = Object.entries(deviceCounts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);

  // Sistemas operativos
  const osCounts = {};
  views.forEach((v) => { if (v.os && v.os !== "Unknown") osCounts[v.os] = (osCounts[v.os] || 0) + 1; });
  const osList = Object.entries(osCounts).sort((a, b) => b[1] - a[1]);

  // Navegadores
  const browserCounts = {};
  views.forEach((v) => { if (v.browser && v.browser !== "Unknown") browserCounts[v.browser] = (browserCounts[v.browser] || 0) + 1; });
  const browsers = Object.entries(browserCounts).sort((a, b) => b[1] - a[1]);

  // Visitantes
  const visitorFreq = {};
  views.forEach((v) => { if (v.visitor_id) visitorFreq[v.visitor_id] = (visitorFreq[v.visitor_id] || 0) + 1; });
  const newVisitors = Object.values(visitorFreq).filter((n) => n === 1).length;
  const returning = Object.values(visitorFreq).filter((n) => n > 1).length;
  const registered = views.filter((v) => v.is_registered).length;
  const guests = views.length - registered;

  return {
    views: views.length,
    uniqueVisitors,
    clicks: clicks.length,
    ctr: views.length ? Math.round((clicks.length / views.length) * 100) : 0,
    platforms,
    platformTotal,
    sources,
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