import crypto from "crypto";

// generate vote hash
export const generateVoteHash = ({ candidate, walletAddress, nonce }) => {
  const data = `${candidate}-${walletAddress}-${nonce}`;
  return crypto.createHash("sha256").update(data).digest("hex");
};
