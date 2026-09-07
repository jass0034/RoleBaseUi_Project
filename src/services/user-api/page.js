import axios from 'axios';

// const API_URL = 'https://localhost:7156/api/Register';
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://rolebase-api-2.onrender.com'
).replace(/\/$/, '');
const API_URL = `${API_BASE_URL}/api/Register`;

export const getUsers = async () => {
  return await axios.get(API_URL);
};

export const getUserById = async (id) => {
  return await axios.post(`${API_URL}/${id}`);
};

export const createUser = async (user) => {
  return await axios.post(API_URL, user);
};

export const updateUser = async (user) => {
  return await axios.put(`${API_URL}`, user);
};

export const deleteUser = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};
