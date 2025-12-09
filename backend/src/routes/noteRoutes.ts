import express from "express";
import NoteController from "../controllers/NoteController";

const router = express.Router();

router.get("/", NoteController.getAllNotes);

export default router;
