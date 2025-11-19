/**
 * Color Routes
 * API endpoints for color operations
 */

import { Router } from 'express';
import ColorController from '../controllers/ColorController';

const router = Router();

// GET routes
router.get('/', ColorController.getAllColors.bind(ColorController));
router.get('/search', ColorController.searchColors.bind(ColorController));
router.get('/:id', ColorController.getColorById.bind(ColorController));

// POST route
router.post('/', ColorController.createColor.bind(ColorController));

// PUT route
router.put('/:id', ColorController.updateColor.bind(ColorController));

// DELETE route
router.delete('/:id', ColorController.deleteColor.bind(ColorController));

export default router;
