import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar UserProfile para obtener datos del onboarding
    const profiles = await base44.entities.UserProfile.list();
    const userProfile = profiles.find(p => p.user_id === user.id);

    // Buscar si ya existe un artista vinculado a este usuario
    const artists = await base44.entities.Artist.list();
    const existingArtist = artists.find(a => a.user_id === user.id);

    // Datos base del artista usando UserProfile si existe
    const artistData = {
      stageName: userProfile?.artist_name || userProfile?.full_name || user.full_name || user.email.split('@')[0],
      legalName: userProfile?.full_name || user.full_name || '',
      email: userProfile?.user_email || user.email,
      phone: userProfile?.phone ? `${userProfile.phone_country_code || ''} ${userProfile.phone}`.trim() : '',
      location: userProfile?.nationality || '',
      avatar_url: userProfile?.profile_photo_url || '',
      status: 'Active',
      user_id: user.id
    };

    if (existingArtist) {
      // Si ya existe, sincronizar datos del UserProfile que falten
      const needsUpdate =
        (userProfile?.profile_photo_url && existingArtist.avatar_url !== userProfile.profile_photo_url) ||
        (userProfile?.artist_name && existingArtist.stageName !== userProfile.artist_name);

      if (needsUpdate) {
        await base44.entities.Artist.update(existingArtist.id, artistData);
      }

      return Response.json({ artistId: existingArtist.id, message: 'Artist profile already exists' });
    }

    // Crear nuevo perfil de artista con datos del onboarding
    const newArtist = await base44.entities.Artist.create(artistData);

    return Response.json({ artistId: newArtist.id, created: true });
  } catch (error) {
    console.error('Error creating artist profile:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});