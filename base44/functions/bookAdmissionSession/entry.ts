import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { syncApplicationToHubspot, buildBriefing } from "../../shared/fullAccessHubspot.ts";

const TZ = "Europe/Madrid";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const applicationId = body?.application_id;
    const startRaw = body?.start;
    if (!applicationId || !startRaw) {
      return Response.json({ error: "Faltan datos de la reserva." }, { status: 400 });
    }
    const start = new Date(startRaw);
    if (Number.isNaN(start.getTime())) {
      return Response.json({ error: "Horario no válido." }, { status: 400 });
    }

    const application = await base44.asServiceRole.entities.FullAccessApplication.get(
      applicationId
    ).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!application) return Response.json({ error: "Not found" }, { status: 404 });

    if (application.meeting_start) {
      return Response.json({
        start: application.meeting_start,
        end: application.meeting_end,
        meeting_link: application.meeting_link,
        already: true,
      });
    }

    const settingsList = await base44.asServiceRole.entities.FullAccessSettings.list("-created_date", 1);
    const duration = Number(settingsList?.[0]?.booking_duration) || 30;
    const end = new Date(start.getTime() + duration * 60000);

    let accessToken = "";
    try {
      const connection = await base44.asServiceRole.connectors.getConnection("googlecalendar");
      accessToken = connection?.accessToken || "";
    } catch {
      accessToken = "";
    }
    if (!accessToken) {
      return Response.json({ error: "Google Calendar aún no está conectado." });
    }

    const freeBusyRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        timeZone: TZ,
        items: [{ id: "primary" }],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!freeBusyRes.ok) {
      return Response.json({ error: "No hemos podido comprobar la disponibilidad." });
    }
    const freeBusy = await freeBusyRes.json();
    const busy = freeBusy?.calendars?.primary?.busy || [];
    if (busy.length > 0) {
      return Response.json({ error: "Ese horario ya no está disponible. Elige otro." });
    }

    const taken = await base44.asServiceRole.entities.FullAccessApplication.filter({
      meeting_start: start.toISOString(),
    });
    if ((taken || []).length > 0) {
      return Response.json({ error: "Ese horario acaba de ocuparse. Elige otro." });
    }

    const artist = application.artist_name || application.contact_name || "Artista";
    const email = String(body?.email || application.email || "").trim();

    const eventRes = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: `Cabaña Full Access · Admisión — ${artist}`,
          description: `Sesión de admisión de Cabaña Full Access.\n\n${buildBriefing(application)}`,
          start: { dateTime: start.toISOString(), timeZone: TZ },
          end: { dateTime: end.toISOString(), timeZone: TZ },
          attendees: email ? [{ email }] : [],
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
          reminders: { useDefault: true },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!eventRes.ok) {
      const detail = await eventRes.text();
      return Response.json({
        error: `Google Calendar no pudo crear el evento (${eventRes.status}). ${detail.slice(0, 160)}`,
      });
    }

    const event = await eventRes.json();
    const meetingLink =
      event.hangoutLink ||
      (event.conferenceData?.entryPoints || []).find((p) => p.entryPointType === "video")?.uri ||
      "";

    const updated = await base44.asServiceRole.entities.FullAccessApplication.update(application.id, {
      meeting_start: start.toISOString(),
      meeting_end: end.toISOString(),
      meeting_timezone: TZ,
      meeting_link: meetingLink,
      calendar_event_id: event.id || "",
      status: "sesion_agendada",
      email: email || application.email,
    });

    try {
      const { contactId } = await syncApplicationToHubspot(base44, updated);
      await base44.asServiceRole.entities.FullAccessApplication.update(application.id, {
        hubspot_contact_id: contactId,
        hubspot_sync_status: "sincronizado",
        hubspot_sync_error: "",
      });
    } catch (syncError) {
      await base44.asServiceRole.entities.FullAccessApplication.update(application.id, {
        hubspot_sync_status: "error",
        hubspot_sync_error: String(syncError?.message || syncError).slice(0, 900),
      });
    }

    return Response.json({
      start: start.toISOString(),
      end: end.toISOString(),
      meeting_link: meetingLink,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}