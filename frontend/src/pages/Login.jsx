import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";
import { useNavigate, Link } from "react-router";
import { loginUser } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [toastConfig, setToastConfig] = useState(null);

  const showToast = (message, type = "info") => {
    setToastConfig({ message, type });
  };

  useEffect(() => {
    const handleLoginToast = (e) => {
      showToast(e.detail.message, e.detail.type);
    };

    window.addEventListener("show-login-toast", handleLoginToast);

    return () => {
      window.removeEventListener("show-login-toast", handleLoginToast);
    };
  }, []);

  // login form handling
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // submit button
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await loginUser(formData);

      login({
        token: res.data.token,
        user: res.data.user,
        role: "user",
      });

      showToast("Login successful!", "success");

      setTimeout(() => {
        navigate("/elections");
      }, 1200);
    } catch (error) {
      showToast(error.response?.data?.message || "Login failed", "error");
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
          Welcome Back
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Login to continue voting securely
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/30 border border-white/10 outline-none text-white"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
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

          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Login"}
          </motion.button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300">
            Signup
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
