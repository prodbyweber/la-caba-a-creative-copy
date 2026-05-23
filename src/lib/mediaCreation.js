/**
 * Centralized media creation service for Cabaña Creative.
 * Used by TracksSection, ShortsSection, FilmsSection.
 *
 * Every method:
 *  - logs each step to console so runtime logs capture failures
 *  - throws on any failure (no silent swallowing)
 *  - returns the created entity
 */
import { base44 } from "@/api/base44Client";

// ─── Internal logger ──────────────────────────────────────────────────────────
function log(tag, msg, data) {
  if (data !== undefined) {
    console.log(`[mediaCreation:${tag}]`, msg, data);
  } else {
    console.log(`[mediaCreation:${tag}]`, msg);
  }
}
function err(tag, msg, error) {
  console.error(`[mediaCreation:${tag}] ERROR —`, msg, error);
}

// ─── Upload helper ────────────────────────────────────────────────────────────
export async function uploadFile(file, label = "file") {
  log("upload", `Starting upload: ${label}`, { name: file.name, size: file.size });
  const result = await base44.integrations.Core.UploadFile({ file });
  if (!result?.file_url) {
    throw new Error(`Upload failed for ${label}: no URL returned`);
  }
  log("upload", `Upload complete: ${label}`, result.file_url);
  return result.file_url;
}

// ─── CREATE SOUNDTRACK ────────────────────────────────────────────────────────
/**
 * @param {object} data  — form fields (title, audio_file_url, cover_url, etc.)
 * @param {string} artistId  — optional artist entity ID
 * @returns {Promise<object>} created Track entity
 */
export async function createSoundtrack(data, artistId) {
  // Safety net: if artistId missing, auto-resolve from authenticated user
  if (!artistId) {
    try {
      const res = await base44.functions.invoke('createArtistProfileForNewUser', {});
      artistId = res?.data?.artistId || null;
      if (artistId) log("soundtrack", "Auto-resolved artistId", artistId);
    } catch (e) { log("soundtrack", "Could not auto-resolve artistId", e); }
  }
  log("soundtrack", "Starting creation", { title: data.title, artistId });

  if (!data.title?.trim()) throw new Error("El título es obligatorio");

  // Strip empty strings / nulls — schema rejects them
  const payload = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );

  // Ensure status is a valid enum value
  const validStatuses = ["idea", "production", "mixing", "mastering", "completed"];
  if (!validStatuses.includes(payload.status)) {
    payload.status = "idea";
  }

  if (artistId) payload.artist_id = artistId;

  log("soundtrack", "Payload ready", payload);

  const created = await base44.entities.Track.create(payload);

  if (!created?.id) {
    throw new Error("Track.create returned no ID — insert may have failed");
  }

  log("soundtrack", "Created successfully", { id: created.id, title: created.title });
  return created;
}

// ─── UPDATE SOUNDTRACK ────────────────────────────────────────────────────────
export async function updateSoundtrack(trackId, data) {
  log("soundtrack", "Updating", { trackId });

  const payload = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );

  const validStatuses = ["idea", "production", "mixing", "mastering", "completed"];
  if (payload.status && !validStatuses.includes(payload.status)) {
    payload.status = "idea";
  }

  const updated = await base44.entities.Track.update(trackId, payload);
  log("soundtrack", "Updated successfully", { trackId });
  return updated;
}

// ─── CREATE SHORT ─────────────────────────────────────────────────────────────
/**
 * @param {object} data  — { title, youtube_url, thumbnail_url, collaborators, track_id }
 * @param {string} artistId  — optional artist entity ID
 * @returns {Promise<object>} created ExplorarItem entity
 */
export async function createShort(data, artistId) {
  // Safety net: if artistId missing, auto-resolve from authenticated user
  if (!artistId) {
    try {
      const res = await base44.functions.invoke('createArtistProfileForNewUser', {});
      artistId = res?.data?.artistId || null;
      if (artistId) log("short", "Auto-resolved artistId", artistId);
    } catch (e) { log("short", "Could not auto-resolve artistId", e); }
  }
  log("short", "Starting creation", { title: data.title, artistId });

  if (!data.title?.trim()) throw new Error("El título es obligatorio");
  if (!data.youtube_url?.trim()) throw new Error("La URL de YouTube es obligatoria");

  const payload = {
    title: data.title,
    content_type: "short",
    youtube_url: data.youtube_url,
    is_active: true,
  };

  if (data.thumbnail_url) payload.thumbnail_url = data.thumbnail_url;
  if (data.collaborators?.length) payload.collaborators = data.collaborators;
  if (data.track_id) payload.track_id = data.track_id;
  if (artistId) payload.artist_id = artistId;

  log("short", "Payload ready", payload);

  const created = await base44.entities.ExplorarItem.create(payload);

  if (!created?.id) {
    throw new Error("ExplorarItem.create (short) returned no ID");
  }

  log("short", "Created successfully", { id: created.id, title: created.title });
  return created;
}

