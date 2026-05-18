import CryptoJS from "crypto-js";

// vote nullifier
export const generateNullifier = (walletAddress, electionId) => {
  const data = `${walletAddress}-${electionId}`;
  return CryptoJS.SHA256(data).toString();
};
