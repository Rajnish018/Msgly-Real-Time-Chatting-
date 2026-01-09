import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import SidebarSkeleton from "../../components/skeletons/ChatPageSkeleton";
import NewChatSidebar from "./NewChatSidebar";
import ChatMenuDropdown from "./ChatMenuDropdown";
import { Search, MoreVertical, MessageSquare } from "lucide-react";

const ChatSidebar = () => {
  const {
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers, logout } = useAuthStore();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState("chats"); // chats | new-chat

  /* ---------------- Actions ---------------- */
  const markAllAsRead = () => {
    // UI-only; real impl should hit API
    users.forEach((u) => (u.unreadCount = 0));
    setMenuOpen(false);
  };

  const selectAllChats = () => {
    if (users.length) setSelectedUser(users[0]);
    setMenuOpen(false);
  };

  /* ---------------- Filtered Users ---------------- */
  const filteredUsers = useMemo(() => {
    let list = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) => {
        const nameMatch = u.fullName?.toLowerCase().includes(q);

        const lastMessageText =
          u.lastMessage?.text?.toLowerCase() || "";

        return nameMatch || lastMessageText.includes(q);
      });
    }

    if (filter === "unread") return list.filter((u) => u.unreadCount > 0);
    if (filter === "favourites") return list.filter((u) => u.isFavourite);
    if (filter === "groups") return list.filter((u) => u.isGroup);

    return list;
  }, [users, search, filter]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
<div className="h-full w-full bg-base-100 overflow-hidden">
      <AnimatePresence mode="wait">
        {view === "chats" ? (
          <motion.div
            key="chats"
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            {/* Header */}
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
                    onNewGroup={() => setMenuOpen(false)}
                    onStarAll={() => setMenuOpen(false)}
                    onSelectAll={selectAllChats}
                    onMarkAllRead={markAllAsRead}
                    onLogout={logout}
                  />
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats"
                  className="w-full pl-10 pr-4 py-2.5 bg-base-200 rounded-full outline-none"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {["all", "unread", "groups", "favourites"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                      filter === f
                        ? "bg-primary text-black"
                        : "bg-base-200 hover:bg-base-300"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <EmptyState />
              ) : (
                filteredUsers.map((user) => {
                  const isOnline = onlineUsers.includes(user._id);
                  const isActive = selectedUser?._id === user._id;

                  const lastMessageText =
                    user.lastMessage?.text
                      ? user.lastMessage.text
                      : user.lastMessage?.image
                      ? "📷 Photo"
                      : "";

                  return (
                    <button
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full px-4 py-3 flex gap-3 items-center transition ${
                        isActive
                          ? "bg-base-300"
                          : "hover:bg-base-200"
                      }`}
                    >
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

                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium truncate">
                          {user.fullName}
                        </p>

                        {/* ✅ SAFE STRING ONLY */}
                        <p className="text-sm opacity-60 truncate">
                          {lastMessageText}
                        </p>
                      </div>

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
          <motion.div
            key="new-chat"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <NewChatSidebar onBack={() => setView("chats")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- Empty State ---------------- */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <MessageSquare className="w-8 h-8 opacity-40 mb-4" />
    <h3 className="font-semibold">No chats found</h3>
    <p className="text-sm opacity-60">Start a new conversation</p>
  </div>
);

export default ChatSidebar;
