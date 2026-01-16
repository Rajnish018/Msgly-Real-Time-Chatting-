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
  console.log("Rendering MessageInput");
  /* ================= STATE ================= */
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [recording, setRecording] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  /* ================= REFS ================= */
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const touchStartX = useRef(0);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  /* ================= STORES ================= */
  const socket = useAuthStore((s) => s.socket);
  const { sendMessage, selectedUser } = useChatStore();

  /* ================= TYPING ================= */
  const emitTyping = () => {
    if (!socket || !selectedUser) {
      console.log("⚠️ emitTyping skipped (no socket or selectedUser)");
      return;
    }

    if (!isTypingRef.current) {
      console.log("✍️ EMIT typing →", selectedUser._id);
      socket.emit("typing", { to: selectedUser._id });
      isTypingRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      console.log("⌛ TYPING IDLE → stopTyping");
      socket.emit("stopTyping", { to: selectedUser._id });
      isTypingRef.current = false;
    }, TYPING_IDLE);
  };

  const stopTyping = () => {
    if (!socket || !selectedUser || !isTypingRef.current) {
      console.log("⚠️ stopTyping skipped");
      return;
    }

    console.log("🛑 EMIT stopTyping →", selectedUser._id);
    socket.emit("stopTyping", { to: selectedUser._id });
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
  };

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      console.log("🧹 MessageInput unmount → force stopTyping");
      stopTyping();
    };
  }, []);

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
    if (!file || !selectedUser) {
      console.log("⚠️ image skipped");
      return;
    }

    console.log("🖼️ IMAGE selected:", file.name);

    const reader = new FileReader();
    reader.onloadend = async () => {
      console.log("📤 IMAGE send");
      await sendMessage({ image: reader.result });
    };
    reader.readAsDataURL(file);

    setShowAttach(false);
    e.target.value = "";
  };

  /* ================= AUDIO ================= */
  const startRecording = async (e) => {
    try {
      console.log("🎙️ START recording");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      setCancelled(false);

      if (e.touches) {
        touchStartX.current = e.touches[0].clientX;
      }

      recorder.ondataavailable = (ev) => {
        audioChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        if (cancelled || !audioChunksRef.current.length) {
          console.log("❌ AUDIO cancelled");
          audioChunksRef.current = [];
          return;
        }

        console.log("📤 AUDIO send");
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
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
    if (deltaX > CANCEL_DISTANCE) {
      console.log("↩️ AUDIO cancel swipe");
      setCancelled(true);
    }
  };

  const stopRecording = () => {
    console.log("🛑 STOP recording");
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  /* ================= SEND ================= */
  const handleSend = () => {
    if (!text.trim() || !selectedUser) {
      console.log("⚠️ send blocked");
      return;
    }

    console.log("📤 SEND text:", text);

    stopTyping();
    sendMessage({ text });
    setText("");
    textareaRef.current.style.height = "auto";
  };

  /* ================= RENDER ================= */
  return (
    <div className="relative sticky bottom-0 w-full px-3 pb-3 bg-base-100">
      {/* EMOJI */}
      {showEmoji && (
        <div className="absolute bottom-[72px] left-3 right-3 z-40">
          <EmojiPicker
            width="100%"
            theme="auto"
            onEmojiClick={(e) => {
              console.log("😀 emoji:", e.emoji);
              setText((p) => p + e.emoji);
              resizeTextarea();
            }}
          />
        </div>
      )}

      {/* ATTACH */}
      <AttachSheet
        open={showAttach}
        onClose={() => setShowAttach(false)}
        onPickImage={() => fileInputRef.current.click()}
      />

      {/* INPUT BAR */}
      <div className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-2 shadow-sm">
        <button onClick={() => setShowAttach(true)} className="btn btn-ghost btn-circle btn-sm">
          <Plus className="w-5 h-5" />
        </button>

        <button onClick={() => setShowEmoji((v) => !v)} className="btn btn-ghost btn-circle btn-sm">
          <Smile className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          placeholder="Type a message"
          onChange={(e) => {
            const value = e.target.value;
            console.log("⌨️ INPUT:", value);
            setText(value);
            resizeTextarea();
            value.trim() ? emitTyping() : stopTyping();
          }}
          onBlur={stopTyping}
          className="flex-1 bg-transparent resize-none outline-none text-sm py-1"
        />

        {!text.trim() ? (
          <button
            onTouchStart={startRecording}
            onTouchMove={handleSwipe}
            onTouchEnd={stopRecording}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            className={`btn btn-circle btn-sm ${recording ? "btn-error" : "btn-ghost"}`}
          >
            <Mic className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={handleSend} className="btn btn-circle btn-sm btn-primary">
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
