/**
 * Textos legales que se muestran en los popups de /admision.
 * Reutilizan la información ya publicada en /politica-de-privacidad y /aviso-legal.
 * No incluye datos que no estén ya publicados en el sitio.
 */

export const LEGAL_DOCS = {
  privacy: {
    title: "Política de privacidad",
    updated: "Última actualización: junio 2026",
    blocks: [
      {
        title: "Responsable del tratamiento",
        text: "El responsable del tratamiento de tus datos personales es Cabaña Creative (cabanacreative.es). Puedes contactar con nosotros en hola@cabanacreative.es.",
      },
      {
        title: "Datos que recogemos",
        items: [
          "Datos identificativos: nombre, apellidos, dirección de correo electrónico, número de teléfono y país de residencia.",
          "Datos profesionales y artísticos: etapa del proyecto, géneros musicales, enlace a tu música, tipo de lanzamiento, presupuesto y disponibilidad.",
          "Datos de navegación: dirección IP, tipo de navegador, páginas visitadas y eventos dentro del sitio, recogidos mediante cookies propias y de terceros.",
        ],
      },
      {
        title: "Finalidad",
        items: [
          "Gestionar y valorar tu solicitud de admisión al programa Cabaña Full Access.",
          "Contactarte y coordinar la sesión de descubrimiento.",
          "Cumplir las obligaciones legales, fiscales y contables que nos sean aplicables.",
        ],
      },
      {
        title: "Base legal",
        text: "Tratamos tus datos sobre la base de tu consentimiento (art. 6.1.a RGPD) y de la aplicación de medidas precontractuales a petición del interesado (art. 6.1.b RGPD).",
      },
      {
        title: "Conservación",
        text: "Los datos se conservan durante la tramitación de la solicitud y, después, durante los plazos de prescripción de las responsabilidades legales aplicables.",
      },
      {
        title: "Destinatarios",
        text: "No cedemos tus datos a terceros salvo obligación legal. Para prestar el servicio recurrimos a proveedores tecnológicos que actúan como encargados del tratamiento bajo contrato: gestión de contactos (CRM), agenda de reuniones y alojamiento web.",
      },
      {
        title: "Tus derechos",
        text: "Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición escribiendo a hola@cabanacreative.es e indicando el derecho que deseas ejercer. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).",
      },
      {
        title: "Cookies",
        text: "Utilizamos cookies técnicas necesarias para el funcionamiento del sitio y cookies de medición y publicidad, que solo se activan con tu consentimiento desde el panel de configuración.",
      },
    ],
  },
  data: {
    title: "Protección de datos",
    updated: "Información básica sobre el tratamiento de tus datos",
    blocks: [
      {
        title: "Quién trata tus datos",
        text: "Cabaña Creative, con sitio web cabanacreative.es y correo de contacto hola@cabanacreative.es, es el responsable del tratamiento de los datos que facilitas en este formulario de admisión.",
      },
      {
        title: "Qué datos tratamos",
        text: "Los datos de contacto que escribes (nombre, correo electrónico y teléfono), tu país de residencia y la información que compartes sobre tu proyecto musical: etapa, géneros, enlace a tu música, tipo de lanzamiento, presupuesto y disponibilidad.",
      },
      {
        title: "Para qué y con qué legitimación",
        text: "Los usamos únicamente para valorar tu candidatura al programa, contactarte y, si el proyecto encaja, agendar la sesión de descubrimiento. La base legal es tu consentimiento y la aplicación de medidas precontractuales a tu petición.",
      },
      {
        title: "Cuánto tiempo",
        text: "Durante la tramitación de tu solicitud y, después, durante los plazos legales de prescripción. Si no avanzamos, conservamos el registro el tiempo mínimo necesario para atender posibles responsabilidades.",
      },
      {
        title: "Con quién los compartimos",
        text: "Solo con los proveedores tecnológicos que nos permiten gestionar las solicitudes y la agenda (CRM, agenda de reuniones y alojamiento web), que actúan como encargados del tratamiento bajo contrato. Cuando alguno opera fuera del Espacio Económico Europeo, aplicamos cláusulas contractuales tipo aprobadas por la Comisión Europea.",
      },
      {
        title: "Seguridad",
        text: "Aplicamos cifrado de las comunicaciones mediante HTTPS, control de acceso por roles, copias de seguridad periódicas y revisión continua de la infraestructura.",
      },
      {
        title: "Cómo ejercer tus derechos",
        text: "Escribe a hola@cabanacreative.es indicando el derecho que quieres ejercer (acceso, rectificación, supresión, limitación, portabilidad u oposición) y adjuntando un documento que acredite tu identidad. Responderemos en el plazo máximo de un mes. También puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).",
      },
    ],
  },
};