import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ---------- User-Agent parsing ----------
function parseDevice(ua) {
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}
function parseOS(ua) {
  if (/windows nt 10/i.test(ua)) return 'Windows';
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
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
      landing_id,
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

    if (!landing_id) return Response.json({ error: 'landing_id required' }, { status: 400 });

    const ua = req.headers.get('user-agent') || '';
    const ip = getIP(req);

    // Geolocalización por IP (ipapi.co, https, sin API key)
    let country = null, country_code = null, city = null;
    if (ip) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 2500);
        const r = await fetch(`https://ipapi.co/${ip}/json/`, { signal: ctrl.signal });
        clearTimeout(timer);
        if (r.ok) {
          const j = await r.json();
          country = j.country_name || null;
          country_code = j.country_code || null;
          city = j.city || null;
        }
      } catch (_) { /* geo no bloquea el tracking */ }
    }

    // Usuario registrado (opcional — la landing es pública)
    let is_registered = false, user_id = null;
    try {
      const u = await base44.auth.me();
      if (u && u.id) { is_registered = true; user_id = u.id; }
    } catch (_) { /* anónimo */ }

    // Resolver dueño de la landing para anclar el RLS de analíticas
    let owner_id = null, track_id = null;
    try {
      const landing = await base44.asServiceRole.entities.ReleaseLanding.get(landing_id);
      if (landing) {
        owner_id = landing.created_by_id || null;
        track_id = landing.track_id || null;
      }
    } catch (_) { /* landing no encontrada — aún registramos el evento */ }

    await base44.asServiceRole.entities.ReleaseEvent.create({
      landing_id,
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