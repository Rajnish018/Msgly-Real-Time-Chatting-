import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import SidebarNavbar from "../components/SidebarNavbar";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const AppLayout = () => {
  console.log("Rendering AppLayout");
  const socket = useAuthStore((s) => s.socket);

  const {
    subscribeToPresence,
    unsubscribeFromPresence,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToTyping,
    unsubscribeFromTyping,
  } = useChatStore();

  useEffect(() => {
    if (!socket) return;

    // ✅ ALL socket listeners
    subscribeToPresence();
    subscribeToMessages();
    subscribeToTyping();

    return () => {
      unsubscribeFromPresence();
      unsubscribeFromMessages();
      unsubscribeFromTyping();
    };
  }, [socket]);

  return (
    <div className="h-screen flex bg-base-100">
      <SidebarNavbar />
      <main className="flex-1 h-full md:pl-16 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
