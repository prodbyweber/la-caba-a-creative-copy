// Utilities for sharing a Track's public link — reused by catalog cards and the share page.

export function getTrackShareUrl(trackId) {
  return `${window.location.origin}/track/${trackId}`;
}

// Tries native share sheet first (mobile), falls back to clipboard copy.
// Returns { shared: true } | { copied: true } | { copied: false }
export async function shareTrackLink(trackId, title) {
  const url = getTrackShareUrl(trackId);

  if (navigator.share) {
    try {
      await navigator.share({ title: title || "Escucha este track en Cabaña Creative", url });
      return { shared: true };
    } catch {
      // user cancelled the native sheet — don't fall back, just stop
      return { shared: false, cancelled: true };
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return { copied: true };
  } catch {
    return { copied: false };
  }
}