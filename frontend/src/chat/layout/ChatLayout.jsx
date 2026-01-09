import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import ChatSidebar from "../components/ChatSidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import ChatPageSkeleton from "../../components/skeletons/ChatPageSkeleton";
import SlidePanel from "../../components/SlidePanel";
import { useChatStore } from "../../store/useChatStore";

const ChatLayout = () => {
  const { selectedUser, isUsersLoading, getUsers } = useChatStore();

  useEffect(() => {
    getUsers();
  }, []);

  if (isUsersLoading) return <ChatPageSkeleton />;

  return (
    <div className="h-full w-full bg-base-100 overflow-hidden">

      {/* ================= DESKTOP LAYOUT ================= */}
      <div className="hidden md:flex h-full w-full">
        {/* Sidebar */}
        <div className="w-[380px] lg:w-[420px] flex-shrink-0 border-r border-base-300">
          <ChatSidebar />
        </div>

        {/* Chat */}
        <div className="flex-1 h-full">
          {selectedUser ? <ChatContainer /> : <NoChatSelected />}
        </div>
      </div>

      {/* ================= MOBILE LAYOUT ================= */}
      <div className="md:hidden h-full w-full relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!selectedUser ? (
            <SlidePanel key="sidebar" direction="left">
              <ChatSidebar />
            </SlidePanel>
          ) : (
            <SlidePanel key="chat" direction="right">
              <ChatContainer />
            </SlidePanel>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default ChatLayout;
