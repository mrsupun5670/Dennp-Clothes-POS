import { query } from "../config/database";

interface Note {
    note_id: number;
    order_id: number;
    shop_id: number;
    notes: string;
    created_at: Date;
    updated_at: Date;
}

class NoteModel {
  static async getAllNotes(shopId: number): Promise<Note[]> {
    const sql = "SELECT order_id, shop_id, notes, created_at, updated_at FROM orders WHERE shop_id = ? AND notes IS NOT NULL AND notes != '' ORDER BY updated_at DESC";
    const rows = await query(sql, [shopId]);
    // Map order_id to note_id for frontend compatibility
    return (rows as any[]).map(row => ({
      note_id: row.order_id,
      order_id: row.order_id,
      shop_id: row.shop_id,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }
}

export default NoteModel;
