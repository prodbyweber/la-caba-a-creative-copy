import React from "react";

export default function PoliticaCookies() {
  return (
    <div style={{ background: "#080808", minHeight: "100dvh", padding: "80px 24px 60px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: "2rem", color: "#f0ede8", marginBottom: "8px" }}>
          Política de Cookies
        </h1>
        <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "40px" }}>Última actualización: junio 2025</p>

        <Section title="1. ¿Qué son las cookies?">
          <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en el dispositivo del usuario al visitarlos. Sirven para recordar preferencias, analizar el comportamiento de navegación y ofrecer contenido personalizado.</p>
          <p>Según la Ley 34/2002 (LSSI-CE) y el RGPD, el uso de cookies que no sean estrictamente necesarias requiere el consentimiento previo e informado del usuario.</p>
        </Section>

        <Section title="2. Tipos de cookies que usamos">
          <p><strong style={{ color: "#f0ede8" }}>Por su titularidad:</strong></p>
          <ul>
            <li><strong>Propias:</strong> emitidas por cabanacreative.es directamente.</li>
            <li><strong>De terceros:</strong> emitidas por plataformas externas integradas en el sitio (Meta, etc.).</li>
          </ul>
          <p><strong style={{ color: "#f0ede8" }}>Por su finalidad:</strong></p>
          <ul>
            <li><strong>Necesarias:</strong> imprescindibles para el funcionamiento básico del sitio. No requieren consentimiento.</li>
            <li><strong>Analíticas:</strong> permiten analizar el tráfico y comportamiento de los usuarios para mejorar el sitio.</li>
            <li><strong>Marketing:</strong> utilizadas para mostrar publicidad relevante y medir la eficacia de campañas.</li>
          </ul>
        </Section>

        <Section title="3. Tabla de cookies utilizadas">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <Th>Nombre</Th>
                  <Th>Tipo</Th>
                  <Th>Finalidad</Th>
                  <Th>Duración</Th>
                </tr>
              </thead>
              <tbody>
                <Tr name="cookie_consent" type="Necesaria" purpose="Guarda las preferencias de consentimiento de cookies del usuario" duration="1 año" />
                <Tr name="_fbp" type="Marketing" purpose="Meta Pixel — identifica navegadores para métricas de conversión y publicidad en Facebook/Instagram" duration="3 meses" />
                <Tr name="_fbc" type="Marketing" purpose="Meta Pixel — almacena el parámetro de clic en anuncios de Facebook" duration="2 años" />
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Cómo gestionar o desactivar las cookies">
          <p>Puedes gestionar o eliminar las cookies desde la configuración de tu navegador. A continuación te indicamos cómo hacerlo en los principales navegadores:</p>
          <ul>
            <li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</li>
            <li><strong>Mozilla Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
            <li><strong>Safari:</strong> Preferencias → Privacidad → Gestión de datos de sitios web</li>
            <li><strong>Microsoft Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies</li>
          </ul>
          <p>Ten en cuenta que deshabilitar ciertas cookies puede afectar al funcionamiento del sitio web.</p>
          <p>También puedes gestionar tus preferencias de cookies en cualquier momento usando el panel de configuración disponible en el banner inferior del sitio.</p>
        </Section>

        <Section title="5. Cambios en esta política">
          <p>Nos reservamos el derecho a actualizar esta Política de Cookies para adaptarla a novedades legislativas, cambios en el sitio web o nuevas herramientas incorporadas. Te recomendamos revisarla periódicamente.</p>
        </Section>

        <Section title="6. Contacto">
          <p>Si tienes dudas sobre el uso de cookies en este sitio, puedes contactarnos en <a href="mailto:hola@cabanacreative.es" style={{ color: "#ff5833" }}>hola@cabanacreative.es</a>.</p>
        </Section>

        <BackLink />
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <h2 style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#f0ede8", marginBottom: "12px" }}>{title}</h2>
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: "0.92rem", color: "#aaaaaa", lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th style={{ textAlign: "left", padding: "8px 12px", color: "#f0ede8", fontWeight: 700 }}>{children}</th>;
}

function Tr({ name, type, purpose, duration }) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={{ padding: "10px 12px", color: "#aaaaaa", fontFamily: "monospace", fontSize: "0.8rem" }}>{name}</td>
      <td style={{ padding: "10px 12px", color: "#aaaaaa" }}>{type}</td>
      <td style={{ padding: "10px 12px", color: "#aaaaaa" }}>{purpose}</td>
      <td style={{ padding: "10px 12px", color: "#aaaaaa", whiteSpace: "nowrap" }}>{duration}</td>
    </tr>
  );
}

function BackLink() {
  return (
    <div style={{ marginTop: "48px", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "24px" }}>
      <a href="/start" style={{ fontFamily: "Arial, sans-serif", fontSize: "0.85rem", color: "#666", textDecoration: "none" }}>
        ← Volver al inicio
      </a>
    </div>
  );
}