import API from "./api";

// vote submit
export const submitVote = async ({
  electionId,
  candidate,
  voteHash,
  walletAddress,
  signature,
  nullifier,
  timestamp,
}) => {
  const res = await API.post("/v1/votes/submit", {
    electionId,
    candidate,
    voteHash,
    walletAddress,
    signature,
    nullifier,
    timestamp,
  });

  return res.data;
};

// get votes
export const getMyVotes = async (page = 1, limit = 10) => {
  const res = await API.get(`/v1/votes/my-votes?page=${page}&limit=${limit}&_t=${Date.now()}`);

  return res.data;
};

// check vote for specific election
export const checkElectionVote = async (electionId) => {
  const res = await API.get(`/v1/votes/check/${electionId}`);
  return res.data;
};
