import express from 'express';
import { z } from 'zod';
import { generateRestoId, getRestoFlowDb } from '../db.ts';
import {
  AuthenticatedRestoFlowRequest,
  isSafeHttpUrl,
  requireRestoFlowAuth,
  requireRestoFlowRole
} from '../security.ts';

const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Category name is required').max(80),
  description: z.string().trim().max(240).optional().default(''),
  sortOrder: z.coerce.number().int().min(0).max(999).optional().default(10)
});

const variantSchema = z.object({
  name: z.string().trim().min(1).max(60),
  priceDelta: z.coerce.number().min(-5000).max(50000)
});

const addonSchema = z.object({
  name: z.string().trim().min(1).max(60),
  price: z.coerce.number().min(0).max(10000)
});

const menuItemCreateSchema = z.object({
  categoryId: z.string().trim().min(1, 'Category is required'),
  sku: z.string().trim().min(2).max(32).optional(),
  name: z.string().trim().min(2, 'Dish name is required').max(120),
  description: z.string().trim().max(400).optional().default(''),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => isSafeHttpUrl(v), 'Image URL must use http(s) or a relative path')
    .optional()
    .default(''),
  basePrice: z.coerce.number().min(0).max(500000),
  dietaryType: z.enum(['veg', 'non_veg', 'egg', 'vegan']).default('veg'),
  prepTimeMins: z.coerce.number().int().min(1).max(180).default(15),
  kitchenStation: z
    .enum(['hot_kitchen', 'tandoor', 'bar', 'pastry', 'cold_station'])
    .default('hot_kitchen'),
  isAvailable: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  variants: z.array(variantSchema).optional().default([]),
  addons: z.array(addonSchema).optional().default([])
});

const menuItemUpdateSchema = menuItemCreateSchema.partial();

function safeParseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mapMenuItemRow(r: any) {
  return {
    id: r.id,
    categoryId: r.category_id,
    categoryName: r.category_name || '',
    sku: r.sku,
    name: r.name,
    description: r.description || '',
    imageUrl: r.image_url || '',
    basePrice: Number(r.base_price),
    dietaryType: r.dietary_type,
    prepTimeMins: Number(r.prep_time_mins || 15),
    kitchenStation: r.kitchen_station || 'hot_kitchen',
    isAvailable: Boolean(r.is_available),
    isFeatured: Boolean(r.is_featured),
    variants: safeParseJson(r.variants_json, []),
    addons: safeParseJson(r.addons_json, []),
    isDemo: Boolean(r.is_demo),
    updatedAt: r.updated_at
  };
}

