import API from "./api";

// user signup
export const signupUser = async (formData) => {
  const res = await API.post("/auth/user/signup", formData);
  return res.data;
};

// user login
export const loginUser = async (formData) => {
  const res = await API.post("/auth/user/login", formData);
  return res.data;
};

// signup admin
export const signupAdmin = async (formData) => {
  const res = await API.post("/auth/admin/signup", formData);
  return res.data;
};

// login admin
export const loginAdmin = async (formData) => {
  const res = await API.post("/auth/admin/login", formData);
  return res.data;
};

// validate wallet
export const validateWallet = async (walletAddress, signature) => {
  const res = await API.post("/auth/validate-wallet", {
    walletAddress,
    signature,
  });

  return res.data;
};

// change password
export const changePassword = async ({
  currentPassword,
  newPassword,
  role,
}) => {
  const endpoint =
    role === "admin"
      ? "/auth/admin/change-password"
      : "/auth/user/change-password";

  const res = await API.patch(endpoint, {
    currentPassword,
    newPassword,
  });

  return res.data;
};

// upload profile picture
export const uploadProfilePicture = async (formData) => {
  const res = await API.patch("/auth/user/profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
