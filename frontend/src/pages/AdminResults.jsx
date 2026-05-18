import React, { useEffect, useState } from "react";

import { useParams } from "react-router";

import { getElectionResults } from "../services/resultService";

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
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading analytics...
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
    <div className="min-h-screen px-6 py-14 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Admin Results Dashboard</h1>

        <p className="text-slate-400 mt-2">{result.title}</p>
      </div>

      {/* Result Section */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
          <p className="text-slate-400">Winner</p>

          <h2 className="text-2xl font-bold mt-2">{result.winner || "None"}</h2>
        </div>

        <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
          <p className="text-slate-400">Total Votes</p>

          <h2 className="text-2xl font-bold mt-2">{result.totalVotes}</h2>
        </div>

        <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
          <p className="text-slate-400">Status</p>

          <h2 className="text-2xl font-bold mt-2 capitalize">
            {result.status}
          </h2>
        </div>
      </div>

      {/* Candidate Breakdown */}
      <div className="space-y-5">
        {result.results.map((candidate) => (
          <div
            key={candidate.candidate}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex justify-between mb-3">
              <h3 className="text-lg font-semibold">{candidate.candidate}</h3>

              <span>{candidate.votes} votes</span>
            </div>

            <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden">
              <div
                style={{
                  width: `${candidate.percentage}%`,
                }}
                className="h-full bg-white rounded-full transition-all duration-700"
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

export default AdminResults;
