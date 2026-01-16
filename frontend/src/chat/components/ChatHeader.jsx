import { useState, useRef, useEffect } from "react";
import {
  Search,
  MoreVertical,
  Info,
  BellOff,
  Clock,
  Lock,
  Heart,
  XCircle,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

/* =========================================================
   LAST SEEN FORMATTER
========================================================= */
const formatLastSeen = (timestamp) => {
  if (!timestamp) return "last seen recently";

  const date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return "last seen recently";

  return `last seen at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const ChatHeader = () => {
  console.log("Rendering ChatHeader");
  /* ======================
     STORES
  ====================== */
  const {
    selectedUser,
    typingUsers,
    onlineUsers,
    lastSeenMap,
    clearSelectedUser,
    clearTyping,
  } = useChatStore();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  /* ======================
     CLOSE MENU ON OUTSIDE CLICK
  ====================== */
  useEffect(() => {
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!selectedUser) return null;

  const userId = String(selectedUser._id);
  const isTyping = !!typingUsers?.[userId];
  const isOnline = !!onlineUsers?.[userId];
  const lastSeen = lastSeenMap?.[userId];

  const statusText = isTyping
    ? "typing…"
    : isOnline
    ? "online"
    : formatLastSeen(lastSeen);

  const handleCloseChat = () => {
    clearTyping();        // 🔥 clear typing state
    clearSelectedUser();  // 🔥 close chat safely
    setOpenMenu(false);
  };

  return (
    <div className="h-14 px-3 border-b border-base-300 bg-base-100 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <img
          src={selectedUser.profilePic || "/avatar.png"}
          alt={selectedUser.fullName}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>
          <h3 className="text-sm font-medium text-white truncate max-w-[180px]">
            {selectedUser.fullName}
          </h3>
          <p
            className={`text-xs ${
              isTyping ? "text-green-400" : "text-white/60"
            }`}
          >
            {statusText}
          </p>
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-2 relative" ref={menuRef}>
        <button className="p-2 rounded-full hover:bg-white/10">
          <Search className="w-5 h-5 text-white/80" />
        </button>

        <button
          onClick={() => setOpenMenu((p) => !p)}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <MoreVertical className="w-5 h-5 text-white/80" />
        </button>

        {openMenu && (
          <div className="absolute right-0 top-12 w-56 bg-[#233138] rounded-md shadow-xl overflow-hidden z-50">
            <MenuItem icon={Info} label="Contact info" />
            <MenuItem icon={Info} label="Business details" />
            <MenuItem icon={CheckIcon} label="Select messages" />
            <MenuItem icon={BellOff} label="Mute notifications" />
            <MenuItem icon={Clock} label="Disappearing messages" />
            <MenuItem icon={Lock} label="Lock chat" />
            <MenuItem icon={Heart} label="Add to favourites" />

            <MenuItem
              icon={XCircle}
              label="Close chat"
              onClick={handleCloseChat}
            />

            <Divider />

            <MenuItem icon={ShieldAlert} label="Report" />
            <MenuItem icon={ShieldAlert} label="Block" danger />
            <MenuItem icon={Trash2} label="Clear chat" />
            <MenuItem icon={Trash2} label="Delete chat" />
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   MENU ITEM
========================================================= */
const MenuItem = ({ icon: Icon, label, danger, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm text-left
      ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-white/80 hover:bg-white/10"
      }
    `}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const Divider = () => (
  <div className="h-px bg-white/10 my-1" />
);

const CheckIcon = () => (
  <span className="w-4 h-4 flex items-center justify-center border border-white/40 rounded-sm text-xs">
    ✓
  </span>
);

export default ChatHeader;
