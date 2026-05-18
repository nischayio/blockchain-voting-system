import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// ENV validation

if (!process.env.RPC_URL) {
  throw new Error("RPC_URL missing in .env");
}

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY missing in .env");
}

if (!process.env.CONTRACT_ADDRESS) {
  throw new Error("CONTRACT_ADDRESS missing in .env");
}

// Provider
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

// Wallet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract
const contractAddress = process.env.CONTRACT_ADDRESS;

const ABI = [
  "function storeBatch(string memory _batchId, bytes32 _root) public",
];

const contract = new ethers.Contract(contractAddress, ABI, wallet);

// Store on Chain
export const storeOnChain = async (batchId, root) => {
  try {
    if (!batchId || !root) {
      throw new Error("batchId and root are required");
    }

    console.log("Sending batch to blockchain...");
    console.log("Batch ID:", batchId);
    console.log("Merkle Root:", root);

    // ensuring bytes32 formatting
    const formattedRoot = root.startsWith("0x") ? root : `0x${root}`;

    // send transaction
    const tx = await contract.storeBatch(batchId, formattedRoot);

    console.log("Transaction submitted:", tx.hash);

    // wait for confirmation
    const receipt = await tx.wait();

    console.log("Blockchain confirmation successful");
    console.log("Block Number:", receipt.blockNumber);

    // return tx and receipt metadata
    return {
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      confirmations: receipt.confirmations,
      transactionIndex: receipt.transactionIndex,
    };
  } catch (error) {
    console.error("BLOCKCHAIN ERROR:");
    console.error(error);

    
    throw error;
  }
};
