import { useState } from "react";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PhoneIcon, MailIcon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/AuthContext";
import { apiPost } from "@/lib/api";

export default function ContactPage() {
  const { user } = useAuth();
  const [calling, setCalling] = useState(false);
  const [called, setCalled] = useState(false);

  async function handleCall() {
    setCalling(true);
    await apiPost("/push/call.php").catch(() => {});
    setCalling(false);
    setCalled(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteNav authed={Boolean(user)} userName={user?.name ?? user?.email} tier={user?.tier} avatarUrl={user?.avatarUrl} />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-body">Contacta con Nicotech</h1>
        <p className="mt-3 text-muted">
          ¿Dudas, un plan Enterprise o algo que arreglar? Elige cómo prefieres hablar con nosotros.
        </p>

        <Card className="mt-8 w-full p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-azure/10">
              <PhoneIcon size={20} color="#3a86ff" />
            </div>
            <div className="text-left">
              <h2 className="font-display font-bold text-body">Llamar desde la web</h2>
              <p className="text-sm text-muted">Sin dar tu número ni el nuestro, directo desde el navegador.</p>
            </div>
          </div>
          {called ? (
            <p className="mt-4 text-sm font-semibold text-mint">
              Aviso enviado — te contactaremos en cuanto lo veamos.
            </p>
          ) : (
            <Button className="mt-4 w-full" disabled={calling} onClick={handleCall}>
              {calling ? "Avisando…" : "Llamar"}
            </Button>
          )}
          <p className="mt-2 text-xs text-muted">
            De momento esto solo nos avisa — la llamada de verdad por la web llegará más adelante.
          </p>
        </Card>

        <Card className="mt-4 w-full p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint/10">
              <MailIcon size={20} color="#2ec4b6" />
            </div>
            <div className="text-left">
              <h2 className="font-display font-bold text-body">Escríbenos</h2>
              <p className="text-sm text-muted">Te contestamos en cuanto podamos.</p>
            </div>
          </div>
          <a href="mailto:hola@nicotech.es" className="mt-4 block">
            <Button variant="secondary" className="w-full">
              hola@nicotech.es
            </Button>
          </a>
        </Card>
      </main>
    </div>
  );
}
