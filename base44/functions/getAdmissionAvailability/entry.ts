import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

const TZ = "Europe/Madrid";

function tzOffsetMinutes(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  );
  return (asUtc - date.getTime()) / 60000;
}

function zonedToUtc(y, m, d, hour, minute, timeZone) {
  const guess = new Date(Date.UTC(y, m - 1, d, hour, minute, 0));
  const offset = tzOffsetMinutes(guess, timeZone);
  return new Date(guess.getTime() - offset * 60000);
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const days = Math.min(Math.max(Number(body?.days) || 21, 1), 60);
    const duration = Math.min(Math.max(Number(body?.duration) || 30, 15), 120);
    const startHour = Math.min(Math.max(Number(body?.start_hour) ?? 10, 0), 23);
    const endHour = Math.min(Math.max(Number(body?.end_hour) ?? 19, startHour + 1), 24);
    const timeZone = TZ;

    let accessToken = "";
    try {
      const connection = await base44.asServiceRole.connectors.getConnection("googlecalendar");
      accessToken = connection?.accessToken || "";
    } catch {
      accessToken = "";
    }
    if (!accessToken) {
      return Response.json({
        slots: [],
        error: "Google Calendar aún no está conectado.",
      });
    }

    const now = new Date();
    const horizon = new Date(now.getTime() + (days + 1) * 24 * 60 * 60 * 1000);

    const freeBusyRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: now.toISOString(),
        timeMax: horizon.toISOString(),
        timeZone,
        items: [{ id: "primary" }],
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!freeBusyRes.ok) {
      const detail = await freeBusyRes.text();
      return Response.json({
        slots: [],
        error: `Google Calendar respondió ${freeBusyRes.status}: ${detail.slice(0, 160)}`,
      });
    }

    const freeBusy = await freeBusyRes.json();
    const busy = (freeBusy?.calendars?.primary?.busy || []).map((range) => ({
      start: new Date(range.start).getTime(),
      end: new Date(range.end).getTime(),
    }));

    const todayParts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const [ty, tm, td] = todayParts.split("-").map(Number);

    const minStart = now.getTime() + 3 * 60 * 60 * 1000;
    const slots = [];

    for (let i = 0; i < days; i += 1) {
      const base = new Date(Date.UTC(ty, tm - 1, td + i));
      const weekday = base.getUTCDay();
      if (weekday === 0 || weekday === 6) continue;

      const y = base.getUTCFullYear();
      const m = base.getUTCMonth() + 1;
      const d = base.getUTCDate();

      for (let minutes = startHour * 60; minutes + duration <= endHour * 60; minutes += duration) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        const start = zonedToUtc(y, m, d, hour, minute, timeZone);
        const end = new Date(start.getTime() + duration * 60000);
        if (start.getTime() < minStart) continue;
        const overlaps = busy.some(
          (range) => start.getTime() < range.end && end.getTime() > range.start
        );
        if (overlaps) continue;
        slots.push(start.toISOString());
        if (slots.length >= 240) break;
      }
      if (slots.length >= 240) break;
    }

    return Response.json({ slots, timezone: timeZone, duration });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}