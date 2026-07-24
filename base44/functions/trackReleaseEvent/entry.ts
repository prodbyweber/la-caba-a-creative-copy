import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ---------- User-Agent parsing ----------
function parseDevice(ua) {
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}
function parseOS(ua) {
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/mac os x/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown';
}
function parseBrowser(ua) {
  if (/edg/i.test(ua)) return 'Edge';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Unknown';
}
function getIP(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const {
      track_id,
      event_type = 'view',
      platform = null,
      visitor_id = null,
      utm_source = null,
      utm_medium = null,
      utm_campaign = null,
      utm_term = null,
      utm_content = null,
      referer_source = null,
    } = body;

    if (!track_id) return Response.json({ error: 'track_id required' }, { status: 400 });

    const ua = req.headers.get('user-agent') || '';
    const ip = getIP(req);

    // Geolocalización por IP con dos proveedores (fallback) para máxima fiabilidad.
    let country = null, country_code = null, city = null;
    if (ip) {
      // 1) ipapi.co
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 2500);
        const r = await fetch(`https://ipapi.co/${ip}/json/`, { signal: ctrl.signal });
        clearTimeout(timer);
        if (r.ok) {
          const j = await r.json();
          if (j && !j.error && (j.country_name || j.country_code)) {
            country = j.country_name || null;
            country_code = j.country_code || null;
            city = j.city || null;
          }
        }
      } catch (_) { /* continúa al fallback */ }
      // 2) Fallback: ipwho.is
      if (!country && !country_code) {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 2500);
          const r = await fetch(`https://ipwho.is/${ip}/`, { signal: ctrl.signal });
          clearTimeout(timer);
          if (r.ok) {
            const j = await r.json();
            if (j && j.success !== false && (j.country || j.country_code)) {
              country = j.country || null;
              country_code = j.country_code || null;
              city = j.city || null;
            }
          }
        } catch (_) { /* geo no bloquea el tracking */ }
      }
    }

    // Usuario registrado (opcional — la página es pública)
    let is_registered = false, user_id = null;
    try {
      const u = await base44.auth.me();
      if (u && u.id) { is_registered = true; user_id = u.id; }
    } catch (_) { /* anónimo */ }

    // Resolver dueño del soundtrack para anclar el RLS de analíticas
    let owner_id = null;
    try {
      const track = await base44.asServiceRole.entities.Track.get(track_id);
      if (track) {
        owner_id = track.created_by_id || null;
      }
    } catch (_) { /* track no encontrado — aún registramos el evento */ }

    await base44.asServiceRole.entities.ReleaseEvent.create({
      track_id,
      owner_id,
      event_type,
      platform,
      country,
      country_code,
      city,
      referer_source,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      device_type: parseDevice(ua),
      os: parseOS(ua),
      browser: parseBrowser(ua),
      is_registered,
      user_id,
      visitor_id,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});