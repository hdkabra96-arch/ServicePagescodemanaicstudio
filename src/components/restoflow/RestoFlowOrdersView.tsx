import React, { useCallback, useEffect, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  PlayCircle,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  OrderRecord,
  RestaurantSettings,
  RestoFlowRolePermissions
} from '../../types/restoflow';
import { downloadRestoReceiptPdf } from '../../utils/restoflowExports';

interface RestoFlowOrdersViewProps {
  restaurant: RestaurantSettings;
  permissions: RestoFlowRolePermissions;
  onOrderMutated?: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  preparing: 'bg-amber-50 text-amber-800 border-amber-200',
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  held: 'bg-slate-100 text-slate-700 border-slate-300',
  served: 'bg-sky-50 text-sky-700 border-sky-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200'
};

export const RestoFlowOrdersView: React.FC<RestoFlowOrdersViewProps> = ({
  restaurant,
  permissions,
  onOrderMutated
}) => {
  const sym = restaurant.currencySymbol || '₹';
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelBox, setShowCancelBox] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const res = await restoFlowApi.getOrders({
        search: search.trim() || undefined,
        orderType: typeFilter,
        status: statusFilter,
        limit: 80
      });
      setOrders(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load orders.');
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCancelOrder = async () => {
    if (!selectedOrder || cancelReason.trim().length < 3) {
      setError('Enter a brief cancellation reason (at least 3 characters).');
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.cancelOrder(selectedOrder.id, cancelReason);
      setSelectedOrder(res.data);
      setShowCancelBox(false);
      setCancelReason('');
      setFeedback(res.message || 'Order cancelled.');
      await loadOrders();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancellation failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleResumeHeld = async (orderId: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.resumeOrder(orderId);
      setSelectedOrder(res.data);
      setFeedback(res.message || 'Held order resumed.');
      await loadOrders();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resume order.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            Module 05 · Unified Order Ledger
          </div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Dine-In, Takeaway &amp; Delivery Orders
          </h1>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-1.5 bg-white border border-[#E7E0D6] text-xs font-bold px-3.5 py-2 rounded-lg text-[#1C1917] self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
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
            placeholder="Search by Order #, guest name, or table..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] text-xs"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#D6D3D1] bg-white text-xs font-semibold"
        >
          <option value="all">All Channels</option>
          <option value="dine_in">Dine-In</option>
          <option value="takeaway">Takeaway</option>
          <option value="delivery">Delivery</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#D6D3D1] bg-white text-xs font-semibold"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="served">Served</option>
          <option value="held">Held</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E7E0D6] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#EFEAE2] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="px-5 py-3">Order #</th>
                <th className="px-4 py-3">Channel / Table</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1ECE4] text-xs">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FDFBF7]">
                  <td className="px-5 py-3 font-mono font-bold text-[#1C1917]">
                    <div className="flex items-center gap-1.5">
                      <span>{ord.orderNumber}</span>
                      {ord.isDemo && (
                        <span className="text-[9px] font-sans uppercase px-1.5 py-0.5 rounded bg-[#F1ECE4] text-[#64748B]">
                          Demo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-[#475569]">
                    {ord.orderType.replace('_', ' ')}
                    {ord.tableNumber ? ` · ${ord.tableNumber}` : ''}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1E293B]">{ord.customerName}</td>
                  <td className="px-4 py-3 text-[#64748B]">{ord.items.length} line(s)</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${
                        STATUS_BADGE[ord.status] || 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-bold capitalize ${
                        ord.paymentStatus === 'paid'
                          ? 'text-[#10B981]'
                          : ord.paymentStatus === 'partial'
                          ? 'text-amber-600'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-extrabold text-[#1C1917]">
                    {sym}{ord.grandTotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(ord);
                        setShowCancelBox(false);
                        setCancelReason('');
                      }}
                      className="inline-flex items-center gap-1 text-[#EA580C] hover:underline font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#64748B]">
                    No orders match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase text-[#EA580C]">
                  {selectedOrder.orderType.replace('_', ' ')}
                  {selectedOrder.tableNumber ? ` · Table ${selectedOrder.tableNumber}` : ''}
                </div>
                <h3 className="text-lg font-extrabold font-mono text-[#1C1917]">
                  {selectedOrder.orderNumber}
                </h3>
                <div className="text-xs text-[#64748B]">
                  {selectedOrder.customerName} · {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#64748B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedOrder.cancelReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                <span className="font-bold">Cancelled Reason:</span> {selectedOrder.cancelReason}
              </div>
            )}

            <div className="border border-[#EFEAE2] rounded-xl divide-y divide-[#F1ECE4]">
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#1C1917]">
                      {it.quantity}x {it.itemNameSnapshot}
                      {it.variantName ? ` (${it.variantName})` : ''}
                    </div>
                    <div className="text-[11px] text-[#64748B] uppercase">{it.kitchenStatus}</div>
                  </div>
                  <span className="font-mono font-bold text-[#1C1917]">
                    {sym}{it.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[#FDFBF7] border border-[#EFEAE2] rounded-xl p-3.5 text-xs space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{sym}{selectedOrder.subtotal.toFixed(2)}</span></div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-[#10B981]"><span>Discount</span><span className="font-mono">-{sym}{selectedOrder.discountAmount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between"><span>{restaurant.taxLabel} ({selectedOrder.taxRatePct}%)</span><span className="font-mono">{sym}{selectedOrder.taxAmount.toFixed(2)}</span></div>
              {selectedOrder.serviceChargeAmount > 0 && (
                <div className="flex justify-between"><span>Service Charge</span><span className="font-mono">{sym}{selectedOrder.serviceChargeAmount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1.5 border-t border-[#E7E0D6]">
                <span>Grand Total</span>
                <span className="font-mono">{sym}{selectedOrder.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {selectedOrder.payments.length > 0 && (
              <div className="space-y-1 text-xs">
                <div className="font-bold text-[#475569]">Recorded Payments</div>
                {selectedOrder.payments.map((p) => (
                  <div key={p.id} className="flex justify-between bg-emerald-50/70 px-3 py-1.5 rounded-lg">
                    <span className="uppercase font-bold text-emerald-900">
                      {p.paymentMethod} {p.referenceNumber ? `(${p.referenceNumber})` : ''}
                    </span>
                    <span className="font-mono font-bold text-emerald-800">{sym}{p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {showCancelBox && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                <label className="block text-xs font-bold text-red-800">Cancellation Reason</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Guest changed mind before cooking"
                  className="w-full px-3 py-2 rounded-lg border border-red-300 bg-white text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCancelBox(false)}
                    className="px-3 py-1.5 rounded text-xs font-bold text-[#475569]"
                  >
                    Back
                  </button>
                  <button
                    disabled={isBusy}
                    onClick={handleCancelOrder}
                    className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold inline-flex items-center gap-1"
                  >
                    {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Confirm Cancellation</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EFEAE2]">
              <button
                onClick={() => downloadRestoReceiptPdf(restaurant, selectedOrder)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1C1917] text-white text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Receipt</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedOrder.status === 'held' && (
                  <button
                    disabled={isBusy}
                    onClick={() => handleResumeHeld(selectedOrder.id)}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Resume Order</span>
                  </button>
                )}

                {permissions.canCancelOrders &&
                  !['completed', 'cancelled'].includes(selectedOrder.status) &&
                  !showCancelBox && (
                    <button
                      onClick={() => setShowCancelBox(true)}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
