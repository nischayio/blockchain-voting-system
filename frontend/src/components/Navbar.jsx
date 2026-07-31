import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { ShieldCheck, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuthStore } from "../store/useAuthStore";
import { useVoteStore } from "../store/useVoteStore";

import UserModal from "./UserModal";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, logout } = useAuthStore();

  const { setWallet, setVoteState, setVoteHashOnly } = useVoteStore();

  const [openProfile, setOpenProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(e.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const role = localStorage.getItem("role");

  const navItems =
    role === "admin"
      ? [
          {
            name: "Home",
            path: "/",
          },
          {
            name: "Dashboard",
            path: "/admin",
          },
          {
            name: "Batches",
            path: "/batches",
          },
        ]
      : [
          {
            name: "Home",
            path: "/",
          },
          {
            name: "Elections",
            path: "/elections",
          },
          {
            name: "Batches",
            path: "/batches",
          },
        ];

  // logout
  const handleLogout = () => {
    const currentRole = localStorage.getItem("role");

    logout();

    setWallet(null);
    setVoteState("idle");
    setVoteHashOnly("");

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate(currentRole === "admin" ? "/admin/login" : "/login");
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 relative">
        <motion.div 
          animate={{ height: isMobileMenuOpen ? "auto" : "72px" }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-3 h-[72px] shrink-0">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>

            <span className="font-semibold text-white">NexusVote</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.path === "/elections" && !isAuthenticated) {
                      if (location.pathname === "/login") {
                        window.dispatchEvent(
                          new CustomEvent("show-login-toast", {
                            detail: {
                              message: "Please login first",
                              type: "error",
                            },
                          }),
                        );

                        return;
                      }

                      navigate("/login");
                      return;
                    }

                    navigate(item.path);
                  }}
                  className={`text-sm font-medium transition ${
                    isActive ? "text-white" : "text-slate-500 hover:text-white"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}

            {/* Login Section */}
            {!isAuthenticated && role !== "admin" ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/admin/login")}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
                >
                  Admin
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="px-5 py-2 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-200 transition"
                >
                  Login
                </button>
              </div>
            ) : (
              <>
                <button
                  ref={profileButtonRef}
                  onClick={() => setOpenProfile((prev) => !prev)}
                  className="w-11 h-11 rounded-full overflow-hidden border border-white/10 hover:border-white/20 transition"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <User className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </button>
              </>
            )}
          </div>



          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition relative w-10 h-10 flex items-center justify-center"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute"
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute"
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                ref={mobileMenuRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden px-6 pb-6 flex flex-col gap-4"
              >
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (item.path === "/elections" && !isAuthenticated) {
                        if (location.pathname === "/login") {
                          window.dispatchEvent(
                            new CustomEvent("show-login-toast", {
                              detail: {
                                message: "Please login first",
                                type: "error",
                              },
                            }),
                          );
                          return;
                        }
                        navigate("/login");
                        return;
                      }
                      navigate(item.path);
                    }}
                    className={`text-left text-lg font-medium transition ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}

              <div className="h-px bg-white/10 my-2" />

              {!isAuthenticated && role !== "admin" ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full py-3 rounded-xl bg-white text-slate-900 font-medium transition hover:bg-slate-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/admin/login");
                    }}
                    className="w-full py-3 rounded-xl bg-white/10 text-white font-medium transition hover:bg-white/20"
                  >
                    Admin
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setOpenProfile(true);
                    }}
                    className="flex items-center gap-3 w-full text-left p-2 -mx-2 hover:bg-white/5 rounded-xl transition"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <User className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">
                        {user?.name || "User"}
                      </div>
                      <div className="text-sm text-slate-400 truncate">
                        {user?.email || "No email"}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-medium transition hover:bg-red-500/20 mt-2"
                  >
                    Logout
                  </button>
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>

        <UserModal
          open={openProfile}
          anchorRef={profileButtonRef}
          onClose={() => setOpenProfile(false)}
          logout={handleLogout}
        />
      </div>
    </div>
  );
};

export default Navbar;
