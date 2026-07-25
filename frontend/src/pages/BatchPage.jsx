import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import API from "../services/api";
import EmptyState from "../components/EmptyState";
import { Database } from "lucide-react";

const BatchPage = () => {
  const [batches, setBatches] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const limit = 10;

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await API.get(`/v1/batches?page=${page}&limit=${limit}`);

        setBatches(res.data.data || []);

        setPagination(res.data.pagination || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [page]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 min-h-screen flex flex-col">
      <h2 className="text-4xl font-bold mb-10 text-center">Batch Explorer</h2>

      {/* Main Content */}
      <div className="flex-1">
        {loading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="h-6 bg-white/10 rounded-lg w-1/3 mb-4 animate-pulse" />
                <div className="h-4 bg-white/10 rounded-lg w-full mb-3 animate-pulse" />
                <div className="h-4 bg-white/10 rounded-lg w-full mb-3 animate-pulse" />
                <div className="h-4 bg-white/10 rounded-lg w-1/4 mb-3 animate-pulse" />
                <div className="h-4 bg-white/10 rounded-lg w-1/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : batches.length === 0 ? (
          <EmptyState icon={Database} message="No batches have been processed yet" />
        ) : (
          <div className="space-y-6">
            {batches.map((batch) => (
              <motion.div
                key={batch.batchId}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
              >
                <h3 className="text-xl font-semibold mb-2">{batch.batchId}</h3>

                <p className="text-sm text-slate-400 break-all">
                  Root: {batch.merkleRoot || "Not stored"}
                </p>

                <p className="text-sm text-slate-400 mt-2 break-all">
                  Transaction: {batch.transactionHash || "Pending"}
                </p>

                <p className="text-sm text-slate-400 mt-2">
                  Status: {batch.status}
                </p>

                <p className="text-sm text-slate-400 mt-2">
                  Votes: {batch.voteCount}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {batches.length > 0 && (
        <div className="flex justify-center gap-4 mt-16 pb-10 pt-8">
          <button
            disabled={!pagination?.hasPrevPage}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl bg-white/10 disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-slate-400 flex items-center">
            Page {pagination?.page || 1}
          </span>

          <button
            disabled={!pagination?.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-white/10 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BatchPage;
