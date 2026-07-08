export type ChangeType = "MAJOR" | "MINOR";

export type ChangelogEntry = {
  /** Fecha de la versión en formato dia.mes.año(2 cifras) */
  date: string;
  major: number;
  minor: number;
  type: ChangeType;
  title: string;
  description: string;
  /** Cambio interno/confidencial: version con sufijo ".c" y etiqueta en rojo. */
  confidential?: boolean;
  /**
   * Arreglo de un bug de la version anterior (no de una version nueva): no sube
   * el numero de version, se queda en la misma pero con sufijo ".b", etiqueta en
   * amarillo y el emoji de bug al final.
   */
  bugfix?: boolean;
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
  {
    date: "05.07.26",
    major: 8,
    minor: 0,
    type: "MAJOR",
    title: "Página de precios",
    description:
      "El enlace \"Precios\" ya lleva a una página con los tres planes: Básico (gratis, con publicidad, hasta 20 suscripciones), Premium (sin publicidad, ilimitadas) y Premium Lite (con publicidad, ilimitadas). El cambio de plan todavía no está abierto a todo el mundo — avisaremos cuando el sistema de pagos esté listo.",
  },
  {
    date: "05.07.26",
    major: 8,
    minor: 1,
    type: "MINOR",
    title: "Pago con código de acceso",
    description:
      "En la página de Precios, mientras no hay pasarela de pago real, Premium y Premium Lite se pueden desbloquear con un código de acceso.",
  },
  {
    date: "05.07.26",
    major: 8,
    minor: 2,
    type: "MINOR",
    title: "Precios reales y página de pago",
    description:
      "Premium ya cuesta 10 €/año (1 €/mes) y Premium Lite 5 €/año (0,5 €/mes). Al suscribirte se abre una página de pago con los métodos disponibles — de momento el único activo es el código de acceso, el resto aparecen como \"Próximamente\".",
  },
  {
    date: "05.07.26",
    major: 9,
    minor: 0,
    type: "MAJOR",
    title: "Quitamos la publicidad",
    description:
      "Hemos eliminado todo lo relacionado con anuncios (incluida la integración con Google AdSense que estábamos preparando): nos parecía poco ético y queremos una web limpia. Premium Lite pasa a diferenciarse por un límite de 50 suscripciones en vez de por los anuncios. La landing también muestra ahora cuánta gente ya se ha registrado.",
  },
  {
    date: "05.07.26",
    major: 9,
    minor: 1,
    type: "MINOR",
    title: "Contador más animado",
    description:
      "El contador de \"Ya somos X personas\" ahora es tan grande como un titular, y sus letras bailan solas todo el rato, lentito.",
  },
  {
    date: "05.07.26",
    major: 9,
    minor: 2,
    type: "MINOR",
    title: "Ajustes finos del contador",
    description:
      "El número del contador se queda en azul y el resto del texto en negro. Además, ahora hay el mismo espacio debajo del contador que el que hay justo encima, respecto a los botones de la cabecera.",
  },
  {
    date: "05.07.26",
    major: 10,
    minor: 0,
    type: "MAJOR",
    title: "Mi cuenta",
    description:
      "Nueva página \"Mi cuenta\" para subir una foto de perfil, cambiar tu nombre, tu email y tu contraseña, y eliminar la cuenta (pide tu contraseña, y el cuadro no aparece hasta pulsar el botón rojo de eliminar).",
  },
  {
    date: "06.07.26",
    major: 10,
    minor: 1,
    type: "MINOR",
    title: "Textos más claros en \"Cómo funciona\"",
    description:
      "Ahora se explica que puedes poner la fecha de cobro que quieras y te avisaremos para comprarlo, y que te avisaremos cuando tengas que cancelar una suscripción.",
  },
  {
    date: "06.07.26",
    major: 10,
    minor: 2,
    type: "MINOR",
    title: "\"Únete tú\" ya lleva al registro",
    description:
      "En el contador de \"Ya somos X personas\", el \"únete tú\" ahora es un enlace directo a crear cuenta, sin cambiar de aspecto.",
  },
  {
    date: "06.07.26",
    major: 10,
    minor: 3,
    type: "MINOR",
    title: "Mejoras internas",
    description: "Ajustes para mejorar la experiencia de usuario.",
    confidential: true,
  },
  {
    date: "06.07.26",
    major: 10,
    minor: 4,
    type: "MINOR",
    title: "Nueva etiqueta \"c\" en el historial",
    description:
      "Cuando una versión lleva una \"c\" y su etiqueta se ve en rojo, es un cambio confidencial por seguridad de la web — no se detalla en qué consiste.",
  },
  {
    date: "06.07.26",
    major: 10,
    minor: 5,
    type: "MINOR",
    title: "Precios de Premium Lite actualizados",
    description:
      "Hemos revisado los precios de los planes de pago para que tengan más sentido dentro de la web y reflejen mejor lo que te ofrece cada uno. Premium Lite pasa de 5 €/año a 8 €/año (0,7 €/mes) — con la diferencia de solo 2 €/año respecto a Premium (10 €/año, 1 €/mes), queda mucho más claro que por muy poco más te llevas las suscripciones ilimitadas sin ningún límite, así que la mayoría sale ganando dando el salto. Premium no cambia de precio. Como siempre, Básico sigue siendo gratis para todo el mundo.",
  },
  {
    date: "06.07.26",
    major: 10,
    minor: 6,
    type: "MINOR",
    title: "Plan Enterprise",
    description:
      "Nuevo plan Enterprise en la página de Precios, separado del resto: pensado para dar Premium o Premium Lite a tu equipo (20 €/año base sobre Premium o 18 €/año sobre Premium Lite, más 5 €/año o 4 €/año por cada cuenta de empleado). Todavía no se puede comprar desde la web ni contactar para activarlo — eso llega pronto.",
  },
  {
    date: "06.07.26",
    major: 10,
    minor: 7,
    type: "MINOR",
    title: "Límites de suscripciones ajustados",
    description:
      "El plan Básico pasa a un máximo de 3 suscripciones a la vez, y Premium Lite a un máximo de 7. Premium sigue sin ningún límite.",
  },
  {
    date: "06.07.26",
    major: 10,
    minor: 8,
    type: "MINOR",
    title: "Precios anual y mensual, uno al lado del otro",
    description:
      "En Precios ya puedes cambiar entre pago mensual y anual con un interruptor arriba de los planes (anual viene marcado por defecto). El anual muestra a cuánto equivale al mes y cuánto te ahorras frente a pagar mes a mes.",
  },
  {
    date: "06.07.26",
    major: 11,
    minor: 0,
    type: "MAJOR",
    title: "Mejora de diseño al dashboard",
    description:
      "El panel se reorganiza: tus suscripciones ahora se agrupan en Activas, Pendientes y Canceladas, con su recuento. Nuevas gráficas de gasto mensual (barras o línea) y de gasto por categoría (barra o tarta), que se cambian con un clic en el título. Las tarjetas quedan más limpias, sin etiquetas repetidas.",
  },
  {
    date: "07.07.26",
    major: 12,
    minor: 0,
    type: "MAJOR",
    title: "Nuevo diseño de registro e inicio de sesión, con Google y Apple",
    description:
      "La página de crear cuenta estrena un diseño a dos columnas con vista previa de suscripciones, y la de iniciar sesión una tarjeta centrada con la opción de mantener la sesión iniciada. Además, ya puedes registrarte o entrar con Google o con Apple (el de Apple se activará en cuanto tengamos las claves).",
  },
  {
    date: "07.07.26",
    major: 12,
    minor: 1,
    type: "MINOR",
    title: "Mejoras internas",
    description: "Ajustes para mejorar la experiencia de usuario.",
    confidential: true,
  },
  {
    date: "07.07.26",
    major: 12,
    minor: 2,
    type: "MINOR",
    title: "Arreglo en la gráfica de gasto mensual",
    description:
      "Al eliminar una suscripción, el gasto de los meses en los que sí estuvo activa ya no desaparecía de la gráfica de \"Gasto mensual\" — ahora ese histórico se mantiene correcto, tanto al eliminar como al cancelar.",
  },
  {
    date: "07.07.26",
    major: 13,
    minor: 0,
    type: "MAJOR",
    title: "Verificación por email y recuperación de contraseña",
    description:
      "Al añadir una suscripción te enviamos un email de confirmación con un código: reenvíalo a verifica@nicotech.es y tu suscripción quedará marcada como verificada en el panel. Además, \"¿La olvidaste?\" en el inicio de sesión ya funciona de verdad: te llega un enlace por email para restablecer tu contraseña.",
  },
  {
    date: "07.07.26",
    major: 13,
    minor: 1,
    type: "MINOR",
    title: "Verificación más rápida",
    description: "El correo reenviado a verifica@nicotech.es se revisa ahora cada 15 segundos en vez de cada 5 minutos.",
  },
  {
    date: "07.07.26",
    major: 13,
    minor: 1,
    type: "MINOR",
    title: "Arreglo en la revisión del correo de verificación",
    description:
      "La revisión periódica del buzón de verificación no se estaba ejecutando correctamente por una incompatibilidad interna — ya funciona.",
    bugfix: true,
  },
  {
    date: "08.07.26",
    major: 13,
    minor: 2,
    type: "MINOR",
    title: "Mejoras internas",
    description: "Ajustes para mejorar la experiencia de usuario.",
    confidential: true,
  },
  {
    date: "08.07.26",
    major: 14,
    minor: 0,
    type: "MAJOR",
    title: "Modo oscuro",
    description:
      "Nicotech ahora tiene modo oscuro. Por defecto sigue el ajuste de tu dispositivo (también en la landing sin haber iniciado sesión); para forzarlo, ve a Mi cuenta → Apariencia y elige Claro u Oscuro con los iconos de sol y luna.",
  },
  {
    date: "08.07.26",
    major: 14,
    minor: 1,
    type: "MINOR",
    title: "Página de contacto",
    description:
      "Nueva página de contacto (enlazada desde el pie de la landing y desde el menú), y el botón \"Contactar\" del plan Enterprise ya funciona.",
  },
];

export function formatVersion(entry: ChangelogEntry): string {
  const suffix = entry.confidential ? ".c" : entry.bugfix ? ".b" : "";
  return `${entry.date}.${entry.major}.${entry.minor}${suffix}`;
}

export const CURRENT_VERSION = CHANGELOG[CHANGELOG.length - 1];
