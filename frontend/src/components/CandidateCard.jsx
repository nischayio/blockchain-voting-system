import React from "react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";

// candidate glass card
const CandidateCard = ({ name, onVote }) => {
  return (
    <GlassCard className="p-6 flex flex-col items-center">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="mb-4 text-lg font-semibold"
      >
        {name}
      </motion.div>

      <button
        onClick={onVote}
        className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition"
      >
        Vote
      </button>
    </GlassCard>
  );
};

export default CandidateCard;
