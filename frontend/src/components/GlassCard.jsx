import React from 'react'
import { motion } from "framer-motion";

// glasscard component
const GlassCard = ({ children, className = "", ...props }) => {
  return (
    <motion.div
        whileHover={{scale: 1.02}}
        className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden ${className}`}
        {...props}
    >
        {children}
    </motion.div>
  );
};

export default GlassCard;