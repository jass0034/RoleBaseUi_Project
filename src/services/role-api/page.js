import axios from 'axios';

const API_URL = 'https://localhost:7156/api/Role';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
export const getRoles = async () => {
  return axios.get(API_URL);
};

export const getRolesById = async (id) => {
  return await axios.get(`${API_URL}/${id}`, getAuthHeader());
};

export const createRole = async (role) => {
  return await axios.post(API_URL, role, getAuthHeader());
};

export const updateRole = async (role) => {
  return await axios.put(`${API_URL}`, role, getAuthHeader());
};

export const deleteRole = async (id) => {
  return await axios.delete(`${API_URL}/${id}`, getAuthHeader());
};
