import { motion } from "framer-motion";

const SlidePanel = ({
  children,
  direction = "left", // left | right
  duration = 0.25,
}) => {
  const isLeft = direction === "left";

  return (
    <motion.div
      initial={{ x: isLeft ? -80 : 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isLeft ? -80 : 80, opacity: 0 }}
      transition={{ duration, ease: "easeOut" }}
      className="
        w-full
        h-[100dvh]
        overflow-hidden
        md:h-full
      "
    >
      {children}
    </motion.div>
  );
};

export default SlidePanel;
