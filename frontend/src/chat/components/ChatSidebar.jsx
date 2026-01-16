import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreVertical, MessageSquare } from "lucide-react";

import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

import SidebarSkeleton from "../../components/skeletons/ChatPageSkeleton";
import NewChatSidebar from "./NewChatSidebar";
import ChatMenuDropdown from "./ChatMenuDropdown";

/* =========================================================
   CHAT SIDEBAR
========================================================= */
const ChatSidebar = () => {
  console.log("Rendering ChatSidebar");
  /* ======================
     STORES
  ====================== */
  const {
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();

  const { logout, onlineUsers } = useAuthStore();
  console.log("Online Users:", onlineUsers);
  console.log("Users in Sidebar:", users);
  console.log("Selected User:", selectedUser);

  /* ======================
     LOCAL STATE
  ====================== */
  const [search, setSearch] = useState("");
  const [filter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState("chats");

  /* ======================
     SAFE USER SELECT (🔥 IMPORTANT)
  ====================== */
  const handleSelectUser = useCallback(
    (user) => {
      if (!user?._id) return;

      // 🔒 block re-select of active chat
      if (selectedUser?._id === user._id) return;

      setSelectedUser(user);
    },
    [selectedUser?._id, setSelectedUser]
  );

  /* ======================
     FILTER USERS
  ====================== */
  const filteredUsers = useMemo(() => {
    let list = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) => {
        const nameMatch = u.fullName?.toLowerCase().includes(q);
        const lastMessageText = u.lastMessage?.text?.toLowerCase() || "";
        return nameMatch || lastMessageText.includes(q);
      });
    }

    if (filter === "unread") return list.filter((u) => u.unreadCount > 0);
    if (filter === "favourites") return list.filter((u) => u.isFavourite);
    if (filter === "groups") return list.filter((u) => u.isGroup);

    return list;
  }, [users, search, filter]);

  /* ======================
     LOADING
  ====================== */
  if (isUsersLoading) return <SidebarSkeleton />;

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="h-full w-full bg-base-100 overflow-hidden">
      <AnimatePresence mode="wait">
        {view === "chats" ? (
          <motion.div
            key="chats"
            className="h-full flex flex-col"
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
          >
            {/* ================= HEADER ================= */}
            <div className="p-4 border-b border-base-300">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Chats</h1>

                <div className="relative flex items-center gap-1">
                  <button
                    onClick={() => setView("new-chat")}
                    className="p-2 hover:bg-base-200 rounded-lg"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="p-2 hover:bg-base-200 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  <ChatMenuDropdown
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    onLogout={logout}
                  />
                </div>
              </div>

              {/* ================= SEARCH ================= */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats"
                  className="w-full pl-10 pr-4 py-2.5 bg-base-200 rounded-full outline-none"
                />
              </div>
            </div>

            {/* ================= CHAT LIST ================= */}
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <EmptyState />
              ) : (
                filteredUsers.map((user) => {
                  const isOnline = !!onlineUsers[user._id];
                  const isActive = selectedUser?._id === user._id;

                  return (
                    <button
                      key={user._id}
                      disabled={isActive} // 🔒 block re-click
                      onClick={() => handleSelectUser(user)}
                      className={`w-full px-4 py-3 flex gap-3 items-center transition
                        ${
                          isActive
                            ? "bg-base-300 cursor-default"
                            : "hover:bg-base-200"
                        }`}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          className="w-12 h-12 rounded-full object-cover"
                          alt={user.fullName}
                        />

                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium truncate">
                          {user.fullName}
                        </p>
                        <p className="text-sm opacity-60 truncate">
                          {user.lastMessage?.text || ""}
                        </p>
                      </div>

                      {/* Unread */}
                      {user.unreadCount > 0 && (
                        <span className="ml-auto bg-primary text-black text-xs font-semibold px-2 py-0.5 rounded-full">
                          {user.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : (
          <NewChatSidebar onBack={() => setView("chats")} />
        )}
      </AnimatePresence>
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <MessageSquare className="w-8 h-8 opacity-40 mb-4" />
    <h3 className="font-semibold">No chats found</h3>
    <p className="text-sm opacity-60">Start a new conversation</p>
  </div>
);

export default ChatSidebar;
