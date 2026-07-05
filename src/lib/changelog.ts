export type ChangeType = "MAJOR" | "MINOR";

export type ChangelogEntry = {
  /** Fecha de la versión en formato dia.mes.año(2 cifras) */
  date: string;
  major: number;
  minor: number;
  type: ChangeType;
  title: string;
  description: string;
};

/**
 * Formato de versión: dia.mes.año.MAJOR.MINOR
 * MAJOR sube al añadir funciones/componentes nuevos; MINOR sube con
 * cambios menores (estética, ajustes) y se reinicia a 0 en cada MAJOR.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "04.07.26",
    major: 0,
    minor: 0,
    type: "MAJOR",
    title: "Primera versión pública",
    description: "Landing explicando el objetivo de Nicotech: organizar tus suscripciones en un solo lugar.",
  },
  {
    date: "04.07.26",
    major: 1,
    minor: 0,
    type: "MAJOR",
    title: "Área de cliente",
    description: "Registro, inicio de sesión y gestión completa de tus suscripciones (añadir, editar, cancelar, borrar).",
  },
  {
    date: "04.07.26",
    major: 2,
    minor: 0,
    type: "MAJOR",
    title: "Buscador de servicios",
    description:
      "Catálogo de más de 170 servicios con precios reales de referencia. Fecha de cobro unificada y cancelación en una fecha concreta (en vez de \"tras N meses\").",
  },
  {
    date: "04.07.26",
    major: 3,
    minor: 0,
    type: "MAJOR",
    title: "Cambios internos de servidor",
    description:
      "Preparado para funcionar en cualquier hosting, sin necesitar Node.js. No notarás nada distinto, pero ahora es más barato y sencillo de mantener.",
  },
  {
    date: "04.07.26",
    major: 3,
    minor: 1,
    type: "MINOR",
    title: "Ajuste de precisión",
    description: "Los precios se redondean correctamente a 2 decimales.",
  },
  {
    date: "05.07.26",
    major: 4,
    minor: 0,
    type: "MAJOR",
    title: "Botón \"Comprar\"",
    description:
      "Elige el servicio y el plan, complétalo en una ventana emergente, y la suscripción se añade sola a tu lista al terminar.",
  },
  {
    date: "05.07.26",
    major: 4,
    minor: 1,
    type: "MINOR",
    title: "Estado \"Pendiente\"",
    description: "Las suscripciones con fecha de cobro futura se marcan como \"Pendiente\", con aviso un día antes.",
  },
  {
    date: "05.07.26",
    major: 5,
    minor: 0,
    type: "MAJOR",
    title: "Rediseño visual completo",
    description: "Nuevo diseño de la landing, el panel y el acceso: animaciones, iconos propios y más pulido en todos los detalles.",
  },
  {
    date: "05.07.26",
    major: 5,
    minor: 1,
    type: "MINOR",
    title: "Verificación de seguridad",
    description: "reCAPTCHA v3 al iniciar sesión y registrarte, para frenar bots.",
  },
  {
    date: "05.07.26",
    major: 6,
    minor: 0,
    type: "MAJOR",
    title: "Niveles de cuenta",
    description:
      "Cuentas Básico y Premium, hueco reservado para publicidad (las cuentas Premium no la ven) y aviso de cookies.",
  },
  {
    date: "05.07.26",
    major: 6,
    minor: 1,
    type: "MINOR",
    title: "Nuevo icono",
    description: "Favicon propio de Nicotech con los colores de la marca, en vez del genérico.",
  },
  {
    date: "05.07.26",
    major: 7,
    minor: 0,
    type: "MAJOR",
    title: "Instalable como aplicación",
    description: "Nicotech ya se puede instalar como app desde la propia web, con su icono a mano en el móvil o el escritorio.",
  },
  {
    date: "05.07.26",
    major: 7,
    minor: 1,
    type: "MINOR",
    title: "Mejor detección de instalación",
    description: "Se detecta correctamente cuándo el navegador permite instalar la app.",
  },
  {
    date: "05.07.26",
    major: 7,
    minor: 2,
    type: "MINOR",
    title: "Edición con animación de tarjeta",
    description: "Al pulsar \"Editar\", la propia tarjeta se expande en su sitio para mostrar el formulario, en vez de abrir una ventana aparte.",
  },
  {
    date: "05.07.26",
    major: 7,
    minor: 3,
    type: "MINOR",
    title: "Enlace a la web desde el panel",
    description: "Nuevo enlace \"Ver la web\" en la barra del área de cliente para volver a la página principal.",
  },
  {
    date: "05.07.26",
    major: 7,
    minor: 4,
    type: "MINOR",
    title: "Insignia de reCAPTCHA más discreta",
    description: "El indicador de reCAPTCHA solo se muestra en login/registro; desaparece del resto de la web una vez iniciada la sesión.",
  },
  {
    date: "05.07.26",
    major: 7,
    minor: 5,
    type: "MINOR",
    title: "Enlace \"Precios\"",
    description:
      "Nuevo enlace \"Precios\" en la barra de navegación (todavía sin destino). Se está preparando un sistema de planes de pago para el futuro — de momento Nicotech sigue siendo gratis para todo el mundo.",
  },
  {
    date: "05.07.26",
    major: 7,
    minor: 6,
    type: "MINOR",
    title: "Menú móvil",
    description:
      "En pantallas estrechas, todos los enlaces de la barra de navegación (antes ocultos) ahora se ven en un menú desplegable con el icono de las tres rayas.",
  },
];

export function formatVersion(entry: ChangelogEntry): string {
  return `${entry.date}.${entry.major}.${entry.minor}`;
}

export const CURRENT_VERSION = CHANGELOG[CHANGELOG.length - 1];
