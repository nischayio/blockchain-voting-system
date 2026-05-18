import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ShieldCheck, User } from "lucide-react";

import { useAuthStore } from "../store/useAuthStore";
import { useVoteStore } from "../store/useVoteStore";

import UserModal from "./UserModal";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, logout } = useAuthStore();

  const { setWallet, setVoteState, setVoteHashOnly } = useVoteStore();

  const [openProfile, setOpenProfile] = useState(false);

  const profileButtonRef = useRef(null);

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-lg">
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
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <User className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </button>

                <UserModal
                  open={openProfile}
                  anchorRef={profileButtonRef}
                  onClose={() => setOpenProfile(false)}
                  logout={handleLogout}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
