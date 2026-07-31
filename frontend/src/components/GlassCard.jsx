import React from 'react'
import { motion } from "framer-motion";

// glasscard component
const GlassCard = ({ children, className = "", hoverEffect = "scale", ...props }) => {
  const motionProps = hoverEffect === "scale" ? { whileHover: { scale: 1.02 } } : {};

  return (
    <motion.div
        {...motionProps}
        className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden ${className}`}
        {...props}
    >
        {children}
    </motion.div>
  );
};

export default GlassCard;