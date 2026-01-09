import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";
import { CheckCheck, Check, Clock, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const ChatMessages = ({ messages, messagesEndRef }) => {
  const { authUser } = useAuthStore();
  const [reactingTo, setReactingTo] = useState(null);

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
    <div
      className="
        h-full
        overflow-y-auto
        p-4
        pb-24
        space-y-3
        bg-base-200/30
      "
    >
      {messages.map((msg) => {
        const isMine = msg.senderId === authUser._id;
        const status = getMessageStatus(msg);

        return (
          <div
            key={msg._id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div className="relative group max-w-[70%]">
              {/* MESSAGE BUBBLE */}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  isMine
                    ? "bg-primary text-primary-content rounded-br-none"
                    : "bg-base-200 text-base-content rounded-bl-none"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Attachment"
                    className="rounded-lg mb-2 max-w-full max-h-64 object-cover"
                  />
                )}

                {msg.text && (
                  <p className="whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}

                {/* TIME + STATUS */}
                <div
                  className={`flex items-center gap-1 mt-2 text-xs opacity-70 ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>{formatMessageTime(msg.createdAt)}</span>
                  {isMine && statusIcons[status]}
                </div>
              </div>

              {/* REACTION BUTTON */}
              <button
                onClick={() => setReactingTo(msg._id)}
                className={`
                  absolute top-2
                  ${isMine ? "-left-8" : "-right-8"}
                  opacity-0 group-hover:opacity-100
                  transition
                `}
              >
                <Smile size={16} />
              </button>

              {/* EMOJI PICKER */}
              {reactingTo === msg._id && (
                <div
                  className={`
                    absolute z-30 mt-2
                    ${isMine ? "right-full mr-2" : "left-full ml-2"}
                  `}
                >
                  <EmojiPicker
                    height={260}
                    onEmojiClick={(emoji) => {
                      console.log("reaction:", emoji.emoji, msg._id);
                      // TODO: send reaction to backend
                      setReactingTo(null);
                    }}
                  />
                </div>
              )}

              {/* REACTIONS DISPLAY */}
              {msg.reactions?.length > 0 && (
                <div
                  className={`flex gap-1 mt-1 text-sm ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.reactions.map((r, i) => (
                    <span
                      key={i}
                      className="bg-base-100 px-2 py-0.5 rounded-full shadow"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
