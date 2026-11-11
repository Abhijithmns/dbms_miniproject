"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ChatIcon,
  CloseIcon,
  ExternalLinkIcon,
  ImageIcon,
  MinimizeIcon,
  PlusIcon,
  ScreamingSnooSticker,
  SendIcon,
  SettingsIcon,
  SlidersIcon,
  SmileIcon,
  SnooAvatarIcon,
} from "@/components/Icons";
import { toast } from "@/components/Toast";
import { UserAvatar } from "@/components/UserAvatar";
import { USER_STORAGE_KEY } from "@/components/UserIdentity";
import { apiRequest } from "@/lib/api";

interface MessageItem {
  messageId: number | string;
  content: string;
  sentAt: string;
  readAt?: string | null;
  senderId: number;
  receiverId: number;
  senderUsername: string;
  receiverUsername: string;
  senderProfileImage?: string;
  receiverProfileImage?: string;
}

interface ChatThread {
  partnerUsername: string;
  partnerId: number;
  partnerProfileImage?: string;
  isMod?: boolean;
  messages: MessageItem[];
  lastMessage: MessageItem;
  unreadCount: number;
}

interface UserOption {
  id: number;
  username: string;
  karma: number;
  profileImage?: string;
}

function ChatAvatar({
  username,
  profileImage,
  size = 36,
}: {
  username: string;
  profileImage?: string;
  size?: number;
}) {
  if (profileImage && !["cyan", "glasses", "robot"].includes(profileImage)) {
    return <UserAvatar image={profileImage} username={username} size={size} />;
  }

  if (username === "thepesuretard" || profileImage === "cyan") {
    return (
      <div
        className="rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
        style={{ width: size, height: size, backgroundColor: "#00d5ff" }}
      >
        <SnooAvatarIcon size={size} />
      </div>
    );
  }
  if (username === "Autistic_Snecc" || profileImage === "glasses") {
    return (
      <div
        className="rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
        style={{ width: size, height: size, backgroundColor: "#2b343b" }}
      >
        <SnooAvatarIcon size={size} />
      </div>
    );
  }
  if (username === "capstone" || profileImage === "robot") {
    return (
      <div
        className="rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
        style={{ width: size, height: size, backgroundColor: "#3a2d54" }}
      >
        <SnooAvatarIcon size={size} />
      </div>
    );
  }
  if (username.toLowerCase().includes("mod") || username.toLowerCase().includes("post from")) {
    return (
      <div
        className="rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2px]"
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center text-[10px] font-mono text-white font-bold">
          {">_"}
        </div>
      </div>
    );
  }

  return <UserAvatar image={profileImage} username={username} size={size} />;
}

function isImageContent(text: string) {
  const trimmed = text.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("[Image:")
  );
}

function extractImageUrl(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("[Image:") && trimmed.endsWith("]")) {
    return trimmed.slice(7, -1).trim();
  }
  return trimmed;
}

