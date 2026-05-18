import React from "react";
import { useNavigate } from "react-router";
import { easeInOut, motion } from "framer-motion";
import { ShieldCheck, Globe, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Elections",
      path: "/elections",
    },
    {
      label: "Batches",
      path: "/batches",
    },
  ];

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black/20 backdrop-blur-xl">
      {/* Glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Title */}
          <div>
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer w-fit"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">NexusVote</h2>

                <p className="text-sm text-slate-400">
                  Secure Blockchain Voting
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              A secure and transparent decentralized voting platform powered by
              blockchain verification, wallet authentication, and tamper-proof
              election integrity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-slate-300">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <motion.button
                  key={link.label}
                  whileHover={{ x: 4 }}
                  transition={{ease: easeInOut, duration: 0.2}}
                  onClick={() => navigate(link.path)}
                  className="flex w-fit items-center gap-2 text-slate-400 transition hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  {link.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Extra info */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-slate-300">
              Security
            </h3>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-300">
                  Wallet signature authentication
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-300">
                  Blockchain verified votes
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-400 transition hover:text-white hover:border-white/20">
                  <Globe className="h-5 w-5" />
                </button>

                <button className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-400 transition hover:text-white hover:border-white/20">
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center md:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} NexusVote. All rights reserved.
          </p>

          <p className="text-sm text-slate-500">
            Built with MERN & Blockchain
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
