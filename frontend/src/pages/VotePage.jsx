import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router";
import { toPng } from "html-to-image";

// services
import { submitVote, getMyVotes, checkElectionVote } from "../services/voteService";
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
  Download,
  ShieldCheck,
} from "lucide-react";

const VotePage = () => {
  const navigate = useNavigate();
  const { electionId } = useParams();
  const receiptRef = useRef(null);

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
  const [voteReceipt, setVoteReceipt] = useState(null);
  const [isCheckingVote, setIsCheckingVote] = useState(true);

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
      setIsCheckingVote(true);
      try {
        const res = await checkElectionVote(electionId);
        
        if (res.hasVoted && res.vote) {
          setHasVotedInElection(true);
          setVoteHashOnly(res.vote.voteHash);
          setVoteReceipt({
            voteHash: res.vote.voteHash,
            timestamp: res.vote.createdAt || Date.now(),
            walletAddress: res.vote.walletAddress || wallet || user?.walletAddress,
          });
        } else {
          setHasVotedInElection(false);
          setVoteHashOnly("");
          setVoteState("idle");
        }
      } catch (err) {
        console.error("Failed to check vote status:", err);
      } finally {
        setIsCheckingVote(false);
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
            id: candidate._id || index + 1,
            name: candidate.name,
            image: candidate.image,
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
      showToast("Please connect wallet first", "error");
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

Election: ${election?.title}
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
      setHasVotedInElection(true);
      
      setVoteReceipt({
        voteHash: hash,
        timestamp: timestamp,
        walletAddress: wallet,
      });

      showToast("Vote submitted!", "success");
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
        if (res.status === "pending" || res.status === "processing") {
          return;
        }

        if (res.status === "failed") {
          setVoteState("failed");
          showToast("Batch processing failed", "error");
          clearInterval(interval);
          return;
        }

        setVerifyResult(res);
        setVerified();
        showToast("Vote verified on blockchain!", "success");
        clearInterval(interval);
      } catch (error) {
        console.error("Auto verification error:", error);
      }
    };

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

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await toPng(receiptRef.current, {
        backgroundColor: "#0f172a", // slate-900 background
        pixelRatio: 2, // high res
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `vote-receipt-${election?.title || 'election'}.png`;
      link.click();
      showToast("Receipt downloaded!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to download receipt", "error");
    }
  };

  const copyReceiptText = () => {
    if (!voteReceipt) return;
    const text = `Vote Receipt
Election: ${election?.title}
Voter: ${user?.name || "Verified Voter"}
Wallet: ${voteReceipt.walletAddress}
Vote Hash: ${voteReceipt.voteHash}
Timestamp: ${new Date(voteReceipt.timestamp).toLocaleString()}`;
    
    navigator.clipboard.writeText(text);
    showToast("Receipt text copied!", "success");
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
      <div className="w-full max-w-5xl mx-auto px-6 py-14">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/elections")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-10"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Elections
        </button>

        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-bold text-slate-100">
            {election?.title || "Loading Election..."}
          </h1>

          <p className="text-slate-400 mt-2">
            {election?.description ||
              "Select a candidate below. Your vote will be cryptographically signed, anonymized via nullifiers, and submitted to the decentralized network."}
          </p>

          <div className="mt-4">
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
        </motion.div>

        {/* STATUS */}
        <div className="-mt-4 mb-8 flex justify-center min-h-[20px] items-center relative z-20">
          <AnimatePresence mode="wait">
            {voteState === "pending" && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 text-yellow-400"
              >
                <Clock className="animate-pulse w-4 h-4" />
                Syncing with blockchain...
              </motion.div>
            )}

            {voteState === "verified" && (
              <motion.div
                key="verified"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center gap-2 text-green-400"
              >
                <CheckCircle2 className="w-4 h-4" />
                Verified on blockchain
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RECEIPT CARD */}
        {hasVotedInElection && voteReceipt && (
          <SectionWrapper className="flex flex-col items-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md"
            >
              <div 
                ref={receiptRef}
                className="w-full bg-slate-900 border border-emerald-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex flex-col items-center mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden mb-3">
                    {user?.profilePicture || user?.image ? (
                      <img src={user.profilePicture || user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-emerald-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white">{user?.name || "Verified Voter"}</h3>
                  <div className="flex items-center gap-1.5 text-emerald-400 mt-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Vote Recorded</span>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Vote Hash</p>
                    <p className="text-sm text-slate-300 font-mono break-all">{voteReceipt.voteHash}</p>
                  </div>
                  
                  <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Wallet Address</p>
                    <p className="text-sm text-slate-300 font-mono break-all">{voteReceipt.walletAddress}</p>
                  </div>

                  <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                    <p className="text-sm text-slate-300">{new Date(voteReceipt.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {/* NexusVote Logo inside the receipt */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 relative z-10">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-white/80 text-sm tracking-wide">NexusVote</span>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  onClick={copyReceiptText}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium flex items-center justify-center gap-2 transition"
                >
                  <Copy className="w-4 h-4" />
                  Copy Details
                </button>
                <button 
                  onClick={downloadReceipt}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  <Download className="w-4 h-4" />
                  Save Image
                </button>
              </div>
            </motion.div>
          </SectionWrapper>
        )}

        {/* CANDIDATES */}
        {election?.status === "active" && !isCheckingVote && !hasVotedInElection && (
          <SectionWrapper>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 w-full max-w-3xl mx-auto">
              {candidates.map((c) => (
                <GlassCard
                  key={c.id}
                  hoverEffect="none"
                  className={`p-8 flex flex-col items-center group transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] ${
                    selectedCandidate === c.name
                      ? "border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                      : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className={`w-32 h-32 rounded-full bg-slate-800/50 border border-white/10 mb-6 shadow-inner relative z-10 overflow-hidden ${!c.image ? 'flex items-center justify-center' : ''}`}>
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover block" />
                    ) : (
                      <User className="w-16 h-16 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-100 mb-1 relative z-10">
                    {c.name}
                  </h3>

                  <p className="text-sm text-slate-500 mb-8 relative z-10">
                    {c.role}
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => initiateVote(c.name)}
                    disabled={
                      isConnecting ||
                      (voteState === "voting" && activeCandidate === c.name)
                    }
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative z-10 flex justify-center items-center gap-2"
                  >
                    {voteState === "voting" && activeCandidate === c.name ? (
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
        {hasVotedInElection && voteReceipt && (
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
                    whileTap={{ scale: 0.95 }}
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
        )}
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
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
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition"
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
