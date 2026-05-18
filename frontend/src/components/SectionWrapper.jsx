import React from "react";
import { motion } from "framer-motion";

// 
const SectionWrapper = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default SectionWrapper;
