import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const HomeLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center overflow-hidden"
    >
      {/* Glow Background */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full" />

      {/* Loader Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border border-white/10" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border-t-2 border-purple-400 border-r-2 border-r-blue-400"
          />

          {/* Center Icons */}
          <div className="absolute inset-4 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center justify-center">
            <span className="text-lg font-bold text-white">
              <ShieldCheck className="w-7 h-7 text-slate-300" />
            </span>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1,
          }}
          className="mt-6 text-slate-400 tracking-[0.2em] uppercase text-sm"
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default HomeLoader;
