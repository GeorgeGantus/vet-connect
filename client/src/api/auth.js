import axiosInstance from './axiosInstance';

const API_URL = '/api/auth';

/**
 * Logs in a user.
 * @param {object} credentials - The user's credentials.
 * @param {string} credentials.email - The user's email.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<object>} The response data, including the token.
 */
export const loginUser = async (credentials) => {
  const response = await axiosInstance.post(`${API_URL}/login`, credentials);
  return response.data;
};

/**
 * Registers a new user.
 * @param {object} userData - The user's registration data.
 * @param {string} userData.name - The user's name.
 * @param {string} userData.email - The user's email.
 * @param {string} userData.password - The user's password.
 * @param {string} userData.role - The user's role ('veterinarian' or 'vendor').
 * @returns {Promise<object>} The response data, including the token.
 */
export const registerUser = async (userData) => {
  const response = await axiosInstance.post(`${API_URL}/register`, userData);
  return response.data;
};