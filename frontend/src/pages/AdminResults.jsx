import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { getElectionResults } from "../services/resultService";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowLeft } from "lucide-react";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

const AdminResults = () => {
  const { electionId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getElectionResults(electionId);
        setResult(res.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-14 max-w-7xl mx-auto animate-pulse">
        <div className="w-40 h-6 bg-white/10 rounded-md mb-8"></div>
        
        <div className="mb-10">
          <div className="w-64 h-10 bg-white/10 rounded-lg mb-2"></div>
          <div className="w-48 h-4 bg-white/10 rounded-md"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-10">
          <div className="col-span-2 md:col-span-1 rounded-3xl bg-white/5 border border-white/5 p-6">
            <div className="w-20 h-4 bg-white/10 rounded-md mb-4"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 shrink-0"></div>
              <div className="w-32 h-8 bg-white/10 rounded-lg"></div>
            </div>
          </div>
          <div className="col-span-1 rounded-3xl bg-white/5 border border-white/5 p-6">
            <div className="w-24 h-4 bg-white/10 rounded-md mb-4"></div>
            <div className="w-20 h-8 bg-white/10 rounded-lg"></div>
          </div>
          <div className="col-span-1 rounded-3xl bg-white/5 border border-white/5 p-6">
            <div className="w-20 h-4 bg-white/10 rounded-md mb-4"></div>
            <div className="w-24 h-8 bg-white/10 rounded-lg"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Candidates skeleton */}
          <div className="space-y-5">
            <div className="w-48 h-6 bg-white/10 rounded-md mb-2"></div>
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

          {/* Bar chart skeleton */}
          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 flex flex-col min-h-[400px]">
            <div className="w-48 h-6 bg-white/10 rounded-md mb-6"></div>
            <div className="w-full flex-1 flex items-end gap-4 pb-10">
              {[1, 2, 3, 4, 5].map((i, idx) => (
                <div key={i} className="flex-1 bg-white/10 rounded-t-md" style={{ height: `${[40, 80, 50, 30, 60][idx]}%` }}></div>
              ))}
            </div>
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

  const barData = result.results.map(c => ({
    name: c.name,
    votes: Number(c.votes),
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
    <div className="min-h-screen px-6 py-14 max-w-7xl mx-auto">
      <Link
        to={`/admin`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold">Admin Results Dashboard</h1>
        <p className="text-slate-400 mt-2">{result.election.title}</p>
      </motion.div>

      {/* Result Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-10"
      >
        <motion.div variants={itemVariants} className="col-span-2 md:col-span-1 rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors">
          <p className="text-slate-400 mb-4">Winner</p>
          <div className="flex items-center gap-4">
            {!result.isTie && result.winner && (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                {result.winner.image ? (
                  <img src={result.winner.image} alt={result.winner.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 text-[10px]">No Img</div>
                )}
              </div>
            )}
            <h2 className="text-2xl font-bold text-emerald-400">{result.isTie ? "Tie" : (result.winner?.name || "None")}</h2>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-1 rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors">
          <p className="text-slate-400">Total Votes</p>
          <h2 className="text-2xl font-bold mt-2">{result.totalVotes}</h2>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-1 rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors">
          <p className="text-slate-400">Status</p>
          <h2 className="text-2xl font-bold mt-2 capitalize text-blue-400">
            {result.election.status}
          </h2>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Candidate Breakdown */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          <h3 className="text-xl font-semibold mb-2">Candidate Statistics</h3>
          {result.results.map((candidate, index) => (
            <motion.div
              variants={itemVariants}
              key={candidate.candidateId}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 flex gap-6 items-center hover:bg-white/10 transition-colors"
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
                  <span>{candidate.votes} votes</span>
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

        {/* Bar Chart Section */}
        {result.totalVotes > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col min-h-[400px]"
          >
            <h3 className="text-xl font-semibold mb-6">Vote Comparison</h3>
            <div className="w-full h-[350px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.5)" 
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} 
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)" 
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Bar 
                    dataKey="votes" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={60}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationBegin={200}
                    animationEasing="ease-out"
                  >
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminResults;
