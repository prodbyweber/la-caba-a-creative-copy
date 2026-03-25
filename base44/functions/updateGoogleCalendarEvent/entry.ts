import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { session, google_event_id } = await req.json();
  if (!session || !google_event_id) return Response.json({ error: 'Missing data' }, { status: 400 });

  const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

  // Build rich description
  const descParts = [];
  if (session.type) descParts.push(`Tipo: ${session.type === 'Session' ? 'Sesión de Estudio' : session.type === 'Meeting' ? 'Reunión' : 'Trabajo en Estudio'}`);
  if (session.location) descParts.push(`Ubicación: ${session.location === 'Studio' ? 'Estudio' : session.location === 'Online' ? 'Online' : 'Externo'}`);
  if (session.status) descParts.push(`Estado: ${session.status}`);
  if (session.artist_name) descParts.push(`Artista: ${session.artist_name}`);
  if (session.project_name) descParts.push(`Proyecto: ${session.project_name}`);
  if (session.description) descParts.push(`\nNotas:\n${session.description}`);
  descParts.push('\n—\nActualizado desde Cabaña Creative');

  const toMadridISO = (dtStr) => {
    if (!dtStr) return null;
    if (dtStr.includes('+') || dtStr.includes('Z') || (dtStr.length > 19 && dtStr[19] !== '.')) {
      return new Date(dtStr).toISOString();
    }
    return dtStr.length === 16 ? dtStr + ':00' : dtStr;
  };

  const attendees = (session.attendees || [])
    .filter(email => email && email.trim())
    .map(email => ({ email: email.trim() }));

  const event = {
    summary: session.title,
    description: descParts.join('\n'),
    location: session.location === 'Studio' ? 'Estudio Cabaña Creative, Madrid' : session.location === 'Online' ? 'Online (Google Meet)' : session.location || '',
    start: {
      dateTime: toMadridISO(session.start_time),
      timeZone: 'Europe/Madrid'
    },
    end: {
      dateTime: toMadridISO(session.end_time),
      timeZone: 'Europe/Madrid'
    },
    attendees: attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 10 },
        { method: 'email', minutes: 60 * 24 }
      ]
    }
  };

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${google_event_id}?sendUpdates=all`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: 'Google Calendar API error', details: err }, { status: 500 });
  }

  const updated = await res.json();
  return Response.json({ success: true, google_event_id: updated.id });
});