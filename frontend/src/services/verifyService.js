import API from "./api.js";

// verify vote
export const verifyVote = async (voteHash) => {
  const res = await API.get(`/v1/verify/${voteHash}`);
  return res.data.data;
};
