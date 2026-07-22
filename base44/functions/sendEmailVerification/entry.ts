import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { sendVerificationEmail } from "../../shared/emailVerification.ts";

// Reenvío manual del correo de verificación desde el panel de administración.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin requerido' }, { status: 403 });

    const { user_id, app_url } = await req.json().catch(() => ({}));
    if (!user_id) return Response.json({ error: 'user_id requerido' }, { status: 400 });

    const result = await sendVerificationEmail(base44, { userId: user_id, app_url });
    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
});