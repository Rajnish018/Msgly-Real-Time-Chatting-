import { useEffect, useRef, useState } from "react";
import { Image, Send, Smile, Mic, Paperclip } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";

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
  const waveformRef = useRef(null);
  const fileInputRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const touchStartX = useRef(0);

  /* ================= TYPING ================= */
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const { socket } = useAuthStore();
  const { sendMessage, selectedUser } = useChatStore();

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

  useEffect(() => {
    return () => stopTyping(); // cleanup on unmount / reload
  }, []);

  /* ================= AUTO RESIZE ================= */
  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 24 * MAX_ROWS) + "px";
  };

  /* ================= IMAGE PICK ================= */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      stopTyping();
      await sendMessage({ image: reader.result });
    };
    reader.readAsDataURL(file);

    setShowAttach(false);
    e.target.value = "";
  };

  /* ================= WAVEFORM ================= */
  const drawWaveform = () => {
    const canvas = waveformRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.fftSize;
    const data = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteTimeDomainData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = cancelled ? "#ef4444" : "#22c55e";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = data[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  /* ================= RECORD ================= */
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
        cancelAnimationFrame(animationRef.current);
        audioContextRef.current?.close();
        stream.getTracks().forEach((t) => t.stop());

        if (cancelled) return;

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendMessage({ audio: blob });
      };

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      source.connect(analyser);
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      recorder.start();
      setRecording(true);
      drawWaveform();
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

  /* ================= EMOJI SWIPE DOWN ================= */
  useEffect(() => {
    let startY = 0;

    const onTouchStart = (e) => (startY = e.touches[0].clientY);
    const onTouchMove = (e) => {
      if (e.touches[0].clientY - startY > 60) setShowEmoji(false);
    };

    if (showEmoji && emojiRef.current) {
      emojiRef.current.addEventListener("touchstart", onTouchStart);
      emojiRef.current.addEventListener("touchmove", onTouchMove);
    }

    return () => {
      emojiRef.current?.removeEventListener("touchstart", onTouchStart);
      emojiRef.current?.removeEventListener("touchmove", onTouchMove);
    };
  }, [showEmoji]);

  return (
    <div className="sticky bottom-0 bg-base-100 border-t p-2">
      {/* EMOJI */}
      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-full left-0 right-0 z-30">
          <EmojiPicker
            width="100%"
            onEmojiClick={(e) => setText((p) => p + e.emoji)}
          />
        </div>
      )}

      {/* ATTACHMENT SHEET */}
      {showAttach && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setShowAttach(false)}
        >
          <div
            className="absolute bottom-0 w-full bg-base-100 rounded-t-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => fileInputRef.current.click()}
              className="btn w-full mb-2"
            >
              <Image className="mr-2" /> Image
            </button>

            <button
              onClick={() => toast("Camera coming soon 📷")}
              className="btn w-full"
            >
              📷 Camera
            </button>

            <button
              onClick={() => setShowAttach(false)}
              className="btn btn-ghost w-full mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* WAVEFORM */}
      {recording && (
        <div className="mb-2">
          <canvas
            ref={waveformRef}
            height={40}
            className="w-full bg-base-200 rounded-lg"
          />
          <p className="text-xs text-center mt-1 text-error">
            {cancelled ? "Cancelled" : "Recording… swipe left to cancel"}
          </p>
        </div>
      )}

      {/* INPUT ROW */}
      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="btn btn-circle btn-ghost"
        >
          <Smile />
        </button>

        <button
          onClick={() => setShowAttach(true)}
          className="btn btn-circle btn-ghost"
        >
          <Paperclip />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            resizeTextarea();
            emitTyping();
          }}
          onBlur={stopTyping}
          placeholder="Message…"
          className="flex-1 resize-none input input-bordered rounded-2xl"
        />

        {!text.trim() && (
          <button
            onTouchStart={startRecording}
            onTouchMove={handleSwipe}
            onTouchEnd={stopRecording}
            className={`btn btn-circle ${recording ? "btn-error" : "btn-ghost"}`}
          >
            <Mic />
          </button>
        )}

        <button
          onClick={() => {
            if (!text.trim()) return;
            stopTyping();
            sendMessage({ text });
            setText("");
            textareaRef.current.style.height = "auto";
          }}
          className="btn btn-circle btn-primary"
          disabled={!text.trim()}
        >
          <Send />
        </button>
      </div>

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