// ─── UPDATE SHORT ─────────────────────────────────────────────────────────────
export async function updateShort(itemId, data, artistId) {
  log("short", "Updating", { itemId });

  const payload = {
    title: data.title,
    content_type: "short",
    youtube_url: data.youtube_url,
    is_active: true,
  };
  if (data.thumbnail_url) payload.thumbnail_url = data.thumbnail_url;
  if (data.collaborators) payload.collaborators = data.collaborators;
  if (data.track_id) payload.track_id = data.track_id;
  if (artistId) payload.artist_id = artistId;

  const updated = await base44.entities.ExplorarItem.update(itemId, payload);
  log("short", "Updated successfully", { itemId });
  return updated;
}

// ─── CREATE FILM ──────────────────────────────────────────────────────────────
/**
 * @param {object} data  — { title, content_type, genres, year, description, youtube_url, thumbnail_url, credits, seasons }
 * @param {string} artistId  — optional artist entity ID
 * @returns {Promise<object>} created ExplorarItem entity
 */
export async function createFilm(data, artistId) {
  // Safety net: if artistId missing, auto-resolve from authenticated user
  if (!artistId) {
    try {
      const res = await base44.functions.invoke('createArtistProfileForNewUser', {});
      artistId = res?.data?.artistId || null;
      if (artistId) log("film", "Auto-resolved artistId", artistId);
    } catch (e) { log("film", "Could not auto-resolve artistId", e); }
  }
  log("film", "Starting creation", { title: data.title, content_type: data.content_type, artistId });

  if (!data.title?.trim()) throw new Error("El título es obligatorio");

  const validTypes = ["minifilm", "film", "videoclip", "visualizer", "series"];
  const contentType = validTypes.includes(data.content_type) ? data.content_type : "film";

  const isSeries = contentType === "series";

  if (!isSeries && !data.youtube_url?.trim()) {
    throw new Error("La URL de YouTube es obligatoria para este tipo de proyecto");
  }

  // Serialize seasons into description for series
  const descriptionPayload = isSeries
    ? JSON.stringify({ __seasons: data.seasons || [], text: data.description || "" })
    : (data.description || undefined);

  const payload = {
    title: data.title,
    content_type: contentType,
    is_active: true,
  };

  if (data.genres?.length) {
    payload.genres = data.genres;
    payload.subtitle = data.genres[0];
  }
  if (data.year) payload.year = Number(data.year);
  if (descriptionPayload) payload.description = descriptionPayload;
  if (data.youtube_url) payload.youtube_url = data.youtube_url;
  if (data.thumbnail_url) payload.thumbnail_url = data.thumbnail_url;
  if (data.credits?.length) payload.credits = data.credits;
  if (artistId) payload.artist_id = artistId;

  log("film", "Payload ready", payload);

  const created = await base44.entities.ExplorarItem.create(payload);

  if (!created?.id) {
    throw new Error("ExplorarItem.create (film) returned no ID");
  }

  log("film", "ExplorarItem created", { id: created.id });

  // Secondary: link to Project (non-blocking)
  if (artistId) {
    const projectTypeMap = {
      series: "Serie",
      minifilm: "MiniFilm",
      videoclip: "Videoclip",
      film: "Film",
      visualizer: "Film",
    };
    try {
      const proj = await base44.entities.Project.create({
        title: data.title,
        type: projectTypeMap[contentType] || "Film",
        artist_id: artistId,
        cover_url: data.thumbnail_url || undefined,
        description: data.description || undefined,
        status: "Draft",
        is_public: false,
        explorar_item_id: created.id,
      });
      log("film", "Project linked", { projectId: proj?.id });
    } catch (projErr) {
      // Non-critical: log but don't block
      err("film", "Project.create failed (non-critical, item was saved)", projErr);
    }
  }

  return created;
}

// ─── UPDATE FILM ──────────────────────────────────────────────────────────────
export async function updateFilm(itemId, data, existingItem) {
  log("film", "Updating", { itemId });

  const validTypes = ["minifilm", "film", "videoclip", "visualizer", "series"];
  const contentType = validTypes.includes(data.content_type) ? data.content_type : "film";
  const isSeries = contentType === "series";

  const descriptionPayload = isSeries
    ? JSON.stringify({ __seasons: data.seasons || [], text: data.description || "" })
    : (data.description || undefined);

  const payload = {
    title: data.title,
    content_type: contentType,
    is_active: existingItem?.is_active ?? true,
  };

  if (data.genres?.length) {
    payload.genres = data.genres;
    payload.subtitle = data.genres[0];
  }
  if (data.year) payload.year = Number(data.year);
  if (descriptionPayload) payload.description = descriptionPayload;
  if (data.youtube_url) payload.youtube_url = data.youtube_url;
  if (data.thumbnail_url) payload.thumbnail_url = data.thumbnail_url;
  if (data.credits?.length) payload.credits = data.credits;

  const updated = await base44.entities.ExplorarItem.update(itemId, payload);
  log("film", "Updated successfully", { itemId });
  return updated;
}