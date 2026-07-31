import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router";

// services
import { submitVote, getMyVotes } from "../services/voteService";
import { verifyVote } from "../services/verifyService";
import { getElectionById } from "../services/electionService";

// store
import { useAuthStore } from "../store/useAuthStore";
import { useVoteStore } from "../store/useVoteStore";

// utils
import { generateVoteHash } from "../utils/hash";
import { connectWallet, signMessage } from "../utils/wallet";
import { generateNullifier } from "../utils/nullifier";

// components
import GlassCard from "../components/GlassCard";
import SectionWrapper from "../components/SectionWrapper";
import Toast from "../components/Toast";

// services
import { validateWallet } from "../services/authService";

// icons
import {
  Wallet,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  User,
  Loader2,
  Fingerprint,
  ArrowLeft,
} from "lucide-react";

const VotePage = () => {
  const navigate = useNavigate();
  const { electionId } = useParams();

  const [isConnecting, setIsConnecting] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toastConfig, setToastConfig] = useState(null);
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [candidateToVote, setCandidateToVote] = useState(null);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVotedInElection, setHasVotedInElection] = useState(false);

  const {
    wallet,
    voteHash,
    voteState,
    polling,
    setWallet,
    setVote,
    setVoteHashOnly,
    setVerified,
    setVoteState,
  } = useVoteStore();

  const { user, updateUser } = useAuthStore();

  useEffect(() => {
    if (user?.walletAddress && !wallet) {
      setWallet(user.walletAddress);
    }
  }, [user, wallet, setWallet]);

  const showToast = (message, type = "info") => {
    setToastConfig({
      message,
      type,
    });
  };

  useEffect(() => {
    const checkUserVote = async () => {
      try {
        setHasVotedInElection(false);

        const res = await getMyVotes(1, 100);

        const votes = res?.data || [];

        const voted = votes.find(
          (vote) =>
            vote.electionId?._id === electionId ||
            vote.electionId === electionId,
        );

        if (voted) {
          setHasVotedInElection(true);
          if (voted.voteHash) {
            setVoteHashOnly(voted.voteHash);
          }
        } else {
          setHasVotedInElection(false);
          setVoteHashOnly("");
          setVoteState("idle");
        }
      } catch (err) {
        console.error("Failed to check vote status:", err);
      }
    };

    if (electionId) {
      checkUserVote();
    }
  }, [electionId]);

  // Fetch election
  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await getElectionById(electionId);

        const electionData = res.data;

        setElection(electionData);

        setCandidates(
          electionData.candidates.map((candidate, index) => ({
            id: index + 1,
            name: candidate,
            role: "Election Candidate",
          })),
        );
      } catch (err) {
        console.error(err);

        showToast(
          err.response?.data?.message || "Failed to load election",
          "error",
        );

        navigate("/elections");
      }
    };

    fetchElection();
  }, [electionId, navigate]);

  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);

      const address = await connectWallet();

      if (!address) {
        showToast("Wallet connection failed", "error");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));

      const message = `Link wallet to voting account: ${user.id}`;

      const signature = await signMessage(message);

      await validateWallet(address, signature);

      setWallet(address);
      const updatedUser = {
        ...user,
        walletAddress: address.toLowerCase(),
      };

      updateUser(updatedUser);

      showToast("Wallet connected!", "success");
    } catch (error) {
      console.error(error);

      const msg = error?.response?.data?.message;

      showToast(msg || "Failed to connect wallet", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const initiateVote = (candidateName) => {
    if (!wallet) {
      showToast("Connect wallet first", "error");
      return;
    }
    setCandidateToVote(candidateName);
    setConfirmModalOpen(true);
  };

  // Vote handling
  const handleVote = async (candidateName) => {
    if (!wallet) {
      showToast("Connect wallet first", "error");
      return;
    }

    setVoteState("voting");

    setActiveCandidate(candidateName);

    setSelectedCandidate(candidateName);

    try {
      const { hash } = generateVoteHash(election?._id, candidateName, wallet);

      const nullifier = generateNullifier(wallet, election?._id);

      const timestamp = Date.now();

      const message = `
Blockchain Voting System

Election: ${election?._id}
Candidate: ${candidateName}

Vote Hash: ${hash}

Wallet: ${wallet.toLowerCase()}

Timestamp: ${timestamp}
`;

      const signature = await signMessage(message);

      await submitVote({
        electionId: election?._id,
        candidate: candidateName,
        voteHash: hash,
        walletAddress: wallet,
        signature,
        nullifier,
        timestamp,
      });

      setVote(hash);
      setVoteState("pending");

      setActiveCandidate(null);

      showToast("Vote submitted!", "success");
      setHasVotedInElection(true);
    } catch (err) {
      setVoteState("idle");

      setActiveCandidate(null);

      const msg = err.response?.data?.message;

      showToast(msg || "Vote failed", "error");
    }
  };

  // Verify vote
  const handleVerify = async () => {
    if (!voteHash) return;

    setVoteState("verifying");

    try {
      const res = await verifyVote(voteHash);

      if (res.status === "pending" || res.status === "processing") {
        showToast("Waiting for batch...", "info");

        setVoteState("pending");

        return;
      }

      if (res.status === "failed") {
        setVoteState("failed");

        showToast("Batch processing failed", "error");

        return;
      }

      // verified
      setVerifyResult(res);

      setVerified();

      showToast("Vote verified!", "success");
    } catch (error) {
      console.error("Verification error:", error);

      setVoteState("pending");

      showToast("Verification failed", "error");
    }
  };

  // auto verify voting
  useEffect(() => {
    if (!voteHash || voteState !== "pending") {
      return;
    }

    let interval;

    const pollVerification = async () => {
      try {
        const res = await verifyVote(voteHash);

        // batching
        if (res.status === "pending" || res.status === "processing") {
          return;
        }

        // batch failed
        if (res.status === "failed") {
          setVoteState("failed");

          showToast("Batch processing failed", "error");

          clearInterval(interval);

          return;
        }

        // verified
        setVerifyResult(res);

        setVerified();

        showToast("Vote verified on blockchain!", "success");

        clearInterval(interval);
      } catch (error) {
        console.error("Auto verification error:", error);
      }
    };

    // poll
    pollVerification();

    interval = setInterval(pollVerification, 5000);

    return () => clearInterval(interval);
  }, [voteHash, voteState]);

  const copyHash = () => {
    if (!voteHash) return;

    navigator.clipboard.writeText(voteHash);

    setCopied(true);

    showToast("Copied to clipboard", "success");

    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* Toast */}
      <AnimatePresence>
        {toastConfig && (
          <Toast
            message={toastConfig.message}
            type={toastConfig.type}
            onClose={() => setToastConfig(null)}
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/elections")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Elections
        </button>

        {/* HEADER */}
        <SectionWrapper className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6 tracking-tight">
            {election?.title || "Loading Election..."}
          </h2>

          <p className="text-slate-400 max-w-xl mb-10">
            {election?.description ||
              "Select a candidate below. Your vote will be cryptographically signed, anonymized via nullifiers, and submitted to the decentralized network."}
          </p>

          <div className="mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm capitalize ${
                election?.status === "active"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : election?.status === "ended"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              {election?.status}
            </span>
          </div>

          {wallet ? (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="flex items-center gap-3 px-5 py-2.5 bg-green-500/10 border border-green-500/20 rounded-full"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

              <span className="text-green-400 font-medium tracking-wide">
                {wallet.slice(0, 6)}
                ...
                {wallet.slice(-4)}
              </span>
            </motion.div>
          ) : (
            <motion.button
              whileTap={{
                scale: 0.95,
              }}
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-8 py-3.5 bg-white text-slate-900 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-70"
            >
              {isConnecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}

              {isConnecting ? "Connecting..." : "Connect Web3 Wallet"}
            </motion.button>
          )}
        </SectionWrapper>

        {/* STATUS */}
        <div className="flex justify-center min-h-[20px] items-center">
          <AnimatePresence mode="wait">
            {voteState === "pending" && (
              <motion.div
                key="pending"
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                }}
                className="flex items-center gap-2 text-yellow-400"
              >
                <Clock className="animate-pulse w-4 h-4" />
                Syncing with blockchain...
              </motion.div>
            )}

            {voteState === "verified" && (
              <motion.div
                key="verified"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.5,
                  duration: 0.5,
                }}
                className="flex items-center gap-2 text-green-400"
              >
                <CheckCircle2 className="w-4 h-4" />
                Verified on blockchain
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CANDIDATES */}
        {election?.status === "active" && (
          <SectionWrapper>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 w-full max-w-3xl mx-auto">
              {candidates.map((c) => (
                <GlassCard
                  key={c.id}
                  className={`p-8 flex flex-col items-center group transition-all duration-300 ${
                    selectedCandidate === c.name
                      ? "border-blue-500 bg-blue-500/10"
                      : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-white/10 flex items-center justify-center mb-6 shadow-inner relative z-10">
                    <User className="w-10 h-10 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-100 mb-1 relative z-10">
                    {c.name}
                  </h3>

                  <p className="text-sm text-slate-500 mb-8 relative z-10">
                    {c.role}
                  </p>

                  <motion.button
                    whileTap={{
                      scale: 0.95,
                    }}
                    onClick={() => initiateVote(c.name)}
                    disabled={
                      !wallet ||
                      hasVotedInElection ||
                      (voteState === "voting" && activeCandidate === c.name)
                    }
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative z-10 flex justify-center items-center gap-2"
                  >
                    {hasVotedInElection ? (
                      "Vote Locked"
                    ) : voteState === "voting" && activeCandidate === c.name ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Cast Vote"
                    )}
                  </motion.button>
                </GlassCard>
              ))}
            </div>
          </SectionWrapper>
        )}

        {/* VERIFY */}
        <SectionWrapper>
          <div className="max-w-2xl mx-auto w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Fingerprint className="w-6 h-6 text-purple-400" />

              <h3 className="text-2xl font-bold text-slate-100">
                Verify Your Vote
              </h3>
            </div>

            <div className="relative z-10 space-y-4">
              <input
                type="text"
                placeholder="0x..."
                value={voteHash}
                onChange={(e) => setVoteHashOnly(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-slate-200"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={handleVerify}
                  disabled={!voteHash || voteState === "verifying"}
                  className="flex-1 py-3.5 bg-white/10 rounded-xl flex items-center justify-center gap-2"
                >
                  {voteState === "verifying" ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Verify"
                  )}
                </motion.button>

                <button
                  onClick={copyHash}
                  disabled={!voteHash}
                  className="px-6 py-3.5 bg-black/40 rounded-xl flex items-center gap-2"
                >
                  {copied ? <Check /> : <Copy />}

                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </SectionWrapper>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8,  }}
              animate={{ opacity: 1, scale: 1, }}
              exit={{ opacity: 0, scale: 0.8,  }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-md bg-slate-900 border border-white/10 p-6 md:p-6 rounded-3xl shadow-2xl z-[101]"
            >
              <h3 className="text-xl font-bold text-white mb-2">Confirm Vote</h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Are you sure you want to cast your vote for{" "}
                <span className="text-white font-semibold">
                  {candidateToVote}
                </span>{" "}
                in the <span className="text-white font-semibold">{election?.title || 'current'}</span> election? This action is signed via your wallet and is permanent.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-whit text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmModalOpen(false);
                    handleVote(candidateToVote);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition"
                >
                  Confirm Vote
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VotePage;
