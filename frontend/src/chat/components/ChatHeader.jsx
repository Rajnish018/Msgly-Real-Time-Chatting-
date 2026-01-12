import { X } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

/* =========================================================
   LAST SEEN FORMATTER
========================================================= */
const formatLastSeen = (timestamp) => {

  // console.log("🟡 last seen timestamp:", timestamp);

  if (!timestamp) return "last seen recently";

  const date = new Date(Number(timestamp));

  if (isNaN(date.getTime())) {
    return "last seen recently";
  }

  return `last seen at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};


const ChatHeader = () => {
  const {
    selectedUser,
    setSelectedUser,
    typingUsers,
    onlineUsers,
    lastSeenMap,
  } = useChatStore();

  if (!selectedUser) return null;

  //  ALWAYS normalize ID to string
  const userId = String(selectedUser._id);

  const isTyping = !!typingUsers?.[userId];
  const isOnline = !!onlineUsers?.[userId];
  const lastSeen = lastSeenMap?.[userId];

  const statusText = isTyping
    ? "typing…"
    : isOnline
    ? "online"
    : formatLastSeen(lastSeen);

 
  // console.log("presence", {
  //   selectedUser: userId,
  //   onlineUsers,
  //   lastSeenMap,
  // });

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

              {/* {isOnline && (
                <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-base-100" />
              )} */}
            </div>
          </div>

          {/* User Info */}
          <div className="leading-tight">
            <h3 className="font-medium truncate max-w-[180px]">
              {selectedUser.fullName}
            </h3>

            <p
              className={`text-xs transition-colors ${
                isTyping ? "text-primary" : "text-base-content/60"
              }`}
            >
              {statusText}
            </p>
          </div>
        </div>

        {/* CLOSE BUTTON */}
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
