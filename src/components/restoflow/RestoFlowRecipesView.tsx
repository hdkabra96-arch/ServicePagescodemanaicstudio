import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  IngredientRecord,
  RecipeRecord,
  RestaurantSettings,
  RestoFlowRolePermissions
} from '../../types/restoflow';

interface RestoFlowRecipesViewProps {
  restaurant: RestaurantSettings;
  permissions: RestoFlowRolePermissions;
  onRecipeMutated?: () => void;
}

interface UnmappedDish {
  id: string;
  name: string;
  categoryName: string;
  basePrice: number;
  dietaryType: string;
}

export const RestoFlowRecipesView: React.FC<RestoFlowRecipesViewProps> = ({
  restaurant,
  permissions,
  onRecipeMutated
}) => {
  const sym = restaurant.currencySymbol || '₹';
  const canEdit = permissions.canManageRecipes;

  const [recipes, setRecipes] = useState<RecipeRecord[]>([]);
  const [unmappedDishes, setUnmappedDishes] = useState<UnmappedDish[]>([]);
  const [ingredients, setIngredients] = useState<IngredientRecord[]>([]);
  const [analytics, setAnalytics] = useState({
    mappedCount: 0,
    unmappedCount: 0,
    avgFoodCostPct: 0,
    highCostCount: 0,
    avgGrossMargin: 0
  });

  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recipe Builder Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [selectedDishName, setSelectedDishName] = useState('');
  const [selectedSellingPrice, setSelectedSellingPrice] = useState(0);
  const [yieldServings, setYieldServings] = useState('1');
  const [prepNotes, setPrepNotes] = useState('');
  const [recipeLines, setRecipeLines] = useState<{ ingredientId: string; quantityRequired: string }[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [recRes, ingRes] = await Promise.all([
        restoFlowApi.getRecipes(search),
        restoFlowApi.getIngredients()
      ]);
      setRecipes(recRes.data.recipes);
      setUnmappedDishes(recRes.data.unmappedMenuItems);
      setAnalytics(recRes.data.analytics);
      setIngredients(ingRes.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load recipes.');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const ingredientMap = useMemo(
    () => new Map(ingredients.map((i) => [i.id, i])),
    [ingredients]
  );

  const openNewRecipe = (dish?: UnmappedDish) => {
    const target = dish || unmappedDishes[0];
    if (!target) return;
    setSelectedMenuItemId(target.id);
    setSelectedDishName(target.name);
    setSelectedSellingPrice(target.basePrice);
    setYieldServings('1');
    setPrepNotes('');
    setRecipeLines(
      ingredients[0] ? [{ ingredientId: ingredients[0].id, quantityRequired: '0.2' }] : []
    );
    setShowModal(true);
  };

  const openEditRecipe = (rec: RecipeRecord) => {
    setSelectedMenuItemId(rec.menuItemId);
    setSelectedDishName(rec.menuItemName);
    setSelectedSellingPrice(rec.sellingPrice);
    setYieldServings(String(rec.yieldServings));
    setPrepNotes(rec.prepNotes);
    setRecipeLines(
      rec.ingredients.map((i) => ({
        ingredientId: i.ingredientId,
        quantityRequired: String(i.quantityRequired)
      }))
    );
    setShowModal(true);
  };

  const livePreview = useMemo(() => {
    const total = recipeLines.reduce((sum, line) => {
      const ing = ingredientMap.get(line.ingredientId);
      const qty = parseFloat(line.quantityRequired) || 0;
      return sum + (ing ? ing.unitCost * qty : 0);
    }, 0);
    const y = Math.max(1, parseInt(yieldServings, 10) || 1);
    const perServing = total / y;
    const pct = selectedSellingPrice > 0 ? (perServing / selectedSellingPrice) * 100 : 0;
    const margin = selectedSellingPrice - perServing;
    return {
      total: Math.round(total * 100) / 100,
      perServing: Math.round(perServing * 100) / 100,
      pct: Math.round(pct * 10) / 10,
      margin: Math.round(margin * 100) / 100
    };
  }, [recipeLines, ingredientMap, yieldServings, selectedSellingPrice]);

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuItemId || recipeLines.length === 0) return;
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.upsertRecipe({
        menuItemId: selectedMenuItemId,
        yieldServings: Math.max(1, parseInt(yieldServings, 10) || 1),
        prepNotes,
        ingredients: recipeLines.map((l) => ({
          ingredientId: l.ingredientId,
          quantityRequired: parseFloat(l.quantityRequired) || 0
        }))
      });
      setFeedback(res.message || 'Recipe cost sheet saved.');
      setShowModal(false);
      await loadData();
      onRecipeMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save recipe.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    setIsBusy(true);
    setError(null);
    try {
      await restoFlowApi.deleteRecipe(recipeId);
      setConfirmDeleteId(null);
      setFeedback('Recipe removed.');
      await loadData();
      onRecipeMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete recipe.');
    } finally {
      setIsBusy(false);
    }
  };

  const foodCostBadge = (pct: number) => {
    if (pct <= 28) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (pct <= 35) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center gap-2.5 text-sm font-semibold text-[#64748B]">
        <Loader2 className="w-5 h-5 animate-spin text-[#EA580C]" />
        <span>Calculating live recipe food costs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Recipe Management & Food Costing
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Standardized ingredient ratios linked directly to live inventory purchase prices for accurate plate costing & margin control.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white text-xs font-bold text-[#1C1917] hover:bg-[#FDFBF7]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate</span>
          </button>
          {canEdit && unmappedDishes.length > 0 && (
            <button
              onClick={() => openNewRecipe()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Map Dish Recipe</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Food Cost Analytics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Average Food Cost %
          </div>
          <div className="text-2xl font-extrabold text-[#1C1917] mt-1">
            {analytics.avgFoodCostPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            Target benchmark: 26% – 32%
          </div>
        </div>

        <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Avg Plate Gross Margin
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {sym}
            {analytics.avgGrossMargin.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Contribution per dish sold</div>
        </div>

        <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Mapped Recipes
          </div>
          <div className="text-2xl font-extrabold text-[#1C1917] mt-1">
            {analytics.mappedCount}{' '}
            <span className="text-xs font-semibold text-[#64748B]">
              / {analytics.mappedCount + analytics.unmappedCount} dishes
            </span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            {analytics.unmappedCount} dishes pending recipe card
          </div>
        </div>

        <div
          className={`border rounded-2xl p-4 ${
            analytics.highCostCount > 0 ? 'bg-red-50/70 border-red-200' : 'bg-white border-[#E7E0D6]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              High-Cost Dishes (&gt;35%)
            </span>
            {analytics.highCostCount > 0 && <AlertTriangle className="w-4 h-4 text-red-600" />}
          </div>
          <div
            className={`text-2xl font-extrabold mt-1 ${
              analytics.highCostCount > 0 ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {analytics.highCostCount}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Review portioning or menu price</div>
        </div>
      </div>

      {/* Unmapped Menu Dishes Quick Strip */}
      {canEdit && unmappedDishes.length > 0 && (
        <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="text-xs font-extrabold text-[#9A3412] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#EA580C]" />
              <span>Menu Items Without Recipe Cost Sheets ({unmappedDishes.length})</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {unmappedDishes.slice(0, 8).map((dish) => (
              <button
                key={dish.id}
                onClick={() => openNewRecipe(dish)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#FED7AA] text-xs font-bold text-[#1C1917] hover:border-[#EA580C] hover:text-[#EA580C]"
              >
                <Plus className="w-3 h-3 text-[#EA580C]" />
                <span>{dish.name}</span>
                <span className="text-[10px] text-[#64748B]">
                  ({sym}
                  {dish.basePrice})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes by dish name, category, or prep notes..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E7E0D6] bg-white text-xs font-medium focus:outline-none focus:border-[#EA580C]"
        />
      </div>

      {/* Recipe Cost Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {recipes.map((rec) => (
          <div
            key={rec.id}
            className="bg-white border border-[#E7E0D6] rounded-2xl p-5 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C]">
                    {rec.categoryName} · Yield {rec.yieldServings} serving{rec.yieldServings > 1 ? 's' : ''}
                  </div>
                  <h3 className="text-base font-extrabold text-[#1C1917] mt-0.5">{rec.menuItemName}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full border text-xs font-extrabold whitespace-nowrap ${foodCostBadge(
                    rec.foodCostPct
                  )}`}
                >
                  {rec.foodCostPct.toFixed(1)}% Food Cost
                </span>
              </div>

              {/* Financial Strip */}
              <div className="grid grid-cols-3 gap-2 bg-[#FDFBF7] border border-[#EFEAE2] rounded-xl p-3 text-center">
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#64748B]">Menu Price</div>
                  <div className="text-sm font-extrabold text-[#1C1917] mt-0.5">
                    {sym}
                    {rec.sellingPrice.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#64748B]">Plate Cost</div>
                  <div className="text-sm font-extrabold text-[#EA580C] mt-0.5">
                    {sym}
                    {rec.costPerServing.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#64748B]">Gross Margin</div>
                  <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                    {sym}
                    {rec.grossMargin.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Ingredient Breakdown */}
              <div className="border border-[#EFEAE2] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#FDFBF7] text-[10px] font-bold uppercase text-[#64748B] border-b border-[#EFEAE2]">
                      <th className="px-3 py-2">Ingredient</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Rate</th>
                      <th className="px-3 py-2 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFE6]">
                    {rec.ingredients.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 font-semibold text-[#1C1917]">{item.ingredientName}</td>
                        <td className="px-3 py-2 text-right text-[#475569]">
                          {item.quantityRequired} {item.unit}
                        </td>
                        <td className="px-3 py-2 text-right text-[#64748B]">
                          {sym}
                          {item.unitCost}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-[#1C1917]">
                          {sym}
                          {item.lineCost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rec.prepNotes && (
                <div className="flex items-start gap-2 text-[11px] text-[#475569] bg-[#FDFBF7] px-3 py-2 rounded-lg">
                  <ChefHat className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                  <span>{rec.prepNotes}</span>
                </div>
              )}
            </div>

            {canEdit && (
              <div className="pt-3 border-t border-[#EFEAE2] flex items-center justify-between gap-2">
                {confirmDeleteId === rec.id ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-red-700">Delete recipe sheet?</span>
                    <button
                      disabled={isBusy}
                      onClick={() => handleDeleteRecipe(rec.id)}
                      className="px-2.5 py-1 rounded bg-red-600 text-white font-bold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-1 rounded border border-[#E7E0D6] text-[#475569] font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(rec.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}

                <button
                  onClick={() => openEditRecipe(rec)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1917] text-white text-xs font-bold hover:bg-[#292524]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Cost Sheet</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL: RECIPE BUILDER & LIVE COST CALCULATOR */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRecipe}
            className="bg-white rounded-2xl border border-[#E7E0D6] max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#1C1917]">
                  Recipe Cost Sheet — {selectedDishName}
                </h2>
                <p className="text-xs text-[#64748B]">
                  Menu Selling Price: {sym}
                  {selectedSellingPrice.toFixed(2)}
                </p>
              </div>
              <button type="button" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            {/* Live Preview Banner */}
            <div className="grid grid-cols-3 gap-3 bg-[#1C1917] text-white rounded-xl p-4 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#A8A29E] font-bold">
                  Cost / Serving
                </div>
                <div className="text-lg font-extrabold text-[#FB923C] mt-0.5">
                  {sym}
                  {livePreview.perServing.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#A8A29E] font-bold">
                  Live Food Cost %
                </div>
                <div
                  className={`text-lg font-extrabold mt-0.5 ${
                    livePreview.pct > 35 ? 'text-red-400' : 'text-[#10B981]'
                  }`}
                >
                  {livePreview.pct.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#A8A29E] font-bold">
                  Gross Margin
                </div>
                <div className="text-lg font-extrabold text-white mt-0.5">
                  {sym}
                  {livePreview.margin.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {unmappedDishes.some((d) => d.id === selectedMenuItemId) && (
                <label className="space-y-1 sm:col-span-2">
                  <span className="font-bold text-[#1C1917]">Select Unmapped Dish</span>
                  <select
                    value={selectedMenuItemId}
                    onChange={(e) => {
                      const d = unmappedDishes.find((x) => x.id === e.target.value);
                      if (d) {
                        setSelectedMenuItemId(d.id);
                        setSelectedDishName(d.name);
                        setSelectedSellingPrice(d.basePrice);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white"
                  >
                    {unmappedDishes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({sym}
                        {d.basePrice})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Yield Servings</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={yieldServings}
                  onChange={(e) => setYieldServings(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
            </div>

            {/* Ingredient Rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Mapped Ingredients</span>
                <button
                  type="button"
                  onClick={() => {
                    const unused =
                      ingredients.find(
                        (i) => !recipeLines.some((l) => l.ingredientId === i.id)
                      ) || ingredients[0];
                    if (!unused) return;
                    setRecipeLines((prev) => [
                      ...prev,
                      { ingredientId: unused.id, quantityRequired: '0.1' }
                    ]);
                  }}
                  className="text-xs font-bold text-[#EA580C] hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Ingredient</span>
                </button>
              </div>

              <div className="space-y-2">
                {recipeLines.map((line, idx) => {
                  const ing = ingredientMap.get(line.ingredientId);
                  const lineCost = ing ? ing.unitCost * (parseFloat(line.quantityRequired) || 0) : 0;
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-[#FDFBF7] p-2.5 rounded-xl border border-[#EFEAE2]"
                    >
                      <select
                        value={line.ingredientId}
                        onChange={(e) =>
                          setRecipeLines((prev) =>
                            prev.map((row, i) =>
                              i === idx ? { ...row, ingredientId: e.target.value } : row
                            )
                          )
                        }
                        className="col-span-6 px-2.5 py-1.5 rounded-lg border border-[#E7E0D6] bg-white text-xs"
                      >
                        {ingredients.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({sym}
                            {i.unitCost}/{i.unit})
                          </option>
                        ))}
                      </select>
                      <div className="col-span-3 flex items-center gap-1">
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          required
                          value={line.quantityRequired}
                          onChange={(e) =>
                            setRecipeLines((prev) =>
                              prev.map((row, i) =>
                                i === idx ? { ...row, quantityRequired: e.target.value } : row
                              )
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-[#E7E0D6] bg-white text-xs"
                        />
                        <span className="text-[10px] font-bold text-[#64748B]">
                          {ing?.unit || ''}
                        </span>
                      </div>
                      <div className="col-span-2 text-right text-xs font-bold text-[#1C1917]">
                        {sym}
                        {lineCost.toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecipeLines((prev) => prev.filter((_, i) => i !== idx))}
                        className="col-span-1 flex justify-center text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <label className="block space-y-1 text-xs">
              <span className="font-bold text-[#1C1917]">Chef Preparation Notes</span>
              <textarea
                rows={2}
                value={prepNotes}
                onChange={(e) => setPrepNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                placeholder="Standardized cook temperature, garnish, and plating instructions..."
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-[#E7E0D6] text-xs font-bold text-[#475569]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy || recipeLines.length === 0}
                className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
              >
                {isBusy ? 'Saving...' : 'Save Recipe Cost Sheet'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
