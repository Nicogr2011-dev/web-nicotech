import { useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PhoneIcon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { createPeerConnection, endCall, forwardLocalIce, monitorCallStatus, pollRemoteIce } from "@/lib/webrtcCall";
import type { CallRole } from "@/lib/webrtcCall";

type Phase = "listening" | "ringing" | "answering" | "in-call" | "ended";

function playRingtone(): () => void {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioContextClass();
  let stopped = false;

  function beep() {
    if (stopped) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    window.setTimeout(beep, 1600);
  }
  beep();

  return () => {
    stopped = true;
    ctx.close();
  };
}

export default function CallsPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("listening");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingCallRef = useRef<{ id: number; offerSdp: string } | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const roleRef = useRef<CallRole | null>(null);
  const stopIcePollRef = useRef<(() => void) | null>(null);
  const stopStatusPollRef = useRef<(() => void) | null>(null);
  const stopRingtoneRef = useRef<(() => void) | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const phaseRef = useRef<Phase>("listening");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    let stopped = false;

    async function pollPending() {
      if (stopped) return;
      if (phaseRef.current === "listening") {
        try {
          const data = await apiGet<{ call: { id: number; offerSdp: string; createdAt: string } | null }>(
            "/calls/pending.php"
          );
          if (data.call && phaseRef.current === "listening") {
            pendingCallRef.current = { id: data.call.id, offerSdp: data.call.offerSdp };
            stopRingtoneRef.current = playRingtone();
            setPhase("ringing");
          }
        } catch {
          // Se reintenta en el siguiente ciclo.
        }
      }
      if (!stopped) window.setTimeout(pollPending, 2500);
    }
    pollPending();

    return () => {
      stopped = true;
    };
  }, []);

  useEffect(() => cleanup, []);

  function cleanup() {
    stopRingtoneRef.current?.();
    stopRingtoneRef.current = null;
    stopIcePollRef.current?.();
    stopIcePollRef.current = null;
    stopStatusPollRef.current?.();
    stopStatusPollRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    roleRef.current = null;
  }

  function backToListening() {
    cleanup();
    pendingCallRef.current = null;
    setPhase("listening");
  }

  async function handleAccept() {
    const pending = pendingCallRef.current;
    if (!pending) return;
    stopRingtoneRef.current?.();
    stopRingtoneRef.current = null;
    setError(null);
    setPhase("answering");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const pc = createPeerConnection();
      pcRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pc.ontrack = (event) => {
        if (!audioRef.current) return;
        audioRef.current.srcObject = event.streams[0];
        audioRef.current.play().catch(() => {});
      };
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
          setError("Se perdió la conexión de audio — puede ser cosa de la red.");
          if (roleRef.current) endCall(roleRef.current);
          backToListening();
        }
      };

      await pc.setRemoteDescription({ type: "offer", sdp: pending.offerSdp });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await apiPost("/calls/answer.php", { callId: pending.id, answerSdp: answer.sdp });

      const role: CallRole = { callId: pending.id };
      roleRef.current = role;
      forwardLocalIce(pc, role);
      stopIcePollRef.current = pollRemoteIce(pc, role);
      stopStatusPollRef.current = monitorCallStatus(role, (status) => {
        if (status === "ended") backToListening();
      });

      setPhase("in-call");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo contestar la llamada.");
      if (pending) endCall({ callId: pending.id });
      backToListening();
    }
  }

  function handleReject() {
    const pending = pendingCallRef.current;
    if (pending) endCall({ callId: pending.id });
    backToListening();
  }

  function handleHangup() {
    if (roleRef.current) endCall(roleRef.current);
    backToListening();
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
      <SiteNav authed userName={user?.name ?? user?.email} tier={user?.tier} avatarUrl={user?.avatarUrl} />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-body">Llamadas</h1>
        <p className="mt-3 text-muted">Aquí contestas a quien te llame desde /contacto.</p>

        <Card className="mt-8 w-full p-6">
          <audio ref={audioRef} autoPlay className="hidden" />

          {phase === "listening" ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-azure/10">
                <PhoneIcon size={24} color="#3a86ff" />
              </div>
              <p className="text-sm text-muted">Esperando llamadas… deja esta pestaña abierta o espera el aviso push.</p>
            </div>
          ) : null}

          {phase === "ringing" ? (
            <div className="space-y-3 py-4">
              <p className="font-display text-lg font-bold text-body">📞 Llamada entrante</p>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAccept}>
                  Contestar
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleReject}>
                  Rechazar
                </Button>
              </div>
            </div>
          ) : null}

          {phase === "answering" ? (
            <p className="py-4 text-sm text-muted">Conectando…</p>
          ) : null}

          {phase === "in-call" ? (
            <div className="space-y-3 py-4">
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

          {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
        </Card>
      </main>
    </div>
  );
}
