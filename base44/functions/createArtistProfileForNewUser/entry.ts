import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar si ya existe un artista vinculado a este usuario
    const artists = await base44.entities.Artist.list();
    const existingArtist = artists.find(a => a.user_id === user.id);

    if (existingArtist) {
      return Response.json({ artistId: existingArtist.id, message: 'Artist profile already exists' });
    }

    // Crear nuevo perfil de artista para el usuario
    const newArtist = await base44.entities.Artist.create({
      stageName: user.full_name || user.email.split('@')[0],
      legalName: user.full_name || '',
      email: user.email,
      status: 'Active',
      user_id: user.id
    });

    return Response.json({ artistId: newArtist.id, created: true });
  } catch (error) {
    console.error('Error creating artist profile:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});