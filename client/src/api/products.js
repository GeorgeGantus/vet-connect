import axiosInstance from './axiosInstance';

const API_URL = '/api/products';

/**
 * Adds a new product to a catalog, including an image.
 * @param {FormData} formData - The form data for the new product.
 * @returns {Promise<object>} The newly created product.
 */
export const addProduct = async (formData) => {
  // When passing FormData, axios automatically sets the 'Content-Type' to 'multipart/form-data'
  const response = await axiosInstance.post(API_URL, formData);
  return response.data;
};

/**
 * Toggles the "like" status of a product for the current user.
 * @param {number} productId - The ID of the product to like/unlike.
 * @returns {Promise<object>} An object with the new liked status.
 */
export const toggleLikeProduct = async (productId) => {
  const response = await axiosInstance.post(`${API_URL}/${productId}/like`);
  return response.data;
};

/**
 * Submits a budget request for a product.
 * @param {number} productId - The ID of the product.
 * @param {string} [message] - An optional message to include with the request.
 * @returns {Promise<object>} The server response.
 */
export const requestBudgetForProduct = async (productId, message) => {
  const response = await axiosInstance.post(`${API_URL}/${productId}/request-budget`, { message });
  return response.data;
};
