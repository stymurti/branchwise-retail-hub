import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Users, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, loadHistory, publishMessage, subscribe } from "@/lib/chatBus";

interface LiveChatWidgetProps {
  context: "pos" | "backoffice";
  userName?: string;
  userRole?: ChatMessage["role"];
}

const seedMessages: ChatMessage[] = [
  { id: "seed-1", sender: "Admin Pusat", role: "admin", text: "Selamat pagi tim, jangan lupa cek stok promo hari ini ya.", time: "08:15", ts: 0 },
  { id: "seed-2", sender: "Kasir Jakarta", role: "kasir", text: "Siap pak, struk promo sudah aktif.", time: "08:17", ts: 1 },
  { id: "seed-3", sender: "Supervisor", role: "supervisor", text: "Cabang Bandung tolong update opname siang ini.", time: "08:20", ts: 2 },
];

export function LiveChatWidget({ context, userName, userRole }: LiveChatWidgetProps) {
  const defaultName = userName ?? (context === "pos" ? "Kasir" : "Admin");
  const defaultRole: ChatMessage["role"] = userRole ?? (context === "pos" ? "kasir" : "admin");

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const history = loadHistory();
    return history.length > 0 ? history : seedMessages;
  });
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  // Subscribe to incoming messages from other tabs/windows
  useEffect(() => {
    const unsub = subscribe((msg) => {
      // Don't echo own messages (we add them locally on send)
      if (msg.sender === defaultName && msg.role === defaultRole) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, { ...msg, self: false }];
      });
      if (!openRef.current) setUnread((u) => u + 1);
    });
    return unsub;
  }, [defaultName, defaultRole]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: defaultName,
      role: defaultRole,
      text,
      time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
      ts: now.getTime(),
    };
    setMessages((m) => [...m, { ...msg, self: true }]);
    publishMessage(msg);
    setInput("");
  };

  const roleColor = (role: ChatMessage["role"]) => {
    switch (role) {
      case "admin": return "text-primary";
      case "supervisor": return "text-warning";
      default: return "text-info";
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Buka live chat"
        >
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[90vw] max-w-sm h-[500px] bg-card border rounded-2xl shadow-2xl flex flex-col animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b gradient-primary rounded-t-2xl">
            <div className="flex items-center gap-2 text-primary-foreground">
              <Users className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm flex items-center gap-1.5">
                  Live Chat Operasional
                  <Wifi className="w-3 h-3 text-success-foreground/90" />
                </p>
                <p className="text-xs opacity-80">
                  {context === "pos" ? "POS & Kasir" : "Back Office"} • {defaultName}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="iconSm" onClick={() => setOpen(false)} className="text-primary-foreground hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-3" ref={scrollRef as any}>
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col", msg.self ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-medium", roleColor(msg.role))}>{msg.sender}</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{msg.role}</Badge>
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    msg.self ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Tulis pesan..."
              className="flex-1"
            />
            <Button size="icon" onClick={send}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
