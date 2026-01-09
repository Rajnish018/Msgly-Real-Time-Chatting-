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
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToTyping,
    unsubscribeFromTyping,
  } = useChatStore();

  const messagesEndRef = useRef(null);

  /* ================= FETCH + SOCKET ================= */
  useEffect(() => {
    if (!selectedUser?._id) return;

    subscribeToMessages();
    subscribeToTyping();

    getMessages(selectedUser._id);
    axiosInstance.patch(`/messages/read/${selectedUser._id}`);

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTyping();
    };
  }, [getMessages, selectedUser._id, subscribeToMessages, subscribeToTyping, unsubscribeFromMessages, unsubscribeFromTyping]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= EMPTY ================= */
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-base-content/60">
        Select a chat
      </div>
    );
  }

  /* ================= LOADING ================= */
  if (isMessagesLoading) {
    return <ChatLoadingState />;
  }

  return (
  <div className="flex flex-col bg-base-100 h-full w-full">

    {/* HEADER (fixed) */}
    <div className="shrink-0 sticky top-0 z-10 bg-base-100">
      <ChatHeader />
    </div>

    {/* MESSAGES (scrollable) */}
    <div className="flex-1 min-h-0">
      {messages.length === 0 ? (
        <ChatEmptyState />
      ) : (
        <ChatMessages
          messages={messages}
          messagesEndRef={messagesEndRef}
        />
      )}
    </div>

    {/* INPUT (fixed bottom) */}
    <div
  className="
    shrink-0
    sticky
    bottom-5
    z-10
    bg-base-100/95
    backdrop-blur
    border-t border-base-300
    shadow-[0_-4px_12px_rgba(0,0,0,0.04)]
    rounded-t-xl
    md:rounded-none
  "
>
  <MessageInput />
</div>


  </div>
);
}

export default ChatContainer;
