import { useEffect } from "react";
import { CheckCheck, Check, Clock } from "lucide-react";

import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

import ChatBubble from "./ChatBubble";
import MessageActionMenu from "./MessageActionMenu";
import { useMessageMenu } from "./useMessageMenu";

/* =========================================================
   TYPING INDICATOR
========================================================= */
const TypingBubble = () => (
  <div className="flex gap-1 px-3 py-2 bg-base-200 rounded-2xl rounded-bl-none">
    <span className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce" />
    <span className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce delay-150" />
    <span className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce delay-300" />
  </div>
);

/* =========================================================
   CHAT MESSAGES
========================================================= */
const ChatMessages = ({ messages = [], messagesEndRef }) => {
  console.log("Rendering ChatMessages Component");
  /* ======================
     STORES
  ====================== */
  const authUser = useAuthStore((s) => s.authUser);
  console.log("Auth User:", authUser.data._id);
  
  const authId = authUser.data?._id?.toString();


  const { selectedUser, typingUsers } = useChatStore();
  const selectedUserId = selectedUser?._id?.toString();

  const isTyping = !!typingUsers?.[selectedUserId];

  const { menu, openMenu, closeMenu } = useMessageMenu();

  console.log("Selected User ID:", selectedUserId);
  console.log("authId:", authId);
  console.log("isTyping:", isTyping);

  /* ================= SAFETY GUARD ================= */
  if (!authId || !selectedUser) return null;

  console.log("Rendering ChatMessages:", { messages, isTyping });

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ================= STATUS ICONS ================= */
  const statusIcons = {
    sending: <Clock className="w-3 h-3 animate-pulse" />,
    sent: <Check className="w-3 h-3 opacity-50" />,
    read: <CheckCheck className="w-3 h-3 text-primary" />,
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-3 space-y-3 bg-base-200/30">
      {messages.map((msg) => {
        const senderId =
          typeof msg.senderId === "object"
            ? msg.senderId?._id?.toString()
            : msg.senderId?.toString();

        const isMine = senderId === authId;

        const status = msg.sending
          ? "sending"
          : msg.isRead
          ? "read"
          : "sent";

        return (
          <div
            key={msg._id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <ChatBubble
              msg={msg}
              isMine={isMine}
              statusIcon={statusIcons[status]}
              onOpenMenu={openMenu}
              onReact={(emoji, message) => {
                console.log("REACTION:", emoji, message._id);
              }}
            />
          </div>
        );
      })}

      {/* ================= TYPING ================= */}
      {isTyping && (
        <div className="flex justify-start">
          <TypingBubble />
        </div>
      )}

      {/* ================= MESSAGE MENU ================= */}
      <MessageActionMenu menu={menu} closeMenu={closeMenu} />

      {/* ================= SCROLL ANCHOR ================= */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
