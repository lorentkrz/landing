"use client";

import { AnimatePresence, motion } from "framer-motion";

export function Preloader({
  visible,
  typed,
  blast,
}: {
  visible: boolean;
  typed: string;
  blast: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: blast ? 0 : 1, scale: blast ? 1.2 : 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="radar"
            animate={blast ? { scale: 4, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="radar-ping" />
            <div className="absolute inset-0 flex items-center justify-center text-xs tracking-[0.3em] text-[#d4ff00]">
              <span className="mono-font">{typed}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
