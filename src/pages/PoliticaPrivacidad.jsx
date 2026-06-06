import React from "react";

export default function PoliticaPrivacidad() {
  return (
    <div style={{ background: "#080808", minHeight: "100dvh", padding: "80px 24px 60px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: "2rem", color: "#f0ede8", marginBottom: "8px" }}>
          Política de Privacidad
        </h1>
        <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "40px" }}>Última actualización: junio 2025</p>

        <Section title="1. Responsable del tratamiento">
          <p>En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), le informamos que el responsable del tratamiento de sus datos personales es:</p>
          <ul>
            <li><strong>Nombre:</strong> Santiago Alejandro Weber Hernández</li>
            <li><strong>NIF:</strong> Z1951498E</li>
            <li><strong>Dirección:</strong> Calle de Rufino González, 14, Madrid</li>
            <li><strong>Email:</strong> hola@cabanacreative.es</li>
            <li><strong>Sitio web:</strong> cabanacreative.es</li>
          </ul>
        </Section>

        <Section title="2. Datos que recogemos">
          <p>Podemos recoger los siguientes datos personales:</p>
          <ul>
            <li>Datos identificativos: nombre, apellidos, dirección de correo electrónico y teléfono cuando nos contactas a través de formularios.</li>
            <li>Datos de navegación: dirección IP, tipo de navegador, páginas visitadas, duración de la visita, recopilados mediante cookies y herramientas de análisis.</li>
            <li>Datos profesionales: información artística o de marca que nos facilitas en el contexto de la prestación de servicios.</li>
          </ul>
        </Section>

        <Section title="3. Finalidad del tratamiento">
          <p>Tratamos tus datos para las siguientes finalidades:</p>
          <ul>
            <li>Gestionar las solicitudes de información y contacto recibidas.</li>
            <li>Prestar los servicios contratados de producción musical, audiovisual, identidad visual y marketing.</li>
            <li>Enviar comunicaciones comerciales sobre nuestros servicios, siempre que hayas otorgado tu consentimiento.</li>
            <li>Mejorar la experiencia de navegación y analizar el tráfico del sitio web.</li>
            <li>Cumplir con obligaciones legales aplicables.</li>
          </ul>
        </Section>

        <Section title="4. Base legal del tratamiento">
          <ul>
            <li><strong>Ejecución de un contrato:</strong> cuando los datos son necesarios para prestar el servicio solicitado.</li>
            <li><strong>Interés legítimo:</strong> para mejorar nuestros servicios y atender solicitudes de información.</li>
            <li><strong>Consentimiento:</strong> para el envío de comunicaciones comerciales y el uso de cookies no esenciales.</li>
            <li><strong>Obligación legal:</strong> cuando la normativa vigente nos exige tratar determinados datos.</li>
          </ul>
        </Section>

        <Section title="5. Conservación de los datos">
          <p>Los datos se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recogidos:</p>
          <ul>
            <li>Datos de contacto: hasta que se resuelva la solicitud y durante el plazo de prescripción de posibles responsabilidades (5 años).</li>
            <li>Datos de clientes: durante la vigencia de la relación contractual y los plazos legales posteriores.</li>
            <li>Datos de newsletter: hasta que el usuario retire su consentimiento.</li>
          </ul>
        </Section>

        <Section title="6. Tus derechos">
          <p>Puedes ejercer los siguientes derechos en cualquier momento:</p>
          <ul>
            <li><strong>Acceso:</strong> conocer qué datos personales tratamos sobre ti.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos en determinadas circunstancias.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común.</li>
            <li><strong>Limitación:</strong> solicitar la restricción del tratamiento en ciertos casos.</li>
          </ul>
          <p>Para ejercer estos derechos, escríbenos a <a href="mailto:hola@cabanacreative.es" style={{ color: "#ff5833" }}>hola@cabanacreative.es</a> indicando el derecho que deseas ejercer y adjuntando una copia de tu documento de identidad.</p>
          <p>Si consideras que el tratamiento no se ajusta a la normativa, puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (www.aepd.es).</p>
        </Section>

        <Section title="7. Destinatarios de los datos">
          <p>No cedemos tus datos a terceros salvo por obligación legal. Podemos contar con proveedores de servicios (encargados del tratamiento) que tratan datos en nuestro nombre bajo contrato de encargo, como plataformas de email, servicios de analítica o herramientas de gestión de proyectos.</p>
        </Section>

        <Section title="8. Transferencias internacionales">
          <p>Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Espacio Económico Europeo. En tales casos, nos aseguramos de que existan garantías adecuadas conforme al RGPD (cláusulas contractuales tipo u otras garantías equivalentes).</p>
        </Section>

        <Section title="9. Seguridad">
          <p>Adoptamos las medidas técnicas y organizativas necesarias para garantizar la seguridad de tus datos y prevenir su pérdida, alteración o acceso no autorizado.</p>
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