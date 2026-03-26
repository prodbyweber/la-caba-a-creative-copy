import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { name, email, phone, message } = await req.json();
  if (!name || !email || !message) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const STUDIO_EMAIL = 'hola@lacabanacreative.com';

  // 1. Email a La Cabaña Creative con todos los datos del lead
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: STUDIO_EMAIL,
    from_name: `${name} (Formulario Web)`,
    subject: `📩 Nuevo mensaje de contacto de ${name}`,
    body: `
<h2>Nuevo mensaje de contacto</h2>
<p><strong>Nombre:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}
<p><strong>Mensaje:</strong></p>
<p style="white-space: pre-line;">${message}</p>
<hr/>
<p style="color: #888; font-size: 12px;">Enviado desde el formulario de contacto de lacabanacreative.com</p>
    `.trim()
  });

  // 2. Email de confirmación al remitente
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: email,
    from_name: 'Cabaña Creative',
    subject: '¡Hemos recibido tu mensaje! ✉️',
    body: `
<p>Hola ${name},</p>
<p>Gracias por ponerte en contacto con nosotros. Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
<p>Si tienes cualquier duda urgente, puedes escribirnos directamente a <a href="mailto:${STUDIO_EMAIL}">${STUDIO_EMAIL}</a>.</p>
<br/>
<p>El equipo de <strong>Cabaña Creative</strong></p>
    `.trim()
  });

  return Response.json({ success: true });
});