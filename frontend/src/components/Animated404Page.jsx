import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Ghost } from "lucide-react";

const Animated404 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 overflow-hidden relative">
      {/* Floating background blobs */}
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
        animate={{ y: [0, -40, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-base-100 rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Ghost className="w-10 h-10 text-primary" />
        </motion.div>

        {/* 404 text */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl font-bold text-primary"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-lg text-base-content"
        >
          Oops! Page not found
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-sm text-base-content/60"
        >
          The page you’re looking for doesn’t exist or was moved.
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-content hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Animated404;
