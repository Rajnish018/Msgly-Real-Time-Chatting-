import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { formatMessageTime } from "../../lib/utils";
import { CheckCheck, Check, Clock, Smile, Trash2, Edit3 } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const EDIT_TIME_LIMIT = 15 * 60 * 1000;

/* ================= TYPING ================= */
const TypingBubble = () => (
  <div className="flex items-center gap-1 px-3 py-2 bg-base-200 rounded-2xl rounded-bl-none max-w-fit">
    <span className="flex gap-1">
      <span className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce" />
      <span className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce [animation-delay:300ms]" />
    </span>
  </div>
);

const ChatMessages = ({ messages, messagesEndRef }) => {
  const { authUser } = useAuthStore();
  const {
    selectedUser,
    typingUsers,
    editMessage,
    deleteMessage,
    reactToMessage,
  } = useChatStore();

  const [reactingTo, setReactingTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const isTyping = typingUsers?.[selectedUser?._id];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  const getMessageStatus = (msg) => {
    if (msg.senderId !== authUser._id) return null;
    if (msg.isRead) return "read";
    return "delivered";
  };

  const statusIcons = {
    delivered: <CheckCheck className="w-3 h-3 opacity-40" />,
    read: <CheckCheck className="w-3 h-3 text-primary" />,
    sending: <Clock className="w-3 h-3 animate-pulse" />,
    sent: <Check className="w-3 h-3" />,
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-3 space-y-2 bg-base-200/30 overscroll-contain">
      {messages.map((msg) => {
        const isMine = msg.senderId === authUser._id;
        const status = getMessageStatus(msg);
        const canEdit =
          isMine &&
          !msg.deletedForEveryone &&
          Date.now() - new Date(msg.createdAt).getTime() <
            EDIT_TIME_LIMIT;

        return (
          <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div className="relative group max-w-[70%]">
              {/* MESSAGE BUBBLE */}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  isMine
                    ? "bg-primary text-primary-content rounded-br-none"
                    : "bg-base-200 text-base-content rounded-bl-none"
                }`}
              >
                {/* DELETED */}
                {msg.deletedForEveryone ? (
                  <p className="italic text-sm opacity-60">
                    This message was deleted
                  </p>
                ) : (
                  <>
                    {/* IMAGE */}
                    {msg.image && (
                      <img
                        src={msg.image}
                        className="rounded-lg mb-2 max-w-full max-h-64"
                      />
                    )}

                    {/* TEXT / EDIT */}
                    {editingId === msg._id ? (
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            editMessage(msg._id, editText);
                            setEditingId(null);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => setEditingId(null)}
                        autoFocus
                        className="input input-sm w-full"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap break-words">
                        {msg.text}
                        {msg.edited && (
                          <span className="text-xs opacity-50 ml-1">
                            (edited)
                          </span>
                        )}
                      </p>
                    )}

                    {/* TIME */}
                    <div
                      className={`flex items-center gap-1 mt-2 text-xs opacity-70 ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {isMine && statusIcons[status]}
                    </div>
                  </>
                )}
              </div>

              {/* ACTIONS */}
              {isMine && !msg.deletedForEveryone && (
                <>
                  {canEdit && (
                    <button
                      onClick={() => {
                        setEditingId(msg._id);
                        setEditText(msg.text);
                      }}
                      className="absolute -left-7 top-2 opacity-0 group-hover:opacity-100"
                    >
                      <Edit3 size={14} />
                    </button>
                  )}

                  <button
                    onClick={() =>
                      deleteMessage(msg._id, {
                        forEveryone: true,
                      })
                    }
                    className="absolute -left-7 top-8 opacity-0 group-hover:opacity-100 text-error"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}

              {/* REACTIONS */}
              <button
                onClick={() => setReactingTo(msg._id)}
                className={`absolute top-2 ${
                  isMine ? "-left-8" : "-right-8"
                } opacity-0 group-hover:opacity-100`}
              >
                <Smile size={16} />
              </button>

              {msg.reactions?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {msg.reactions.map((r, i) => (
                    <span
                      key={i}
                      className="bg-base-100 text-sm px-2 py-0.5 rounded-full shadow"
                    >
                      {r.emoji} {r.count}
                    </span>
                  ))}
                </div>
              )}

              {reactingTo === msg._id && (
                <div
                  className={`absolute z-30 mt-2 ${
                    isMine ? "right-full mr-2" : "left-full ml-2"
                  }`}
                >
                  <EmojiPicker
                    height={260}
                    onEmojiClick={(emoji) => {
                      reactToMessage(msg._id, emoji.emoji);
                      setReactingTo(null);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* TYPING */}
      {isTyping && (
        <div className="flex justify-start">
          <TypingBubble />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
