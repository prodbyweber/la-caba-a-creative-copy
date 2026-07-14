// Utilities for sharing a Track's public link — reused by catalog cards and the share page.
// Uses the track's slug for clean URLs (e.g. /t/midnight-drive) when available, falling back to id.

export function getTrackShareUrl(track) {
  if (!track) return "";
  const slugOrId = track.slug || track.id;
  return `${window.location.origin}/t/${slugOrId}`;
}

// Fallback clipboard copy that works without navigator.clipboard (insecure contexts, old browsers).
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// Tries native share sheet first (mobile). Always copies to clipboard so the link is available
// even if the user dismisses the sheet or the API is unavailable.
// Returns { shared: true } | { copied: true } | { copied: false }
// Accepts a track object { slug, id, title } or, for backwards compat, (trackId, title).
export async function shareTrackLink(trackOrId, title) {
  const track = (typeof trackOrId === "object" && trackOrId !== null) ? trackOrId : { id: trackOrId, title };
  const url = getTrackShareUrl(track);
  const shareTitle = track.title || title || "Escucha este track en Cabaña Creative";

  let shared = false;
  if (navigator.share) {
    try {
      await navigator.share({ title: shareTitle, url });
      shared = true;
    } catch {
      // user cancelled — keep going to clipboard
    }
  }

  const copied = await copyToClipboard(url);
  if (shared) return { shared: true, copied };
  return { copied };
}