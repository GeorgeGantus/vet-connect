import axiosInstance from './axiosInstance';

const API_URL = '/api/products';

/**
 * Adds a new product to a catalog.
 * @param {object} productData - The data for the new product.
 * @param {string} productData.name - The name of the product.
 * @param {string} [productData.description] - The description of the product.
 * @param {number} productData.price - The price of the product.
 * @param {number} productData.catalog_id - The ID of the catalog this product belongs to.
 * @returns {Promise<object>} The newly created product.
 */
export const addProduct = async (productData) => {
  const response = await axiosInstance.post(API_URL, productData);
  return response.data;
};