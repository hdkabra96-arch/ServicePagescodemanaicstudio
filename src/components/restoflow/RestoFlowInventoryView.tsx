import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  CheckCircle2,
  Edit3,
  FileSpreadsheet,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  X
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  IngredientRecord,
  InventorySummaryStats,
  InventoryTransactionRecord,
  PurchaseOrderRecord,
  RestaurantSettings,
  RestoFlowRolePermissions,
  RestoFlowUser,
  SupplierRecord
} from '../../types/restoflow';

interface RestoFlowInventoryViewProps {
  user: RestoFlowUser;
  restaurant: RestaurantSettings;
  permissions: RestoFlowRolePermissions;
  onInventoryMutated?: () => void;
}

type InventorySubTab = 'ingredients' | 'purchase_orders' | 'suppliers' | 'ledger';

const PO_STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  ordered: 'bg-amber-50 text-amber-800 border-amber-200',
  received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200'
};

const TX_BADGE: Record<string, string> = {
  stock_in: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  stock_out: 'bg-sky-50 text-sky-700 border-sky-200',
  wastage: 'bg-red-50 text-red-700 border-red-200',
  adjustment: 'bg-amber-50 text-amber-800 border-amber-200',
  recipe_deduction: 'bg-purple-50 text-purple-700 border-purple-200'
};

