import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import { adminSignup } from "../services/adminAuthService";
import { useAuthStore } from "../store/useAuthStore";

const AdminSignup = () => {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: "",
    secretCode: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role === "admin") {
      navigate("/admin");
    }
  }, [navigate]);

  // signup form handling
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // submit button
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profilePic: formData.profilePic,
        secretCode: formData.secretCode,
      };

      const res = await adminSignup(payload);

      login({
        token: res.data.token,
        user: res.data.user,
        role: res.data.role,
      });

      navigate("/admin");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
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
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Signup</h1>

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full p-4 pr-14 rounded-2xl bg-white/5 border border-white/10 outline-none"
            />

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

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
              className="w-full p-4 pr-14 rounded-2xl bg-white/5 border border-white/10 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
            >
              {showConfirmPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          <input
            type="text"
            name="profilePic"
            placeholder="Profile Picture URL"
            onChange={handleChange}
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none"
          />

          <input
            type="password"
            name="secretCode"
            placeholder="Admin Secret Code"
            onChange={handleChange}
            required
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none"
          />

          <button
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-white text-black font-semibold disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Admin Account"}
          </button>
        </div>

        <p className="text-center text-slate-400 mt-6">
          Already admin?{" "}
          <Link to="/admin/login" className="text-white hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default AdminSignup;
