// Real-time chat bus using BroadcastChannel (cross-tab/window same browser)
// + localStorage persistence so messages survive reloads.

export interface ChatMessage {
  id: string;
  sender: string;
  role: "kasir" | "admin" | "supervisor";
  text: string;
  time: string;
  ts: number;
  self?: boolean;
}

const CHANNEL = "retailpro-livechat";
const STORAGE_KEY = "retailpro-livechat-history";
const MAX_HISTORY = 200;

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (typeof window === "undefined") return null;
  if (!channel && "BroadcastChannel" in window) {
    channel = new BroadcastChannel(CHANNEL);
  }
  return channel;
}

export function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function saveHistory(msgs: ChatMessage[]) {
  try {
    const trimmed = msgs.slice(-MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function publishMessage(msg: ChatMessage) {
  const history = loadHistory();
  // dedupe by id
  if (!history.some((m) => m.id === msg.id)) {
    history.push(msg);
    saveHistory(history);
  }
  const ch = getChannel();
  ch?.postMessage(msg);
}

export function subscribe(handler: (msg: ChatMessage) => void): () => void {
  const ch = getChannel();
  if (!ch) return () => {};
  const fn = (e: MessageEvent) => handler(e.data as ChatMessage);
  ch.addEventListener("message", fn);
  // also listen to storage events as fallback for other browser contexts
  const storageFn = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const arr = JSON.parse(e.newValue) as ChatMessage[];
        const last = arr[arr.length - 1];
        if (last) handler(last);
      } catch {}
    }
  };
  window.addEventListener("storage", storageFn);
  return () => {
    ch.removeEventListener("message", fn);
    window.removeEventListener("storage", storageFn);
  };
}
