import { useEffect, useRef } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import ChatPageSkeleton from "../../components/skeletons/ChatPageSkeleton";
import SlidePanel from "../../components/SlidePanel";
import { useChatStore } from "../../store/useChatStore";

const ChatLayout = () => {
  console.log("Rendering ChatLayout");
  const { selectedUser, isUsersLoading, getUsers } = useChatStore();
  const initializedRef = useRef(false);

  // Fetch users once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <ChatPageSkeleton />;

  return (
    <div className="h-screen w-full bg-base-100 overflow-hidden">
      {/* DESKTOP */}
      <div className="hidden md:flex h-full">
        {/* Sidebar always visible */}
        <div className="w-[380px] lg:w-[420px] border-r border-base-300">
          <ChatSidebar />
        </div>

        {/* Content controlled ONLY by selectedUser */}
        <div className="flex-1 h-full">
          {selectedUser ? <ChatContainer /> : <NoChatSelected />}
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden h-full relative">
        {selectedUser ? (
          <SlidePanel direction="right">
            <ChatContainer />
          </SlidePanel>
        ) : (
          <SlidePanel direction="left">
            <ChatSidebar />
          </SlidePanel>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
