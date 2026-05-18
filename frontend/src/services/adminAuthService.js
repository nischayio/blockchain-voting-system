import API from "./api";

// admin signup service
export const adminSignup = async (formData) => {
  const res = await API.post("/auth/admin/signup", formData);

  return res.data;
};

// admin login service
export const adminLogin = async (credentials) => {
  const res = await API.post("/auth/admin/login", credentials);

  return res.data;
};
