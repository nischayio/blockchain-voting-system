import { create } from "zustand";

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    profilePicture: user.profilePicture || user.profilePic || "",
  };
};

// auth persistance
export const useAuthStore = create((set) => ({
  user: normalizeUser(JSON.parse(localStorage.getItem("user"))),
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  isAuthenticated: !!localStorage.getItem("token"),

  login: ({ token, user, role }) => {
    const normalized = normalizeUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalized));
    localStorage.setItem("role", role);

    set({
      token,
      user: normalized,
      role,
      isAuthenticated: true,
    });
  },

  updateUser: (updatedUser) => {
    const normalized = normalizeUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(normalized));

    set({
      user: normalized,
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
