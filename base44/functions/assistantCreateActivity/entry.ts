import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { activityType, sessionData, deliverableData, revisionData } = body;

  try {
    if (activityType === 'session') {
      // 1. Crear sesión en BD con source: 'cabana'
      const created = await base44.asServiceRole.entities.Session.create({
        ...sessionData,
        source: 'cabana',
      });

      // 2. Sincronizar con Google Calendar
      let gcalResult = null;
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

        const toMadridISO = (dtStr) => {
          if (!dtStr) return null;
          if (dtStr.includes('+') || dtStr.includes('Z') || (dtStr.length > 19 && dtStr[19] !== '.')) {
            return new Date(dtStr).toISOString();
          }
          return dtStr.length === 16 ? dtStr + ':00' : dtStr;
        };

        const descParts = [];
        if (sessionData.type) descParts.push(`Tipo: ${sessionData.type === 'Session' ? 'Sesión de Estudio' : sessionData.type === 'Meeting' ? 'Reunión' : 'Trabajo en Estudio'}`);
        if (sessionData.location) descParts.push(`Ubicación: ${sessionData.location === 'Studio' ? 'Estudio' : sessionData.location === 'Online' ? 'Online' : 'Externo'}`);
        if (sessionData.artist_name) descParts.push(`Artista: ${sessionData.artist_name}`);
        if (sessionData.project_name) descParts.push(`Proyecto: ${sessionData.project_name}`);
        if (sessionData.description) descParts.push(`\nNotas:\n${sessionData.description}`);
        descParts.push('\n—\nCreado desde Cabaña Creative (Asistente IA)');

        const attendees = (sessionData.attendees || [])
          .filter(e => e && e.trim())
          .map(e => ({ email: e.trim() }));

        const event = {
          summary: sessionData.title,
          description: descParts.join('\n'),
          location: sessionData.location === 'Studio' ? 'Estudio Cabaña Creative, Madrid' : sessionData.location === 'Online' ? 'Online (Google Meet)' : sessionData.location || '',
          start: { dateTime: toMadridISO(sessionData.start_time), timeZone: 'Europe/Madrid' },
          end: { dateTime: toMadridISO(sessionData.end_time), timeZone: 'Europe/Madrid' },
          colorId: sessionData.type === 'Meeting' ? '9' : sessionData.type === 'StudioWork' ? '2' : '1',
          attendees,
          guestsCanModifyEvent: false,
          guestsCanInviteOthers: false,
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 30 },
              { method: 'popup', minutes: 10 },
              { method: 'email', minutes: 60 * 24 }
            ]
          }
        };

        const gcalRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });

        if (gcalRes.ok) {
          const gcalData = await gcalRes.json();
          // 3. Actualizar sesión con ID de Google Calendar
          await base44.asServiceRole.entities.Session.update(created.id, {
            google_event_id: gcalData.id,
            google_event_link: gcalData.htmlLink,
          });
          gcalResult = { google_event_id: gcalData.id, google_event_link: gcalData.htmlLink };
        }
      } catch (gcalErr) {
        // Google Calendar falla no bloquea la creación
        gcalResult = { error: gcalErr.message };
      }

      return Response.json({ success: true, session: created, gcal: gcalResult });

    } else if (activityType === 'deliverable') {
      const created = await base44.asServiceRole.entities.Deliverable.create(deliverableData);
      return Response.json({ success: true, deliverable: created });

    } else if (activityType === 'revision') {
      const created = await base44.asServiceRole.entities.Revision.create(revisionData);
      return Response.json({ success: true, revision: created });
    }

    return Response.json({ error: 'Unknown activity type' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});