import { Mic } from "lucide-react";
import toast from "react-hot-toast";
import { useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";

const CANCEL_DISTANCE = 80;

const MicButton = () => {
  const { sendMessage } = useChatStore();

  const [recording, setRecording] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const touchStartX = useRef(0);

  /* ================= START ================= */
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

  /* ================= SWIPE ================= */
  const handleSwipe = (e) => {
    const deltaX = touchStartX.current - e.touches[0].clientX;
    if (deltaX > CANCEL_DISTANCE) setCancelled(true);
  };

  /* ================= STOP ================= */
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
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
  );
};

export default MicButton;
