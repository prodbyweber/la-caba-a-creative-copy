import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Schedule for a deliverable:
// -4 days: "Edición y Premezcla - {title}" (2h) — StudioWork
// -3 days: "Edición y Premezcla - {title}" PART 2 (1h) — StudioWork
// -2 days: "{title} - Mix Final" (2h) — StudioWork  [actually 1h per revised brief: event 3 = 1h]
// -1 day:  "Revisión Master & Exports - {title}" (1h) — StudioWork
//
// Revised reading of brief:
// -4 days: "Sesión de Edición y Premix - {title}" 2h
// -3 days: "Sesión de Edición y Mix - {title}"   1h (cont.)
// -2 days: "{title} - Mix Final"                 1h
// -1 day:  "Revisión Master & Exports - {title}" 1h

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { deliverable_title, due_date_time } = await req.json();
  if (!deliverable_title || !due_date_time) {
    return Response.json({ error: 'Missing deliverable_title or due_date_time' }, { status: 400 });
  }

  const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

  const dueDate = new Date(due_date_time);

  // 4 events to schedule:
  // offsets in days before due date, durations in hours
  const eventsToSchedule = [
    { daysBeforeDue: 4, durationHours: 2, title: `Sesión de Edición y Premix - ${deliverable_title}`, color: '2' },
    { daysBeforeDue: 3, durationHours: 1, title: `Sesión de Edición y Mix - ${deliverable_title}`, color: '2' },
    { daysBeforeDue: 2, durationHours: 1, title: `${deliverable_title} - Mix Final`, color: '2' },
    { daysBeforeDue: 1, durationHours: 1, title: `Revisión Master & Exports - ${deliverable_title}`, color: '5' },
  ];

  // Earliest allowed start hour (Madrid local) and latest end hour
  const WORK_START_HOUR = 14;
  const WORK_END_HOUR = 22;
  const ALLOWED_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri (0=Sun, 6=Sat)

  // Get the target date for a given daysBeforeDue, skipping weekends
  // We need to find the actual calendar day that is `daysBeforeDue` working days before dueDate
  function getTargetDate(daysBeforeDue) {
    // Simple: subtract daysBeforeDue calendar days, then if weekend, move to previous Friday
    const d = new Date(dueDate);
    d.setDate(d.getDate() - daysBeforeDue);
    // If weekend, push back to Friday
    const dow = d.getDay();
    if (dow === 0) d.setDate(d.getDate() - 2); // Sunday → Friday
    if (dow === 6) d.setDate(d.getDate() - 1); // Saturday → Friday
    return d;
  }

  // Fetch busy slots from Google Calendar freebusy API for a given day (Madrid time)
  async function getBusySlotsForDay(date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 0);

    const freebusyRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        timeZone: 'Europe/Madrid',
        items: [{ id: 'primary' }],
      }),
    });
    if (!freebusyRes.ok) return [];
    const data = await freebusyRes.json();
    return (data.calendars?.primary?.busy || []).map(b => ({
      start: new Date(b.start),
      end: new Date(b.end),
    }));
  }

  // Find first available slot on a given day within work hours
  async function findSlot(date, durationHours) {
    const busySlots = await getBusySlotsForDay(date);
    const durationMs = durationHours * 60 * 60 * 1000;

    // Try slots starting from WORK_START_HOUR in 30-min increments
    let candidate = new Date(date);
    candidate.setHours(WORK_START_HOUR, 0, 0, 0);
    const latestStart = new Date(date);
    latestStart.setHours(WORK_END_HOUR - durationHours, 0, 0, 0);

    while (candidate <= latestStart) {
      const candidateEnd = new Date(candidate.getTime() + durationMs);
      // Check if this slot overlaps any busy period
      const overlaps = busySlots.some(b =>
        candidate < b.end && candidateEnd > b.start
      );
      if (!overlaps) {
        return { start: new Date(candidate), end: candidateEnd };
      }
      // Advance 30 minutes
      candidate = new Date(candidate.getTime() + 30 * 60 * 1000);
    }

    // No slot found that day — return default at WORK_START_HOUR
    const fallback = new Date(date);
    fallback.setHours(WORK_START_HOUR, 0, 0, 0);
    return { start: fallback, end: new Date(fallback.getTime() + durationMs) };
  }

  // Create a Google Calendar event
  async function createGCalEvent(title, slot, durationHours, colorId) {
    const toLocalISO = (d) => {
      // Format as YYYY-MM-DDTHH:MM:SS without timezone offset — combined with timeZone field
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const event = {
      summary: title,
      description: `Evento automático generado por Cabaña Creative\nTipo: Trabajo de Estudio\n—\nCreado desde Cabaña Creative`,
      start: { dateTime: toLocalISO(slot.start), timeZone: 'Europe/Madrid' },
      end: { dateTime: toLocalISO(slot.end), timeZone: 'Europe/Madrid' },
      colorId: colorId || '2',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Calendar error: ${err}`);
    }
    return await res.json();
  }

  // Store session in DB
  async function storeSession(title, slot, colorId) {
    const pad = n => String(n).padStart(2, '0');
    const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    await base44.asServiceRole.entities.Session.create({
      type: 'StudioWork',
      title,
      start_time: slot.start.toISOString(),
      end_time: slot.end.toISOString(),
      location: 'Studio',
      status: 'Scheduled',
      source: 'cabana',
      color: colorId === '5' ? '#f59e0b' : '#8b5cf6',
    });
  }

  const createdEvents = [];
  const errors = [];

  for (const ev of eventsToSchedule) {
    const targetDate = getTargetDate(ev.daysBeforeDue);
    const slot = await findSlot(targetDate, ev.durationHours);
    try {
      const gcalEvent = await createGCalEvent(ev.title, slot, ev.durationHours, ev.color);
      // Also store in our Session entity
      await storeSession(ev.title, slot, ev.color);
      createdEvents.push({ title: ev.title, start: slot.start.toISOString(), gcal_id: gcalEvent.id });
    } catch (e) {
      errors.push({ title: ev.title, error: e.message });
    }
  }

  return Response.json({ created: createdEvents, errors });
});