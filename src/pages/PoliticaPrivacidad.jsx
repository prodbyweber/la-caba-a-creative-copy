import React from "react";

export default function PoliticaPrivacidad() {
  return (
    <div style={{ background: "#080808", minHeight: "100dvh", padding: "80px 24px 60px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: "2rem", color: "#f0ede8", marginBottom: "8px" }}>
          Política de Privacidad
        </h1>
        <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "40px" }}>Última actualización: junio 2026</p>

        <Section title="1. Responsable del tratamiento">
          <p>En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), le informamos que el responsable del tratamiento de sus datos personales es:</p>
          <ul>
            <li><strong>Nombre:</strong> Cabaña Creative</li>
            <li><strong>Email:</strong> hola@cabanacreative.es</li>
            <li><strong>Sitio web:</strong> cabanacreative.es</li>
          </ul>
        </Section>

        <Section title="2. Datos que recogemos">
          <p>En función de tu interacción con nuestra plataforma, podemos recoger las siguientes categorías de datos personales:</p>
          <ul>
            <li><strong>Datos identificativos:</strong> nombre, apellidos, dirección de correo electrónico, número de teléfono, nombre artístico y nombre de usuario de Instagram cuando nos contactas a través de formularios de solicitud o registro.</li>
            <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, sistema operativo, páginas visitadas, duración de la visita, interacciones y eventos dentro del sitio web, recopilados mediante cookies propias y de terceros, así como herramientas de análisis web.</li>
            <li><strong>Datos profesionales y artísticos:</strong> información sobre tu proyecto musical o de marca que nos facilitas voluntariamente en el contexto de la prestación de servicios (géneros musicales, fase del proyecto, presupuesto disponible, referencias artísticas, enlaces a redes sociales y portfolios).</li>
            <li><strong>Datos de actividad en redes sociales:</strong> cuando interactúas con nuestros perfiles en Instagram, YouTube, TikTok u otras plataformas, o cuando utilizas funciones de inicio de sesión social, podemos recibir información agregada o anonimizada conforme a las políticas de cada plataforma.</li>
            <li><strong>Datos de pago y facturación:</strong> en caso de contratación de servicios de pago, los datos relativos a la transacción son tratados a través de procesadores de pago externos (Stripe). Cabaña Creative no almacena directamente los datos completos de tarjetas bancarias.</li>
            <li><strong>Datos de comunicación:</strong> contenido de los mensajes, correos electrónicos y solicitudes que nos envías a través de cualquier canal de contacto.</li>
          </ul>
        </Section>

        <Section title="3. Finalidad del tratamiento">
          <p>Tratamos tus datos personales para las siguientes finalidades específicas:</p>
          <ul>
            <li><strong>Gestión de clientes y contactos:</strong> atender y gestionar las solicitudes de información, presupuestos y consultas recibidas a través de nuestros formularios y canales de comunicación.</li>
            <li><strong>Prestación de servicios contratados:</strong> ejecutar y gestionar los servicios de producción musical, producción audiovisual, identidad visual, estrategia de marca y marketing digital contratados por nuestros clientes.</li>
            <li><strong>Publicidad y remarketing:</strong> mostrar anuncios personalizados y campañas de remarketing a través de plataformas como Google Ads, Meta Ads (Facebook e Instagram) y TikTok Ads, basados en tus intereses y comportamiento de navegación, siempre que hayas otorgado tu consentimiento.</li>
            <li><strong>Análisis de comportamiento y mejora del servicio:</strong> analizar el tráfico del sitio web, las interacciones de los usuarios y el rendimiento de nuestras campañas mediante herramientas como Google Analytics, para mejorar la experiencia de usuario, nuestros servicios y nuestras estrategias de comunicación.</li>
            <li><strong>Comunicaciones comerciales y newsletters:</strong> enviar comunicaciones sobre nuestros servicios, novedades, contenidos relevantes y promociones, siempre que hayas otorgado tu consentimiento expreso.</li>
            <li><strong>Automatizaciones de marketing:</strong> gestionar flujos automatizados de comunicación por correo electrónico (email marketing) a través de plataformas de terceros, basados en el consentimiento y en el interés legítimo de mantener informados a nuestros clientes y contactos.</li>
            <li><strong>Cumplimiento de obligaciones legales y fiscales:</strong> atender a los requerimientos establecidos por la normativa tributaria, mercantil y de protección de datos aplicable.</li>
          </ul>
        </Section>

        <Section title="4. Base legal del tratamiento">
          <ul>
            <li><strong>Ejecución de un contrato:</strong> cuando los datos son necesarios para prestar el servicio solicitado o para la ejecución de medidas precontractuales.</li>
            <li><strong>Interés legítimo:</strong> para mejorar nuestros servicios, atender solicitudes de información, analizar el uso de nuestra plataforma y enviar comunicaciones comerciales a clientes existentes sobre servicios similares.</li>
            <li><strong>Consentimiento:</strong> para el envío de comunicaciones comerciales a no clientes, el uso de cookies no esenciales (analíticas y publicitarias), la participación en campañas de remarketing y la personalización de anuncios a través de plataformas publicitarias de terceros.</li>
            <li><strong>Obligación legal:</strong> cuando la normativa vigente nos exige tratar determinados datos, como los relativos a facturación y obligaciones fiscales.</li>
          </ul>
        </Section>

        <Section title="5. Conservación de los datos">
          <p>Los datos se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recogidos:</p>
          <ul>
            <li><strong>Datos de contacto y solicitudes:</strong> hasta que se resuelva la solicitud y durante el plazo de prescripción de posibles responsabilidades legales (5 años según el artículo 1964 del Código Civil).</li>
            <li><strong>Datos de clientes:</strong> durante la vigencia de la relación contractual y los plazos legales posteriores exigidos por la normativa fiscal y mercantil.</li>
            <li><strong>Datos de newsletter y comunicaciones comerciales:</strong> hasta que el usuario retire su consentimiento o solicite la baja, lo que puede hacer en cualquier momento a través del enlace de cancelación incluido en cada comunicación o escribiendo a hola@cabanacreative.es.</li>
            <li><strong>Datos de navegación y cookies:</strong> según los plazos establecidos en nuestra Política de Cookies para cada tipo de cookie.</li>
          </ul>
        </Section>

        <Section title="6. Tus derechos">
          <p>Puedes ejercer los siguientes derechos en cualquier momento y de forma gratuita:</p>
          <ul>
            <li><strong>Acceso:</strong> conocer qué datos personales tratamos sobre ti y obtener copia de los mismos.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de tus datos cuando, entre otros motivos, ya no sean necesarios para los fines para los que fueron recogidos.</li>
            <li><strong>Limitación del tratamiento:</strong> solicitar la restricción del tratamiento de tus datos en determinadas circunstancias, en cuyo caso únicamente los conservaremos para el ejercicio o defensa de reclamaciones.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado, de uso común y lectura mecánica, o solicitar que los transmitamos directamente a otro responsable cuando sea técnicamente posible.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos en determinadas circunstancias, incluyendo la oposición al tratamiento con fines de marketing directo y elaboración de perfiles.</li>
          </ul>
          <p>Para ejercer estos derechos, escríbenos a <a href="mailto:hola@cabanacreative.es" style={{ color: "#ff5833" }}>hola@cabanacreative.es</a> indicando el derecho que deseas ejercer y adjuntando una copia de tu documento de identidad o documento equivalente que acredite tu identidad. Responderemos a tu solicitud en el plazo máximo de un mes, que podrá ampliarse a dos meses en caso de solicitudes complejas o numerosas.</p>
          <p>Asimismo, tienes derecho a retirar tu consentimiento en cualquier momento, sin que ello afecte a la licitud del tratamiento basado en el consentimiento previo a su retirada.</p>
          <p>Si consideras que el tratamiento de tus datos personales no se ajusta a la normativa, puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (AEPD) a través de su sede electrónica en <a href="https://www.aepd.es" target="_blank" rel="noreferrer" style={{ color: "#ff5833" }}>www.aepd.es</a>.</p>
        </Section>

        <Section title="7. Destinatarios de los datos y proveedores externos">
          <p>No cedemos tus datos personales a terceros salvo por obligación legal. Sin embargo, para la prestación de nuestros servicios, recurrimos a los siguientes proveedores de servicios que actúan como encargados del tratamiento bajo contrato:</p>
          <ul>
            <li><strong>Google (Google Analytics, Google Ads, YouTube):</strong> utilizamos servicios de Google para analítica web, medición del tráfico, publicidad digital y alojamiento de contenido audiovisual. Google LLC está certificado bajo el Privacy Shield y aplica cláusulas contractuales tipo aprobadas por la Comisión Europea. Puedes consultar cómo Google utiliza los datos en <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: "#ff5833" }}>policies.google.com/privacy</a>.</li>
            <li><strong>Meta Platforms (Facebook, Instagram, Meta Ads):</strong> utilizamos el píxel de Meta y las herramientas publicitarias de Meta para campañas de publicidad segmentada y remarketing, así como para medir la efectividad de nuestros anuncios. Meta Platforms Ireland Limited es el responsable para usuarios del EEE. Más información en <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noreferrer" style={{ color: "#ff5833" }}>facebook.com/privacy/policy</a>.</li>
            <li><strong>TikTok:</strong> podemos utilizar TikTok Ads para campañas publicitarias y de captación. TikTok Technology Limited y TikTok Information Technologies UK Limited actúan como responsables conjuntos para usuarios del EEE. Consulta su política en <a href="https://www.tiktok.com/legal/privacy-policy" target="_blank" rel="noreferrer" style={{ color: "#ff5833" }}>tiktok.com/legal/privacy-policy</a>.</li>
            <li><strong>Procesadores de pago (Stripe):</strong> para la gestión de pagos en línea utilizamos Stripe, que actúa como responsable independiente del tratamiento de los datos de pago. Stripe cumple con los estándares PCI DSS y aplica las garantías exigidas por el RGPD. Consulta su política en <a href="https://stripe.com/es/privacy" target="_blank" rel="noreferrer" style={{ color: "#ff5833" }}>stripe.com/privacy</a>.</li>
            <li><strong>Plataformas de email marketing:</strong> podemos utilizar servicios de terceros para la gestión de comunicaciones por correo electrónico y automatizaciones de marketing, que actúan como encargados del tratamiento bajo las garantías adecuadas.</li>
            <li><strong>Servicios de hosting e infraestructura web:</strong> nuestra plataforma web está alojada en servidores que cumplen con los estándares de seguridad exigidos por la normativa europea, aplicando cifrado de datos en tránsito mediante protocolo HTTPS y medidas de seguridad técnicas y organizativas.</li>
          </ul>
        </Section>

        <Section title="8. Transferencias internacionales de datos">
          <p>Algunos de los proveedores mencionados en la sección anterior pueden estar ubicados o procesar datos fuera del Espacio Económico Europeo (EEE), en particular en Estados Unidos. En dichos casos, Cabaña Creative se asegura de que:</p>
          <ul>
            <li>Las transferencias se realizan exclusivamente a entidades que ofrecen garantías adecuadas de conformidad con el artículo 46 del RGPD, tales como las cláusulas contractuales tipo aprobadas por la Comisión Europea.</li>
            <li>Los proveedores están certificados bajo el Marco de Privacidad de Datos UE-EE.UU. (Data Privacy Framework) o aplican medidas adicionales de protección equivalentes.</li>
            <li>Las transferencias se limitan a los datos estrictamente necesarios para la prestación del servicio contratado.</li>
            <li>Se realizan evaluaciones de impacto y se revisan periódicamente las garantías aplicables por parte de cada proveedor.</li>
          </ul>
          <p>Puedes solicitar información adicional sobre las garantías aplicables a las transferencias internacionales escribiendo a hola@cabanacreative.es.</p>
        </Section>

        <Section title="9. Seguridad">
          <p>Adoptamos las medidas técnicas y organizativas necesarias para garantizar la seguridad de tus datos personales y prevenir su pérdida, alteración, acceso no autorizado o tratamiento indebido, teniendo en cuenta el estado de la tecnología, la naturaleza de los datos y los riesgos a los que están expuestos. Entre otras medidas, aplicamos:</p>
          <ul>
            <li>Cifrado de las comunicaciones mediante protocolo SSL/TLS (HTTPS).</li>
            <li>Control de acceso basado en autenticación y autorización por roles.</li>
            <li>Actualización periódica de sistemas y plataformas.</li>
            <li>Monitoreo continuo de la infraestructura y copias de seguridad periódicas.</li>
            <li>Formación y concienciación en materia de protección de datos para todo el personal con acceso a información personal.</li>
          </ul>
        </Section>

        <Section title="10. Cookies y tecnologías de seguimiento">
          <p>Nuestro sitio web utiliza cookies propias y de terceros para mejorar la experiencia de navegación, analizar el tráfico y personalizar el contenido publicitario. Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestra web.</p>
          <p>Clasificación de cookies utilizadas:</p>
          <ul>
            <li><strong>Cookies técnicas (propias):</strong> necesarias para el funcionamiento básico del sitio web, como la gestión de sesiones de usuario, autenticación y preferencias de navegación. Estas cookies no requieren consentimiento según la normativa aplicable.</li>
            <li><strong>Cookies de análisis (terceros):</strong> utilizamos Google Analytics para recopilar información anónima sobre el uso de nuestro sitio web (páginas visitadas, tiempo de navegación, origen del tráfico). Estos datos nos permiten medir y mejorar el rendimiento de la plataforma. Puedes rechazar estas cookies a través de nuestro panel de configuración o de la configuración de tu navegador.</li>
            <li><strong>Cookies publicitarias y de remarketing (terceros):</strong> utilizamos el píxel de Meta (Facebook/Instagram), Google Ads y, en su caso, TikTok Ads para mostrar anuncios relevantes basados en tu navegación y medir la efectividad de nuestras campañas publicitarias. Estas cookies requieren tu consentimiento previo y expreso.</li>
          </ul>
          <p><strong>Tus opciones sobre cookies:</strong> al acceder por primera vez a nuestro sitio web, te mostramos un banner de configuración de cookies donde puedes aceptar todas, rechazar todas o personalizar tus preferencias por categoría. En cualquier momento puedes modificar tu consentimiento accediendo a la configuración de cookies desde el banner disponible en la parte inferior de la página.</p>
          <p>Adicionalmente, puedes gestionar las cookies directamente desde la configuración de tu navegador. Ten en cuenta que el bloqueo de determinadas cookies puede afectar al funcionamiento de algunas funcionalidades del sitio.</p>
          <p>Para información más detallada, consulta nuestra <a href="/politica-de-cookies" style={{ color: "#ff5833" }}>Política de Cookies</a>.</p>
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