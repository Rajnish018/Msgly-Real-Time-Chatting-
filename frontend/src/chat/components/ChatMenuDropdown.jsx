import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Star,
  CheckSquare,
  MailCheck,
  LogOut,
} from "lucide-react";

const ChatMenuDropdown = ({
  open,
  onClose,
  onNewGroup,
  onStarAll,
  onSelectAll,
  onMarkAllRead,
  onLogout,
}) => {
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute right-0 top-11 w-56 bg-base-100 border border-base-300 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <MenuItem icon={Plus} label="New group" onClick={onNewGroup} />
          <MenuItem icon={Star} label="Star all messages" onClick={onStarAll} />
          <MenuItem
            icon={CheckSquare}
            label="Select all chats"
            onClick={onSelectAll}
          />
          <MenuItem
            icon={MailCheck}
            label="Mark all as read"
            onClick={onMarkAllRead}
          />

          <div className="h-px bg-base-300 my-1" />

          <MenuItem
            icon={LogOut}
            label="Logout"
            onClick={onLogout}
            danger
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MenuItem = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-base-200 ${
      danger ? "text-red-500 hover:bg-red-500/10" : ""
    }`}
  >
    <Icon className="w-4 h-4 opacity-70" />
    {label}
  </button>
);

export default ChatMenuDropdown;
