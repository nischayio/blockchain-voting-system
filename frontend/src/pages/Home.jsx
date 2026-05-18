import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Fingerprint,
  Layers,
  Link as LinkIcon,
  ArrowRight,
  ChevronRight,
  Wallet,
  Shield,
  Database,
  KeyRound,
  Blocks,
  FingerprintIcon,
} from "lucide-react";
import HomeLoader from "../components/HomeLoader";
import LiquidEther from "../components/LiquidEther";

// SECTIONS DATA
const sections = [
  {
    title: "Secure Voting System",
    desc: "Every vote is cryptographically signed and verified, ensuring complete authenticity and tamper-proof integrity.",
    icon: ShieldCheck,
    image: "/illustrations/ShieldCheck.svg",
    alt: "Secure voting illustration",
  },

  {
    title: "Transparent & Verifiable",
    desc: "Merkle proofs allow every user to independently verify their vote inclusion without trusting the backend.",
    icon: Fingerprint,
    image: "/illustrations/FingerprintPattern.svg",
    alt: "Transparent verification illustration",
  },

  {
    title: "Scalable Architecture",
    desc: "Batch processing and Layer-2 concepts ensure the system scales efficiently without compromising security.",
    icon: Layers,
    image: "/illustrations/Layers.svg",
    alt: "Scalable architecture illustration",
  },

  {
    title: "Blockchain Anchoring",
    desc: "Final vote batches are anchored on-chain, creating a permanent and immutable audit trail.",
    icon: LinkIcon,
    image: "/illustrations/Link.svg",
    alt: "Blockchain anchoring illustration",
  },
];

const Home = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [showLiquidEther, setShowLiquidEther] = useState(false);

  // Loading screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  // Liquid ether load delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLiquidEther(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnterApp = () => {
    const role = localStorage.getItem("role");

    if (role === "admin") {
      navigate("/admin");
      return;
    }

    navigate("/elections");
  };

  // Home loading animation
  if (loading) {
    return <HomeLoader />;
  }

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center text-center px-6">
        {/* Liquid Ether Background */}
        <div className="absolute inset-0 z-0">
          {showLiquidEther && (
            <LiquidEther
              colors={["#5227FF", "#FF9FFC", "#B497CF"]}
              mouseForce={14}
              cursorSize={85}
              isViscous
              viscous={26}
              iterationsViscous={26}
              iterationsPoisson={26}
              resolution={0.45}
              isBounce={false}
              autoDemo
              autoSpeed={0.4}
              autoIntensity={1.8}
              takeoverDuration={0.22}
              autoResumeDelay={2500}
              autoRampDuration={0.5}
              color0="#5227FF"
              color1="#FF9FFC"
              color2="#B497CF"
            />
          )}
        </div>
        <motion.div
          initial={{
            opacity: 0,
            y: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="relative z-20 max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            System Live & Anchoring
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Next-Generation <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
              Blockchain Voting
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
            A framework for secure, transparent, and verifiable elections.
            Powered by advanced cryptography and decentralized ledgers.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleEnterApp}
              className="px-8 py-4 bg-white text-slate-950 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors duration-300"
            >
              Enter Voting App
              <ArrowRight className="w-5 h-5" />
            </button>

            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
              Read Documentation
            </button>
          </div>
        </motion.div>
      </section>

      {/* LOGO STRIP */}
      <section className="py-14 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-slate-500 tracking-[0.25em] uppercase mb-10">
            Built With Modern Cryptographic Infrastructure
          </p>

          <div className="flex justify-center flex-wrap lg:flex-nowrap gap-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="group px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center gap-2 hover:border-purple-500/20 hover:bg-purple-500/[0.04] transition-all duration-300 shrink-0">
              <Wallet className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300 whitespace-nowrap">
                MetaMask
              </span>
            </div>

            <div className="group px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center gap-2 hover:border-blue-500/20 hover:bg-blue-500/[0.04] transition-all duration-300 shrink-0">
              <FingerprintIcon className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300 whitespace-nowrap">
                Merkle Proofs
              </span>
            </div>

            <div className="group px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center gap-2 hover:border-indigo-500/20 hover:bg-indigo-500/[0.04] transition-all duration-300 shrink-0">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-300 whitespace-nowrap">
                JWT Auth
              </span>
            </div>

            <div className="group px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center gap-2 hover:border-cyan-500/20 hover:bg-cyan-500/[0.04] transition-all duration-300 shrink-0">
              <Blocks className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-slate-300 whitespace-nowrap">
                Blockchain
              </span>
            </div>

            <div className="group px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center gap-2 hover:border-pink-500/20 hover:bg-pink-500/[0.04] transition-all duration-300 shrink-0">
              <KeyRound className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-slate-300 whitespace-nowrap">
                Crypto Signing
              </span>
            </div>

            <div className="group px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center gap-2 hover:border-emerald-500/20 hover:bg-emerald-500/[0.04] transition-all duration-300 shrink-0">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300 whitespace-nowrap">
                Batch Storage
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SCROLL SECTIONS */}
      <div className="py-24 space-y-32">
        {sections.map((sec, index) => {
          const isReversed = index % 2 !== 0;

          return (
            <section
              key={index}
              className="flex items-center px-6 md:px-16 max-w-7xl mx-auto"
            >
              <div
                className={`flex flex-col md:flex-row gap-12 lg:gap-24 items-center w-full ${isReversed ? "md:flex-row-reverse" : ""}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7 }}
                  className="flex-1 space-y-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-blue-400 mb-6">
                    <sec.icon className="w-7 h-7" />
                  </div>

                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-100">
                    {sec.title}
                  </h2>

                  <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                    {sec.desc}
                  </p>

                  {/* <button className="group inline-flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors pt-4">
                    Learn how it works
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button> */}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="flex-1 w-full"
                >
                  <div className="relative w-full flex items-center justify-center">
                    <img
                      src={sec.image}
                      alt={sec.alt}
                      draggable={false}
                      className="w-full max-w-[200px] object-contain select-none pointer-events-none rounded-[2rem] transition-transform duration-500 hover:scale-[1.02] mt-10"
                    />

                    {/* subtle glow */}
                    <div className="absolute inset-0 bg-blue-500/5 blur-[100px] -z-10" />
                  </div>
                </motion.div>
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA */}
      <section className="relative py-32 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative z-10 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-100 tracking-tight">
            Ready to secure your next election?
          </h2>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands of organizations conducting transparent and
            verifiable votes.
          </p>

          <button
            onClick={handleEnterApp}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1"
          >
            Step Into Verifiable Voting
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
