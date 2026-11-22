import express from 'express';
import { z } from 'zod';
import { requireRestoFlowAuth, requireRestoFlowRole } from '../security.ts';
import {
  deleteRecipe,
  listRecipesWithAnalytics,
  upsertRecipe
} from '../services/recipeService.ts';

const upsertRecipeSchema = z.object({
  menuItemId: z.string().trim().min(1, 'Select a menu dish'),
  yieldServings: z.coerce.number().int().min(1, 'Yield must be at least 1 serving').max(100).default(1),
  prepNotes: z.string().trim().max(500).optional().default(''),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.string().trim().min(1),
        quantityRequired: z.coerce.number().positive('Quantity must be greater than zero').max(10000)
      })
    )
    .min(1, 'Add at least one ingredient to map this recipe')
});

export function createRestoFlowRecipeRouter(): express.Router {
  const router = express.Router();

  router.get('/recipes', requireRestoFlowAuth, (req, res) => {
    const search = String(req.query.search || '');
    res.json({ success: true, data: listRecipesWithAnalytics(search) });
  });

  router.post(
    '/recipes',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager']),
    (req, res) => {
      const parsed = upsertRecipeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid recipe payload.'
        });
      }
      try {
        const saved = upsertRecipe(parsed.data);
        res.status(201).json({
          success: true,
          message: `Recipe cost sheet saved for ${saved.menuItemName}.`,
          data: saved
        });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.delete(
    '/recipes/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager']),
    (req, res) => {
      try {
        deleteRecipe(req.params.id);
        res.json({ success: true, message: 'Recipe deleted.' });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  return router;
}
