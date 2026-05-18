import { create } from "zustand";

// auth persistance
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  isAuthenticated: !!localStorage.getItem("token"),

  login: ({ token, user, role }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", role);

    set({
      token,
      user,
      role,
      isAuthenticated: true,
    });
  },

  updateUser: (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));

    set({
      user: updatedUser,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("voteHash");
    localStorage.removeItem("voteState");

    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
    });
  },
}));
