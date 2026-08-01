import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getElectionResults } from "../services/resultService";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

const ResultsPage = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getElectionResults(electionId);
        setResult(res.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-14 max-w-5xl mx-auto animate-pulse">
        <div className="w-40 h-6 bg-white/10 rounded-md mb-10"></div>
        
        <div className="mb-10 flex flex-col items-center">
          <div className="w-64 h-10 bg-white/10 rounded-lg mb-4"></div>
          <div className="w-32 h-4 bg-white/10 rounded-md"></div>
        </div>

        {/* Winner card skeleton */}
        <div className="rounded-[32px] border border-white/5 bg-white/5 p-8 flex flex-col items-center mb-10">
          <div className="w-24 h-6 bg-white/10 rounded-md mb-4"></div>
          <div className="w-24 h-24 rounded-full bg-white/10 mb-4"></div>
          <div className="w-48 h-10 bg-white/10 rounded-lg mb-4"></div>
          <div className="w-32 h-4 bg-white/10 rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Candidates skeleton */}
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border border-white/5 bg-white/5 p-6 flex gap-6 items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 shrink-0"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-3">
                    <div className="w-32 h-5 bg-white/10 rounded-md"></div>
                    <div className="w-16 h-5 bg-white/10 rounded-md"></div>
                  </div>
                  <div className="w-full h-4 rounded-full bg-white/10"></div>
                  <div className="w-12 h-4 bg-white/10 rounded-md ml-auto mt-2"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Pie chart skeleton */}
          <div className="rounded-3xl border border-white/5 bg-white/5 p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-48 h-6 bg-white/10 rounded-md mb-6"></div>
            <div className="w-[220px] h-[220px] rounded-full border-[40px] border-white/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  const pieData = result.results.map(c => ({
    name: c.name,
    value: Number(c.votes)
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen px-6 py-14 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/elections")}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-10"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Elections
      </button>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-bold">{result.election.title}</h1>
        <p className="text-slate-400 mt-2">Election Results</p>
      </motion.div>

      {/* Winner card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative rounded-[32px] border border-emerald-500/30 bg-emerald-500/10 p-8 text-center mb-10 overflow-hidden group"
      >
        {/* Animated glowing background */}
        <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-xl text-slate-300 mb-4">Winner</h2>
          
          {!result.isTie && result.winner && (
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/30 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {result.winner.image ? (
                <img src={result.winner.image} alt={result.winner.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 text-sm">No Img</div>
              )}
            </div>
          )}

          <motion.p 
            animate={{ textShadow: ["0px 0px 8px rgba(16,185,129,0)", "0px 0px 16px rgba(16,185,129,0.8)", "0px 0px 8px rgba(16,185,129,0)"] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="text-4xl font-bold text-emerald-300"
          >
            {result.isTie ? "Tie" : (result.winner?.name || "No Winner")}
          </motion.p>
          <p className="text-slate-400 mt-4">Total Votes: <span className="font-semibold text-white">{result.totalVotes}</span></p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Results section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {result.results.map((candidate, index) => (
            <motion.div
              variants={itemVariants}
              key={candidate.candidateId}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex gap-6 items-center hover:bg-white/10 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                {candidate.image ? (
                  <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-white/5 border border-white/10">
                    <span className="text-xs">No img</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between mb-3">
                  <h3 className="text-lg font-semibold">{candidate.name}</h3>
                  <span className="text-slate-300">{candidate.votes} votes</span>
                </div>

                <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${candidate.percentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 * index }}
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    className="h-full rounded-full"
                  />
                </div>

                <p className="text-right mt-2 text-slate-400 text-sm">
                  {candidate.percentage}%
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pie Chart Section */}
        {result.totalVotes > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 flex flex-col items-center justify-center min-h-[400px]"
          >
            <h3 className="text-xl font-semibold mb-6">Vote Distribution</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
