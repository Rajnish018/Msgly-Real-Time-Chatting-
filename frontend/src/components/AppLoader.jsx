import { motion } from "framer-motion";
import { MessageCircleMore } from "lucide-react";

const AppLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <MessageCircleMore className="w-8 h-8 text-primary" />
        </motion.div>

        {/* App name / text */}
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-sm text-base-content/70 tracking-wide"
        >
          Loading your conversations…
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AppLoader;
