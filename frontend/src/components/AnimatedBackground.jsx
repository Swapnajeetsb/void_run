import React from "react";
import { motion } from "framer-motion";

const chars = "01<>[]{}#$@VOIDRUN";
const items = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: `${(i * 29) % 100}%`,
  delay: (i % 9) * 0.7,
  duration: 7 + (i % 6),
  text: chars[(i * 7) % chars.length]
}));

export default function AnimatedBackground() {
  return (
    <div className="matrix-bg" aria-hidden="true">
      {items.map((x) => (
        <motion.span
          key={x.id}
          initial={{ y: "-10vh", opacity: 0 }}
          animate={{ y: "110vh", opacity: [0, 0.65, 0] }}
          transition={{ duration: x.duration, delay: x.delay, repeat: Infinity, ease: "linear" }}
          style={{ left: x.left }}
        >
          {x.text}
        </motion.span>
      ))}
      <div className="noise" />
    </div>
  );
}
