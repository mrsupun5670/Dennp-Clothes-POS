import axios from 'axios';
import { API_URL } from '../config/api';

export interface InventoryItem {
  inventory_id: number;
  shop_id: number;
  item_name: string;
  quantity_in_stock: number;
  updated_at: string;
  unit_cost: number | string;
}

/**
 * Get all inventory items for a specific shop
 */
export const getShopInventory = async (shopId: number): Promise<InventoryItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/inventory/${shopId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching shop inventory:', error);
    throw error;
  }
};

/**
 * Get a single inventory item by ID
 */
export const getInventoryItem = async (inventoryId: number): Promise<InventoryItem> => {
  try {
    const response = await axios.get(`${API_URL}/inventory/item/${inventoryId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    throw error;
  }
};

/**
 * Add a new inventory item
 */
export const addInventoryItem = async (
  shopId: number,
  inventoryId: number,
  itemName: string,
  quantityInStock: number,
  unitCost: number
): Promise<{ inventory_id: number }> => {
  try {
    const response = await axios.post(`${API_URL}/inventory`, {
      inventory_id: inventoryId,
      shop_id: shopId,
      item_name: itemName,
      quantity_in_stock: quantityInStock,
      unit_cost: unitCost,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

/**
 * Update an inventory item
 */
export const updateInventoryItem = async (
  inventoryId: number,
  itemName: string,
  quantityInStock: number,
  unitCost: number
): Promise<void> => {
  try {
    await axios.put(`${API_URL}/inventory/${inventoryId}`, {
      itemName,
      quantityInStock,
      unitCost,
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

/**
 * Delete an inventory item
 */
export const deleteInventoryItem = async (inventoryId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/inventory/${inventoryId}`);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

/**
 * Search inventory items by name
 */
export const searchInventoryItems = async (
  shopId: number,
  searchTerm: string
): Promise<InventoryItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/inventory/search/${shopId}`, {
      params: { q: searchTerm },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error searching inventory items:', error);
    throw error;
  }
};
