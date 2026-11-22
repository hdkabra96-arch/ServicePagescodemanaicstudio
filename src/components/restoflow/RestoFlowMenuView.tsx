import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  FolderPlus,
  Loader2,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  MenuCategory,
  MenuItem,
  RestaurantSettings,
  RestoFlowRolePermissions
} from '../../types/restoflow';

interface RestoFlowMenuViewProps {
  restaurant: RestaurantSettings;
  permissions: RestoFlowRolePermissions;
}

export const RestoFlowMenuView: React.FC<RestoFlowMenuViewProps> = ({
  restaurant,
  permissions
}) => {
  const sym = restaurant.currencySymbol || '₹';
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Item modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    categoryId: '',
    name: '',
    sku: '',
    description: '',
    imageUrl: '',
    basePrice: '350',
    dietaryType: 'veg' as 'veg' | 'non_veg' | 'egg' | 'vegan',
    prepTimeMins: '15',
    kitchenStation: 'hot_kitchen' as 'hot_kitchen' | 'tandoor' | 'bar' | 'pastry' | 'cold_station',
    variantsText: 'Regular:0, Large:180',
    addonsText: 'Extra Dip:50'
  });

  const loadMenu = useCallback(async () => {
    try {
      const [cRes, iRes] = await Promise.all([
        restoFlowApi.getMenuCategories(),
        restoFlowApi.getMenuItems({
          search: search.trim() || undefined,
          categoryId: catFilter,
          dietaryType: dietFilter
        })
      ]);
      setCategories(cRes.data);
      setItems(iRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load menu catalog.');
    } finally {
      setIsLoading(false);
    }
  }, [search, catFilter, dietFilter]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const handleToggleAvail = async (item: MenuItem) => {
    setBusyId(item.id);
    setError(null);
    try {
      const res = await restoFlowApi.toggleMenuItemAvailability(item.id, !item.isAvailable);
      setFeedback(res.message || 'Availability updated.');
      await loadMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update availability.');
    } finally {
      setBusyId(null);
    }
  };

  const openCreateItem = () => {
    setEditingItem(null);
    setItemForm({
      categoryId: categories[0]?.id || '',
      name: '',
      sku: '',
      description: '',
      imageUrl: '',
      basePrice: '350',
      dietaryType: 'veg',
      prepTimeMins: '15',
      kitchenStation: 'hot_kitchen',
      variantsText: 'Regular:0',
      addonsText: ''
    });
    setShowItemModal(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      sku: item.sku,
      description: item.description,
      imageUrl: item.imageUrl,
      basePrice: String(item.basePrice),
      dietaryType: item.dietaryType,
      prepTimeMins: String(item.prepTimeMins),
      kitchenStation: item.kitchenStation,
      variantsText: item.variants.map((v) => `${v.name}:${v.priceDelta}`).join(', '),
      addonsText: item.addons.map((a) => `${a.name}:${a.price}`).join(', ')
    });
    setShowItemModal(true);
  };

  const parsePairList = (raw: string) =>
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((entry) => {
        const [name, num] = entry.split(':').map((x) => x.trim());
        return { name: name || 'Option', val: Number(num) || 0 };
      });

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId('save-item');
    setError(null);
    try {
      const variants = parsePairList(itemForm.variantsText).map((x) => ({
        name: x.name,
        priceDelta: x.val
      }));
      const addons = parsePairList(itemForm.addonsText).map((x) => ({
        name: x.name,
        price: Math.max(0, x.val)
      }));

      if (editingItem) {
        await restoFlowApi.updateMenuItem(editingItem.id, {
          categoryId: itemForm.categoryId,
          name: itemForm.name,
          description: itemForm.description,
          imageUrl: itemForm.imageUrl,
          basePrice: Number(itemForm.basePrice),
          dietaryType: itemForm.dietaryType,
          prepTimeMins: Number(itemForm.prepTimeMins),
          kitchenStation: itemForm.kitchenStation,
          variants,
          addons
        });
        setFeedback(`Updated "${itemForm.name}".`);
      } else {
        await restoFlowApi.createMenuItem({
          categoryId: itemForm.categoryId,
          sku: itemForm.sku || undefined,
          name: itemForm.name,
          description: itemForm.description,
          imageUrl: itemForm.imageUrl,
          basePrice: Number(itemForm.basePrice),
          dietaryType: itemForm.dietaryType,
          prepTimeMins: Number(itemForm.prepTimeMins),
          kitchenStation: itemForm.kitchenStation,
          variants,
          addons
        });
        setFeedback(`Added "${itemForm.name}" to the menu.`);
      }

      setShowItemModal(false);
      await loadMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save menu item.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId('save-cat');
    setError(null);
    try {
      await restoFlowApi.createMenuCategory({ name: catName, description: catDesc });
      setCatName('');
      setCatDesc('');
      setShowCatModal(false);
      setFeedback('Menu category created.');
      await loadMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create category.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            Module 03 · Menu Catalog &amp; 86 Controls
          </div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Menu Categories, Dishes &amp; Modifiers
          </h1>
        </div>

        {permissions.canManageMenu && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCatModal(true)}
              className="inline-flex items-center gap-1.5 bg-white border border-[#E7E0D6] hover:bg-[#FDFBF7] text-[#1C1917] text-xs font-bold px-3.5 py-2 rounded-lg"
            >
              <FolderPlus className="w-4 h-4 text-[#EA580C]" />
              <span>New Category</span>
            </button>
            <button
              onClick={openCreateItem}
              className="inline-flex items-center gap-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish</span>
            </button>
          </div>
        )}
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="hover:underline">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-[#E7E0D6] rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu dishes, SKUs, or ingredients..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] text-xs"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#D6D3D1] bg-white text-xs font-semibold"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.itemCount ?? 0})
            </option>
          ))}
        </select>
        <select
          value={dietFilter}
          onChange={(e) => setDietFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#D6D3D1] bg-white text-xs font-semibold"
        >
          <option value="all">All Dietary</option>
          <option value="veg">Veg</option>
          <option value="non_veg">Non-Veg</option>
          <option value="vegan">Vegan</option>
          <option value="egg">Egg</option>
        </select>
      </div>

      {/* Menu Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-48 rounded-xl bg-white border border-[#E7E0D6] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-xl overflow-hidden flex flex-col justify-between ${
                item.isAvailable ? 'border-[#E7E0D6]' : 'border-red-200 opacity-75'
              }`}
            >
              <div>
                <div className="h-36 bg-[#1C1917] relative overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#A8A29E]">
                      {item.sku}
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#1C1917]/85 text-white">
                      {item.dietaryType.replace('_', '-')}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/95 text-[#1C1917]">
                      {item.sku}
                    </span>
                  </div>
                  {!item.isAvailable && (
                    <span className="absolute inset-0 bg-black/55 flex items-center justify-center text-xs font-extrabold uppercase tracking-widest text-red-200">
                      86&apos;d · Unavailable
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-[#1C1917]">{item.name}</h3>
                    <span className="font-mono font-extrabold text-sm text-[#EA580C] shrink-0">
                      {sym}{item.basePrice}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-2">{item.description}</p>
                  <div className="text-[11px] text-[#475569] pt-1 flex flex-wrap gap-2">
                    <span>{item.categoryName}</span>
                    <span>•</span>
                    <span>{item.prepTimeMins}m prep</span>
                    <span>•</span>
                    <span className="capitalize">{item.kitchenStation.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-[#FDFBF7] border-t border-[#EFEAE2] flex items-center justify-between gap-2">
                {permissions.canToggleMenuAvailability ? (
                  <button
                    disabled={busyId === item.id}
                    onClick={() => handleToggleAvail(item)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      item.isAvailable ? 'text-[#10B981]' : 'text-red-600'
                    }`}
                  >
                    {item.isAvailable ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                    <span>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-[#64748B]">
                    {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                )}

                {permissions.canManageMenu && (
                  <button
                    onClick={() => openEditItem(item)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1C1917] hover:text-[#EA580C]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCategory}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#1C1917]">New Menu Category</h3>
              <button type="button" onClick={() => setShowCatModal(false)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Category name (e.g. Chef Specials)"
              className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] text-xs"
            />
            <input
              type="text"
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Short description"
              className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                className="px-4 py-2 rounded-lg border border-[#D6D3D1] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyId === 'save-cat'}
                className="px-5 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold"
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add/Edit Dish Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveItem}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#1C1917]">
                {editingItem ? `Edit ${editingItem.name}` : 'Add New Menu Dish'}
              </h3>
              <button type="button" onClick={() => setShowItemModal(false)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#334155] mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">Category</label>
                <select
                  required
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">Base Price ({sym})</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={itemForm.basePrice}
                  onChange={(e) => setItemForm({ ...itemForm, basePrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">Dietary</label>
                <select
                  value={itemForm.dietaryType}
                  onChange={(e) => setItemForm({ ...itemForm, dietaryType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs"
                >
                  <option value="veg">Veg</option>
                  <option value="non_veg">Non-Veg</option>
                  <option value="vegan">Vegan</option>
                  <option value="egg">Egg</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">Kitchen Station</label>
                <select
                  value={itemForm.kitchenStation}
                  onChange={(e) => setItemForm({ ...itemForm, kitchenStation: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs"
                >
                  <option value="hot_kitchen">Hot Kitchen</option>
                  <option value="tandoor">Tandoor &amp; Grill</option>
                  <option value="bar">Craft Bar</option>
                  <option value="pastry">Pastry</option>
                  <option value="cold_station">Cold Station</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#334155] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Variants (format: Regular:0, Large:180)
                </label>
                <input
                  type="text"
                  value={itemForm.variantsText}
                  onChange={(e) => setItemForm({ ...itemForm, variantsText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Add-ons (format: Extra Cheese:60, Mint Dip:40)
                </label>
                <input
                  type="text"
                  value={itemForm.addonsText}
                  onChange={(e) => setItemForm({ ...itemForm, addonsText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 rounded-lg border border-[#D6D3D1] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyId === 'save-item'}
                className="px-5 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                {busyId === 'save-item' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save Dish</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
