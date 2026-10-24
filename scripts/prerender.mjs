// Prerender de la portada: tras `vite build`, abre la web compilada en un Chromium
// sin ventana, captura la landing ya pintada y la mete dentro de <div id="root"> en
// dist/index.html. Así los buscadores (y las vistas previas de redes sociales) ven
// el contenido sin ejecutar JavaScript. React la sustituye al cargar (createRoot,
// no hydrate), así que para el usuario no cambia nada.
//
// Necesita Chromium de Playwright: si falta, `npx playwright install chromium`.
import { readFileSync, writeFileSync } from "node:fs";
import { preview } from "vite";
import { chromium } from "playwright";

const INDEX = "dist/index.html";
const ROOT_TAG = '<div id="root"></div>';

const html = readFileSync(INDEX, "utf8");
if (!html.includes(ROOT_TAG)) {
  throw new Error(`prerender: no encuentro ${ROOT_TAG} en ${INDEX}`);
}

const server = await preview({ preview: { port: 4179, strictPort: true }, logLevel: "error" });
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: "es-ES" });
  // Visitante anónimo y sin banner de cookies: ni sesión ni datos de la API en el HTML.
  await page.addInitScript(() => localStorage.setItem("nicotech_cookie_consent", "accepted"));
  await page.route("**/api/**", (route) => route.abort());

  await page.goto(server.resolvedUrls.local[0], { waitUntil: "networkidle" });
  await page.waitForSelector("main h1");

  const markup = await page.evaluate(() => {
    // Las secciones con <Reveal> empiezan con opacity 0 hasta hacer scroll: en el HTML
    // estático tienen que salir visibles o su texto contaría como oculto.
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
    return document.getElementById("root").innerHTML;
  });
  if (!markup.includes("<h1")) throw new Error("prerender: la portada no tiene <h1>");

  writeFileSync(
    INDEX,
    html.replace(ROOT_TAG, `<div id="root"><div data-prerender style="display: contents">${markup}</div></div>`)
  );
  console.log(`prerender: portada incrustada en ${INDEX} (${Math.round(markup.length / 1024)} KB)`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
