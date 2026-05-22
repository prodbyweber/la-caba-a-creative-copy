import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar UserProfile para obtener datos del onboarding
    // CRITICAL: usar .filter() no .list() para evitar paginación que omite usuarios nuevos
    const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
    const userProfile = profiles[0] || null;

    // Buscar si ya existe un artista vinculado a este usuario
    const existingArtists = await base44.entities.Artist.filter({ user_id: user.id });
    const existingArtist = existingArtists[0] || null;

    // Datos base del artista usando UserProfile si existe
    const residenceOrNationality = userProfile?.country_of_residence || userProfile?.nationality || '';
    const city = userProfile?.address ? `${userProfile.address}, ${residenceOrNationality}` : residenceOrNationality;
    const artistData = {
      stageName: userProfile?.artist_name || userProfile?.full_name || user.full_name || user.email.split('@')[0],
      legalName: userProfile?.full_name || user.full_name || '',
      email: userProfile?.user_email || user.email,
      phone: userProfile?.phone ? `${userProfile.phone_country_code || ''} ${userProfile.phone}`.trim() : '',
      location: city,
      avatar_url: userProfile?.profile_photo_url || '',
      photo_position: userProfile?.photo_position || 'center center',
      nationality: userProfile?.nationality || '',
      country_of_residence: userProfile?.country_of_residence || '',
      status: 'Active',
      user_id: user.id
    };

    if (existingArtist) {
      // Si ya existe, sincronizar datos del UserProfile que falten
      const needsUpdate =
        (userProfile?.profile_photo_url && existingArtist.avatar_url !== userProfile.profile_photo_url) ||
        (userProfile?.artist_name && existingArtist.stageName !== (userProfile.artist_name || '')) ||
        (!existingArtist.user_id); // asegurar linkage

      if (needsUpdate) {
        await base44.entities.Artist.update(existingArtist.id, { ...artistData, user_id: user.id });
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