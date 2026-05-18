import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { getAllPublicElections } from "../services/electionService";
import { formatToIST } from "../utils/dateTime";

const ElectionsPage = () => {
  const [elections, setElections] = useState([]);

  const [loading, setLoading] = useState(true);

  // fetch elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await getAllPublicElections();

        setElections(res.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();

    const interval = setInterval(() => {
      fetchElections();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20";

      case "ended":
        return "bg-red-500/20 text-red-300 border border-red-500/20";

      default:
        return "bg-blue-500/20 text-blue-300 border border-blue-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading elections...
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Elections</h1>

        <p className="text-slate-400 mt-2">Participate in active elections</p>
      </div>

      {/* render elections */}
      {elections.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          No elections available
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {elections.map((election) => (
            <div
              key={election._id}
              className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{election.title}</h2>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(
                    election.status,
                  )}`}
                >
                  {election.status}
                </span>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                {election.description || "No description"}
              </p>

              <p className="text-slate-400 text-sm">
                Candidates: {election.candidates.length}
              </p>

              <p className="text-slate-500 text-sm mt-4">
                Starts: {formatToIST(election.startTime)}
              </p>

              <p className="text-slate-500 text-sm">
                Ends: {formatToIST(election.endTime)}
              </p>
              {/* elections buttons */}
              <div className="mt-6">
                {election.status === "upcoming" ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-white/10 text-slate-500 cursor-not-allowed"
                  >
                    Upcoming
                  </button>
                ) : election.status === "active" ? (
                  <Link
                    to={`/vote/${election._id}`}
                    className="block text-center w-full py-3 rounded-2xl bg-white text-black font-semibold"
                  >
                    Vote
                  </Link>
                ) : (
                  <Link
                    to={`/results/${election._id}`}
                    className="block text-center w-full py-3 rounded-2xl bg-emerald-500/20 text-emerald-300 font-semibold"
                  >
                    Results
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElectionsPage;