export function createRestoFlowMenuRouter(): express.Router {
  const router = express.Router();

  // Categories
  router.get('/menu/categories', requireRestoFlowAuth, (_req, res) => {
    const db = getRestoFlowDb();
    const rows = db
      .prepare(`
        SELECT c.*, COUNT(m.id) AS item_count
        FROM menu_categories c
        LEFT JOIN menu_items m ON m.category_id = c.id
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC
      `)
      .all() as any[];

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description || '',
        sortOrder: Number(r.sort_order || 0),
        isActive: Boolean(r.is_active),
        isDemo: Boolean(r.is_demo),
        itemCount: Number(r.item_count || 0)
      }))
    });
  });

  router.post(
    '/menu/categories',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const parsed = categoryCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid category data.'
        });
      }

      const db = getRestoFlowDb();
      const baseSlug = parsed.data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'category';
      const existing = db.prepare('SELECT id FROM menu_categories WHERE LOWER(slug) = LOWER(?)').get(baseSlug);
      const slug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
      const id = generateRestoId('rfcat');
      const nowIso = new Date().toISOString();

      db.prepare(`
        INSERT INTO menu_categories (id, name, slug, description, sort_order, is_active, is_demo, created_at)
        VALUES (?, ?, ?, ?, ?, 1, 0, ?)
      `).run(id, parsed.data.name, slug, parsed.data.description, parsed.data.sortOrder, nowIso);

      res.status(201).json({
        success: true,
        message: 'Menu category created.',
        data: {
          id,
          name: parsed.data.name,
          slug,
          description: parsed.data.description,
          sortOrder: parsed.data.sortOrder,
          isActive: true,
          isDemo: false,
          itemCount: 0
        }
      });
    }
  );

  router.delete(
    '/menu/categories/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req, res) => {
      const db = getRestoFlowDb();
      const linked = (
        db.prepare('SELECT COUNT(*) AS c FROM menu_items WHERE category_id = ?').get(req.params.id) as { c: number }
      ).c;
      if (linked > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category with ${linked} linked menu item(s). Move or remove items first.`
        });
      }
      const info = db.prepare('DELETE FROM menu_categories WHERE id = ?').run(req.params.id);
      if (info.changes === 0) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      res.json({ success: true, message: 'Category deleted.' });
    }
  );

  // Menu Items
  router.get('/menu/items', requireRestoFlowAuth, (req, res) => {
    const db = getRestoFlowDb();
    const search = String(req.query.search || '').trim();
    const categoryId = String(req.query.categoryId || '').trim();
    const dietaryType = String(req.query.dietaryType || '').trim();
    const availableOnly = String(req.query.availableOnly || '').toLowerCase() === 'true';

    const conds: string[] = [];
    const params: any[] = [];

    if (search) {
      conds.push('(m.name LIKE ? OR m.sku LIKE ? OR m.description LIKE ?)');
      const p = `%${search}%`;
      params.push(p, p, p);
    }
    if (categoryId && categoryId !== 'all') {
      conds.push('m.category_id = ?');
      params.push(categoryId);
    }
    if (dietaryType && dietaryType !== 'all' && ['veg', 'non_veg', 'egg', 'vegan'].includes(dietaryType)) {
      conds.push('m.dietary_type = ?');
      params.push(dietaryType);
    }
    if (availableOnly) {
      conds.push('m.is_available = 1');
    }

    const whereSql = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';
    const rows = db
      .prepare(`
        SELECT m.*, c.name AS category_name
        FROM menu_items m
        JOIN menu_categories c ON c.id = m.category_id
        ${whereSql}
        ORDER BY c.sort_order ASC, m.is_featured DESC, m.name ASC
      `)
      .all(...params) as any[];

    res.json({ success: true, data: rows.map(mapMenuItemRow) });
  });

  router.post(
    '/menu/items',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req, res) => {
      const parsed = menuItemCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid menu item payload.'
        });
      }

      const db = getRestoFlowDb();
      const cat = db.prepare('SELECT id FROM menu_categories WHERE id = ?').get(parsed.data.categoryId);
      if (!cat) {
        return res.status(400).json({ success: false, message: 'Selected category does not exist.' });
      }

      const d = parsed.data;
      const id = generateRestoId('rfm');
      const sku = (d.sku || `SKU-${Date.now().toString().slice(-5)}`).toUpperCase();
      const skuExists = db.prepare('SELECT id FROM menu_items WHERE LOWER(sku) = LOWER(?)').get(sku);
      if (skuExists) {
        return res.status(409).json({ success: false, message: `SKU "${sku}" is already in use.` });
      }

      const nowIso = new Date().toISOString();
      db.prepare(`
        INSERT INTO menu_items (
          id, category_id, sku, name, description, image_url, base_price, dietary_type,
          prep_time_mins, kitchen_station, is_available, is_featured, variants_json, addons_json, is_demo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).run(
        id,
        d.categoryId,
        sku,
        d.name,
        d.description,
        d.imageUrl,
        d.basePrice,
        d.dietaryType,
        d.prepTimeMins,
        d.kitchenStation,
        d.isAvailable ? 1 : 0,
        d.isFeatured ? 1 : 0,
        JSON.stringify(d.variants),
        JSON.stringify(d.addons),
        nowIso,
        nowIso
      );

      const created = db
        .prepare('SELECT m.*, c.name AS category_name FROM menu_items m JOIN menu_categories c ON c.id = m.category_id WHERE m.id = ?')
        .get(id);

      res.status(201).json({
        success: true,
        message: 'Menu item added.',
        data: mapMenuItemRow(created)
      });
    }
  );

  router.patch(
    '/menu/items/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req, res) => {
      const parsed = menuItemUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid menu item update.'
        });
      }

      const db = getRestoFlowDb();
      const current = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as any;
      if (!current) {
        return res.status(404).json({ success: false, message: 'Menu item not found.' });
      }

      const d = parsed.data;
      const nowIso = new Date().toISOString();
      db.prepare(`
        UPDATE menu_items
        SET
          category_id = ?,
          name = ?,
          description = ?,
          image_url = ?,
          base_price = ?,
          dietary_type = ?,
          prep_time_mins = ?,
          kitchen_station = ?,
          is_available = ?,
          is_featured = ?,
          variants_json = ?,
          addons_json = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        d.categoryId ?? current.category_id,
        d.name ?? current.name,
        d.description ?? current.description,
        d.imageUrl ?? current.image_url,
        d.basePrice ?? current.base_price,
        d.dietaryType ?? current.dietary_type,
        d.prepTimeMins ?? current.prep_time_mins,
        d.kitchenStation ?? current.kitchen_station,
        d.isAvailable !== undefined ? (d.isAvailable ? 1 : 0) : current.is_available,
        d.isFeatured !== undefined ? (d.isFeatured ? 1 : 0) : current.is_featured,
        d.variants !== undefined ? JSON.stringify(d.variants) : current.variants_json,
        d.addons !== undefined ? JSON.stringify(d.addons) : current.addons_json,
        nowIso,
        req.params.id
      );

      const updated = db
        .prepare('SELECT m.*, c.name AS category_name FROM menu_items m JOIN menu_categories c ON c.id = m.category_id WHERE m.id = ?')
        .get(req.params.id);

      res.json({ success: true, message: 'Menu item updated.', data: mapMenuItemRow(updated) });
    }
  );

  // Instant 86 / Availability Toggle (Owner, Manager, or Kitchen Staff)
  router.patch(
    '/menu/items/:id/availability',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'kitchen']),
    (req, res) => {
      const db = getRestoFlowDb();
      const current = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as any;
      if (!current) {
        return res.status(404).json({ success: false, message: 'Menu item not found.' });
      }
      const nextAvail =
        typeof req.body?.isAvailable === 'boolean' ? req.body.isAvailable : !Boolean(current.is_available);

      db.prepare('UPDATE menu_items SET is_available = ?, updated_at = ? WHERE id = ?').run(
        nextAvail ? 1 : 0,
        new Date().toISOString(),
        req.params.id
      );

      const updated = db
        .prepare('SELECT m.*, c.name AS category_name FROM menu_items m JOIN menu_categories c ON c.id = m.category_id WHERE m.id = ?')
        .get(req.params.id);

      res.json({
        success: true,
        message: nextAvail ? 'Dish marked Available.' : 'Dish marked Unavailable (86).',
        data: mapMenuItemRow(updated)
      });
    }
  );

  router.delete(
    '/menu/items/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req, res) => {
      const db = getRestoFlowDb();
      const usedInOrders = (
        db.prepare('SELECT COUNT(*) AS c FROM order_items WHERE menu_item_id = ?').get(req.params.id) as { c: number }
      ).c;
      if (usedInOrders > 0) {
        return res.status(400).json({
          success: false,
          message: 'This dish is referenced in historical orders. Mark it Unavailable instead of deleting.'
        });
      }
      const info = db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
      if (info.changes === 0) {
        return res.status(404).json({ success: false, message: 'Menu item not found.' });
      }
      res.json({ success: true, message: 'Menu item deleted.' });
    }
  );

  return router;
}
