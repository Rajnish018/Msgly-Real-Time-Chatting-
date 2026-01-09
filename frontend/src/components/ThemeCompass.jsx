import { useEffect, useState } from "react";
import { motion } from "framer-motion";
// import { Palette } from "lucide-react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";

const RADIUS = 120;

const haptic = () => {
  if (navigator.vibrate) navigator.vibrate(15);
};

const ThemeCompass = ({ onSelect }) => {
  const { theme, setTheme } = useThemeStore();
  const [activeIndex, setActiveIndex] = useState(
    Math.max(THEMES.indexOf(theme), 0)
  );

  /* ---------- keyboard navigation ---------- */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i + 1) % THEMES.length);
        haptic();
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) => (i - 1 + THEMES.length) % THEMES.length);
        haptic();
      }
      if (e.key === "Enter") {
        const t = THEMES[activeIndex];
        setTheme(t);
        onSelect?.();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, onSelect, setTheme]);

  return (
    <div className="relative flex items-center justify-center">
      {/* CENTER */}
      <motion.div
        animate={{ rotate: (activeIndex / THEMES.length) * 360 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="absolute"
      />

      {/* RADIAL ITEMS */}
      {THEMES.map((t, i) => {
        const angle = (i / THEMES.length) * Math.PI * 2;
        const x = Math.cos(angle) * RADIUS;
        const y = Math.sin(angle) * RADIUS;
        const isActive = i === activeIndex;

        return (
          <motion.button
            key={t}
            data-theme={t}
            style={{
              left: "50%",
              top: "50%",
              translateX: x,
              translateY: y,
            }}
            whileHover={{ scale: 1.25 }}
            animate={{ scale: isActive ? 1.25 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => {
              setTheme(t);
              onSelect?.(); // AUTO CLOSE
            }}
            className={`
              absolute -translate-x-1/2 -translate-y-1/2
              h-10 w-10 rounded-full
              bg-base-100 border border-base-300
              ${theme === t ? "ring-2 ring-primary" : ""}
            `}
          >
            <div className="grid grid-cols-2 gap-[2px] p-1">
              <span className="bg-primary h-2 w-2 rounded-sm" />
              <span className="bg-secondary h-2 w-2 rounded-sm" />
              <span className="bg-accent h-2 w-2 rounded-sm" />
              <span className="bg-neutral h-2 w-2 rounded-sm" />
            </div>

            {/* HOVER / ACTIVE LABEL */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-7 left-1/2 -translate-x-1/2
                           text-xs font-medium whitespace-nowrap"
              >
                {t}
              </motion.div>
            )}
          </motion.button>
        );
      })}

      {/* CENTER ICON
      <div className=" absolute left-1/2 top-1/2
          -translate-x-1/2 -translate-y-1/2
          btn btn-circle btn-primary
          pointer-events-none z-10">
        <Palette />
      </div> */}
    </div>
  );
};

export default ThemeCompass;
