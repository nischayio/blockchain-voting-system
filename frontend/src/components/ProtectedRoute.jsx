import React from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";

// Routes Protection
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
