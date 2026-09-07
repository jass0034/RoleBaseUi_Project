import axios from 'axios';

const API_URl = 'https://localhost:7156/api/Login';

export const sendOtp = (data) => {
  return axios.post(`${API_URl}/sendOtp`, data);
};

export const verifyOtp = (data) => {
  return axios.post(`${API_URl}/verifyOtp`, data);
};
