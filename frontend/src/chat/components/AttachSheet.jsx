import { Image } from "lucide-react";

const AttachSheet = ({ open, onClose, onPickImage }) => {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-40 bg-black/40"
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 px-3 pb-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-base-100 rounded-2xl p-4 shadow-lg">
          <button
            onClick={onPickImage}
            className="btn btn-ghost w-full justify-start gap-3"
          >
            <Image className="w-5 h-5" />
            Image
          </button>

          <button
            onClick={onClose}
            className="btn btn-ghost w-full mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachSheet;
