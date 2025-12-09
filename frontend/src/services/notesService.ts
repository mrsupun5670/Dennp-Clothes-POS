import { API_URL } from "../config/api";

export interface Note {
    note_id: number;
    order_id: number;
    shop_id: number;
    notes: string;
    created_at: string;
    updated_at: string;
}


export const getShopNotes = async (shopId: number): Promise<Note[]> => {
  try {
    const response = await fetch(`${API_URL}/notes?shop_id=${shopId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch notes");
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching shop notes:", error);
    throw error;
  }
};
