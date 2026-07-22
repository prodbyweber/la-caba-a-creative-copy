import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Verificación pública del correo mediante token (accedido desde el enlace del email).
// No requiere sesión: el artista puede hacer clic sin haber iniciado sesión.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json().catch(() => ({}));
    if (!token) return Response.json({ error: 'Token requerido' }, { status: 400 });

    const users = await base44.asServiceRole.entities.User.filter({ email_verification_token: token });
    if (!users || users.length === 0) return Response.json({ error: 'Token inválido o expirado' }, { status: 404 });
    const target = users[0];
    if (target.email_verified) return Response.json({ success: true, already_verified: true });

    await base44.asServiceRole.entities.User.update(target.id, { email_verified: true, email_verification_token: "" });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
});