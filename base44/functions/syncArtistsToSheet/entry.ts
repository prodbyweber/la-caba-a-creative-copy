import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SHEET_NAME = "Creadores";
const SHEET_TITLE = "Creadores · Cabaña Creative";

const COLUMNS = [
  { label: "Nombre completo", value: (c) => fullName(c) },
  { label: "Nombre artístico", value: (c) => c.artist?.stageName || c.profile?.artist_name || c.profile?.display_name || "" },
  { label: "Correo", value: (c) => email(c) },
  { label: "Teléfono", value: (c) => phone(c) },
  { label: "Nacionalidad", value: (c) => c.artist?.nationality || c.profile?.nationality || "" },
  { label: "País de residencia", value: (c) => c.artist?.country_of_residence || c.profile?.country_of_residence || "" },
  { label: "Dirección", value: (c) => c.profile?.address || c.artist?.location || "" },
  { label: "Género musical", value: (c) => c.artist?.genre || "" },
  { label: "Tipo de creador", value: (c) => c.profile?.creator_type || "" },
  { label: "Usuario", value: (c) => (c.username ? `@${c.username}` : "") },
  { label: "Estado", value: (c) => c.artist?.status || "" },
  { label: "Horas de estudio", value: (c) => c.artist?.studio_hours_total ?? "" },
  { label: "Alta", value: (c) => formatDate(c.artist?.created_date || c.profile?.created_date || c.platformUser?.created_date) },
];

function fullName(c) {
  const p = c.profile;
  const joined = [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim();
  return (
    p?.full_name ||
    joined ||
    c.artist?.legalName ||
    c.platformUser?.full_name ||
    c.artist?.stageName ||
    c.platformUser?.email ||
    ""
  );
}

function email(c) {
  return (
    c.artist?.email ||
    c.profile?.user_email ||
    c.profile?.contact_email ||
    c.platformUser?.email ||
    ""
  );
}

function phone(c) {
  if (c.artist?.phone) return c.artist.phone;
  const p = c.profile;
  if (!p?.phone) return "";
  return [p.phone_country_code, p.phone].filter(Boolean).join(" ").trim();
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-ES");
}

function mergeCreators(artists, profiles, users) {
  const seen = new Set();
  const result = [];

  for (const artist of artists) {
    if (seen.has(artist.id)) continue;
    seen.add(artist.id);
    if (artist.user_id) seen.add(`uid-${artist.user_id}`);
    const profile = profiles.find((p) => p.user_id === artist.user_id) || null;
    result.push({ artist, profile, platformUser: null, username: profile?.username || null });
  }

  for (const profile of profiles) {
    if (artists.some((a) => a.user_id === profile.user_id)) continue;
    const key = `profile-${profile.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (profile.user_id) seen.add(`uid-${profile.user_id}`);
    result.push({ artist: null, profile, platformUser: null, username: profile.username || null });
  }

  for (const u of users) {
    if (seen.has(`uid-${u.id}`)) continue;
    seen.add(`uid-${u.id}`);
    result.push({ artist: null, profile: null, platformUser: u, username: null });
  }

  return result;
}

async function sheetsFetch(url, { method = "GET", token, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Sheets (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json().catch(() => ({}));
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const [artists, profiles, users] = await Promise.all([
      base44.asServiceRole.entities.Artist.list("-created_date", 500),
      base44.asServiceRole.entities.UserProfile.list("-created_date", 500),
      base44.asServiceRole.entities.User.list("-created_date", 500),
    ]);

    const creators = mergeCreators(artists, profiles, users);
    const values = [
      COLUMNS.map((col) => col.label),
      ...creators.map((creator) => COLUMNS.map((col) => col.value(creator))),
    ];

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");

    const states = await base44.asServiceRole.entities.ArtistSheet.list("-created_date", 1);
    const state = states[0] || null;

    let spreadsheetId = state?.spreadsheet_id || null;
    let spreadsheetUrl = state?.spreadsheet_url || null;

    if (!spreadsheetId) {
      const created = await sheetsFetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        token: accessToken,
        body: {
          properties: { title: SHEET_TITLE },
          sheets: [{ properties: { title: SHEET_NAME } }],
        },
      });
      spreadsheetId = created.spreadsheetId;
      spreadsheetUrl = created.spreadsheetUrl;
    }

    const sheetRange = `${encodeURIComponent(SHEET_NAME)}!A1:Z5000`;

    await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetRange}:clear`,
      { method: "POST", token: accessToken }
    );

    await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_NAME)}!A1?valueInputOption=RAW`,
      { method: "PUT", token: accessToken, body: { values } }
    );

    const payload = {
      spreadsheet_id: spreadsheetId,
      spreadsheet_url: spreadsheetUrl,
      last_synced_at: new Date().toISOString(),
      row_count: creators.length,
    };

    if (state) {
      await base44.asServiceRole.entities.ArtistSheet.update(state.id, payload);
    } else {
      await base44.asServiceRole.entities.ArtistSheet.create(payload);
    }

    return Response.json({
      success: true,
      row_count: creators.length,
      spreadsheet_id: spreadsheetId,
      spreadsheet_url: spreadsheetUrl,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}