import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { name, email, phone, message } = await req.json();
  if (!name || !email || !message) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  // Guardar el contacto en la base de datos
  await base44.asServiceRole.entities.ContactLead.create({
    name,
    email,
    phone: phone || '',
    message,
    status: 'Nuevo'
  });

  // Notificar al admin vía email interno
  const users = await base44.asServiceRole.entities.User.list();
  const adminUser = users.find(u => u.role === 'admin');

  if (adminUser) {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: adminUser.email,
      from_name: 'Cabaña Creative - Formulario Web',
      subject: `📩 Nuevo mensaje de ${name}`,
      body: `
<h2>Nuevo mensaje de contacto desde la web</h2>
<p><strong>Nombre:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}
<p><strong>Mensaje:</strong></p>
<p style="white-space: pre-line; background: #f5f5f5; padding: 12px; border-radius: 8px;">${message}</p>
<hr/>
<p style="color: #888; font-size: 12px;">Enviado desde el formulario de contacto de lacabanacreative.com</p>
      `.trim()
    });
  }

  return Response.json({ success: true });
});