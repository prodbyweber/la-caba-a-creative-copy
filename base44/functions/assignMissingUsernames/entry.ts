import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function toUsername(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const toUpdate = profiles.filter(p => !p.username);

    const usedUsernames = new Set(profiles.filter(p => p.username).map(p => p.username));

    const results = [];

    for (const profile of toUpdate) {
      const base = toUsername(
        profile.artist_name ||
        profile.full_name ||
        `${profile.first_name || ""}${profile.last_name || ""}` ||
        profile.display_name ||
        `user${profile.id.slice(-6)}`
      ) || `user${profile.id.slice(-6)}`;

      let candidate = base;
      let n = 1;
      while (usedUsernames.has(candidate)) {
        candidate = `${base}${n}`;
        n++;
      }
      usedUsernames.add(candidate);

      await base44.asServiceRole.entities.UserProfile.update(profile.id, { username: candidate });
      results.push({ id: profile.id, username: candidate, name: profile.full_name });
    }

    return Response.json({ updated: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});