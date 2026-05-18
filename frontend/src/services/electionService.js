import API from "./api";

/* get all public elections */
export const getAllPublicElections = async () => {
  const res = await API.get("/v1/elections");

  return res.data;
};

/* get election by id */
export const getElectionById = async (electionId) => {
  const res = await API.get(`/v1/elections/${electionId}`);

  return res.data;
};
