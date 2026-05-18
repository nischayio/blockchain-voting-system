import { ethers } from "ethers";

// connect wallet
export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("MetaMask not installed!");
    return null;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = provider.getSigner();

  const address = await signer.getAddress();

  return address;
};

// transaction signature
export const signMessage = async (message) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = provider.getSigner();

  const signature = await signer.signMessage(message);

  return signature;
};
