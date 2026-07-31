import API from "./api";

export const createElection = async (formData) => {
  const res = await API.post("/v1/elections", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

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
export const addCandidate = async (electionId, formData) => {
  const res = await API.post(`/v1/elections/${electionId}/candidates`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

/* remove candidate */
export const removeCandidate = async (electionId, candidateId) => {
  const res = await API.delete(
    `/v1/elections/${electionId}/candidates/${encodeURIComponent(candidateId)}`,
  );

  return res.data;
};
