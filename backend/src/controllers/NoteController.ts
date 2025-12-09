import { Request, Response } from "express";
import NoteModel from "../models/Note";
import { logger } from "../utils/logger";

class NoteController {
  async getAllNotes(req: Request, res: Response): Promise<void> {
    try {
      const shopId = req.query.shop_id ? Number(req.query.shop_id) : undefined;
      if (!shopId) {
        res.status(400).json({ success: false, error: "shop_id is required" });
        return;
      }
      const notes = await NoteModel.getAllNotes(shopId);
      res.json({
        success: true,
        data: notes,
        message: `Retrieved ${notes.length} notes`,
      });
    } catch (error: any) {
      logger.error("Error in getAllNotes:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch notes",
        details: error.message,
      });
    }
  }
}

export default new NoteController();
