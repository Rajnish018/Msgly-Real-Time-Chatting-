import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "lucide-react";
import ThemeCompass from "../components/ThemeCompass";

const FloatingThemeSelector = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* BUTTON */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="
          fixed top-5 right-5 z-50
          btn btn-circle btn-ghost
          bg-base-100/80 backdrop-blur
          border border-base-300 shadow-md
        "
      >
        <Palette />
      </motion.button>

      {/* OVERLAY */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm
                       flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <ThemeCompass onSelect={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingThemeSelector;
