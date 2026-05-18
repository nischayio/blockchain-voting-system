import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Shield, ShieldCheck } from "lucide-react";

// Custom Toast
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <ShieldCheck className="w-5 h-5 text-blue-400" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 bg-slate-900/90 backdrop:blur-xl border border-white/10 rounded-full shadow-2xl"
    >
      {icons[type] || icons.info}
      <span className="text-sm font-medium text-slate-200">{message}</span>
    </motion.div>
  );
};

export default Toast;
