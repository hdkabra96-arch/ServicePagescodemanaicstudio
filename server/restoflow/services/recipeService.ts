import type { RecipeRecord } from '../../../src/types/restoflow.ts';
import { generateRestoId, getRestoFlowDb } from '../db.ts';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface UnmappedMenuDish {
  id: string;
  name: string;
  categoryName: string;
  basePrice: number;
  dietaryType: string;
}

export interface RecipeDashboardPayload {
  recipes: RecipeRecord[];
  unmappedMenuItems: UnmappedMenuDish[];
  analytics: {
    mappedCount: number;
    unmappedCount: number;
    avgFoodCostPct: number;
    highCostCount: number;
    avgGrossMargin: number;
  };
}

export function listRecipesWithAnalytics(search?: string): RecipeDashboardPayload {
  const db = getRestoFlowDb();
  const conds: string[] = [];
  const params: any[] = [];

  if (search?.trim()) {
    conds.push('(m.name LIKE ? OR c.name LIKE ? OR r.prep_notes LIKE ?)');
    const p = `%${search.trim()}%`;
    params.push(p, p, p);
  }
  const whereSql = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';

  const recipeRows = db
    .prepare(`
      SELECT
        r.*,
        m.name AS menu_item_name,
        m.base_price AS selling_price,
        c.name AS category_name
      FROM recipes r
      JOIN menu_items m ON m.id = r.menu_item_id
      JOIN menu_categories c ON c.id = m.category_id
      ${whereSql}
      ORDER BY m.name ASC
    `)
    .all(...params) as any[];

  const recipeIds = recipeRows.map((r) => r.id);
  const ingByRecipe = new Map<string, RecipeRecord['ingredients']>();

  if (recipeIds.length > 0) {
    const placeholders = recipeIds.map(() => '?').join(',');
    const ingRows = db
      .prepare(`
        SELECT
          ri.*,
          ing.name AS ingredient_name,
          ing.unit AS ingredient_unit,
          ing.unit_cost AS ingredient_unit_cost
        FROM recipe_ingredients ri
        JOIN ingredients ing ON ing.id = ri.ingredient_id
        WHERE ri.recipe_id IN (${placeholders})
        ORDER BY ing.name ASC
      `)
      .all(...recipeIds) as any[];

    for (const row of ingRows) {
      const qty = Number(row.quantity_required);
      const unitCost = Number(row.ingredient_unit_cost);
      const lineCost = round2(qty * unitCost);
      const arr = ingByRecipe.get(row.recipe_id) || [];
      arr.push({
        id: row.id,
        ingredientId: row.ingredient_id,
        ingredientName: row.ingredient_name,
        unit: row.ingredient_unit || row.unit,
        quantityRequired: qty,
        unitCost: round2(unitCost),
        lineCost
      });
      ingByRecipe.set(row.recipe_id, arr);
    }
  }

  const recipes: RecipeRecord[] = recipeRows.map((r) => {
    const ingredients = ingByRecipe.get(r.id) || [];
    const totalRecipeCost = round2(ingredients.reduce((acc, i) => acc + i.lineCost, 0));
    const yieldServings = Math.max(1, Number(r.yield_servings || 1));
    const costPerServing = round2(totalRecipeCost / yieldServings);
    const sellingPrice = round2(Number(r.selling_price || 0));
    const foodCostPct = sellingPrice > 0 ? round2((costPerServing / sellingPrice) * 100) : 0;
    const grossMargin = round2(sellingPrice - costPerServing);

    return {
      id: r.id,
      menuItemId: r.menu_item_id,
      menuItemName: r.menu_item_name,
      categoryName: r.category_name,
      sellingPrice,
      yieldServings,
      prepNotes: r.prep_notes || '',
      totalRecipeCost,
      costPerServing,
      foodCostPct,
      grossMargin,
      isDemo: Boolean(r.is_demo),
      updatedAt: r.updated_at,
      ingredients
    };
  });

  const unmappedRows = db
    .prepare(`
      SELECT m.id, m.name, m.base_price, m.dietary_type, c.name AS category_name
      FROM menu_items m
      JOIN menu_categories c ON c.id = m.category_id
      LEFT JOIN recipes r ON r.menu_item_id = m.id
      WHERE r.id IS NULL
      ORDER BY c.sort_order ASC, m.name ASC
    `)
    .all() as any[];

  const unmappedMenuItems: UnmappedMenuDish[] = unmappedRows.map((u) => ({
    id: u.id,
    name: u.name,
    categoryName: u.category_name,
    basePrice: round2(Number(u.base_price)),
    dietaryType: u.dietary_type
  }));

  const mappedCount = recipes.length;
  const avgFoodCostPct =
    mappedCount > 0
      ? round2(recipes.reduce((sum, r) => sum + r.foodCostPct, 0) / mappedCount)
      : 0;
  const highCostCount = recipes.filter((r) => r.foodCostPct > 35).length;
  const avgGrossMargin =
    mappedCount > 0
      ? round2(recipes.reduce((sum, r) => sum + r.grossMargin, 0) / mappedCount)
      : 0;

  return {
    recipes,
    unmappedMenuItems,
    analytics: {
      mappedCount,
      unmappedCount: unmappedMenuItems.length,
      avgFoodCostPct,
      highCostCount,
      avgGrossMargin
    }
  };
}

