import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";
import { useNavigate, Link } from "react-router";
import { signupUser } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import { User, Mail, Lock, Image, Loader2, Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: "",
  });

  const [toastConfig, setToastConfig] = useState(null);

  const showToast = (message, type = "info") => {
    setToastConfig({ message, type });
  };

  // form handling
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // submit button
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profilePic: formData.profilePic,
      };

      const res = await signupUser(payload);

      login({
        token: res.data.token,
        user: res.data.user,
        role: "user",
      });

      showToast("Account created!", "success");

      setTimeout(() => {
        navigate("/elections");
      }, 1200);
    } catch (error) {
      showToast(error.response?.data?.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 pt-0">
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

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
      >
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          Create Account
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Secure decentralized voting starts here
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/30 border border-white/10 outline-none text-white"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/30 border border-white/10 outline-none text-white"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-14 py-4 rounded-xl bg-black/30 border border-white/10 outline-none text-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2  hover:text-white transition"
            >
              {showPassword ? (
                <Eye className="w-5 h-5 text-white" />
              ) : (
                <EyeOff className="w-5 h-5 text-slate-500" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-14 py-4 rounded-xl bg-black/30 border border-white/10 outline-none text-white"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
            >
              {showConfirmPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Profile Pic */}
          <div className="relative">
            <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

            <input
              type="text"
              name="profilePic"
              placeholder="Profile Picture URL"
              value={formData.profilePic}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/30 border border-white/10 outline-none text-white"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign up"}
          </motion.button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
