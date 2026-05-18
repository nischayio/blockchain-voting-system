import bcrypt from "bcrypt";

// create password hash
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// compare hashed password
export const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};
