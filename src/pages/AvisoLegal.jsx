import React from "react";

export default function AvisoLegal() {
  return (
    <div style={{ background: "#080808", minHeight: "100dvh", padding: "80px 24px 60px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: "2rem", color: "#f0ede8", marginBottom: "8px" }}>
          Aviso Legal
        </h1>
        <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "40px" }}>Última actualización: junio 2025</p>

        <Section title="1. Datos identificativos del titular">
          <p>En cumplimiento del artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se informa que el titular del sitio web <strong>cabanacreative.es</strong> es:</p>
          <ul>
            <li><strong>Nombre:</strong> Santiago Alejandro Weber Hernández</li>
            <li><strong>NIF:</strong> Z1951498E</li>
            <li><strong>Dirección:</strong> Calle de Rufino González, 14, Madrid, España</li>
            <li><strong>Email de contacto:</strong> hola@cabanacreative.es</li>
            <li><strong>Sitio web:</strong> cabanacreative.es</li>
            <li><strong>Actividad:</strong> Agencia creativa y sello discográfico independiente. Servicios de producción musical, contenido audiovisual, identidad visual y campañas de marketing para artistas y marcas.</li>
          </ul>
        </Section>

        <Section title="2. Condiciones de uso">
          <p>El acceso y uso del presente sitio web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas las condiciones incluidas en este Aviso Legal.</p>
          <p>El usuario se compromete a hacer un uso adecuado y lícito del sitio web, absteniéndose de:</p>
          <ul>
            <li>Hacer un uso no autorizado o fraudulento del sitio.</li>
            <li>Transmitir contenidos ilícitos, dañinos o contrarios a la moral o al orden público.</li>
            <li>Introducir virus informáticos o cualquier otro sistema que pueda causar daños.</li>
            <li>Vulnerar los derechos de propiedad intelectual o industrial del titular.</li>
          </ul>
        </Section>

        <Section title="3. Propiedad intelectual e industrial">
          <p>Todos los contenidos del sitio web —incluyendo textos, imágenes, vídeos, diseños, logotipos, código fuente y cualquier otro elemento— son propiedad de Santiago Alejandro Weber Hernández o de terceros que han autorizado su uso, y están protegidos por la legislación española e internacional sobre propiedad intelectual e industrial.</p>
          <p>Queda expresamente prohibida la reproducción, distribución, comunicación pública o transformación de cualquier contenido del sitio sin autorización expresa y por escrito del titular.</p>
        </Section>

        <Section title="4. Limitación de responsabilidad">
          <p>El titular no garantiza la disponibilidad continua e ininterrumpida del sitio web ni la ausencia de errores en sus contenidos. Se reserva el derecho a modificar, suspender o interrumpir el acceso al sitio sin previo aviso.</p>
          <p>El titular no se hace responsable de:</p>
          <ul>
            <li>Los daños o perjuicios derivados del uso o imposibilidad de uso del sitio.</li>
            <li>Los contenidos de terceros a los que se enlace desde este sitio.</li>
            <li>Los virus u otros elementos dañinos que pudieran producir alteraciones en los sistemas informáticos de los usuarios.</li>
          </ul>
        </Section>

        <Section title="5. Enlaces a terceros">
          <p>El sitio puede contener enlaces a sitios web de terceros. El titular no ejerce control sobre dichos sitios ni asume responsabilidad alguna por sus contenidos, políticas de privacidad o prácticas.</p>
        </Section>

        <Section title="6. Legislación aplicable y jurisdicción">
          <p>Las presentes condiciones se rigen por la legislación española vigente. Para la resolución de cualquier controversia derivada del acceso o uso del sitio web, las partes se someten a los Juzgados y Tribunales de Madrid, salvo que la normativa aplicable establezca un fuero imperativo distinto.</p>
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

function BackLink() {
  return (
    <div style={{ marginTop: "48px", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "24px" }}>
      <a href="/start" style={{ fontFamily: "Arial, sans-serif", fontSize: "0.85rem", color: "#666", textDecoration: "none" }}>
        ← Volver al inicio
      </a>
    </div>
  );
}