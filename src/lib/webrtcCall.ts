import { apiGet, apiPost } from "@/lib/api";

// STUN solo no basta cuando las dos redes son restrictivas (NAT de operador móvil,
// redes corporativas, doble NAT...) — con eso, ICE se queda parado en "new" y nunca
// llega a conectar. Añadimos de respaldo el TURN gratuito de Open Relay Project
// (relay real de los paquetes de audio cuando la conexión directa no es posible).
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.relay.metered.ca:80" },
  { urls: "turn:global.relay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:global.relay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
  {
    urls: "turn:global.relay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

export type CallRole = { callId: number; callToken?: string };

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: ICE_SERVERS });
}

export type CallDebugTracker = {
  candidateTypes: Set<string>;
  lastError: string | null;
};

/**
 * Engancha listeners de solo-diagnóstico (no de negocio) para saber, sin acceso al
 * dispositivo real, qué tipo de candidatos ICE se llegan a reunir (host/srflx/relay —
 * "relay" confirma que el TURN responde) y si el navegador reporta un fallo concreto
 * al intentar conectar con alguno de los servidores STUN/TURN configurados.
 */
export function attachDebugTracking(pc: RTCPeerConnection): CallDebugTracker {
  const tracker: CallDebugTracker = { candidateTypes: new Set(), lastError: null };

  pc.addEventListener("icecandidate", (event) => {
    if (event.candidate?.type) tracker.candidateTypes.add(event.candidate.type);
  });

  pc.addEventListener("icecandidateerror", (event) => {
    const e = event as RTCPeerConnectionIceErrorEvent;
    tracker.lastError = `${e.url ?? "?"} (${e.errorCode ?? "?"}) ${e.errorText ?? ""}`.trim();
  });

  return tracker;
}

/**
 * Manda cada candidato ICE local al backend en cuanto el navegador lo descubre.
 *
 * El descubrimiento de candidatos empieza en cuanto se llama a setLocalDescription
 * (justo tras createOffer/createAnswer) — antes de saber el callId/callToken, porque
 * eso llega después de un viaje de ida y vuelta al servidor (start.php/answer.php).
 * Por eso hay que enganchar `onicecandidate` nada más crear la conexión, y guardar
 * en un buffer los candidatos que salgan antes de que `attachRole` les dé destino —
 * si no, esos candidatos (a veces todos) se pierden en silencio y la llamada nunca
 * llega a conectar el audio, aunque la señalización SDP parezca haber ido bien.
 */
export function createIceForwarder(pc: RTCPeerConnection): { attachRole: (role: CallRole) => void } {
  const buffered: RTCIceCandidate[] = [];
  let role: CallRole | null = null;

  function send(candidate: RTCIceCandidate) {
    if (!role) {
      buffered.push(candidate);
      return;
    }
    apiPost("/calls/ice.php", {
      callId: role.callId,
      callToken: role.callToken,
      candidate: JSON.stringify(candidate.toJSON()),
    }).catch(() => {});
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) send(event.candidate);
  };

  return {
    attachRole(r: CallRole) {
      role = r;
      buffered.splice(0).forEach(send);
    },
  };
}

/** Sondea los candidatos ICE que ha mandado el otro lado y los añade a la conexión. */
export function pollRemoteIce(pc: RTCPeerConnection, role: CallRole): () => void {
  let sinceId = 0;
  let stopped = false;

  async function poll() {
    if (stopped) return;
    try {
      const params = new URLSearchParams({
        callId: String(role.callId),
        sinceId: String(sinceId),
        ...(role.callToken ? { callToken: role.callToken } : {}),
      });
      const data = await apiGet<{ candidates: { id: number; candidate: string }[] }>(
        `/calls/ice.php?${params.toString()}`
      );
      for (const c of data.candidates) {
        sinceId = Math.max(sinceId, c.id);
        try {
          await pc.addIceCandidate(JSON.parse(c.candidate));
        } catch {
          // Candidato que ya no aplica (llamada colgada entretanto) — se ignora.
        }
      }
    } catch {
      // Fallo puntual de red: se reintenta en el siguiente ciclo.
    }
    if (!stopped) setTimeout(poll, 1500);
  }
  poll();

  return () => {
    stopped = true;
  };
}

/** Sondea el estado de la llamada (contestada / colgada) mientras dure. */
export function monitorCallStatus(
  role: CallRole,
  onStatus: (status: string, answerSdp: string | null) => void,
  intervalMs = 2000
): () => void {
  let stopped = false;

  async function poll() {
    if (stopped) return;
    try {
      const params = new URLSearchParams({
        callId: String(role.callId),
        ...(role.callToken ? { callToken: role.callToken } : {}),
      });
      const data = await apiGet<{ status: string; answerSdp: string | null }>(`/calls/status.php?${params.toString()}`);
      if (!stopped) onStatus(data.status, data.answerSdp);
    } catch {
      // Fallo puntual de red: se reintenta en el siguiente ciclo.
    }
    if (!stopped) setTimeout(poll, intervalMs);
  }
  poll();

  return () => {
    stopped = true;
  };
}

export function endCall(role: CallRole): void {
  apiPost("/calls/end.php", { callId: role.callId, callToken: role.callToken }).catch(() => {});
}

/** Resumen legible del estado de la conexión y el audio, para diagnosticar "no se oye nada" sin acceso al dispositivo. */
export function describeCallDebugState(
  pc: RTCPeerConnection | null,
  audio: HTMLAudioElement | null,
  tracker?: CallDebugTracker | null
): string {
  if (!pc) return "sin conexión";
  const stream = audio?.srcObject instanceof MediaStream ? audio.srcObject : null;
  const track = stream?.getAudioTracks()[0] ?? null;
  return [
    `ICE: ${pc.iceConnectionState}`,
    `conexión: ${pc.connectionState}`,
    `recolección: ${pc.iceGatheringState}`,
    `candidatos: ${tracker && tracker.candidateTypes.size ? [...tracker.candidateTypes].join(",") : "ninguno"}`,
    `pistas remotas: ${stream ? stream.getAudioTracks().length : 0}`,
    track ? `pista: ${track.readyState}/${track.muted ? "muted" : "activa"}` : "pista: ninguna",
    `audio.paused: ${audio ? audio.paused : "?"}`,
    `audio.muted: ${audio ? audio.muted : "?"}`,
    `volumen: ${audio ? audio.volume : "?"}`,
    `error ICE: ${tracker?.lastError ?? "ninguno"}`,
  ].join(" · ");
}
