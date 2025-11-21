import axios from 'axios';
import { API_URL } from '../config/api';

export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const updateProductStock = async (
  productId: number,
  sizeId: number,
  colorId: number,
  quantity: number
) => {
  try {
    await axios.post(`${API_URL}/products/stock`, {
      productId,
      sizeId,
      colorId,
      quantity,
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

export const clearProductStock = async (productId: number) => {
  try {
    await axios.delete(`${API_URL}/products/${productId}/stock`);
  } catch (error) {
    console.error('Error clearing product stock:', error);
    throw error;
  }
};
