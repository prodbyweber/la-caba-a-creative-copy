import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Schedule 3 events before the deliverable due date:
// -3 days: "Premix / Edición y Premix Inicial" (2h)
// -2 days: "Mix Final" (2h)
// -1 day:  "Master & Exports Final" (1h)

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

  const eventsToSchedule = [
    { daysBeforeDue: 3, durationHours: 2, title: `Premix / Edición y Premix Inicial - ${deliverable_title}`, colorId: '2' },
    { daysBeforeDue: 2, durationHours: 2, title: `Mix Final - ${deliverable_title}`, colorId: '2' },
    { daysBeforeDue: 1, durationHours: 1, title: `Master & Exports Final - ${deliverable_title}`, colorId: '5' },
  ];

  const WORK_START_HOUR = 14;
  const WORK_END_HOUR = 22;

  function getTargetDate(daysBeforeDue) {
    const d = new Date(dueDate);
    d.setDate(d.getDate() - daysBeforeDue);
    // Skip weekends — move to previous Friday
    const dow = d.getDay();
    if (dow === 0) d.setDate(d.getDate() - 2); // Sunday → Friday
    if (dow === 6) d.setDate(d.getDate() - 1); // Saturday → Friday
    return d;
  }

  async function getBusySlotsForDay(date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 0);

    const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        timeZone: 'Europe/Madrid',
        items: [{ id: 'primary' }],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.calendars?.primary?.busy || []).map(b => ({ start: new Date(b.start), end: new Date(b.end) }));
  }

  async function findSlot(date, durationHours) {
    const busySlots = await getBusySlotsForDay(date);
    const durationMs = durationHours * 60 * 60 * 1000;

    let candidate = new Date(date);
    candidate.setHours(WORK_START_HOUR, 0, 0, 0);
    const latestStart = new Date(date);
    latestStart.setHours(WORK_END_HOUR - durationHours, 0, 0, 0);

    while (candidate <= latestStart) {
      const candidateEnd = new Date(candidate.getTime() + durationMs);
      const overlaps = busySlots.some(b => candidate < b.end && candidateEnd > b.start);
      if (!overlaps) return { start: new Date(candidate), end: candidateEnd };
      candidate = new Date(candidate.getTime() + 30 * 60 * 1000);
    }

    // Fallback to work start if no slot found
    const fallback = new Date(date);
    fallback.setHours(WORK_START_HOUR, 0, 0, 0);
    return { start: fallback, end: new Date(fallback.getTime() + durationMs) };
  }

  async function createGCalEvent(title, slot, colorId) {
    const pad = n => String(n).padStart(2, '0');
    const toLocalISO = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

    const event = {
      summary: title,
      description: `Sesión de trabajo automática\nEntregable: ${deliverable_title}\n—\nGenerado por Cabaña Creative`,
      start: { dateTime: toLocalISO(slot.start), timeZone: 'Europe/Madrid' },
      end: { dateTime: toLocalISO(slot.end), timeZone: 'Europe/Madrid' },
      colorId,
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 30 }, { method: 'popup', minutes: 10 }],
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!res.ok) throw new Error(`Google Calendar error: ${await res.text()}`);
    return await res.json();
  }

  async function storeSession(title, slot, colorId) {
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
      const gcalEvent = await createGCalEvent(ev.title, slot, ev.colorId);
      await storeSession(ev.title, slot, ev.colorId);
      createdEvents.push({ title: ev.title, start: slot.start.toISOString(), gcal_id: gcalEvent.id });
    } catch (e) {
      errors.push({ title: ev.title, error: e.message });
    }
  }

  return Response.json({ created: createdEvents, errors });
});