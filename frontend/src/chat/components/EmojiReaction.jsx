import { useEffect, useRef, useState } from "react";
import { Smile, Plus } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

/**
 * isMine = true  → sent message (open LEFT)
 * isMine = false → received message (open RIGHT)
 */
const EmojiReaction = ({ onReact, isMine }) => {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const ref = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* 🙂 Emoji button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded-full bg-base-100 shadow hover:bg-base-200"
      >
        <Smile className="w-4 h-4" />
      </button>

      {/* Reaction bar */}
      {open && (
        <div
          className={`absolute bottom-7 z-50 flex items-center gap-2 px-3 py-2
            bg-base-100 rounded-full shadow-lg
            ${isMine ? "right-0" : "left-0"}
          `}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(emoji);
                setOpen(false);
              }}
              className="text-xl hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}

          <button
            onClick={() => setPickerOpen(true)}
            className="p-1 rounded-full hover:bg-base-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {pickerOpen && (
        <div
          className={`absolute bottom-14 z-50
            ${isMine ? "right-0 origin-bottom-right" : "left-0 origin-bottom-left"}
          `}
        >
          <EmojiPicker
            height={350}
            width={300}
            onEmojiClick={(e) => {
              onReact(e.emoji);
              setPickerOpen(false);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiReaction;
