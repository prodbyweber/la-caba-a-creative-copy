import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { name, email, phone, message } = await req.json();
  if (!name || !email || !message) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  // Separar nombre y apellido (primer token = nombre, resto = apellido)
  const parts = name.trim().split(' ');
  const nombre = parts[0] || name;
  const apellido = parts.slice(1).join(' ') || '-';

  // Guardar el contacto en la base de datos como lead
  await base44.asServiceRole.entities.ExploracionLead.create({
    nombre,
    apellido,
    nombre_artistico: name,
    email,
    telefono: phone || '-',
    pais_nacimiento: '-',
    pais_residencia: '-',
    direccion: '-',
    instagram: '-',
    tiktok: '-',
    spotify: '-',
    youtube: '-',
    nivel_actual: 'Estoy empezando',
    que_frena_crecimiento: message,
    que_espera_resolver: message,
    compromiso_inversion: 'Me interesa, pero quiero más información antes de confirmar',
    status: 'Interesado'
  });

  // Notificar al admin (usuario registrado en la app) vía email interno
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