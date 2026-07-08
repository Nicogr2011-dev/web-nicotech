import { useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PhoneIcon, MailIcon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/AuthContext";
import { apiPost } from "@/lib/api";
import { createPeerConnection, endCall, forwardLocalIce, monitorCallStatus, pollRemoteIce } from "@/lib/webrtcCall";
import type { CallRole } from "@/lib/webrtcCall";

type CallPhase = "idle" | "connecting" | "ringing" | "in-call" | "ended" | "error";

const RING_TIMEOUT_MS = 45000;

export default function ContactPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [callError, setCallError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const roleRef = useRef<CallRole | null>(null);
  const stopIcePollRef = useRef<(() => void) | null>(null);
  const stopStatusPollRef = useRef<(() => void) | null>(null);
  const ringTimeoutRef = useRef<number | null>(null);
  const answeredRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => cleanup, []);

  function cleanup() {
    stopIcePollRef.current?.();
    stopIcePollRef.current = null;
    stopStatusPollRef.current?.();
    stopStatusPollRef.current = null;
    if (ringTimeoutRef.current) window.clearTimeout(ringTimeoutRef.current);
    ringTimeoutRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    roleRef.current = null;
    answeredRef.current = false;
  }

  async function handleCall() {
    setCallError(null);
    setPhase("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const pc = createPeerConnection();
      pcRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pc.ontrack = (event) => {
        if (audioRef.current) audioRef.current.srcObject = event.streams[0];
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const { callId, callToken } = await apiPost<{ callId: number; callToken: string }>("/calls/start.php", {
        offerSdp: offer.sdp,
      });
      const role: CallRole = { callId, callToken };
      roleRef.current = role;

      forwardLocalIce(pc, role);
      stopIcePollRef.current = pollRemoteIce(pc, role);
      setPhase("ringing");

      ringTimeoutRef.current = window.setTimeout(() => {
        if (!answeredRef.current) {
          setCallError("No hemos podido contactarte a tiempo — prueba a escribirnos por email.");
          if (roleRef.current) endCall(roleRef.current);
          cleanup();
          setPhase("ended");
        }
      }, RING_TIMEOUT_MS);

      stopStatusPollRef.current = monitorCallStatus(role, async (status, answerSdp) => {
        if (status === "answered" && !answeredRef.current && answerSdp) {
          answeredRef.current = true;
          if (ringTimeoutRef.current) window.clearTimeout(ringTimeoutRef.current);
          await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
          setPhase("in-call");
        } else if (status === "ended") {
          cleanup();
          setPhase("ended");
        }
      });
    } catch (err) {
      cleanup();
      setPhase("error");
      setCallError(err instanceof Error ? err.message : "No se pudo iniciar la llamada.");
    }
  }

  function handleHangup() {
    if (roleRef.current) endCall(roleRef.current);
    cleanup();
    setPhase("ended");
  }

  function toggleMute() {
    const stream = streamRef.current;
    if (!stream) return;
    const next = !muted;
    stream.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
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

          <audio ref={audioRef} autoPlay className="hidden" />

          {phase === "idle" || phase === "error" ? (
            <Button className="mt-4 w-full" onClick={handleCall}>
              Llamar
            </Button>
          ) : null}
          {phase === "connecting" ? (
            <Button className="mt-4 w-full" disabled>
              Conectando…
            </Button>
          ) : null}
          {phase === "ringing" ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-azure">Llamando… puede tardar unos segundos en contestar.</p>
              <Button variant="secondary" className="w-full" onClick={handleHangup}>
                Cancelar
              </Button>
            </div>
          ) : null}
          {phase === "in-call" ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-mint">En llamada</p>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={toggleMute}>
                  {muted ? "Activar micro" : "Silenciar"}
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleHangup}>
                  Colgar
                </Button>
              </div>
            </div>
          ) : null}
          {phase === "ended" ? (
            <Button className="mt-4 w-full" onClick={handleCall}>
              Volver a llamar
            </Button>
          ) : null}

          {callError ? <p className="mt-3 text-sm text-coral">{callError}</p> : null}
          <p className="mt-2 text-xs text-muted">
            La llamada es de audio, directa por el navegador — no necesitas dar ni recibir ningún número.
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
