import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  Minus,
  PauseCircle,
  PlayCircle,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingCart,
  Split,
  Trash2,
  X
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  DiningTable,
  MenuCategory,
  MenuItem,
  OrderRecord,
  RestaurantSettings
} from '../../types/restoflow';
import { downloadRestoReceiptPdf } from '../../utils/restoflowExports';

interface RestoFlowPosViewProps {
  restaurant: RestaurantSettings;
  onOrderMutated?: () => void;
}

interface CartLine {
  key: string;
  menuItem: MenuItem;
  variantName: string;
  variantDelta: number;
  addonNames: string[];
  addonTotal: number;
  quantity: number;
  specialInstructions: string;
}

interface SplitPaymentDraft {
  paymentMethod: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer';
  amount: string;
  referenceNumber: string;
}

const DIETARY_DOT: Record<string, string> = {
  veg: 'border-emerald-600 bg-emerald-600',
  vegan: 'border-emerald-500 bg-emerald-500',
  egg: 'border-amber-500 bg-amber-500',
  non_veg: 'border-red-600 bg-red-600'
};

export const RestoFlowPosView: React.FC<RestoFlowPosViewProps> = ({
  restaurant,
  onOrderMutated
}) => {
  const sym = restaurant.currencySymbol || '₹';

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [heldOrders, setHeldOrders] = useState<OrderRecord[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCat, setActiveCat] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Order builder state
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [tableId, setTableId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [discountType, setDiscountType] = useState<'none' | 'percent' | 'flat'>('none');
  const [discountValue, setDiscountValue] = useState('0');
  const [cart, setCart] = useState<CartLine[]>([]);

  // Modals
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [chosenVariant, setChosenVariant] = useState('');
  const [chosenAddons, setChosenAddons] = useState<string[]>([]);
  const [itemNote, setItemNote] = useState('');

  const [showHeldDrawer, setShowHeldDrawer] = useState(false);
  const [settlingOrder, setSettlingOrder] = useState<OrderRecord | null>(null);
  const [splitPayments, setSplitPayments] = useState<SplitPaymentDraft[]>([
    { paymentMethod: 'upi', amount: '', referenceNumber: '' }
  ]);
  const [receiptOrder, setReceiptOrder] = useState<OrderRecord | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPosData = useCallback(async () => {
    try {
      const [catRes, itemRes, tblRes, heldRes, openRes] = await Promise.all([
        restoFlowApi.getMenuCategories(),
        restoFlowApi.getMenuItems({ availableOnly: true }),
        restoFlowApi.getTables(),
        restoFlowApi.getOrders({ status: 'held', limit: 20 }),
        restoFlowApi.getOrders({ paymentStatus: 'unpaid', limit: 30 })
      ]);
      setCategories(catRes.data);
      setItems(itemRes.data);
      setTables(tblRes.data);
      setHeldOrders(heldRes.data);
      setUnpaidOrders(
        openRes.data.filter((o) => !['cancelled', 'held'].includes(o.status))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load POS catalog.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosData();
  }, [loadPosData]);

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (activeCat !== 'all' && it.categoryId !== activeCat) return false;
      if (dietFilter !== 'all' && it.dietaryType !== dietFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!it.name.toLowerCase().includes(q) && !it.sku.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [items, activeCat, dietFilter, search]);

  const addLineToCart = (
    item: MenuItem,
    variantName = '',
    addonNames: string[] = [],
    specialInstructions = ''
  ) => {
    const variantObj = item.variants.find((v) => v.name === variantName);
    const variantDelta = variantObj ? Number(variantObj.priceDelta) : 0;
    const addonTotal = item.addons
      .filter((a) => addonNames.includes(a.name))
      .reduce((acc, a) => acc + Number(a.price), 0);

    const key = `${item.id}::${variantName}::${addonNames.sort().join(',')}::${specialInstructions}`;
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [
        ...prev,
        {
          key,
          menuItem: item,
          variantName,
          variantDelta,
          addonNames,
          addonTotal,
          quantity: 1,
          specialInstructions
        }
      ];
    });
  };

  const handleQuickAdd = (item: MenuItem) => {
    if (item.variants.length > 1 || item.addons.length > 0) {
      setCustomizingItem(item);
      setChosenVariant(item.variants[0]?.name || '');
      setChosenAddons([]);
      setItemNote('');
      return;
    }
    addLineToCart(item, item.variants[0]?.name || '', [], '');
  };

  const updateCartQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  // Preview calculations (server always recalculates authoritatively on submission)
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (acc, l) => acc + (l.menuItem.basePrice + l.variantDelta + l.addonTotal) * l.quantity,
        0
      ),
    [cart]
  );

  const discountAmount = useMemo(() => {
    const val = Math.max(0, Number(discountValue) || 0);
    if (discountType === 'percent') return Math.round(((subtotal * Math.min(100, val)) / 100) * 100) / 100;
    if (discountType === 'flat') return Math.min(subtotal, val);
    return 0;
  }, [subtotal, discountType, discountValue]);

  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(((taxable * restaurant.taxRatePct) / 100) * 100) / 100;
  const serviceCharge =
    orderType === 'dine_in'
      ? Math.round(((taxable * restaurant.serviceChargePct) / 100) * 100) / 100
      : 0;
  const grandTotal = Math.round((taxable + taxAmount + serviceCharge) * 100) / 100;

  const submitNewOrder = async (mode: 'hold' | 'fire' | 'pay') => {
    if (cart.length === 0) {
      setError('Add at least one dish to the cart first.');
      return;
    }
    if (orderType === 'dine_in' && !tableId) {
      setError('Select a dining table for Dine-In billing.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setError('Enter the customer delivery address.');
      return;
    }

    setError(null);
    setFeedback(null);
    setIsSubmitting(true);
    try {
      const res = await restoFlowApi.createOrder({
        orderType,
        tableId: orderType === 'dine_in' ? tableId : null,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : '',
        kitchenNotes,
        discountType,
        discountValue: Number(discountValue) || 0,
        hold: mode === 'hold',
        items: cart.map((l) => ({
          menuItemId: l.menuItem.id,
          quantity: l.quantity,
          variantName: l.variantName || undefined,
          addonNames: l.addonNames,
          specialInstructions: l.specialInstructions || undefined
        }))
      });

      setCart([]);
      setKitchenNotes('');
      setDeliveryAddress('');
      setDiscountType('none');
      setDiscountValue('0');
      setFeedback(res.message || 'Order created.');
      await loadPosData();
      onOrderMutated?.();

      if (mode === 'pay') {
        openSettlementModal(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSettlementModal = (order: OrderRecord) => {
    setSettlingOrder(order);
    setSplitPayments([
      { paymentMethod: 'upi', amount: order.balanceDue.toFixed(2), referenceNumber: '' }
    ]);
    setError(null);
  };

  const handleAddSplitRow = () => {
    if (!settlingOrder) return;
    const allocated = splitPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const remaining = Math.max(0, Math.round((settlingOrder.balanceDue - allocated) * 100) / 100);
    setSplitPayments((prev) => [
      ...prev,
      { paymentMethod: 'cash', amount: remaining > 0 ? remaining.toFixed(2) : '', referenceNumber: '' }
    ]);
  };

  const handleConfirmSettlement = async () => {
    if (!settlingOrder) return;
    const validRows = splitPayments
      .filter((p) => Number(p.amount) > 0)
      .map((p) => ({
        paymentMethod: p.paymentMethod,
        amount: Number(p.amount),
        referenceNumber: p.referenceNumber
      }));

    if (validRows.length === 0) {
      setError('Enter at least one valid payment amount.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await restoFlowApi.recordPayments(settlingOrder.id, validRows);
      setSettlingOrder(null);
      setReceiptOrder(res.data);
      setFeedback(res.message || 'Payment recorded.');
      await loadPosData();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment settlement failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeHeld = async (orderId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await restoFlowApi.resumeOrder(orderId);
      setFeedback(res.message || 'Order resumed.');
      setShowHeldDrawer(false);
      await loadPosData();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resume order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTables = tables.filter((t) => !t.mergedIntoTableId && t.status !== 'occupied');

  return (
    <div className="space-y-4">
      {/* Top POS Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            Module 02 · Cashier POS Billing Register
          </div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Point of Sale &amp; Split Billing
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowHeldDrawer((prev) => !prev)}
            className="inline-flex items-center gap-2 bg-white hover:bg-[#FFF7ED] border border-[#E7E0D6] text-[#1C1917] text-xs font-bold px-3.5 py-2 rounded-lg"
          >
            <PauseCircle className="w-4 h-4 text-[#EA580C]" />
            <span>Held Bills ({heldOrders.length})</span>
          </button>

          {unpaidOrders.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#FFF7ED] border border-[#FED7AA] px-3 py-1.5 rounded-lg text-xs">
              <span className="font-bold text-[#C2410C]">Open Unpaid Bills:</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  const found = unpaidOrders.find((o) => o.id === e.target.value);
                  if (found) openSettlementModal(found);
                  e.target.value = '';
                }}
                className="bg-white border border-[#FED7AA] rounded px-2 py-1 text-xs font-mono font-bold text-[#1C1917]"
              >
                <option value="">Settle open bill ({unpaidOrders.length})...</option>
                {unpaidOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} {o.tableNumber ? `(${o.tableNumber})` : `(${o.orderType})`} — {sym}
                    {o.balanceDue.toFixed(0)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Held Orders Drawer */}
      {showHeldDrawer && (
        <div className="bg-[#1C1917] text-white rounded-xl p-4 border border-[#3F3A36] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#FB923C]">
              Held POS Orders Queue ({heldOrders.length})
            </h2>
            <button onClick={() => setShowHeldDrawer(false)} className="text-[#A8A29E] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          {heldOrders.length === 0 ? (
            <p className="text-xs text-[#A8A29E]">No orders currently on hold.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {heldOrders.map((ho) => (
                <div
                  key={ho.id}
                  className="bg-[#292524] border border-[#3F3A36] rounded-lg p-3 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-xs font-bold">
                      <span>{ho.orderNumber}</span>
                      <span className="text-[#10B981]">{sym}{ho.grandTotal.toFixed(0)}</span>
                    </div>
                    <div className="text-[11px] text-[#D6D3D1] mt-1">
                      {ho.items.map((i) => `${i.quantity}x ${i.itemNameSnapshot}`).join(', ')}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleResumeHeld(ho.id)}
                      className="py-1.5 px-2.5 rounded bg-[#EA580C] hover:bg-[#C2410C] text-white text-[11px] font-bold flex items-center justify-center gap-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Resume KDS</span>
                    </button>
                    <button
                      onClick={() => openSettlementModal(ho)}
                      className="py-1.5 px-2.5 rounded bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-bold"
                    >
                      Pay &amp; Close
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Split-Screen POS Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Menu Catalog (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          {/* Search & Dietary Bar */}
          <div className="bg-white border border-[#E7E0D6] rounded-xl p-3.5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dish name or SKU..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'veg', label: 'Veg' },
                { id: 'non_veg', label: 'Non-Veg' },
                { id: 'vegan', label: 'Vegan' },
                { id: 'egg', label: 'Egg' }
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDietFilter(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                    dietFilter === d.id
                      ? 'bg-[#1C1917] text-white'
                      : 'bg-[#F6F1E7] text-[#475569] hover:bg-[#EFEAE2]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCat('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap border ${
                activeCat === 'all'
                  ? 'bg-[#EA580C] text-white border-[#EA580C]'
                  : 'bg-white text-[#475569] border-[#E7E0D6] hover:border-[#EA580C]'
              }`}
            >
              All Dishes ({items.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap border ${
                  activeCat === c.id
                    ? 'bg-[#EA580C] text-white border-[#EA580C]'
                    : 'bg-white text-[#475569] border-[#E7E0D6] hover:border-[#EA580C]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Dish Tiles Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-44 rounded-xl bg-white border border-[#E7E0D6] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleQuickAdd(item)}
                  className="text-left bg-white border border-[#E7E0D6] hover:border-[#EA580C] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="h-26 bg-[#1C1917] relative overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#A8A29E]">
                          {item.sku}
                        </div>
                      )}
                      <span
                        className="absolute top-2 left-2 w-4 h-4 rounded-xs bg-white/95 border flex items-center justify-center"
                        title={item.dietaryType}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${DIETARY_DOT[item.dietaryType] || 'bg-emerald-600'}`}
                        />
                      </span>
                      {(item.variants.length > 1 || item.addons.length > 0) && (
                        <span className="absolute bottom-2 right-2 text-[9px] font-bold uppercase bg-[#1C1917]/85 text-[#FB923C] px-1.5 py-0.5 rounded">
                          Customizable
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-extrabold text-[#1C1917] line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
                        {item.categoryName} · {item.prepTimeMins}m
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pb-3 flex items-center justify-between">
                    <span className="font-mono font-extrabold text-sm text-[#1C1917]">
                      {sym}{item.basePrice}
                    </span>
                    <span className="text-[11px] font-bold text-[#EA580C] group-hover:translate-x-0.5 transition-transform">
                      + Add
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Billing Cart (5 cols) */}
        <div className="xl:col-span-5 bg-white border border-[#E7E0D6] rounded-xl overflow-hidden shadow-sm sticky top-20">
          {/* Channel & Table Selector */}
          <div className="p-4 bg-[#1C1917] text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-sm">
                <ShoppingCart className="w-4 h-4 text-[#EA580C]" />
                <span>Current Bill ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] text-red-300 hover:text-red-200 font-semibold"
                >
                  Clear Cart
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(['dine_in', 'takeaway', 'delivery'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                    orderType === type
                      ? 'bg-[#EA580C] text-white'
                      : 'bg-[#292524] text-[#D6D3D1] hover:bg-[#3F3A36]'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {orderType === 'dine_in' && (
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full bg-[#292524] border border-[#3F3A36] rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="">Select available table...</option>
                {availableTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tableNumber} — {t.name} ({t.section}, {t.capacity} seats)
                  </option>
                ))}
              </select>
            )}

            {orderType === 'delivery' && (
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Customer delivery address & landmark..."
                className="w-full bg-[#292524] border border-[#3F3A36] rounded-lg px-3 py-2 text-xs text-white placeholder-[#A8A29E]"
              />
            )}
          </div>

          {/* Cart Items */}
          <div className="p-4 max-h-68 overflow-y-auto divide-y divide-[#F1ECE4]">
            {cart.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#64748B]">
                Tap dishes on the left to build a live order.
              </div>
            ) : (
              cart.map((line) => {
                const unitPrice = line.menuItem.basePrice + line.variantDelta + line.addonTotal;
                return (
                  <div key={line.key} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1C1917] truncate">
                        {line.menuItem.name}
                        {line.variantName ? ` (${line.variantName})` : ''}
                      </div>
                      {line.addonNames.length > 0 && (
                        <div className="text-[10px] text-[#EA580C] truncate">
                          + {line.addonNames.join(', ')}
                        </div>
                      )}
                      <div className="text-[11px] font-mono text-[#64748B]">
                        {sym}{unitPrice} each
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-[#D6D3D1] rounded-lg bg-[#FDFBF7]">
                        <button
                          type="button"
                          onClick={() => updateCartQty(line.key, -1)}
                          className="p-1.5 text-[#475569] hover:text-[#1C1917]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(line.key, 1)}
                          className="p-1.5 text-[#475569] hover:text-[#1C1917]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="w-16 text-right font-mono text-xs font-extrabold text-[#1C1917]">
                        {sym}{(unitPrice * line.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Discount & Kitchen Notes */}
          <div className="px-4 py-3 bg-[#FDFBF7] border-t border-[#EFEAE2] space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="col-span-2 px-2.5 py-1.5 rounded-lg border border-[#D6D3D1] bg-white text-xs font-semibold"
              >
                <option value="none">No Discount</option>
                <option value="percent">Percent Discount (%)</option>
                <option value="flat">Flat Discount ({sym})</option>
              </select>
              <input
                type="number"
                min="0"
                disabled={discountType === 'none'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#D6D3D1] bg-white disabled:opacity-50 text-xs font-mono"
              />
            </div>

            <input
              type="text"
              value={kitchenNotes}
              onChange={(e) => setKitchenNotes(e.target.value)}
              placeholder="Kitchen notes (e.g. Less spicy, allergy alert)..."
              className="w-full px-3 py-1.5 rounded-lg border border-[#D6D3D1] bg-white text-xs"
            />
          </div>

          {/* Totals & Action Buttons */}
          <div className="p-4 border-t border-[#EFEAE2] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal</span>
                <span className="font-mono">{sym}{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#10B981] font-semibold">
                  <span>Discount</span>
                  <span className="font-mono">-{sym}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#64748B]">
                <span>{restaurant.taxLabel} ({restaurant.taxRatePct}%)</span>
                <span className="font-mono">{sym}{taxAmount.toFixed(2)}</span>
              </div>
              {serviceCharge > 0 && (
                <div className="flex justify-between text-[#64748B]">
                  <span>Service Charge ({restaurant.serviceChargePct}%)</span>
                  <span className="font-mono">{sym}{serviceCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-[#1C1917] pt-2 border-t border-[#EFEAE2]">
                <span>Grand Total</span>
                <span className="font-mono">{sym}{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={() => submitNewOrder('hold')}
                className="py-2.5 px-3 rounded-lg border border-[#D6D3D1] bg-white hover:bg-[#FDFBF7] disabled:opacity-50 text-[#1C1917] text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PauseCircle className="w-4 h-4 text-[#EA580C]" />
                <span>Hold Bill</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={() => submitNewOrder('fire')}
                className="py-2.5 px-3 rounded-lg bg-[#1C1917] hover:bg-[#292524] disabled:opacity-50 text-white text-xs font-bold"
              >
                Fire to Kitchen
              </button>
              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={() => submitNewOrder('pay')}
                className="col-span-2 py-3 px-4 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                <span>Generate Bill &amp; Collect Payment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Variant & Add-on Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E7E0D6]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#1C1917]">{customizingItem.name}</h3>
                <p className="text-xs text-[#64748B]">Base price: {sym}{customizingItem.basePrice}</p>
              </div>
              <button onClick={() => setCustomizingItem(null)} className="text-[#64748B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {customizingItem.variants.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#334155]">Select Portion / Variant</div>
                <div className="space-y-1.5">
                  {customizingItem.variants.map((v) => (
                    <label
                      key={v.name}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs ${
                        chosenVariant === v.name
                          ? 'border-[#EA580C] bg-[#FFF7ED]'
                          : 'border-[#E7E0D6]'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <input
                          type="radio"
                          name="variant"
                          checked={chosenVariant === v.name}
                          onChange={() => setChosenVariant(v.name)}
                        />
                        {v.name}
                      </span>
                      <span className="font-mono font-bold">
                        {v.priceDelta >= 0 ? `+${sym}${v.priceDelta}` : `-${sym}${Math.abs(v.priceDelta)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {customizingItem.addons.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#334155]">Optional Add-ons</div>
                <div className="space-y-1.5">
                  {customizingItem.addons.map((a) => {
                    const checked = chosenAddons.includes(a.name);
                    return (
                      <label
                        key={a.name}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs ${
                          checked ? 'border-[#10B981] bg-emerald-50/50' : 'border-[#E7E0D6]'
                        }`}
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setChosenAddons((prev) =>
                                checked ? prev.filter((x) => x !== a.name) : [...prev, a.name]
                              )
                            }
                          />
                          {a.name}
                        </span>
                        <span className="font-mono font-bold">+{sym}{a.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <input
              type="text"
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              placeholder="Special kitchen instruction (optional)"
              className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs"
            />

            <button
              type="button"
              onClick={() => {
                addLineToCart(customizingItem, chosenVariant, chosenAddons, itemNote);
                setCustomizingItem(null);
              }}
              className="w-full py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-extrabold"
            >
              Add Customized Dish to Bill
            </button>
          </div>
        </div>
      )}

      {/* Split Payment Settlement Modal */}
      {settlingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E7E0D6]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C]">
                  Bill Settlement &amp; Split Payments
                </div>
                <h3 className="text-lg font-extrabold text-[#1C1917]">
                  {settlingOrder.orderNumber} · Balance Due {sym}{settlingOrder.balanceDue.toFixed(2)}
                </h3>
              </div>
              <button onClick={() => setSettlingOrder(null)} className="text-[#64748B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {splitPayments.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <select
                    value={row.paymentMethod}
                    onChange={(e) =>
                      setSplitPayments((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, paymentMethod: e.target.value as any } : r))
                      )
                    }
                    className="col-span-4 px-2.5 py-2 rounded-lg border border-[#D6D3D1] text-xs font-bold uppercase"
                  >
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="wallet">Wallet</option>
                    <option value="bank_transfer">Bank</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.amount}
                    onChange={(e) =>
                      setSplitPayments((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, amount: e.target.value } : r))
                      )
                    }
                    placeholder="Amount"
                    className="col-span-3 px-2.5 py-2 rounded-lg border border-[#D6D3D1] text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={row.referenceNumber}
                    onChange={(e) =>
                      setSplitPayments((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, referenceNumber: e.target.value } : r))
                      )
                    }
                    placeholder="Ref / Txn #"
                    className="col-span-4 px-2.5 py-2 rounded-lg border border-[#D6D3D1] text-xs"
                  />
                  {splitPayments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSplitPayments((prev) => prev.filter((_, i) => i !== idx))}
                      className="col-span-1 text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSplitRow}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] hover:underline"
            >
              <Split className="w-3.5 h-3.5" />
              <span>+ Split Across Another Payment Method</span>
            </button>

            <div className="pt-3 border-t border-[#EFEAE2] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSettlingOrder(null)}
                className="px-4 py-2 rounded-lg border border-[#D6D3D1] text-xs font-bold text-[#475569]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSettlement}
                className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-extrabold flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                <span>Record Payment &amp; Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable & Downloadable Thermal Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#E7E0D6]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
                Bill Settled · {receiptOrder.orderNumber}
              </span>
              <button onClick={() => setReceiptOrder(null)} className="text-[#64748B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FDFBF7] border border-dashed border-[#CBD5E1] rounded-xl p-4 font-mono text-[11px] space-y-2 max-h-80 overflow-y-auto">
              <div className="text-center border-b border-dashed border-[#CBD5E1] pb-2">
                <div className="font-bold text-xs uppercase">{restaurant.name}</div>
                <div className="text-[10px] text-[#64748B]">{restaurant.address}</div>
                {restaurant.gstin && <div className="text-[10px]">GSTIN: {restaurant.gstin}</div>}
              </div>

              <div className="space-y-1 border-b border-dashed border-[#CBD5E1] pb-2">
                {receiptOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between gap-2">
                    <span>
                      {it.quantity}x {it.itemNameSnapshot}
                    </span>
                    <span>{sym}{it.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{sym}{receiptOrder.subtotal.toFixed(2)}</span>
                </div>
                {receiptOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-[#10B981]">
                    <span>Discount</span>
                    <span>-{sym}{receiptOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{restaurant.taxLabel} ({receiptOrder.taxRatePct}%)</span>
                  <span>{sym}{receiptOrder.taxAmount.toFixed(2)}</span>
                </div>
                {receiptOrder.serviceChargeAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Service Charge</span>
                    <span>{sym}{receiptOrder.serviceChargeAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-[#CBD5E1]">
                  <span>TOTAL</span>
                  <span>{sym}{receiptOrder.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {receiptOrder.payments.length > 0 && (
                <div className="pt-2 border-t border-dashed border-[#CBD5E1] space-y-0.5">
                  <div className="text-[10px] font-bold uppercase text-[#64748B]">Payments</div>
                  {receiptOrder.payments.map((p) => (
                    <div key={p.id} className="flex justify-between text-[10px]">
                      <span>{p.paymentMethod.toUpperCase()}</span>
                      <span>{sym}{p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-lg border border-[#D6D3D1] text-xs font-bold text-[#1C1917] flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => downloadRestoReceiptPdf(restaurant, receiptOrder)}
                className="py-2.5 px-3 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>PDF Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
