import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { session } = await req.json();
  if (!session) return Response.json({ error: 'Missing session data' }, { status: 400 });

  const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

  const event = {
    summary: session.title,
    description: session.description || '',
    location: session.location || '',
    start: {
      dateTime: new Date(session.start_time).toISOString(),
      timeZone: 'Europe/Madrid'
    },
    end: {
      dateTime: new Date(session.end_time).toISOString(),
      timeZone: 'Europe/Madrid'
    },
    colorId: session.type === 'Meeting' ? '9' : session.type === 'StudioWork' ? '2' : '1'
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
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

  const created = await res.json();
  return Response.json({ google_event_id: created.id, google_event_link: created.htmlLink });
});