import React from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

const EmptyState = ({ message = "No data available", icon: Icon = Inbox }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center w-full min-h-[50vh]"
    >
      <div className="flex items-center justify-center mb-4">
        <Icon className="w-12 h-12 text-slate-500" strokeWidth={1.5} />
      </div>
      <p className="text-xl font-medium text-slate-400">{message}</p>
    </motion.div>
  );
};

export default EmptyState;
