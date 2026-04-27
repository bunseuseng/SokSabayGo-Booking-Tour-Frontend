import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { api, CHAT_API, WS_URL, KEYS, ConversationUser, ChatMessage, SendMessagePayload } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ChatContextType {
  conversations: ConversationUser[];
  currentConversation: ConversationUser | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  loading: boolean;
  loadingMessages: boolean;
  unreadCount: number;
  clearUnread: () => void;
  sendMessage: (payload: SendMessagePayload) => void;
  selectConversation: (user: ConversationUser) => Promise<void>;
  clearConversation: () => void;
  refreshConversations: () => Promise<void>;
  uploadMedia: (file: File) => Promise<string>;
  startConversation: (driverId: number, driverName: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationUser[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const [wsToken, setWsToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get WebSocket token - for email/password login, use localStorage token directly
  const getWsToken = useCallback(async (): Promise<string | null> => {
    let accessToken = localStorage.getItem(KEYS.ACCESS);

    if (!accessToken) {
      try {
        console.log("🛠️ Token missing from localStorage. Fetching fresh token from backend...");
        const res = await api.get("/api/v1/auth-service/ws-token");
        accessToken = res.data?.data?.accessToken || res.data?.accessToken || null;
        if (accessToken) {
          localStorage.setItem(KEYS.ACCESS, accessToken);
        }
      } catch (err) {
        console.error("Failed to fetch fresh ws-token from backend:", err);
      }
    }
    return accessToken;
  }, []);

  // Fetch conversations from REST API
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get(CHAT_API.CONVERSATIONS);
      if (res.data) {
        // Normalize conversation data - handle different field names from backend
        const rawList = Array.isArray(res.data) ? res.data : res.data.data || [];
        
        // Sum up unread counts if the backend provides them
        let totalUnread = 0;
        
        const normalizedConversations = rawList.map((conv: any) => {
          const uCount = conv.unreadCount || conv.unreadMessages || 0;
          totalUnread += Number(uCount);
          
          return {
            userId: conv.userId || conv.id,
            email: conv.email || "",
            fullName: conv.fullName || conv.name || "Unknown",
            profileImage: conv.profileImage || conv.avatarUrl || conv.avatar,
            bannerUrl: conv.bannerUrl || conv.banner,
            bio: conv.bio || conv.bio,
            role: conv.role || [],
            ratingCount: conv.ratingCount || conv.ratings,
            lastMessageTime: conv.lastMessageTime || conv.lastMessageAt || conv.lastMessage?.timestamp || new Date().toISOString(),
            isOnline: conv.isOnline === true || conv.isOnline === "true" || conv.online === true,
            lastActiveAt: conv.lastActiveAt || conv.lastSeenAt || conv.lastActive || conv.lastSeen,
            unreadCount: uCount,
          };
        });
        
        setConversations(normalizedConversations);
        setUnreadCount(totalUnread);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch message history with a user
  const fetchMessages = useCallback(async (otherUserId: number) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(CHAT_API.HISTORY(otherUserId));
      if (res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Select a conversation and fetch its messages
  const selectConversation = useCallback(async (conv: ConversationUser) => {
    setCurrentConversation(conv);
    await fetchMessages(conv.userId);
  }, [fetchMessages]);

  // Clear active conversation state to stop suppressing unread counters when off-screen
  const clearConversation = useCallback(() => {
    setCurrentConversation(null);
  }, []);

  // Upload media file
  const uploadMedia = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(CHAT_API.MEDIA_UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.secure_url;
  }, []);

  // Send message via WebSocket
  const sendMessage = useCallback((payload: SendMessagePayload) => {
    const client = stompClientRef.current;
    // console.log("📤 Attempting to send message:", payload);
    // console.log("📡 WebSocket connected:", client?.connected);
    if (client && client.connected) {
      // console.log("✅ Publishing to:", CHAT_API.SEND_MESSAGE);
      client.publish({
        destination: CHAT_API.SEND_MESSAGE,
        body: JSON.stringify(payload),
      });
      // console.log("✅ Message published successfully");
    } else {
      console.error("❌ WebSocket not connected", { clientAvailable: !!client });
    }
  }, []);

  // Start a new conversation with a driver
  const startConversation = useCallback(async (driverId: number, driverName: string) => {
    try {
      // First try to get existing conversation or create new one via API
      try {
        const res = await api.post(CHAT_API.START, { recipientId: driverId });
        if (res.data) {
          // If API returns conversation data, use it
          const conv = res.data;
          const newConv: ConversationUser = {
            userId: conv.userId || driverId,
            email: conv.email || "",
            fullName: driverName,
            profileImage: conv.profileImage || conv.avatarUrl,
            bannerUrl: conv.bannerUrl,
            bio: conv.bio,
            role: conv.role || [],
            ratingCount: conv.ratingCount,
            lastMessageTime: new Date().toISOString(),
            isOnline: false,
            lastActiveAt: conv.lastActiveAt,
            unreadCount: conv.unreadCount || 0,
          };
          await selectConversation(newConv);
          return;
        }
      } catch (apiErr) {
        console.log("Start conversation API not available, creating locally:", apiErr);
      }

      // Fallback: create conversation locally without API call
      const newConv: ConversationUser = {
        userId: driverId,
        email: `driver-${driverId}@soksabay.com`,
        fullName: driverName,
        profileImage: "",
        bannerUrl: "",
        bio: "",
        role: ["DRIVER"],
        ratingCount: 0,
        lastMessageTime: new Date().toISOString(),
        isOnline: false,
        lastActiveAt: undefined,
        unreadCount: 0,
      };

      // Add to conversations if not already there
      setConversations((prev) => {
        const exists = prev.find((c) => c.userId === driverId);
        if (exists) return prev;
        return [newConv, ...prev];
      });

      await selectConversation(newConv);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  }, [selectConversation]);

  // Keep a refs of current state to access in WebSocket closure without stale values
  const currentConversationRef = useRef<ConversationUser | null>(null);
  const conversationsRef = useRef<ConversationUser[]>([]);
  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Setup WebSocket connection for real-time chat
  useEffect(() => {
    // console.log("🛠️ ChatContext useEffect RUNNING! user?.id:", user?.id);
    if (!user?.id) {
      console.log("🛑 user?.id is missing, aborting websocket setup");
      return;
    }

    let isMounted = true;
    let activeClient: Client | null = null;
    // console.log("🛠️ ChatContext connectChat initialized");

    const connectChat = async () => {
      try {
        // console.log("🛠️ Calling getWsToken...");
        const token = await getWsToken();
        // console.log("🛠️ getWsToken returned length:", token ? token.length : "NULL");
        if (!token) {
          console.error("❌ Token is missing! Aborting connect.");
          return;
        }
        if (!isMounted) {
          console.error("❌ Component unmounted before token resolved! Aborting connect.");
          return;
        }

        setWsToken(token);
        // console.log("🛠️ Creating new STOMP Client object...");

        activeClient = new Client({
          webSocketFactory: () => new SockJS(WS_URL),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          reconnectDelay: 3000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          beforeConnect: async () => {
            try {
              // Refresh token before each reconnection attempt
              const freshToken = await getWsToken();
              if (freshToken && activeClient) {
                activeClient.connectHeaders = { Authorization: `Bearer ${freshToken}` };
              }
            } catch (err) {
              console.warn("Failed to refresh token in beforeConnect", err);
            }
          },
          onConnect: () => {
            console.log("🟢 Chat WebSocket successfully connected!");
            // Subscribe to incoming messages
            activeClient!.subscribe(CHAT_API.MESSAGES_QUEUE, (frame: IMessage) => {
              // console.log("📨 Received message frame:", frame.body);
              try {
                const message: ChatMessage = JSON.parse(frame.body);
                // console.log("✅ Parsed message:", message);

                // Don't count own messages as unread // but check senderId vs explicitly logged in user id
                const currentUserId = Number(user?.id);
                const isOwnMessage = message.senderId === currentUserId;

                const activeConvo = currentConversationRef.current;
                // Add to messages if it's for current conversation (and not own message)
                const isCurrentConvo = activeConvo &&
                  (message.senderId === activeConvo.userId || message.recipientId === activeConvo.userId);

                if (isCurrentConvo && !isOwnMessage) {
                  setMessages((prev) => {
                    // Prevent duplicate additions
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                  });
                } else if (!isOwnMessage) {
                  // Increment unread count for messages in other conversations or when no conversation selected
                  setUnreadCount((prev) => prev + 1);

                  // Also trigger a UI toast for the new message
                  import("react-toastify").then(({ toast }) => {
                    toast.info(`New message from ${message.senderName}`, {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      theme: "light",
                    });
                  }).catch(() => { });
                }

                // If it's a message from a new person not in our list, refresh the whole list
                const isNewPartner = !conversationsRef.current.some(
                  (c) => c.userId === message.senderId || c.userId === message.recipientId
                );

                if (isNewPartner && !isOwnMessage) {
                  fetchConversations();
                } else {
                  // Update existing conversation list to show this person at the top
                  setConversations((prev) => {
                    const conv = prev.find((c) => c.userId === message.senderId || c.userId === message.recipientId);
                    if (conv) {
                      return [
                        { 
                          ...conv, 
                          lastMessageTime: message.timestamp, 
                          isOnline: true,
                          unreadCount: isCurrentConvo ? 0 : (conv.unreadCount || 0) + 1
                        },
                        ...prev.filter((c) => c.userId !== conv.userId),
                      ];
                    }
                    return prev;
                  });
                }
              } catch (err) {
                console.error("Failed to parse message:", err);
              }
            });
          },
          onStompError: (frame) => {
            console.error("🔴 STOMP error for chat:", frame);
          },
          onWebSocketError: (event) => {
            console.error("🔴 WebSocket error for chat:", event);
          },
        });

        if (isMounted) {
          // console.log("🛠️ Activating client and setting stompClientRef.current");
          activeClient.activate();
          stompClientRef.current = activeClient;
          // console.log("✅ stompClientRef successfully populated:", !!stompClientRef.current);
        } else {
          // console.log("❌ isMounted was false before activate()!");
        }
      } catch (err) {
        console.error("❌ Failed to initialize Chat WebSocket because getWsToken crashed:", err);
      }
    };

    connectChat();

    return () => {
      // console.log("🛠️ ChatContext useEffect CLEANUP RUNNING!");
      isMounted = false;
      if (activeClient) {
        // console.log("🛠️ Deactivating active client...");
        activeClient.deactivate();
      }
      if (stompClientRef.current === activeClient) {
        // console.log("🛠️ Wiping stompClientRef.current to null...");
        stompClientRef.current = null;
      }
    };
  }, [user?.id, getWsToken]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        setMessages,
        loading,
        loadingMessages,
        unreadCount,
        clearUnread: () => setUnreadCount(0),
        sendMessage,
        selectConversation,
        clearConversation,
        refreshConversations: fetchConversations,
        uploadMedia,
        startConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}