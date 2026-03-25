import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const state = body?.data?._provider_meta?.['x-goog-resource-state'];
    if (state === 'sync') return Response.json({ status: 'sync_ack' });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Load sync token
    const existing = await base44.asServiceRole.entities.SyncState.filter({ service: 'googlecalendar' });
    const syncRecord = existing.length > 0 ? existing[0] : null;

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50';
    if (syncRecord?.sync_token) {
      url += `&syncToken=${syncRecord.sync_token}`;
    } else {
      url += '&timeMin=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    let res = await fetch(url, { headers: authHeader });

    // Expired syncToken - full resync
    if (res.status === 410) {
      url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50'
        + '&timeMin=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      res = await fetch(url, { headers: authHeader });
    }

    if (!res.ok) return Response.json({ status: 'api_error' });

    const allItems = [];
    let pageData = await res.json();
    let newSyncToken = null;

    while (true) {
      allItems.push(...(pageData.items || []));
      if (pageData.nextSyncToken) newSyncToken = pageData.nextSyncToken;
      if (!pageData.nextPageToken) break;
      const nextRes = await fetch(url + `&pageToken=${pageData.nextPageToken}`, { headers: authHeader });
      if (!nextRes.ok) break;
      pageData = await nextRes.json();
    }

    // Process changed/cancelled events
    for (const item of allItems) {
      if (item.status === 'cancelled') {
        // Find and delete matching session in our DB by google_event_id
        const matching = await base44.asServiceRole.entities.Session.filter({ google_event_id: item.id });
        for (const s of matching) {
          await base44.asServiceRole.entities.Session.delete(s.id);
        }
      } else {
        // Check if we already have this event (by google_event_id)
        const existing = await base44.asServiceRole.entities.Session.filter({ google_event_id: item.id });

        const start = item.start?.dateTime || item.start?.date;
        const end = item.end?.dateTime || item.end?.date;

        if (existing.length > 0) {
          // Update
          await base44.asServiceRole.entities.Session.update(existing[0].id, {
            title: item.summary || 'Sin título',
            description: item.description || '',
            location: item.location || existing[0].location || 'Studio',
            start_time: start,
            end_time: end
          });
        } else {
          // Only create if it originated from Google (not from us) — skip if we already track it
          // We create it as a new Session from Google Calendar
          await base44.asServiceRole.entities.Session.create({
            title: item.summary || 'Evento de Google Calendar',
            description: item.description || '',
            location: item.location || 'External',
            start_time: start,
            end_time: end || start,
            type: 'Meeting',
            status: 'Scheduled',
            google_event_id: item.id,
            source: 'google_calendar'
          });
        }
      }
    }

    // Save new syncToken
    if (newSyncToken) {
      if (syncRecord) {
        await base44.asServiceRole.entities.SyncState.update(syncRecord.id, { sync_token: newSyncToken });
      } else {
        await base44.asServiceRole.entities.SyncState.create({ service: 'googlecalendar', sync_token: newSyncToken });
      }
    }

    return Response.json({ status: 'ok', processed: allItems.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});