import {
  FileText,
  Image,
  Camera,
  Headphones,
  User,
  BarChart2,
  Calendar,
  Sticker,
} from "lucide-react";

const actions = [
  { label: "Document", icon: FileText, color: "text-purple-500" },
  { label: "Photos & videos", icon: Image, color: "text-blue-500", key: "image" },
  { label: "Camera", icon: Camera, color: "text-pink-500" },
  { label: "Audio", icon: Headphones, color: "text-orange-500" },
  { label: "Contact", icon: User, color: "text-sky-500" },
  { label: "Poll", icon: BarChart2, color: "text-yellow-500" },
  { label: "Event", icon: Calendar, color: "text-red-500" },
  { label: "New sticker", icon: Sticker, color: "text-green-500" },
];

const AttachSheet = ({ open, onClose, onPickImage }) => {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-40"
      />

      {/* Sheet */}
      <div className="absolute bottom-[72px] left-3 right-55 z-50">
        <div className="bg-base-100 rounded-xl shadow-xl p-2">
          {actions.map(({ label, icon: Icon, color, key }) => (
            <button
              key={label}
              onClick={() => {
                if (key === "image") onPickImage?.();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2
                         hover:bg-base-200 rounded-lg transition"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AttachSheet;