export function MessageCenter() {
  const currentUsername = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    () => window.localStorage.getItem(USER_STORAGE_KEY) || "getit_demo",
    () => "getit_demo"
  );

  const [rawMessages, setRawMessages] = useState<MessageItem[]>([]);
  const [activePartner, setActivePartner] = useState<string>("thepesuretard");
  const [inputContent, setInputContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Popups & Drawers
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isStickerOpen, setIsStickerOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgSeqRef = useRef(0);

  // Fetch messages from MariaDB backend
  const loadMessages = () => {
    apiRequest<MessageItem[]>("/api/messages")
      .then((data) => {
        if (Array.isArray(data)) {
          setRawMessages(data);
        }
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // Fetch users for new chat dialog
  useEffect(() => {
    if (!isNewChatOpen) return;
    apiRequest<UserOption[]>("/api/users")
      .then((data) => {
        if (Array.isArray(data)) {
          setUsersList(data.filter((u) => u.username !== currentUsername));
        }
      })
      .catch(() => undefined);
  }, [isNewChatOpen, currentUsername]);

  // Group raw messages into threads by partner
  const threadsMap = new Map<string, ChatThread>();

  // Baseline seed threads matching user's Reddit screenshot
  const seedThreads: ChatThread[] = [
    {
      partnerUsername: "thepesuretard",
      partnerId: 17,
      partnerProfileImage: "cyan",
      isMod: false,
      messages: [
        {
          messageId: "seed-1",
          content: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=500&auto=format&fit=crop&q=80",
          sentAt: "2026-06-02T23:20:00Z",
          senderId: 17,
          receiverId: 6,
          senderUsername: "thepesuretard",
          receiverUsername: currentUsername,
        },
        {
          messageId: "seed-2",
          content: "😱",
          sentAt: "2026-06-02T23:25:00Z",
          senderId: 6,
          receiverId: 17,
          senderUsername: currentUsername,
          receiverUsername: "thepesuretard",
        },
      ],
      lastMessage: {
        messageId: "seed-2",
        content: "😱",
        sentAt: "2026-06-02T23:25:00Z",
        senderId: 6,
        receiverId: 17,
        senderUsername: currentUsername,
        receiverUsername: "thepesuretard",
      },
      unreadCount: 0,
    },
    {
      partnerUsername: "Savings_Walk_1022",
      partnerId: 18,
      partnerProfileImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=60",
      isMod: false,
      messages: [
        {
          messageId: "seed-3",
          content: "Hey, thanks for sharing the SQL notes earlier!",
          sentAt: "2026-05-29T14:10:00Z",
          senderId: 6,
          receiverId: 18,
          senderUsername: currentUsername,
          receiverUsername: "Savings_Walk_1022",
        },
        {
          messageId: "seed-4",
          content: "np :)",
          sentAt: "2026-05-29T14:12:00Z",
          senderId: 18,
          receiverId: 6,
          senderUsername: "Savings_Walk_1022",
          receiverUsername: currentUsername,
        },
      ],
      lastMessage: {
        messageId: "seed-4",
        content: "np :)",
        sentAt: "2026-05-29T14:12:00Z",
        senderId: 18,
        receiverId: 6,
        senderUsername: "Savings_Walk_1022",
        receiverUsername: currentUsername,
      },
      unreadCount: 0,
    },
    {
      partnerUsername: "Autistic_Snecc",
      partnerId: 19,
      partnerProfileImage: "glasses",
      isMod: false,
      messages: [
        {
          messageId: "seed-5",
          content: "Did you review the database report?",
          sentAt: "2026-05-05T10:00:00Z",
          senderId: 19,
          receiverId: 6,
          senderUsername: "Autistic_Snecc",
          receiverUsername: currentUsername,
        },
        {
          messageId: "seed-6",
          content: "Fine",
          sentAt: "2026-05-05T10:05:00Z",
          senderId: 6,
          receiverId: 19,
          senderUsername: currentUsername,
          receiverUsername: "Autistic_Snecc",
        },
      ],
      lastMessage: {
        messageId: "seed-6",
        content: "Fine",
        sentAt: "2026-05-05T10:05:00Z",
        senderId: 6,
        receiverId: 19,
        senderUsername: currentUsername,
        receiverUsername: "Autistic_Snecc",
      },
      unreadCount: 0,
    },
    {
      partnerUsername: "capstone",
      partnerId: 20,
      partnerProfileImage: "robot",
      isMod: false,
      messages: [
        {
          messageId: "seed-7",
          content: "Will the MariaDB transactions commit smoothly?",
          sentAt: "2026-05-05T09:30:00Z",
          senderId: 20,
          receiverId: 6,
          senderUsername: "capstone",
          receiverUsername: currentUsername,
        },
        {
          messageId: "seed-8",
          content: "Ig it will",
          sentAt: "2026-05-05T09:32:00Z",
          senderId: 6,
          receiverId: 20,
          senderUsername: currentUsername,
          receiverUsername: "capstone",
        },
      ],
      lastMessage: {
        messageId: "seed-8",
        content: "Ig it will",
        sentAt: "2026-05-05T09:32:00Z",
        senderId: 6,
        receiverId: 20,
        senderUsername: currentUsername,
        receiverUsername: "capstone",
      },
      unreadCount: 0,
    },
    {
      partnerUsername: "Your post from getit...",
      partnerId: 999,
      isMod: true,
      messages: [
        {
          messageId: "seed-9",
          content: "r/campus-life: Your post was approved by moderators and is now visible on the community feed.",
          sentAt: "2026-02-24T12:00:00Z",
          senderId: 999,
          receiverId: 6,
          senderUsername: "Your post from getit...",
          receiverUsername: currentUsername,
        },
      ],
      lastMessage: {
        messageId: "seed-9",
        content: "r/campus-life: Your post was approved by moderators and is now visible on the community feed.",
        sentAt: "2026-02-24T12:00:00Z",
        senderId: 999,
        receiverId: 6,
        senderUsername: "Your post from getit...",
        receiverUsername: currentUsername,
      },
      unreadCount: 0,
    },
  ];

  // Initialize seed threads
  for (const st of seedThreads) {
    threadsMap.set(st.partnerUsername, { ...st, messages: [...st.messages] });
  }

  // Merge database messages
  for (const m of rawMessages) {
    const isSentByMe = m.senderUsername === currentUsername;
    const partner = isSentByMe ? m.receiverUsername : m.senderUsername;
    const partnerId = isSentByMe ? m.receiverId : m.senderId;
    const partnerImage = isSentByMe ? m.receiverProfileImage : m.senderProfileImage;

    if (!threadsMap.has(partner)) {
      threadsMap.set(partner, {
        partnerUsername: partner,
        partnerId: partnerId,
        partnerProfileImage: partnerImage,
        isMod: partner.toLowerCase().includes("mod"),
        messages: [],
        lastMessage: m,
        unreadCount: !isSentByMe && !m.readAt ? 1 : 0,
      });
    }

    const t = threadsMap.get(partner)!;
    // Avoid duplicates if seed has same message ID
    if (!t.messages.some((existing) => String(existing.messageId) === String(m.messageId))) {
      t.messages.push(m);
    }
    // Update last message if more recent
    if (new Date(m.sentAt).getTime() >= new Date(t.lastMessage.sentAt).getTime()) {
      t.lastMessage = m;
    }
  }

  // Convert to sorted array
  const threads = Array.from(threadsMap.values()).sort(
    (a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime()
  );

  const activeThread = threads.find((t) => t.partnerUsername === activePartner) || threads[0];

  // Sort active thread messages chronologically
  const sortedMessages = activeThread
    ? [...activeThread.messages].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      )
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages.length, activePartner]);

  // Send message
  async function handleSendMessage(contentToSend?: string) {
    const text = (contentToSend || inputContent).trim();
    if (!text || !activeThread || isSending) return;

    setIsSending(true);
    setInputContent("");
    setIsAttachOpen(false);
    setIsEmojiOpen(false);
    setIsStickerOpen(false);

    // Optimistic message item
    msgSeqRef.current += 1;
    const tempId = `temp-${msgSeqRef.current}`;
    const optimisticMsg: MessageItem = {
      messageId: tempId,
      content: text,
      sentAt: "Just now",
      senderId: 6,
      receiverId: activeThread.partnerId,
      senderUsername: currentUsername,
      receiverUsername: activeThread.partnerUsername,
    };

    setRawMessages((prev) => [optimisticMsg, ...prev]);

    try {
      await apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          receiverId: activeThread.partnerId,
          receiverUsername: activeThread.partnerUsername,
          content: text,
        }),
      });
      loadMessages();
    } catch {
      toast("Message delivery failed. Please check login session.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSendSticker(stickerEmoji: string) {
    handleSendMessage(stickerEmoji);
  }

  function handleSendCustomImage() {
    if (!customImageUrl.trim()) return;
    handleSendMessage(customImageUrl.trim());
    setCustomImageUrl("");
  }

  function formatThreadDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  function formatMessageTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function getSnippet(msg: MessageItem) {
    const isMe = msg.senderUsername === currentUsername;
    const prefix = isMe ? "You: " : `${msg.senderUsername}: `;
    if (isImageContent(msg.content)) {
      return `${prefix}🖼️`;
    }
    if (msg.content === "😱") {
      return `${prefix}😱`;
    }
    return `${prefix}${msg.content}`;
  }

  return (
    <div className="reddit-chat-window w-full max-w-[980px] mx-auto h-[700px] flex flex-col md:flex-row relative">
      {/* ============================================================ */}
      {/* Left Sidebar: Threads List                                   */}
      {/* ============================================================ */}
      <div
        className={`w-full md:w-[320px] reddit-chat-sidebar flex flex-col shrink-0 ${
          showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header Bar */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#222528] bg-[#121518]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#ff4500] text-white font-bold flex items-center justify-center text-xs">
              <SnooAvatarIcon size={24} />
            </span>
            <span className="text-white font-extrabold text-base tracking-tight">Chats</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted">
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-[#22272b] hover:text-white transition-colors"
              title="Direct Requests"
              aria-label="Direct requests"
            >
              <ChatIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsNewChatOpen(true)}
              className="p-1.5 rounded-full hover:bg-[#22272b] hover:text-white transition-colors"
              title="New Chat"
              aria-label="New chat"
            >
              <PlusIcon size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-[#22272b] hover:text-white transition-colors"
              title="Chat Settings"
              aria-label="Settings"
            >
              <SlidersIcon size={16} />
            </button>
          </div>
        </div>

        {/* Subheader / Threads selector */}
        <div className="px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-muted border-b border-[#222528]/60 bg-[#121518]">
          <div className="flex items-center gap-1.5 text-white font-bold cursor-pointer hover:text-muted transition-colors">
            <span>↩</span>
            <span>Threads</span>
          </div>
          <span className="text-muted text-[0.7rem]">›</span>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1e2226]/40 p-2 space-y-1">
          {threads.map((t) => {
            const isActive = t.partnerUsername === activePartner;
            return (
              <div
                key={t.partnerUsername}
                onClick={() => {
                  setActivePartner(t.partnerUsername);
                  setShowMobileChat(true);
                }}
                className={`reddit-chat-item ${isActive ? "is-active" : ""}`}
              >
                <div className="relative shrink-0">
                  <ChatAvatar
                    username={t.partnerUsername}
                    profileImage={t.partnerProfileImage}
                    size={38}
                  />
                  {/* Online indicator */}
                  {!t.isMod && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#121518]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-bold text-white truncate">
                        {t.partnerUsername}
                      </span>
                      {t.isMod && (
                        <span className="bg-emerald-600 text-white font-mono text-[9px] font-bold px-1 py-0.2 rounded">
                          MOD
                        </span>
                      )}
                    </div>
                    <span className="text-[0.68rem] text-muted shrink-0 font-mono">
                      {formatThreadDate(t.lastMessage.sentAt)}
                    </span>
                  </div>

                  <p className="text-[0.72rem] text-muted truncate mt-0.5">
                    {getSnippet(t.lastMessage)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* Right Panel: Active Chat Thread Stream                       */}
      {/* ============================================================ */}
      <div
        className={`flex-1 flex flex-col bg-[#0e1113] ${
          !showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Chat Thread Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#222528] bg-[#121518]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile back to list button */}
            <button
              type="button"
              onClick={() => setShowMobileChat(false)}
              className="md:hidden p-1 text-muted hover:text-white"
              aria-label="Back to threads"
            >
              ←
            </button>
            <ChatAvatar
              username={activeThread?.partnerUsername || "Chat"}
              profileImage={activeThread?.partnerProfileImage}
              size={32}
            />
            <div className="min-w-0">
              <span className="text-sm font-bold text-white truncate block">
                {activeThread?.partnerUsername || "Conversation"}
              </span>
            </div>
          </div>

          {/* Right Action Icons (Matching screenshot) */}
          <div className="flex items-center gap-1 text-muted">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-[#22272b] hover:text-white transition-colors"
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-[#22272b] hover:text-white transition-colors"
              title="Expand"
              aria-label="Expand"
            >
              <ExternalLinkIcon size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-[#22272b] hover:text-white transition-colors"
              title="Minimize"
              aria-label="Minimize"
            >
              <MinimizeIcon size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-[#22272b] hover:text-white transition-colors"
              title="Close"
              aria-label="Close"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Message Stream Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 reddit-chat-messages-area">
          {sortedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted p-6">
              <SnooAvatarIcon size={48} />
              <p className="mt-3 text-sm font-bold text-white">
                Start a conversation with {activeThread?.partnerUsername}
              </p>
              <p className="text-xs text-muted max-w-xs mt-1">
                Say hello or send an image to break the ice!
              </p>
            </div>
          ) : (
            sortedMessages.map((msg, idx) => {
              const isMe = msg.senderUsername === currentUsername;
              const isImg = isImageContent(msg.content);
              const isScreamingSnoo = msg.content === "😱";

              return (
                <div key={msg.messageId || idx} className="flex items-start gap-3 group">
                  <ChatAvatar
                    username={msg.senderUsername}
                    profileImage={isMe ? undefined : activeThread?.partnerProfileImage}
                    size={36}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-bold text-white truncate">
                        {msg.senderUsername}
                      </span>
                      <span className="text-[0.68rem] text-muted font-mono">
                        {formatMessageTime(msg.sentAt)}
                      </span>
                    </div>

                    {/* Message Body Content */}
                    {isImg ? (
                      <div className="rounded-2xl overflow-hidden border border-[#343536] max-w-[280px] sm:max-w-[340px] shadow-lg bg-black/60">
                        <img
                          src={extractImageUrl(msg.content)}
                          alt="Shared attachment"
                          className="w-full h-auto object-cover max-h-[280px]"
                        />
                      </div>
                    ) : isScreamingSnoo ? (
                      <div className="py-1">
                        <ScreamingSnooSticker size={130} className="drop-shadow-md" />
                      </div>
                    ) : (
                      <div className="text-sm text-[#e4e6eb] leading-relaxed break-words">
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Drawers / Popups (Emoji, Stickers, Attachment) */}
        {isAttachOpen && (
          <div className="mx-4 mb-2 p-3 bg-[#1e2226] border border-[#343536] rounded-xl shadow-xl flex items-center gap-2 text-xs">
            <span className="text-muted font-bold">Image URL:</span>
            <input
              type="text"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              placeholder="Paste meme or image link (https://...)"
              className="flex-1 bg-[#121518] border border-[#343536] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#878a8c]"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendCustomImage();
              }}
            />
            <button
              type="button"
              onClick={handleSendCustomImage}
              className="btn !py-1.5 !px-3 !text-xs !bg-ink !text-paper font-bold rounded-lg"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setIsAttachOpen(false)}
              className="p-1 text-muted hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {isEmojiOpen && (
          <div className="mx-4 mb-2 p-2.5 bg-[#1e2226] border border-[#343536] rounded-xl shadow-xl flex items-center gap-2 flex-wrap text-lg">
            {["😀", "😂", "😍", "🔥", "👍", "🎉", "💯", "👀", "❤️", "🙌", "🤔", "✨", "🚀", "😎"].map(
              (emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputContent((prev) => prev + emoji);
                    setIsEmojiOpen(false);
                  }}
                  className="hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              )
            )}
          </div>
        )}

        {isStickerOpen && (
          <div className="mx-4 mb-2 p-3 bg-[#1e2226] border border-[#343536] rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Reddit Snoo Stickers
              </span>
              <button
                type="button"
                onClick={() => setIsStickerOpen(false)}
                className="text-xs text-muted hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleSendSticker("😱")}
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#2a3036] transition-colors group"
              >
                <ScreamingSnooSticker size={70} />
                <span className="text-[10px] text-muted group-hover:text-white">Screaming</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendSticker("🔥")}
                className="text-3xl p-3 rounded-xl hover:bg-[#2a3036] transition-colors"
                title="Fire"
              >
                🔥
              </button>
              <button
                type="button"
                onClick={() => handleSendSticker("🎉")}
                className="text-3xl p-3 rounded-xl hover:bg-[#2a3036] transition-colors"
                title="Party"
              >
                🎉
              </button>
              <button
                type="button"
                onClick={() => handleSendSticker("👍")}
                className="text-3xl p-3 rounded-xl hover:bg-[#2a3036] transition-colors"
                title="Thumbs Up"
              >
                👍
              </button>
            </div>
          </div>
        )}

        {/* Chat Input Capsule Bar (Matching screenshot) */}
        <div className="p-3 bg-[#121518] border-t border-[#222528]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="reddit-chat-input-capsule flex items-center gap-2 px-3 py-1.5"
          >
            {/* Left Action Buttons: Image, Emoji, GIF */}
            <div className="flex items-center gap-1 text-muted">
              <button
                type="button"
                onClick={() => {
                  setIsAttachOpen((o) => !o);
                  setIsEmojiOpen(false);
                  setIsStickerOpen(false);
                }}
                className={`p-1.5 rounded-full hover:bg-[#2a3036] hover:text-white transition-colors ${
                  isAttachOpen ? "text-[#ff4500]" : ""
                }`}
                title="Attach Image or Meme"
                aria-label="Attach image"
              >
                <ImageIcon size={17} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEmojiOpen((o) => !o);
                  setIsAttachOpen(false);
                  setIsStickerOpen(false);
                }}
                className={`p-1.5 rounded-full hover:bg-[#2a3036] hover:text-white transition-colors ${
                  isEmojiOpen ? "text-[#ff4500]" : ""
                }`}
                title="Emojis"
                aria-label="Emojis"
              >
                <SmileIcon size={17} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsStickerOpen((o) => !o);
                  setIsAttachOpen(false);
                  setIsEmojiOpen(false);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-black border border-current hover:bg-[#2a3036] hover:text-white transition-colors ${
                  isStickerOpen ? "text-[#ff4500]" : ""
                }`}
                title="GIFs & Stickers"
                aria-label="Stickers"
              >
                GIF
              </button>
            </div>

            {/* Input field */}
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Message"
              className="flex-1 bg-transparent text-sm text-white placeholder-muted outline-none px-1"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputContent.trim() || isSending}
              className={`p-1.5 rounded-full transition-colors ${
                inputContent.trim()
                  ? "text-[#ff4500] hover:bg-[#2a3036]"
                  : "text-muted/40 cursor-not-allowed"
              }`}
              title="Send Message"
              aria-label="Send"
            >
              <SendIcon size={17} />
            </button>
          </form>
        </div>
      </div>

      {/* ============================================================ */}
      {/* New Chat Modal Dialog                                        */}
      {/* ============================================================ */}
      {isNewChatOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1e22] border border-[#343536] rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a3036]">
              <h3 className="text-base font-bold text-white">New Chat</h3>
              <button
                type="button"
                onClick={() => setIsNewChatOpen(false)}
                className="text-muted hover:text-white p-1"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="mt-3">
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="Type a username..."
                className="w-full bg-[#121518] border border-[#343536] rounded-xl px-3 py-2 text-sm text-white placeholder-muted outline-none focus:border-[#878a8c]"
              />
            </div>

            <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
              {usersList
                .filter((u) =>
                  u.username.toLowerCase().includes(searchUserQuery.toLowerCase())
                )
                .map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setActivePartner(u.username);
                      setIsNewChatOpen(false);
                      setShowMobileChat(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#252b30] text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ChatAvatar
                        username={u.username}
                        profileImage={u.profileImage}
                        size={32}
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{u.username}</div>
                        <div className="text-[0.7rem] text-muted font-mono">{u.karma} karma</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-pen">Chat</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
