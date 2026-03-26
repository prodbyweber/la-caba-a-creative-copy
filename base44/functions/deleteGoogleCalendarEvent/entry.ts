import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { google_event_id } = await req.json();
  if (!google_event_id) return Response.json({ error: 'Missing google_event_id' }, { status: 400 });

  const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${google_event_id}?sendUpdates=all`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  // 204 No Content = success, 404/410 = already deleted (all are ok)
  if (!res.ok && res.status !== 410 && res.status !== 404) {
    const err = await res.text();
    return Response.json({ error: 'Google Calendar API error', details: err }, { status: 500 });
  }

  return Response.json({ success: true });
});