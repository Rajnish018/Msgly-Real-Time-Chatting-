import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import ChatSidebar from "../components/ChatSidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import ChatPageSkeleton from "../../components/skeletons/ChatPageSkeleton";
import SlidePanel from "../../components/SlidePanel";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

const ChatLayout = () => {
  const {
    selectedUser,
    isUsersLoading,
    getUsers,
    subscribeToUserStatus,
    unsubscribeFromUserStatus,
  } = useChatStore();

  const { isSocketConnected, socket } = useAuthStore();

  /* ======================
     LOAD USERS ONCE
  ====================== */
  useEffect(() => {
    getUsers();
  }, []);

  /* ======================
     PRESENCE SUBSCRIPTION (FIXED)
  ====================== */
  useEffect(() => {
    if (!isSocketConnected || !socket) {
      console.log("⛔ ChatLayout: socket not connected yet");
      return;
    }

    console.log("🟢 ChatLayout: socket connected", socket.id);

    subscribeToUserStatus();

    return () => {
      unsubscribeFromUserStatus();
    };
  }, [isSocketConnected]); // 🔥 KEY FIX

  if (isUsersLoading) return <ChatPageSkeleton />;

  return (
    <div className="h-screen w-full overflow-hidden bg-base-100">
      {/* ================= DESKTOP ================= */}
      <div className="hidden md:flex h-full w-full">
        <div className="w-[380px] lg:w-[420px] flex-shrink-0 border-r border-base-300 overflow-hidden">
          <ChatSidebar />
        </div>

        <div className="flex-1 h-full overflow-hidden">
          {selectedUser ? <ChatContainer /> : <NoChatSelected />}
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden h-full w-full relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!selectedUser ? (
            <SlidePanel key="sidebar" direction="left">
              <div className="h-full overflow-hidden">
                <ChatSidebar />
              </div>
            </SlidePanel>
          ) : (
            <SlidePanel key="chat" direction="right">
              <div className="h-full overflow-hidden">
                <ChatContainer />
              </div>
            </SlidePanel>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatLayout;
