import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
// import { apiFetch, CHAT_API } from "@/lib/api";

/**
 * WebSocket Integration Guide:
 * ─────────────────────────────
 * 1. Connect:      const ws = new WebSocket(CHAT_API.WS(authToken));
 * 2. On message:   ws.onmessage = (e) => { const msg = JSON.parse(e.data); ... }
 * 3. Send:         ws.send(JSON.stringify({ type: "message", conversationId, content }));
 * 4. Typing:       ws.send(JSON.stringify({ type: "typing", conversationId }));
 * 5. Disconnect:   ws.close();
 *
 * TODO: Replace mock data with real WebSocket connection.
 * TODO: Fetch conversations: await apiFetch(CHAT_API.CONVERSATIONS);
 * TODO: Fetch messages: await apiFetch(CHAT_API.MESSAGES(conversationId));
 * TODO: Send message: await apiFetch(CHAT_API.SEND_MESSAGE(conversationId), { method: "POST", body });
 */

interface Message {
  id: string;
  sender: "user" | "driver";
  content: string;
  time: string;
}

interface Conversation {
  id: string;
  driverName: string;
  lastMessage: string;
  time: string;
  unread: number;
  tripTitle: string;
}

const mockConversations: Conversation[] = [
  { id: "c1", driverName: "Sokha Meas", lastMessage: "I'll pick you up at 4:30 AM at the hotel lobby!", time: "2h ago", unread: 2, tripTitle: "Angkor Wat Sunrise Tour" },
  { id: "c2", driverName: "Vanna Chan", lastMessage: "Sure, I can stop at the Central Market too.", time: "1d ago", unread: 0, tripTitle: "Phnom Penh City Tour" },
  { id: "c3", driverName: "Piseth Hor", lastMessage: "The boat leaves at 9 AM, don't be late!", time: "3d ago", unread: 0, tripTitle: "Sihanoukville Beach Day" },
];

const mockMessages: Record<string, Message[]> = {
  c1: [
    { id: "m1", sender: "driver", content: "Hello! I'm Sokha, your driver for the Angkor Wat tour 🙏", time: "10:00 AM" },
    { id: "m2", sender: "user", content: "Hi Sokha! What time should I be ready?", time: "10:05 AM" },
    { id: "m3", sender: "driver", content: "I'll pick you up at 4:30 AM at the hotel lobby!", time: "10:06 AM" },
    { id: "m4", sender: "driver", content: "Please bring water and sunscreen. It gets hot at the temples!", time: "10:07 AM" },
  ],
  c2: [
    { id: "m5", sender: "user", content: "Can we also visit the Central Market?", time: "Yesterday" },
    { id: "m6", sender: "driver", content: "Sure, I can stop at the Central Market too.", time: "Yesterday" },
  ],
  c3: [
    { id: "m7", sender: "driver", content: "The boat leaves at 9 AM, don't be late!", time: "3 days ago" },
  ],
};

const ChatPage = () => {
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [conversations, setConversations] = useState(mockConversations);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConvo);

  useEffect(() => {
    if (activeConvo) {
      setMessages(mockMessages[activeConvo] || []);
      // TODO: Replace with: const msgs = await apiFetch(CHAT_API.MESSAGES(activeConvo));
      // TODO: Connect WebSocket: const ws = new WebSocket(CHAT_API.WS(token));
    }
  }, [activeConvo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim() || !activeConvo) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      sender: "user",
      content: newMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMsg("");
    // TODO: ws.send(JSON.stringify({ type: "message", conversationId: activeConvo, content: msg.content }));
    // TODO: await apiFetch(CHAT_API.SEND_MESSAGE(activeConvo), { method: "POST", body: JSON.stringify({ content: msg.content }) });

    // Simulate driver reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `m${Date.now()}`, sender: "driver", content: "Got it! See you soon 👍", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    }, 1500);
  };

  // ─── Conversation List ────────────────────────────────────
  if (!activeConvo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          <div className="space-y-2">
            {conversations.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`bg-card rounded-xl border p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  c.unread > 0 ? "border-primary/30" : "border-border"
                }`}
                onClick={() => setActiveConvo(c.id)}
              >
                <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{c.driverName}</h3>
                    <span className="text-xs text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.tripTitle}</p>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {c.unread}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Chat View ────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col bg-background">
      {/* Chat header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setActiveConvo(null)}>
          <ArrowLeft size={20} />
        </Button>
        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
          <User size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{activeConversation?.driverName}</h3>
          <p className="text-xs text-muted-foreground">{activeConversation?.tripTitle}</p>
        </div>
        <Button variant="ghost" size="icon">
          <Phone size={18} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <p>{m.content}</p>
                <p className={`text-[10px] mt-1 ${m.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                  {m.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border p-3 flex gap-2 shrink-0">
        <Input
          placeholder="Type a message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="h-11"
        />
        <Button onClick={handleSend} disabled={!newMsg.trim()} className="h-11 px-4">
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