export const RestoFlowInventoryView: React.FC<RestoFlowInventoryViewProps> = ({
  user,
  restaurant,
  permissions,
  onInventoryMutated
}) => {
  const sym = restaurant.currencySymbol || '₹';
  const canManageCatalog = permissions.canManageInventory;
  const isKitchenOnly = user.role === 'kitchen';

  const [subTab, setSubTab] = useState<InventorySubTab>('ingredients');
  const [summary, setSummary] = useState<InventorySummaryStats | null>(null);
  const [ingredients, setIngredients] = useState<IngredientRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransactionRecord[]>([]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [txTypeFilter, setTxTypeFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showIngModal, setShowIngModal] = useState(false);
  const [editingIng, setEditingIng] = useState<IngredientRecord | null>(null);
  const [ingForm, setIngForm] = useState({
    sku: '',
    name: '',
    category: 'Dairy',
    unit: 'kg' as 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'pack',
    currentStock: '10',
    minStockLevel: '5',
    unitCost: '250',
    defaultSupplierId: ''
  });

  const [movementIng, setMovementIng] = useState<IngredientRecord | null>(null);
  const [moveForm, setMoveForm] = useState({
    txType: 'stock_in' as 'stock_in' | 'stock_out' | 'wastage' | 'adjustment',
    quantity: '5',
    unitCost: '',
    supplierId: '',
    referenceNo: '',
    reason: ''
  });

  const [showSupModal, setShowSupModal] = useState(false);
  const [editingSup, setEditingSup] = useState<SupplierRecord | null>(null);
  const [supForm, setSupForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: 'Produce & Dairy',
    paymentTerms: 'Net 15'
  });

  const [showPoModal, setShowPoModal] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poStatus, setPoStatus] = useState<'draft' | 'ordered'>('ordered');
  const [poNotes, setPoNotes] = useState('');
  const [poLines, setPoLines] = useState<{ ingredientId: string; quantity: string; unitCost: string }[]>([]);

  const loadAll = useCallback(async () => {
    try {
      const [sumRes, ingRes, supRes, poRes, txRes] = await Promise.all([
        restoFlowApi.getInventorySummary(),
        restoFlowApi.getIngredients(),
        restoFlowApi.getSuppliers(),
        restoFlowApi.getPurchaseOrders(),
        restoFlowApi.getInventoryTransactions({ limit: 100 })
      ]);
      setSummary(sumRes.data);
      setIngredients(ingRes.data);
      setSuppliers(supRes.data);
      setPurchaseOrders(poRes.data);
      setTransactions(txRes.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load inventory data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const categories = useMemo(() => {
    const set = new Set(ingredients.map((i) => i.category));
    return ['all', ...Array.from(set).sort()];
  }, [ingredients]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((i) => {
      if (lowStockOnly && !i.isLowStock) return false;
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ingredients, lowStockOnly, categoryFilter, search]);

  const filteredTransactions = useMemo(() => {
    if (txTypeFilter === 'all') return transactions;
    return transactions.filter((t) => t.txType === txTypeFilter);
  }, [transactions, txTypeFilter]);

  const openAddIngredient = () => {
    setEditingIng(null);
    setIngForm({
      sku: '',
      name: '',
      category: 'Dairy',
      unit: 'kg',
      currentStock: '10',
      minStockLevel: '5',
      unitCost: '200',
      defaultSupplierId: suppliers[0]?.id || ''
    });
    setShowIngModal(true);
  };

  const openEditIngredient = (ing: IngredientRecord) => {
    setEditingIng(ing);
    setIngForm({
      sku: ing.sku,
      name: ing.name,
      category: ing.category,
      unit: ing.unit,
      currentStock: String(ing.currentStock),
      minStockLevel: String(ing.minStockLevel),
      unitCost: String(ing.unitCost),
      defaultSupplierId: ing.defaultSupplierId || ''
    });
    setShowIngModal(true);
  };

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setError(null);
    try {
      if (editingIng) {
        await restoFlowApi.updateIngredient(editingIng.id, {
          name: ingForm.name,
          category: ingForm.category,
          unit: ingForm.unit,
          minStockLevel: parseFloat(ingForm.minStockLevel) || 0,
          unitCost: parseFloat(ingForm.unitCost) || 0,
          defaultSupplierId: ingForm.defaultSupplierId || null
        });
        setFeedback(`Updated ingredient "${ingForm.name}".`);
      } else {
        await restoFlowApi.createIngredient({
          sku: ingForm.sku.trim() || undefined,
          name: ingForm.name,
          category: ingForm.category,
          unit: ingForm.unit,
          currentStock: parseFloat(ingForm.currentStock) || 0,
          minStockLevel: parseFloat(ingForm.minStockLevel) || 0,
          unitCost: parseFloat(ingForm.unitCost) || 0,
          defaultSupplierId: ingForm.defaultSupplierId || null
        });
        setFeedback(`Added "${ingForm.name}" to inventory.`);
      }
      setShowIngModal(false);
      await loadAll();
      onInventoryMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save ingredient.');
    } finally {
      setIsBusy(false);
    }
  };

  const openMovementModal = (
    ing: IngredientRecord,
    defaultType: 'stock_in' | 'stock_out' | 'wastage'
  ) => {
    setMovementIng(ing);
    setMoveForm({
      txType: defaultType,
      quantity: defaultType === 'wastage' ? '0.5' : '5',
      unitCost: String(ing.unitCost),
      supplierId: ing.defaultSupplierId || '',
      referenceNo: '',
      reason:
        defaultType === 'wastage'
          ? 'Prep trimmings / spoilage'
          : defaultType === 'stock_out'
          ? 'Kitchen batch issue'
          : 'Vendor delivery restock'
    });
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementIng) return;
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.recordStockMovement({
        ingredientId: movementIng.id,
        txType: moveForm.txType,
        quantity: parseFloat(moveForm.quantity) || 0,
        unitCost: moveForm.txType === 'stock_in' ? parseFloat(moveForm.unitCost) : undefined,
        supplierId: moveForm.txType === 'stock_in' && moveForm.supplierId ? moveForm.supplierId : null,
        referenceNo: moveForm.referenceNo,
        reason: moveForm.reason
      });
      setFeedback(res.message || 'Stock movement recorded.');
      setMovementIng(null);
      await loadAll();
      onInventoryMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record stock movement.');
    } finally {
      setIsBusy(false);
    }
  };

  const openAddSupplier = () => {
    setEditingSup(null);
    setSupForm({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      category: 'Produce & Dairy',
      paymentTerms: 'Net 15'
    });
    setShowSupModal(true);
  };

  const openEditSupplier = (s: SupplierRecord) => {
    setEditingSup(s);
    setSupForm({
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      address: s.address,
      category: s.category,
      paymentTerms: s.paymentTerms
    });
    setShowSupModal(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setError(null);
    try {
      if (editingSup) {
        await restoFlowApi.updateSupplier(editingSup.id, supForm);
        setFeedback(`Updated supplier "${supForm.name}".`);
      } else {
        await restoFlowApi.createSupplier(supForm);
        setFeedback(`Added supplier "${supForm.name}".`);
      }
      setShowSupModal(false);
      await loadAll();
      onInventoryMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save supplier.');
    } finally {
      setIsBusy(false);
    }
  };

  const openCreatePo = () => {
    const firstSup = suppliers[0]?.id || '';
    const lowStockIng = ingredients.find((i) => i.isLowStock) || ingredients[0];
    setPoSupplierId(firstSup);
    setPoStatus('ordered');
    setPoNotes('');
    setPoLines(
      lowStockIng
        ? [
            {
              ingredientId: lowStockIng.id,
              quantity: String(Math.max(5, Math.ceil(lowStockIng.minStockLevel * 2))),
              unitCost: String(lowStockIng.unitCost)
            }
          ]
        : []
    );
    setShowPoModal(true);
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId || poLines.length === 0) return;
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.createPurchaseOrder({
        supplierId: poSupplierId,
        status: poStatus,
        notes: poNotes,
        items: poLines.map((l) => ({
          ingredientId: l.ingredientId,
          quantity: parseFloat(l.quantity) || 0,
          unitCost: parseFloat(l.unitCost) || 0
        }))
      });
      setFeedback(res.message || 'Purchase order created.');
      setShowPoModal(false);
      await loadAll();
      onInventoryMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create purchase order.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleUpdatePoStatus = async (poId: string, status: 'ordered' | 'received' | 'cancelled') => {
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.updatePurchaseOrderStatus(poId, status);
      setFeedback(res.message || 'Purchase order updated.');
      await loadAll();
      onInventoryMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update purchase order.');
    } finally {
      setIsBusy(false);
    }
  };

  const poEstimatedTotal = poLines.reduce(
    (sum, line) => sum + (parseFloat(line.quantity) || 0) * (parseFloat(line.unitCost) || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center gap-2.5 text-sm font-semibold text-[#64748B]">
        <Loader2 className="w-5 h-5 animate-spin text-[#EA580C]" />
        <span>Loading live inventory & procurement data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Inventory, Suppliers & Procurement
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time ingredient stock control, low-stock threshold alerts, purchase order receiving, and wastage ledger.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white text-xs font-bold text-[#1C1917] hover:bg-[#FDFBF7]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          {canManageCatalog && (
            <>
              <button
                onClick={openCreatePo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1C1917] text-white text-xs font-bold hover:bg-[#292524]"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>New Purchase Order</span>
              </button>
              <button
                onClick={openAddIngredient}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Banners */}
      {feedback && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
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

      {/* Live KPI Strip */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Stock Valuation
            </div>
            <div className="text-xl font-extrabold text-[#1C1917] mt-1">
              {sym}
              {summary.totalStockValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">
              {summary.totalIngredients} tracked SKU(s)
            </div>
          </div>

          <button
            onClick={() => {
              setSubTab('ingredients');
              setLowStockOnly((prev) => !prev);
            }}
            className={`text-left border rounded-2xl p-4 transition-colors ${
              summary.lowStockCount > 0
                ? 'bg-[#FFF7ED] border-[#FDBA74] hover:bg-[#FFEDD5]'
                : 'bg-white border-[#E7E0D6]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
                Low-Stock Alerts
              </span>
              <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
            </div>
            <div className="text-xl font-extrabold text-[#EA580C] mt-1">{summary.lowStockCount}</div>
            <div className="text-[11px] text-[#9A3412] mt-0.5">
              {lowStockOnly ? 'Showing low stock (click to clear)' : 'Click to filter urgent items'}
            </div>
          </button>

          <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Open Purchase Orders
            </div>
            <div className="text-xl font-extrabold text-[#1C1917] mt-1">{summary.openPoCount}</div>
            <div className="text-[11px] text-[#64748B] mt-0.5">Draft & Ordered POs</div>
          </div>

          <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Active Suppliers
            </div>
            <div className="text-xl font-extrabold text-[#1C1917] mt-1">{summary.activeSuppliers}</div>
            <div className="text-[11px] text-[#64748B] mt-0.5">Verified vendors</div>
          </div>

          <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4 col-span-2 lg:col-span-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              7-Day Wastage Cost
            </div>
            <div className="text-xl font-extrabold text-red-600 mt-1">
              {sym}
              {summary.wastageCost7d.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">Spoilage & trimmings</div>
          </div>
        </div>
      )}

      {/* Sub-tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E7E0D6] pb-3">
        {[
          { id: 'ingredients', label: 'Ingredients & Stock', icon: Package, count: ingredients.length },
          { id: 'purchase_orders', label: 'Purchase Orders', icon: Truck, count: purchaseOrders.length },
          { id: 'suppliers', label: 'Suppliers', icon: Building2, count: suppliers.length },
          { id: 'ledger', label: 'Stock Ledger & Wastage', icon: FileSpreadsheet, count: transactions.length }
        ].map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as InventorySubTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                active
                  ? 'bg-[#1C1917] text-white'
                  : 'bg-white border border-[#E7E0D6] text-[#475569] hover:text-[#1C1917]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  active ? 'bg-white/15 text-white' : 'bg-[#F5EFE6] text-[#64748B]'
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INGREDIENTS & STOCK */}
      {subTab === 'ingredients' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ingredients by name, SKU, or category..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E7E0D6] bg-white text-xs font-medium focus:outline-none focus:border-[#EA580C]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white text-xs font-semibold text-[#1C1917]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setLowStockOnly((prev) => !prev)}
                className={`px-3 py-2 rounded-lg border text-xs font-bold transition-colors ${
                  lowStockOnly
                    ? 'bg-[#EA580C] border-[#EA580C] text-white'
                    : 'bg-white border-[#E7E0D6] text-[#475569]'
                }`}
              >
                Low Stock Only
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E7E0D6] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDFBF7] border-b border-[#EFEAE2] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="px-4 py-3">Ingredient / SKU</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Stock Level</th>
                    <th className="px-4 py-3">Unit Cost</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3 text-right">Stock Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1ECE4] text-xs">
                  {filteredIngredients.map((ing) => {
                    const ratio = ing.minStockLevel > 0 ? Math.min(100, (ing.currentStock / (ing.minStockLevel * 2)) * 100) : 100;
                    return (
                      <tr key={ing.id} className={ing.isLowStock ? 'bg-[#FFF7ED]/40' : 'hover:bg-[#FDFBF7]'}>
                        <td className="px-4 py-3">
                          <div className="font-bold text-[#1C1917] flex items-center gap-2">
                            <span>{ing.name}</span>
                            {ing.isLowStock && (
                              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-extrabold uppercase">
                                Low
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#64748B] font-mono">{ing.sku}</div>
                        </td>
                        <td className="px-4 py-3 text-[#475569] font-medium">{ing.category}</td>
                        <td className="px-4 py-3 min-w-[160px]">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className={ing.isLowStock ? 'text-red-600' : 'text-[#1C1917]'}>
                              {ing.currentStock} {ing.unit}
                            </span>
                            <span className="text-[#64748B] font-medium">
                              Min {ing.minStockLevel} {ing.unit}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#EFEAE2] rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                ing.isLowStock ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.max(8, ratio)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#1C1917]">
                          {sym}
                          {ing.unitCost.toFixed(2)} / {ing.unit}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#1C1917]">
                          {sym}
                          {ing.stockValue.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-[#475569]">{ing.supplierName || 'Unassigned'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isKitchenOnly && canManageCatalog && (
                              <button
                                onClick={() => openMovementModal(ing, 'stock_in')}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100"
                              >
                                <ArrowDownToLine className="w-3 h-3" />
                                <span>In</span>
                              </button>
                            )}
                            <button
                              onClick={() => openMovementModal(ing, 'stock_out')}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold hover:bg-sky-100"
                            >
                              <ArrowUpFromLine className="w-3 h-3" />
                              <span>Out</span>
                            </button>
                            <button
                              onClick={() => openMovementModal(ing, 'wastage')}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold hover:bg-red-100"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Waste</span>
                            </button>
                            {canManageCatalog && (
                              <button
                                onClick={() => openEditIngredient(ing)}
                                className="p-1.5 rounded-md border border-[#E7E0D6] text-[#475569] hover:text-[#1C1917] hover:bg-[#FDFBF7]"
                                title="Edit Ingredient"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredIngredients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-xs text-[#64748B]">
                        No ingredients match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS */}
      {subTab === 'purchase_orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="bg-white border border-[#E7E0D6] rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#1C1917] font-mono">
                          {po.poNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                            PO_STATUS_BADGE[po.status] || PO_STATUS_BADGE.draft
                          }`}
                        >
                          {po.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#475569] mt-1">{po.supplierName}</div>
                      <div className="text-[11px] text-[#64748B]">
                        Ordered {new Date(po.orderedAt).toLocaleDateString('en-IN')} · By {po.createdByName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-[#1C1917]">
                        {sym}
                        {po.totalAmount.toLocaleString('en-IN')}
                      </div>
                      {po.receivedAt && (
                        <div className="text-[10px] font-semibold text-emerald-700">
                          Received {new Date(po.receivedAt).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#FDFBF7] border border-[#EFEAE2] rounded-xl p-3 space-y-1.5">
                    {po.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1C1917]">
                          {item.ingredientName}{' '}
                          <span className="text-[#64748B] font-normal">
                            ({item.quantity} {item.ingredientUnit} × {sym}
                            {item.unitCost})
                          </span>
                        </span>
                        <span className="font-bold text-[#1C1917]">
                          {sym}
                          {item.lineTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {po.notes && <p className="text-[11px] text-[#64748B] italic">{po.notes}</p>}
                </div>

                {canManageCatalog && (po.status === 'draft' || po.status === 'ordered') && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#EFEAE2]">
                    {po.status === 'draft' && (
                      <button
                        disabled={isBusy}
                        onClick={() => handleUpdatePoStatus(po.id, 'ordered')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600"
                      >
                        Mark Ordered
                      </button>
                    )}
                    <button
                      disabled={isBusy}
                      onClick={() => handleUpdatePoStatus(po.id, 'received')}
                      className="px-3 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-bold hover:bg-emerald-600"
                    >
                      Receive into Stock
                    </button>
                    <button
                      disabled={isBusy}
                      onClick={() => handleUpdatePoStatus(po.id, 'cancelled')}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50"
                    >
                      Cancel PO
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUPPLIERS */}
      {subTab === 'suppliers' && (
        <div className="space-y-4">
          {canManageCatalog && (
            <div className="flex justify-end">
              <button
                onClick={openAddSupplier}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Supplier</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="bg-white border border-[#E7E0D6] rounded-2xl p-5 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-[#1C1917]">{sup.name}</div>
                      <div className="text-[11px] font-bold text-[#EA580C] mt-0.5">{sup.category}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#FDFBF7] border border-[#E7E0D6] text-[10px] font-bold text-[#475569]">
                      {sup.paymentTerms}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-[#475569]">
                    {sup.contactPerson && (
                      <div>
                        <span className="font-semibold text-[#1C1917]">Contact:</span> {sup.contactPerson}
                      </div>
                    )}
                    {sup.phone && (
                      <div>
                        <span className="font-semibold text-[#1C1917]">Phone:</span> {sup.phone}
                      </div>
                    )}
                    {sup.email && (
                      <div>
                        <span className="font-semibold text-[#1C1917]">Email:</span> {sup.email}
                      </div>
                    )}
                    {sup.address && <div className="text-[11px] text-[#64748B] pt-1">{sup.address}</div>}
                  </div>
                </div>
                {canManageCatalog && (
                  <div className="pt-3 border-t border-[#EFEAE2] flex justify-end">
                    <button
                      onClick={() => openEditSupplier(sup)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1C1917] hover:text-[#EA580C]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Vendor</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STOCK LEDGER & WASTAGE */}
      {subTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Movements' },
              { id: 'stock_in', label: 'Stock In' },
              { id: 'stock_out', label: 'Stock Out' },
              { id: 'wastage', label: 'Wastage' },
              { id: 'adjustment', label: 'Adjustments' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTxTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                  txTypeFilter === f.id
                    ? 'bg-[#EA580C] border-[#EA580C] text-white'
                    : 'bg-white border-[#E7E0D6] text-[#475569]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#E7E0D6] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDFBF7] border-b border-[#EFEAE2] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Ingredient</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Cost Impact</th>
                    <th className="px-4 py-3">Ref / Reason</th>
                    <th className="px-4 py-3">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1ECE4] text-xs">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#FDFBF7]">
                      <td className="px-4 py-3 text-[11px] text-[#64748B] whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#1C1917]">{tx.ingredientName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                            TX_BADGE[tx.txType] || TX_BADGE.adjustment
                          }`}
                        >
                          {tx.txType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#1C1917]">
                        {tx.txType === 'stock_in' ? '+' : tx.txType === 'adjustment' ? '=' : '-'}
                        {tx.quantity} {tx.ingredientUnit}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1C1917]">
                        {sym}
                        {tx.totalCost.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-[#475569]">
                        {tx.referenceNo && (
                          <span className="font-mono text-[10px] bg-[#F5EFE6] px-1.5 py-0.5 rounded mr-1.5">
                            {tx.referenceNo}
                          </span>
                        )}
                        {tx.reason || '—'}
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">{tx.createdByName}</td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-xs text-[#64748B]">
                        No stock movements recorded for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT INGREDIENT */}
      {showIngModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveIngredient}
            className="bg-white rounded-2xl border border-[#E7E0D6] max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#1C1917]">
                {editingIng ? `Edit ${editingIng.name}` : 'Add New Ingredient'}
              </h2>
              <button type="button" onClick={() => setShowIngModal(false)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1 sm:col-span-2">
                <span className="font-bold text-[#1C1917]">Ingredient Name *</span>
                <input
                  required
                  value={ingForm.name}
                  onChange={(e) => setIngForm({ ...ingForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  placeholder="e.g. Organic Kashmiri Chili Powder"
                />
              </label>

              {!editingIng && (
                <label className="space-y-1">
                  <span className="font-bold text-[#1C1917]">SKU (optional)</span>
                  <input
                    value={ingForm.sku}
                    onChange={(e) => setIngForm({ ...ingForm, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                    placeholder="ING-CHL"
                  />
                </label>
              )}

              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Category</span>
                <input
                  required
                  value={ingForm.category}
                  onChange={(e) => setIngForm({ ...ingForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  placeholder="Dairy, Spices, Produce..."
                />
              </label>

              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Unit</span>
                <select
                  value={ingForm.unit}
                  onChange={(e) => setIngForm({ ...ingForm, unit: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="l">Litre (l)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="pack">Packs (pack)</option>
                </select>
              </label>

              {!editingIng && (
                <label className="space-y-1">
                  <span className="font-bold text-[#1C1917]">Opening Stock</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={ingForm.currentStock}
                    onChange={(e) => setIngForm({ ...ingForm, currentStock: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  />
                </label>
              )}

              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Low-Stock Alert Threshold</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={ingForm.minStockLevel}
                  onChange={(e) => setIngForm({ ...ingForm, minStockLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>

              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Unit Cost ({sym})</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={ingForm.unitCost}
                  onChange={(e) => setIngForm({ ...ingForm, unitCost: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="font-bold text-[#1C1917]">Default Supplier</span>
                <select
                  value={ingForm.defaultSupplierId}
                  onChange={(e) => setIngForm({ ...ingForm, defaultSupplierId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white"
                >
                  <option value="">None</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIngModal(false)}
                className="px-4 py-2 rounded-lg border border-[#E7E0D6] text-xs font-bold text-[#475569]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
              >
                {isBusy ? 'Saving...' : editingIng ? 'Update Ingredient' : 'Add Ingredient'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: RECORD STOCK MOVEMENT */}
      {movementIng && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMovement}
            className="bg-white rounded-2xl border border-[#E7E0D6] max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#1C1917]">Record Stock Movement</h2>
                <p className="text-xs text-[#64748B]">
                  {movementIng.name} · Current: {movementIng.currentStock} {movementIng.unit}
                </p>
              </div>
              <button type="button" onClick={() => setMovementIng(null)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(isKitchenOnly
                ? [
                    { id: 'stock_out', label: 'Stock Out (Prep)' },
                    { id: 'wastage', label: 'Log Wastage' }
                  ]
                : [
                    { id: 'stock_in', label: 'Stock In' },
                    { id: 'stock_out', label: 'Stock Out' },
                    { id: 'wastage', label: 'Wastage' },
                    { id: 'adjustment', label: 'Set Exact Count' }
                  ]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMoveForm({ ...moveForm, txType: opt.id as any })}
                  className={`px-3 py-2 rounded-lg border text-xs font-bold ${
                    moveForm.txType === opt.id
                      ? 'bg-[#1C1917] border-[#1C1917] text-white'
                      : 'bg-white border-[#E7E0D6] text-[#475569]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">
                  {moveForm.txType === 'adjustment'
                    ? `New Physical Stock (${movementIng.unit})`
                    : `Quantity (${movementIng.unit}) *`}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={moveForm.quantity}
                  onChange={(e) => setMoveForm({ ...moveForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>

              {moveForm.txType === 'stock_in' && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1">
                    <span className="font-bold text-[#1C1917]">Unit Cost ({sym})</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={moveForm.unitCost}
                      onChange={(e) => setMoveForm({ ...moveForm, unitCost: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-bold text-[#1C1917]">Supplier</span>
                    <select
                      value={moveForm.supplierId}
                      onChange={(e) => setMoveForm({ ...moveForm, supplierId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white"
                    >
                      <option value="">Direct Purchase</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Reference No.</span>
                <input
                  value={moveForm.referenceNo}
                  onChange={(e) => setMoveForm({ ...moveForm, referenceNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  placeholder="INV-204 / WST-19 / KITCHEN-BATCH"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Reason / Notes</span>
                <input
                  value={moveForm.reason}
                  onChange={(e) => setMoveForm({ ...moveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMovementIng(null)}
                className="px-4 py-2 rounded-lg border border-[#E7E0D6] text-xs font-bold text-[#475569]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
              >
                {isBusy ? 'Recording...' : 'Confirm Movement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD / EDIT SUPPLIER */}
      {showSupModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSupplier}
            className="bg-white rounded-2xl border border-[#E7E0D6] max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#1C1917]">
                {editingSup ? `Edit ${editingSup.name}` : 'Add Vendor / Supplier'}
              </h2>
              <button type="button" onClick={() => setShowSupModal(false)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1 sm:col-span-2">
                <span className="font-bold text-[#1C1917]">Supplier Name *</span>
                <input
                  required
                  value={supForm.name}
                  onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Contact Person</span>
                <input
                  value={supForm.contactPerson}
                  onChange={(e) => setSupForm({ ...supForm, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Phone</span>
                <input
                  value={supForm.phone}
                  onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Email</span>
                <input
                  type="email"
                  value={supForm.email}
                  onChange={(e) => setSupForm({ ...supForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Category</span>
                <input
                  value={supForm.category}
                  onChange={(e) => setSupForm({ ...supForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Payment Terms</span>
                <input
                  value={supForm.paymentTerms}
                  onChange={(e) => setSupForm({ ...supForm, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  placeholder="Net 15 / Immediate"
                />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="font-bold text-[#1C1917]">Address</span>
                <input
                  value={supForm.address}
                  onChange={(e) => setSupForm({ ...supForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSupModal(false)}
                className="px-4 py-2 rounded-lg border border-[#E7E0D6] text-xs font-bold text-[#475569]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
              >
                {isBusy ? 'Saving...' : 'Save Supplier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREATE PURCHASE ORDER */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePo}
            className="bg-white rounded-2xl border border-[#E7E0D6] max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#1C1917]">Create Purchase Order</h2>
              <button type="button" onClick={() => setShowPoModal(false)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Supplier *</span>
                <select
                  required
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-bold text-[#1C1917]">Initial Status</span>
                <select
                  value={poStatus}
                  onChange={(e) => setPoStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white"
                >
                  <option value="ordered">Ordered (Sent to Vendor)</option>
                  <option value="draft">Draft (Internal Review)</option>
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Order Line Items</span>
                <button
                  type="button"
                  onClick={() => {
                    const firstIng = ingredients[0];
                    if (!firstIng) return;
                    setPoLines((prev) => [
                      ...prev,
                      { ingredientId: firstIng.id, quantity: '5', unitCost: String(firstIng.unitCost) }
                    ]);
                  }}
                  className="text-xs font-bold text-[#EA580C] hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="space-y-2">
                {poLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center bg-[#FDFBF7] p-2.5 rounded-xl border border-[#EFEAE2]"
                  >
                    <select
                      value={line.ingredientId}
                      onChange={(e) => {
                        const ing = ingredients.find((i) => i.id === e.target.value);
                        setPoLines((prev) =>
                          prev.map((row, i) =>
                            i === idx
                              ? {
                                  ...row,
                                  ingredientId: e.target.value,
                                  unitCost: ing ? String(ing.unitCost) : row.unitCost
                                }
                              : row
                          )
                        );
                      }}
                      className="col-span-6 px-2.5 py-1.5 rounded-lg border border-[#E7E0D6] bg-white text-xs"
                    >
                      {ingredients.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) =>
                        setPoLines((prev) =>
                          prev.map((row, i) => (i === idx ? { ...row, quantity: e.target.value } : row))
                        )
                      }
                      className="col-span-2 px-2 py-1.5 rounded-lg border border-[#E7E0D6] bg-white text-xs"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Cost"
                      value={line.unitCost}
                      onChange={(e) =>
                        setPoLines((prev) =>
                          prev.map((row, i) => (i === idx ? { ...row, unitCost: e.target.value } : row))
                        )
                      }
                      className="col-span-3 px-2 py-1.5 rounded-lg border border-[#E7E0D6] bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setPoLines((prev) => prev.filter((_, i) => i !== idx))}
                      className="col-span-1 flex justify-center text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <label className="block space-y-1 text-xs">
              <span className="font-bold text-[#1C1917]">Delivery Notes</span>
              <input
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                placeholder="Morning receiving bay before 9 AM"
              />
            </label>

            <div className="flex items-center justify-between pt-3 border-t border-[#EFEAE2]">
              <div className="text-xs font-bold text-[#1C1917]">
                Estimated PO Total:{' '}
                <span className="text-base text-[#EA580C]">
                  {sym}
                  {poEstimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E7E0D6] text-xs font-bold text-[#475569]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy || poLines.length === 0}
                  className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
                >
                  {isBusy ? 'Creating...' : 'Create PO'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
