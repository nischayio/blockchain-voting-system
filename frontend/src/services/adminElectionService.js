import API from "./api";

/* create election */
export const createElection = async (payload) => {
  const res = await API.post("/v1/elections", payload);

  return res.data;
};

/* get all elections */
export const getAllElections = async (page = 1, limit = 10) => {
  const res = await API.get(
    `/v1/elections/admin/all?page=${page}&limit=${limit}`,
  );

  return res.data;
};

/* get election by id */
export const getElectionById = async (id) => {
  const res = await API.get(`/v1/elections/${id}`);

  return res.data;
};

/* update election */
export const updateElection = async (id, payload) => {
  const res = await API.put(`/v1/elections/${id}`, payload);

  return res.data;
};

/* delete election */
export const deleteElection = async (id) => {
  const res = await API.delete(`/v1/elections/${id}`);

  return res.data;
};

/* add candidate */
export const addCandidate = async (electionId, name) => {
  const res = await API.post(`/v1/elections/${electionId}/candidates`, {
    name,
  });

  return res.data;
};

/* remove candidate */
export const removeCandidate = async (electionId, candidateName) => {
  const res = await API.delete(
    `/v1/elections/${electionId}/candidates/${encodeURIComponent(candidateName)}`,
  );

  return res.data;
};
