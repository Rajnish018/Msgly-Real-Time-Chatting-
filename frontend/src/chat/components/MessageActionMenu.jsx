import { createPortal } from "react-dom";
import { Reply, Copy, Forward, Trash2 } from "lucide-react";

const actions = [
  { label: "Reply", icon: Reply },
  { label: "Copy", icon: Copy },
  { label: "Forward", icon: Forward },
  { label: "Delete", icon: Trash2, danger: true },
];

const MessageActionMenu = ({ menu, closeMenu }) => {
  if (!menu) return null;

  const { rect, isMine, openUp } = menu;

  return createPortal(
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={closeMenu}
      />

      {/* menu */}
      <div
        className="fixed z-50 w-52 rounded-xl bg-neutral text-neutral-content shadow-xl py-2"
        style={{
          top: openUp
            ? rect.top - 10        // 👆 OPEN UP
            : rect.bottom + 6,     // 👇 OPEN DOWN
          transform: openUp
            ? "translateY(-100%)"
            : "translateY(0)",
          left: isMine
            ? Math.max(8, rect.left - 210)
            : Math.min(window.innerWidth - 220, rect.right + 8),
        }}
      >
        {actions.map(({ label, icon: Icon, danger }) => (
          <button
            key={label}
            onClick={closeMenu}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm
              hover:bg-base-200 transition
              ${danger ? "text-red-400" : ""}`}
          >
            <Icon className="w-4 h-4 opacity-70" />
            {label}
          </button>
        ))}
      </div>
    </>,
    document.body
  );
};

export default MessageActionMenu;
