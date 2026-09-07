import axios from 'axios';

// const API_URl = 'https://localhost:7156/api/Login';
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://rolebase-api-2.onrender.com'
).replace(/\/$/, '');
const API_URL = `${API_BASE_URL}/api/Login`;

export const sendOtp = (data) => {
  return axios.post(`${API_URl}/sendOtp`, data);
};

export const verifyOtp = (data) => {
  return axios.post(`${API_URl}/verifyOtp`, data);
};
