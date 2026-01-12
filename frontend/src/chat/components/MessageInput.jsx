import { useEffect, useRef, useState } from "react";
import { Send, Smile, Mic, Plus } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import AttachSheet from "./AttachSheet";

import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

const MAX_ROWS = 5;
const CANCEL_DISTANCE = 80;
const TYPING_IDLE = 1200;

const MessageInput = () => {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [recording, setRecording] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const textareaRef = useRef(null);
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const touchStartX = useRef(0);

  const { socket } = useAuthStore();
  const { sendMessage, selectedUser } = useChatStore();

  /* ================= TYPING ================= */
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const emitTyping = () => {
    if (!socket || !selectedUser) return;

    if (!isTypingRef.current) {
      socket.emit("typing", { to: selectedUser._id });
      isTypingRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { to: selectedUser._id });
      isTypingRef.current = false;
    }, TYPING_IDLE);
  };

  const stopTyping = () => {
    if (!socket || !isTypingRef.current || !selectedUser) return;
    socket.emit("stopTyping", { to: selectedUser._id });
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
  };

  useEffect(() => stopTyping, []);

  /* ================= AUTO RESIZE ================= */
  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 24 * MAX_ROWS) + "px";
  };

  /* ================= IMAGE ================= */
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
    };
    reader.readAsDataURL(file);

    setShowAttach(false);
    e.target.value = "";
  };

  /* ================= AUDIO ================= */
  const startRecording = async (e) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      setCancelled(false);
      touchStartX.current = e.touches[0].clientX;

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (cancelled) return;

        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        await sendMessage({ audio: blob });
      };

      recorder.start();
      setRecording(true);
    } catch {
      toast.error("Microphone permission denied");
    }
  };

  const handleSwipe = (e) => {
    const deltaX = touchStartX.current - e.touches[0].clientX;
    if (deltaX > CANCEL_DISTANCE) setCancelled(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  /* ================= SEND ================= */
  const handleSend = () => {
    if (!text.trim()) return;
    stopTyping();
    sendMessage({ text });
    setText("");
    textareaRef.current.style.height = "auto";
  };

  return (
    <div className="relative sticky bottom-0 w-full px-3 pb-3 bg-base-100">
      {/* EMOJI PICKER */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="absolute bottom-[72px] left-3 right-3 z-40"
        >
          <EmojiPicker
            width="100%"
            theme="auto"
            onEmojiClick={(e) => setText((p) => p + e.emoji)}
          />
        </div>
      )}

      {/* ATTACHMENT SHEET — SAME WIDTH AS INPUT */}
      <AttachSheet
  open={showAttach}
  onClose={() => setShowAttach(false)}
  onPickImage={() => fileInputRef.current.click()}
/>


      {/* INPUT BAR */}
      <div className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-2 shadow-sm">
        {/* PLUS */}
        <button
          onClick={() => setShowAttach(true)}
          className="btn btn-ghost btn-circle btn-sm"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* EMOJI */}
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="btn btn-ghost btn-circle btn-sm"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* TEXT */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          placeholder="Type a message"
          onChange={(e) => {
            setText(e.target.value);
            resizeTextarea();
            emitTyping();
          }}
          onBlur={stopTyping}
          className="flex-1 bg-transparent resize-none outline-none
                     text-sm leading-normal max-h-32
                     text-base-content placeholder:text-base-content/50
                     py-1 align-top"
        />

        {/* MIC ↔ SEND */}
        {!text.trim() ? (
          <button
            onTouchStart={startRecording}
            onTouchMove={handleSwipe}
            onTouchEnd={stopRecording}
            className={`btn btn-circle btn-sm ${
              recording ? "btn-error" : "btn-ghost"
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            className="btn btn-circle btn-sm btn-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageChange}
      />
    </div>
  );
};

export default MessageInput;
