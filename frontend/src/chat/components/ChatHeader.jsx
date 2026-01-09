import { X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(String(selectedUser._id));

//   console.log("🧠 ChatHeader render", {
//   typingUser,
//   selectedUser: selectedUser?._id,
// });


  // 🔥 FIX: string comparison
  const isTyping =
    String(typingUser) === String(selectedUser._id);

  const statusText = isTyping
    ? "typing…"
    : isOnline
    ? "online"
    : "last seen recently";

  return (
    <div className="p-2.5 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-base-100" />
              )}
            </div>
          </div>

          {/* User info */}
          <div className="leading-tight">
            <h3 className="font-medium truncate max-w-[180px]">
              {selectedUser.fullName}
            </h3>

            <p
              className={`text-xs ${
                isTyping ? "text-primary" : "text-base-content/60"
              }`}
            >
              {statusText}
            </p>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={() => setSelectedUser(null)}
          className="p-2 rounded-full hover:bg-base-200"
          aria-label="Close chat"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
