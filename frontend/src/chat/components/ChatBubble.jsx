import { ChevronDown } from "lucide-react";
import EmojiReaction from "./EmojiReaction";
import { formatMessageTime } from "../../lib/utils";

const ChatBubble = ({
  msg,
  isMine,
  statusIcon,
  onReact,
  onOpenMenu=()=>{}, // ✅ correct prop
}) => {
  return (
    <div
      className={`relative group chat-bubble
        ${isMine
          ? "bg-primary text-primary-content rounded-br-none"
          : "bg-base-100 text-base-content rounded-bl-none"}
        max-w-[85%] md:max-w-[78%]
        px-3 py-1.5
        rounded-lg shadow-sm
        text-sm`}
    >
      {/* ⬇ Arrow button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();

          onOpenMenu({
            msg,
            isMine,
            rect,
          });
        }}
        className={`absolute top-1
          ${isMine ? "-left-7" : "-right-7"}
          opacity-0 group-hover:opacity-100 transition
          p-1 rounded-full bg-base-200 shadow`}
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* 🙂 Emoji reactions */}
      <div
        className={`absolute top-1
          ${isMine ? "-left-14" : "-right-14"}
          opacity-0 group-hover:opacity-100 transition`}
      >
        <EmojiReaction
          isMine={isMine}
          onReact={(emoji) => onReact(msg._id, emoji)}
        />
      </div>

      {/* Message text */}
      <p className="whitespace-pre-wrap break-words leading-snug">
        {msg.text}
      </p>

      {/* Footer */}
      <div
        className={`flex items-center gap-1 mt-0.5 text-[11px] opacity-60
          ${isMine ? "justify-end" : "justify-start"}`}
      >
        <span>{formatMessageTime(msg.createdAt)}</span>
        {isMine && statusIcon}
      </div>
    </div>
  );
};

export default ChatBubble;
