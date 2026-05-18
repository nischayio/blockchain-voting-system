import React, { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router";

import { getElectionResults } from "../services/resultService";
import { ArrowLeft } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading results...
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

  return (
    <div className="min-h-screen px-6 py-14 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/elections")}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-10"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Elections
      </button>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">{result.title}</h1>

        <p className="text-slate-400 mt-2">Election Results</p>
      </div>

      {/* Winner card */}
      <div className="rounded-[32px] border border-emerald-500/20 bg-emerald-500/10 p-8 text-center mb-10">
        <h2 className="text-xl text-slate-300">Winner</h2>

        <p className="text-4xl font-bold mt-3 text-emerald-300">
          {result.winner || "No Winner"}
        </p>

        <p className="text-slate-400 mt-4">Total Votes: {result.totalVotes}</p>
      </div>

      {/* Results section*/}
      <div className="space-y-5">
        {result.results.map((candidate) => (
          <div
            key={candidate.candidate}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <div className="flex justify-between mb-3">
              <h3 className="text-lg font-semibold">{candidate.candidate}</h3>

              <span className="text-slate-300">{candidate.votes} votes</span>
            </div>

            <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden">
              <div
                style={{
                  width: `${candidate.percentage}%`,
                }}
                className="h-full rounded-full bg-white transition-all duration-700"
              />
            </div>

            <p className="text-right mt-2 text-slate-400">
              {candidate.percentage}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;
