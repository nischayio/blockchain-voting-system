import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import {
  Mail,
  Wallet,
  Lock,
  LogOut,
  ChevronLeft,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import Toast from "./Toast";
import { changePassword } from "../services/authService";

const UserModal = ({ open, onClose, logout, anchorRef }) => {
  const authUser = useAuthStore((state) => state.user);
  const modalRef = useRef(null);

  const [view, setView] = useState("profile");

  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);

  const [showNew, setShowNew] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  const role = localStorage.getItem("role");

  const user = authUser
    ? {
        ...authUser,
        role: role === "admin" ? "Admin" : "User",
      }
    : null;

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setView("profile");

        setForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        setStayLoggedIn(false);
      }, 200);
    }
  }, [open]);

  // Esc button support
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key !== "Escape") return;

      if (view === "password") {
        setView("profile");
        return;
      }

      onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, view, onClose]);

  // outside click close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose, anchorRef]);

  const showToast = (message, type) => {
    setToast({
      message,
      type,
    });
  };

  // logout button
  const handleLogout = () => {
    logout();
    onClose();
  };

  // password change
  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = form;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);

      const role = localStorage.getItem("role");

      const res = await changePassword({
        currentPassword,
        newPassword,
        role,
      });

      showToast(res.message, "success");

      if (!stayLoggedIn) {
        setTimeout(() => {
          handleLogout();
        }, 1200);

        return;
      }

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setView("profile");
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Password update failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* User Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={modalRef}
            initial={{
              opacity: 0,
              y: -10,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.98,
            }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed top-24 right-0 z-[100] w-[400px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#09090B]/95 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          >
            {/* top glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <motion.div
              animate={{
                x: view === "profile" ? "0%" : "-50%",
              }}
              transition={{
                duration: 0.32,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex w-[200%]"
            >
              {/* Profile */}
              <div className="w-1/2 p-6">
                <div className="flex flex-col items-center pb-5">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ShieldCheck className="h-8 w-8 text-slate-300" />
                    )}
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    {user?.name || "User"}
                  </h2>

                  <span className="mt-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    {user?.role || "User"}
                  </span>
                </div>

                <div className="mb-5 space-y-2.5">
                  <InfoRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={user?.email || "No email found"}
                  />

                  <InfoRow
                    icon={<Wallet className="h-4 w-4" />}
                    label="Wallet"
                    value={user?.walletAddress || "Not connected"}
                    mono
                  />
                </div>

                <div className="space-y-2.5">
                  <ActionButton
                    icon={<Lock className="h-4 w-4" />}
                    label="Change Password"
                    onClick={() => setView("password")}
                  />

                  <ActionButton
                    icon={<LogOut className="h-4 w-4" />}
                    label="Log Out"
                    variant="danger"
                    onClick={handleLogout}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="w-1/2 p-6">
                <button
                  onClick={() => setView("profile")}
                  className="mb-5 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <h3 className="mb-5 text-lg font-semibold text-white">
                  Change Password
                </h3>

                <div className="space-y-4">
                  <PasswordInput
                    label="Current Password"
                    type={showCurrent ? "text" : "password"}
                    value={form.currentPassword}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    show={showCurrent}
                    toggle={() => setShowCurrent(!showCurrent)}
                  />

                  <PasswordInput
                    label="New Password"
                    type={showNew ? "text" : "password"}
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    show={showNew}
                    toggle={() => setShowNew(!showNew)}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    show={showConfirm}
                    toggle={() => setShowConfirm(!showConfirm)}
                  />

                  {/* Login state toggler */}
                  <button
                    onClick={() => setStayLoggedIn(!stayLoggedIn)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.05]"
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                        stayLoggedIn
                          ? "border-purple-500 bg-purple-500"
                          : "border-white/15"
                      }`}
                    >
                      {stayLoggedIn && <Check className="h-3 w-3 text-white" />}
                    </div>

                    <span className="text-sm text-slate-300">
                      Stay logged in after password change
                    </span>
                  </button>

                  <button
                    disabled={loading}
                    onClick={handlePasswordChange}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}

                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const InfoRow = ({ icon, label, value, mono = false }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.03] px-4 py-3">
    <span className="text-white/25">{icon}</span>

    <div className="min-w-0">
      <p className="mb-0.5 text-[10px] uppercase tracking-[0.06em] text-white/30">
        {label}
      </p>

      <p
        className={`truncate text-sm text-white/75 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

const PasswordInput = ({ label, type, value, onChange, show, toggle }) => (
  <div>
    <label className="mb-2 block text-xs uppercase tracking-[0.06em] text-slate-500">
      {label}
    </label>

    <div className="flex items-center rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4">
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
      />

      <button
        type="button"
        onClick={toggle}
        className="text-slate-500 transition hover:text-white"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

const ActionButton = ({ icon, label, onClick, variant = "default" }) => {
  const isDanger = variant === "danger";

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium transition ${
        isDanger
          ? "border-red-500/10 bg-red-500/[0.06] text-red-300 hover:bg-red-500/[0.12]"
          : "border-white/[0.07] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default UserModal;
