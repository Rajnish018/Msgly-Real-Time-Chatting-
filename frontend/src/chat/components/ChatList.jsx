import { MessageSquare } from "lucide-react";

const ChatList = ({
  users,
  selectedUser,
  onSelectUser,
  onlineUsers,
}) => {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageSquare className="w-8 h-8 opacity-40 mb-4" />
        <h3 className="font-semibold">No chats found</h3>
        <p className="text-sm opacity-60">Start a new conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {users.map((user) => {
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
            onClick={() => onSelectUser(user)}
            className={`w-full px-4 py-3 flex gap-3 items-center transition ${
              isActive ? "bg-base-300" : "hover:bg-base-200"
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
              <p className="font-medium truncate">{user.fullName}</p>
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
      })}
    </div>
  );
};

export default ChatList;
