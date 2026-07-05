import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DownloadIcon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/AuthContext";
import { usePwaInstall, detectDevice } from "@/lib/usePwaInstall";

const instructionsByDevice = {
  ios: {
    title: "En iPhone / iPad (Safari)",
    steps: [
      "Abre nicotech.es en Safari (tiene que ser Safari, no Chrome).",
      'Pulsa el icono de "Compartir" (el cuadrado con la flecha hacia arriba).',
      'Baja y pulsa "Añadir a pantalla de inicio".',
      "Confirma con \"Añadir\" — te aparecerá el icono de Nicotech como una app más.",
    ],
  },
  android: {
    title: "En Android (Chrome)",
    steps: [
      "Si no ves el botón de instalar arriba, abre el menú ⋮ de Chrome (arriba a la derecha).",
      'Pulsa "Instalar app" o "Añadir a pantalla de inicio".',
      "Confirma — Nicotech se abrirá como una app independiente, sin barra de navegador.",
    ],
  },
  "desktop-chrome": {
    title: "En el ordenador (Chrome / Edge)",
    steps: [
      "Busca el icono de instalar en la barra de direcciones (a la derecha, cerca de la estrella de favoritos).",
      'Si no lo ves, abre el menú del navegador y busca "Instalar Nicotech" o "Aplicaciones".',
    ],
  },
  "desktop-safari": {
    title: "En Safari de Mac",
    steps: ['Ve al menú "Archivo" → "Añadir al Dock" para tener Nicotech como una app independiente.'],
  },
  "desktop-other": {
    title: "En tu navegador",
    steps: [
      "Tu navegador puede no soportar instalar aplicaciones web todavía.",
      "Prueba con Chrome, Edge o (en iPhone) Safari para poder instalar Nicotech.",
    ],
  },
} as const;

export default function InstallAppPage() {
  const { user } = useAuth();
  const { canInstall, isInstalled, promptInstall } = usePwaInstall();
  const device = detectDevice();
  const info = instructionsByDevice[device];

  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <SiteNav authed={Boolean(user)} userName={user?.name ?? user?.email} tier={user?.tier} />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-16 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-azure/10">
          <DownloadIcon size={28} color="#3a86ff" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold text-ink">¡Descárgalo!</h1>
        <p className="mt-3 max-w-md text-slate">
          No hace falta instalar nada para usar Nicotech — funciona igual desde el navegador. Pero si quieres, puedes
          instalarlo como una app: se abre más rápido, sin barra de direcciones, y tienes su icono a mano en el móvil
          o el escritorio.
        </p>

        <Card className="mt-8 w-full p-8">
          {isInstalled ? (
            <p className="font-semibold text-mint">Ya tienes Nicotech instalada en este dispositivo. 🎉</p>
          ) : canInstall ? (
            <>
              <Button onClick={promptInstall} className="mx-auto">
                <DownloadIcon size={16} color="#fff" />
                Instalar Nicotech
              </Button>
              <p className="mt-4 text-sm text-slate">Un clic y ya la tienes en tu dispositivo.</p>
            </>
          ) : (
            <div className="text-left">
              <p className="mb-4 text-center text-sm text-slate">
                Tu navegador no nos deja mostrar aquí el botón de instalación directa, pero puedes hacerlo a mano:
              </p>
              <h2 className="font-display font-bold text-ink">{info.title}</h2>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate">
                {info.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
