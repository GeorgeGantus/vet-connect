import axiosInstance from './axiosInstance';

const API_URL = '/api/catalogs';

/**
 * Fetches the catalogs for the currently logged-in vendor.
 * @returns {Promise<object>} The list of catalogs.
 */
export const getMyCatalogs = async () => {
  const response = await axiosInstance.get(`${API_URL}/my-catalogs`);
  return response.data;
};

/**
 * Creates a new catalog for the currently logged-in vendor.
 * @param {object} catalogData - The data for the new catalog.
 * @param {string} catalogData.name - The name of the catalog.
 * @param {string} [catalogData.description] - The description of the catalog.
 * @returns {Promise<object>} The newly created catalog.
 */
export const createCatalog = async (catalogData) => {
  const response = await axiosInstance.post(API_URL, catalogData);
  return response.data;
};

/**
 * Updates an existing catalog for the currently logged-in vendor.
 * @param {number} catalogId - The ID of the catalog to update.
 * @param {object} catalogData - The data to update.
 * @param {string} [catalogData.name] - The new name of the catalog.
 * @param {string} [catalogData.description] - The new description of the catalog.
 * @returns {Promise<object>} The updated catalog.
 */
export const updateCatalog = async (catalogId, catalogData) => {
  const response = await axiosInstance.put(`${API_URL}/${catalogId}`, catalogData);
  return response.data;
};

/**
 * Deletes a catalog for the currently logged-in vendor.
 * @param {number} catalogId - The ID of the catalog to delete.
 * @returns {Promise<object>} The confirmation message.
 */
export const deleteCatalog = async (catalogId) => {
  const response = await axiosInstance.delete(`${API_URL}/${catalogId}`);
  return response.data;
};

/**
 * Fetches a single catalog and its products for the currently logged-in vendor.
 * @param {number} catalogId - The ID of the catalog to fetch.
 * @returns {Promise<object>} The catalog with its list of products.
 */
export const getCatalogWithProducts = async (catalogId) => {
  const response = await axiosInstance.get(`${API_URL}/${catalogId}/products`);
  return response.data;
};

/**
 * Fetches a public catalog and its products using an access code.
 * @param {string} accessCode - The access code of the catalog.
 * @returns {Promise<object>} The catalog with its list of products.
 */
export const getCatalogByAccessCode = async (accessCode) => {
  const response = await axiosInstance.get(`${API_URL}/view/${accessCode}`);
  return response.data;
};

/**
 * Fetches events for a specific catalog owned by the vendor.
 * @param {number} catalogId - The ID of the catalog.
 * @returns {Promise<object>} An object containing catalog info and a list of events.
 */
export const getCatalogEvents = async (catalogId) => {
  const response = await axiosInstance.get(`${API_URL}/${catalogId}/events`);
  return response.data;
};

/**
 * Fetches dashboard activity for the currently logged-in vendor.
 * @returns {Promise<Array>} A list of recent events.
 */
export const getDashboardActivity = async () => {
  const response = await axiosInstance.get(`${API_URL}/events`);
  return response.data;
};

/**
 * Fetches the most recently viewed catalogs for the currently logged-in veterinarian.
 * @returns {Promise<Array>} A list of recently viewed catalogs.
 */
export const getRecentlyViewedCatalogs = async () => {
  const response = await axiosInstance.get(`${API_URL}/recently-viewed`);
  return response.data;
};

/**
 * Fetches all clients who have liked at least one of the vendor's products.
 * @returns {Promise<Array>} A list of clients with their liked products.
 */
export const getClientsWhoLikedProducts = async () => {
  const response = await axiosInstance.get(`${API_URL}/clients`);
  return response.data;
};

/**
 * Fetches dashboard statistics (total likes, top products) for the vendor.
 * @returns {Promise<object>} An object containing dashboard stats.
 */
export const getDashboardStats = async () => {
  const response = await axiosInstance.get(`${API_URL}/dashboard-stats`);
  return response.data;
};