import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import ChatMessages from "./ChatMessages";
import ChatEmptyState from "./ChatEmptyState";
import ChatLoadingState from "./ChatLoadingState";
import { axiosInstance } from "../../lib/axios";

const ChatContainer = () => {
  const {
    messages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToTyping,
    unsubscribeFromTyping,
  } = useChatStore();

  const messagesEndRef = useRef(null);

  /* =========================================================
     SOCKET + READ RECEIPT
  ========================================================= */
  useEffect(() => {
    if (!selectedUser?._id) return;

    subscribeToMessages();
    subscribeToTyping();

    // mark messages as read
    axiosInstance.patch(`/messages/read/${selectedUser._id}`);

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTyping();
    };
  }, [selectedUser?._id]);

  /* =========================================================
     AUTO SCROLL (WHATSAPP STYLE)
  ========================================================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  /* =========================================================
     EMPTY STATE
  ========================================================= */
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-base-content/60">
        Select a chat
      </div>
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */
  if (isMessagesLoading) {
    return <ChatLoadingState />;
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-base-100">
      {/* HEADER */}
      <div className="shrink-0 border-b border-base-300">
        <ChatHeader />
      </div>

      {/* MESSAGES — ONLY SCROLL AREA */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2">
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <ChatMessages
            messages={messages}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>

      {/* INPUT — FIXED BOTTOM */}
      <div className="shrink-0 border-t border-base-300 bg-base-100">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;