export function upsertRecipe(input: {
  menuItemId: string;
  yieldServings: number;
  prepNotes?: string;
  ingredients: { ingredientId: string; quantityRequired: number }[];
}): RecipeRecord {
  const db = getRestoFlowDb();
  const dish = db.prepare('SELECT id, name FROM menu_items WHERE id = ?').get(input.menuItemId) as any;
  if (!dish) throw new Error('Selected menu item not found.');

  if (!input.ingredients || input.ingredients.length === 0) {
    throw new Error('Map at least one ingredient to this recipe.');
  }

  // Deduplicate and verify ingredients exist
  const seen = new Set<string>();
  const resolvedIngredients: { ingredientId: string; quantityRequired: number; unit: string }[] = [];
  for (const item of input.ingredients) {
    if (seen.has(item.ingredientId)) {
      throw new Error('Duplicate ingredient detected in recipe. Combine quantities on a single row.');
    }
    seen.add(item.ingredientId);
    const ing = db.prepare('SELECT id, unit FROM ingredients WHERE id = ?').get(item.ingredientId) as any;
    if (!ing) throw new Error('One or more selected ingredients do not exist.');
    const qty = Number(item.quantityRequired);
    if (!(qty > 0)) throw new Error('Ingredient quantity must be greater than zero.');
    resolvedIngredients.push({
      ingredientId: ing.id,
      quantityRequired: Math.round(qty * 1000) / 1000,
      unit: ing.unit
    });
  }

  const yieldServings = Math.max(1, Math.round(Number(input.yieldServings || 1)));
  const nowIso = new Date().toISOString();
  const existing = db
    .prepare('SELECT id FROM recipes WHERE menu_item_id = ?')
    .get(input.menuItemId) as { id: string } | undefined;

  const recipeId = existing?.id || generateRestoId('rfrec');

  db.transaction(() => {
    if (existing) {
      db.prepare(`
        UPDATE recipes
        SET yield_servings = ?, prep_notes = ?, is_demo = 0, updated_at = ?
        WHERE id = ?
      `).run(yieldServings, (input.prepNotes || '').trim(), nowIso, recipeId);
      db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(recipeId);
    } else {
      db.prepare(`
        INSERT INTO recipes (id, menu_item_id, yield_servings, prep_notes, is_demo, updated_at)
        VALUES (?, ?, ?, ?, 0, ?)
      `).run(recipeId, input.menuItemId, yieldServings, (input.prepNotes || '').trim(), nowIso);
    }

    const insertRi = db.prepare(`
      INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity_required, unit)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const ri of resolvedIngredients) {
      insertRi.run(generateRestoId('rfri'), recipeId, ri.ingredientId, ri.quantityRequired, ri.unit);
    }
  })();

  const all = listRecipesWithAnalytics();
  const saved = all.recipes.find((r) => r.id === recipeId);
  if (!saved) throw new Error('Failed to load saved recipe.');
  return saved;
}

export function deleteRecipe(recipeId: string): void {
  const db = getRestoFlowDb();
  const info = db.prepare('DELETE FROM recipes WHERE id = ?').run(recipeId);
  if (info.changes === 0) throw new Error('Recipe not found.');
}
