import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Send, ArrowLeft, Phone, User, Image as ImageIcon, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationUser, ChatMessage, api, BOOKINGS_API, ApiBooking } from "@/lib/api";

const ChatPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    setMessages,
    loading,
    loadingMessages,
    sendMessage,
    selectConversation,
    clearConversation,
    uploadMedia,
    clearUnread,
    startConversation
  } = useChat();

  // new state variables for image review before sending
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCancelledRef = useRef(false);
  // Handle conversation selection
  const handleSelectConversation = async (conv: ConversationUser) => {
    await selectConversation(conv);
    setActiveConvoId(conv.userId);
    clearUnread();
  };

  useEffect(() => {
    const driverData = location.state as { driverId?: number; driverName?: string } | null;
    if (driverData?.driverId && driverData?.driverName && !loading) {
      // Check if we already have a conversation with this driver
      const existingConv = conversations.find((c) => c.userId === driverData.driverId);
      if (existingConv) {
        handleSelectConversation(existingConv);
        // Clear the location state after use
        window.history.replaceState({}, document.title);
      } else {
        // Start a new conversation
        startConversation(driverData.driverId, driverData.driverName).then(() => {
          // Clear the location state after use
          window.history.replaceState({}, document.title);
        });
      }
    }
  }, [location.state, conversations, loading]);

  // Clear context conversation on unmount to stop suppressing toasts across the app
  useEffect(() => {
    return () => {
      clearConversation();
    };
  }, [clearConversation]);

  // Handle back button
  const handleBack = () => {
    setActiveConvoId(null);
    clearConversation();
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSend = () => {
    if (!newMsg.trim() || !currentConversation) return;

    // Add message locally immediately with current timestamp
    const newMessage: ChatMessage = {
      id: Date.now(),
      senderId: Number(user?.id),
      senderName: user?.fullName || "You",
      senderEmail: user?.email || "",
      recipientId: currentConversation.userId,
      recipientName: currentConversation.fullName,
      recipientEmail: currentConversation.email,
      content: newMsg.trim(),
      type: "TEXT",
      mediaUrl: "",
      timestamp: new Date().toISOString(),
      isRead: true,
    };
    setMessages((prev) => [...prev, newMessage]);

    sendMessage({
      recipientId: currentConversation.userId,
      content: newMsg.trim(),
      type: "TEXT",
      mediaUrl: null,
    });

    setNewMsg("");
  };

  // Handle file upload (image)
  // 1. Just captures the file and shows it to you
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmSendImage = async () => {
    if (!previewImage || !currentConversation) return;

    try {
      const mediaUrl = await uploadMedia(previewImage);

      // 1. Send to the server
      sendMessage({
        recipientId: currentConversation.userId,
        content: "",
        type: "IMAGE",
        mediaUrl,
      });

      // 2. ADD THIS: Update your local UI immediately
      const newMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        senderId: Number(user?.id),
        senderName: user?.fullName || "You",
        senderEmail: user?.email || "",
        recipientId: currentConversation.userId,
        recipientName: currentConversation.fullName,
        recipientEmail: currentConversation.email,
        content: "",
        type: "IMAGE",
        mediaUrl, // This uses the URL returned from your uploadMedia function
        timestamp: new Date().toISOString(),
        isRead: true,
      };

      // Push the new message into your local state
      setMessages((prev) => [...prev, newMessage]);

      // 3. Clean up the preview
      setPreviewImage(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

    } catch (err) {
      console.error("Failed to upload image:", err);
    }
  };
  // ─── Voice Recording Logic ───────────────────────────────
  const startRecording = async () => {
    try {
      isCancelledRef.current = false; // Reset the flag
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (!isCancelledRef.current) {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          if (audioBlob.size > 100) {


            if (audioBlob.size > 100) { // check if not just a click
              const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
              try {
                const mediaUrl = await uploadMedia(audioFile);
                if (currentConversation) {
                  sendMessage({
                    recipientId: currentConversation.userId,
                    content: "",
                    type: "VOICE",
                    mediaUrl,
                  });

                  // Add local optimistic message
                  const newMessage: ChatMessage = {
                    id: Date.now(),
                    senderId: Number(user?.id),
                    senderName: user?.fullName || "You",
                    senderEmail: user?.email || "",
                    recipientId: currentConversation.userId,
                    recipientName: currentConversation.fullName,
                    recipientEmail: currentConversation.email,
                    content: "",
                    type: "VOICE",
                    mediaUrl,
                    timestamp: new Date().toISOString(),
                    isRead: true,
                  };
                  setMessages((prev) => [...prev, newMessage]);
                }
              } catch (err) {
                console.error("Failed to upload voice message:", err);
              }
            }
          }

        }

        // stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      isCancelledRef.current = true;
      audioChunksRef.current = []; // clear chunks so onstop does nothing
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to ensure timestamp is treated as UTC
  const parseUtcTimestamp = (ts: string) => {
    // If the backend Spring Boot LocalDateTime doesn't end with 'Z' and lacks a timezone offset, append 'Z'
    if (!ts.endsWith('Z') && !ts.includes('+') && ts.split('-').length <= 3) {
      return new Date(ts + 'Z');
    }
    return new Date(ts);
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = parseUtcTimestamp(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format last seen time
  const formatLastSeen = (lastActiveAt?: string): string => {
    if (!lastActiveAt) return "";
    const date = parseUtcTimestamp(lastActiveAt);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Format conversation time
  const formatConvoTime = (timestamp: string) => {
    const date = parseUtcTimestamp(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // ─── Conversation List ────────────────────────────────────
  if (!activeConvoId) {
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Loading conversations...</div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          {conversations.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No conversations yet. Start a chat by booking a tour!</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <motion.div
                  key={conv.userId}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-card rounded-xl border p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                    {conv.profileImage ? (
                      <img src={conv.profileImage} alt={conv.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{conv.fullName}</h3>
                      <span className="text-xs text-muted-foreground">{formatConvoTime(conv.lastMessageTime)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.role?.join(", ") || "User"}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {conv.isOnline ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-xs text-emerald-600">Online</span>
                        </>
                      ) : conv.lastActiveAt ? (
                        <>
                          <span className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="text-xs text-muted-foreground">{formatLastSeen(conv.lastActiveAt)}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Chat View ────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col bg-background">
      {/* Chat header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
          {currentConversation?.profileImage ? (
            <img src={currentConversation.profileImage} alt={currentConversation.fullName} className="w-full h-full object-cover" />
          ) : (
            <User size={18} className="text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{currentConversation?.fullName}</h3>
          <p className="text-xs text-muted-foreground">
            {currentConversation?.isOnline ? "Online" : `Last active: ${formatConvoTime(currentConversation?.lastActiveAt || "")}`}
          </p>
        </div>
        <Button variant="ghost" size="icon">
          <Phone size={18} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loadingMessages ? (
          <div className="text-center text-muted-foreground py-4">Loading messages...</div>
        ) : (
          <AnimatePresence>
            {messages.map((m) => {
              const isMe = m.senderId === Number(user?.id);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                      }`}
                  >
                    {m.type === "IMAGE" && m.mediaUrl && (
                      <img src={m.mediaUrl} alt="Image" className="max-w-full rounded-lg mb-2" />
                    )}
                    {m.type === "VOICE" && m.mediaUrl && (
                      <audio controls src={m.mediaUrl} className="max-w-full" />
                    )}
                    {m.content && <p>{m.content}</p>}
                    <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                      {formatTime(m.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {/* Input */}
      <div className="bg-card border-t border-border p-3 shrink-0">
        <AnimatePresence mode="wait">
          {/* 1. PREVIEW LAYER (Review Image before sending) */}
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-muted/30 p-2 rounded-xl"
            >
              <div className="relative h-12 w-12 rounded-lg overflow-hidden border bg-background">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium">Image selected</p>
                <p className="text-[10px] text-muted-foreground">Click send to confirm</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewImage(null);
                }}
                className="text-destructive hover:bg-destructive/10"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmSendImage}
                className="bg-primary text-white rounded-full h-10 w-10 p-0 flex items-center justify-center"
              >
                <Send size={18} />
              </Button>
            </motion.div>
          ) : isRecording ? (
            /* 2. RECORDING LAYER (Voice Controls) */
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-muted/30 p-2 rounded-xl"
            >
              <div className="flex items-center gap-2 flex-1 px-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium tabular-nums">{formatDuration(recordingTime)}</span>
                <span className="text-xs text-muted-foreground ml-2">Recording...</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelRecording} // Triggering your cancel function
                className="text-destructive hover:bg-destructive/10"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={stopRecording} // Triggering your stop/send function
                className="bg-red-500 hover:bg-red-600 text-white rounded-full h-10 w-10 p-0 flex items-center justify-center"
              >
                <Send size={18} />
              </Button>
            </motion.div>
          ) : (
            /* 3. STANDARD LAYER (Keyboard & Upload) */
            <motion.div
              key="standard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon size={18} />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="h-11"
                maxLength={255}
              />
              {newMsg.trim() ? (
                <Button onClick={handleSend} className="h-11 px-4">
                  <Send size={18} />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={startRecording}
                  className="h-11 w-11 text-primary hover:bg-primary/10"
                >
                  <Mic size={20} />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatPage;
