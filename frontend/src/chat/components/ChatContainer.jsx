import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { axiosInstance } from "../../lib/axios";

import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import ChatMessages from "./ChatMessages";
import ChatEmptyState from "./ChatEmptyState";
import MessageSkeleton from "../../components/skeletons/MessageSkeleton";

const ChatContainer = () => {
  console.log("Rendering ChatContainer");
  /* ======================
     STORES
  ====================== */
  const {
    selectedUser,
    messages,
    isMessagesLoading,
    getMessages,
  } = useChatStore();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;

    console.log("✅ Fetching messages for:", selectedUser._id);

    getMessages(selectedUser._id);

    axiosInstance
      .patch(`/messages/read/${selectedUser._id}`)
      .catch(() => {});
  }, [selectedUser?._id]);

  if (!selectedUser) return null;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-base-100">
      <ChatHeader />

      <div className="flex-1 min-h-0">
        {isMessagesLoading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <ChatMessages
            messages={messages}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
