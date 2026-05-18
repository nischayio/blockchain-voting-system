import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import { adminLogin } from "../services/adminAuthService";
import { useAuthStore } from "../store/useAuthStore";

const AdminLogin = () => {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role === "admin") {
      navigate("/admin");
    }
  }, [navigate]);

  // login form handling
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // login form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await adminLogin(formData);

      login({
        token: res.data.token,
        user: res.data.user,
        role: res.data.role,
      });

      navigate("/admin");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 pt-0">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Login</h1>

        {/* Email input */}
        <div className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none"
          />

          {/* Password input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full p-4 pr-14 rounded-2xl bg-white/5 border border-white/10 outline-none"
            />

            {/* Password visibility toggle */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Login button */}
          <button
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-white text-black font-semibold disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </div>

        <p className="text-center text-slate-400 mt-6">
          Need admin access?{" "}
          <Link to="/admin/signup" className="text-white hover:underline">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
