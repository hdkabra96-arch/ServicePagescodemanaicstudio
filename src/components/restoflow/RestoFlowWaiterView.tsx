import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  BellRing,
  CalendarClock,
  CheckCircle2,
  GitMerge,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Unlink,
  Users,
  X
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  DiningTable,
  MenuItem,
  OrderRecord,
  RestaurantSettings,
  RestoFlowRolePermissions
} from '../../types/restoflow';

interface RestoFlowWaiterViewProps {
  restaurant: RestaurantSettings;
  permissions: RestoFlowRolePermissions;
  onOrderMutated?: () => void;
}

const TABLE_STATUS_STYLE: Record<string, string> = {
  available: 'border-emerald-300 bg-emerald-50/40',
  occupied: 'border-[#EA580C] bg-[#FFF7ED]',
  reserved: 'border-amber-400 bg-amber-50/60',
  cleaning: 'border-slate-300 bg-slate-100/70'
};

export const RestoFlowWaiterView: React.FC<RestoFlowWaiterViewProps> = ({
  restaurant,
  permissions,
  onOrderMutated
}) => {
  const sym = restaurant.currencySymbol || '₹';
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [readyOrders, setReadyOrders] = useState<OrderRecord[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [sectionFilter, setSectionFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [orderingTable, setOrderingTable] = useState<DiningTable | null>(null);
  const [orderCart, setOrderCart] = useState<Record<string, number>>({});
  const [orderNotes, setOrderNotes] = useState('');

  const [reservingTable, setReservingTable] = useState<DiningTable | null>(null);
  const [reserveGuest, setReserveGuest] = useState('');
  const [reservePhone, setReservePhone] = useState('');

  const [transferSource, setTransferSource] = useState<DiningTable | null>(null);
  const [transferDestId, setTransferDestId] = useState('');

  const [mergePrimary, setMergePrimary] = useState<DiningTable | null>(null);
  const [mergeSecondaryIds, setMergeSecondaryIds] = useState<string[]>([]);

  const [showAddTable, setShowAddTable] = useState(false);
  const [newTblNum, setNewTblNum] = useState('');
  const [newTblName, setNewTblName] = useState('');
  const [newTblSection, setNewTblSection] = useState('Main Dining');
  const [newTblCap, setNewTblCap] = useState('4');

  const loadFloor = useCallback(async () => {
    try {
      const [tblRes, ordRes, menuRes] = await Promise.all([
        restoFlowApi.getTables(),
        restoFlowApi.getOrders({ status: 'ready', limit: 20 }),
        restoFlowApi.getMenuItems({ availableOnly: true })
      ]);
      setTables(tblRes.data);
      setReadyOrders(ordRes.data);
      setMenuItems(menuRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dining floor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFloor();
  }, [loadFloor]);

  const sections = ['All', ...Array.from(new Set(tables.map((t) => t.section)))];
  const visibleTables =
    sectionFilter === 'All' ? tables : tables.filter((t) => t.section === sectionFilter);

  const handleMarkServed = async (orderId: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.updateKdsOrderStatus(orderId, 'served');
      setFeedback(res.message || 'Marked served.');
      await loadFloor();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to mark served.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmitTableOrder = async () => {
    if (!orderingTable) return;
    const selectedItems = Object.entries(orderCart)
      .filter(([, qty]) => qty > 0)
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

    if (selectedItems.length === 0) {
      setError('Select at least one dish to send to kitchen.');
      return;
    }

    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.createOrder({
        orderType: 'dine_in',
        tableId: orderingTable.id,
        kitchenNotes: orderNotes,
        items: selectedItems
      });
      setOrderingTable(null);
      setOrderCart({});
      setOrderNotes('');
      setFeedback(`Order ${res.data.orderNumber} sent to Kitchen for ${orderingTable.tableNumber}.`);
      await loadFloor();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create table order.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservingTable) return;
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.reserveTable(reservingTable.id, {
        guestName: reserveGuest,
        phone: reservePhone
      });
      setReservingTable(null);
      setReserveGuest('');
      setReservePhone('');
      setFeedback(res.message || 'Reservation saved.');
      await loadFloor();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reservation failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferSource || !transferDestId) return;
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.transferTable(transferSource.id, transferDestId);
      setTransferSource(null);
      setTransferDestId('');
      setFeedback(res.message || 'Table transferred.');
      await loadFloor();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleMergeSubmit = async () => {
    if (!mergePrimary || mergeSecondaryIds.length === 0) return;
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.mergeTables(mergePrimary.id, mergeSecondaryIds);
      setMergePrimary(null);
      setMergeSecondaryIds([]);
      setFeedback(res.message || 'Tables merged.');
      await loadFloor();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleUnmerge = async (tableId: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.unmergeTable(tableId);
      setFeedback(res.message || 'Table unmerged.');
      await loadFloor();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unmerge failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.createTable({
        tableNumber: newTblNum,
        name: newTblName,
        section: newTblSection,
        capacity: Number(newTblCap) || 4
      });
      setShowAddTable(false);
      setNewTblNum('');
      setNewTblName('');
      setFeedback(`Added table ${res.data.tableNumber}.`);
      await loadFloor();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add table.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleMarkAvailable = async (tableId: string) => {
    setIsBusy(true);
    try {
      await restoFlowApi.updateTable(tableId, { status: 'available' });
      setFeedback('Table marked available.');
      await loadFloor();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const availableTransferTargets = tables.filter(
    (t) => t.status === 'available' && !t.mergedIntoTableId
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            Module 04 · Dining Floor &amp; Waiter Service
          </div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Interactive Table Map &amp; Table-Side Ordering
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadFloor}
            className="inline-flex items-center gap-1.5 bg-white border border-[#E7E0D6] text-xs font-bold px-3.5 py-2 rounded-lg text-[#1C1917]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Floor</span>
          </button>
          {permissions.canManageMenu && (
            <button
              onClick={() => setShowAddTable(true)}
              className="inline-flex items-center gap-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Table</span>
            </button>
          )}
        </div>
      </div>

      {/* Ready at Kitchen Pass Alert Strip */}
      {readyOrders.length > 0 && (
        <div className="bg-emerald-950 text-white rounded-xl p-4 border border-emerald-800 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10B981]">
            <BellRing className="w-4 h-4" />
            <span>Ready at Kitchen Pass ({readyOrders.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-emerald-900/50 border border-emerald-700/70 rounded-lg p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-mono font-extrabold text-xs">
                    {ord.orderNumber} · {ord.tableNumber ? `Table ${ord.tableNumber}` : ord.orderType}
                  </div>
                  <div className="text-[11px] text-emerald-100 mt-0.5 line-clamp-1">
                    {ord.items.map((i) => `${i.quantity}x ${i.itemNameSnapshot}`).join(', ')}
                  </div>
                </div>
                <button
                  disabled={isBusy}
                  onClick={() => handleMarkServed(ord.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-extrabold shrink-0"
                >
                  Mark Served
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Section Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sections.map((sec) => (
          <button
            key={sec}
            onClick={() => setSectionFilter(sec)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap border ${
              sectionFilter === sec
                ? 'bg-[#1C1917] text-white border-[#1C1917]'
                : 'bg-white text-[#475569] border-[#E7E0D6]'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Floor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleTables.map((tbl) => (
          <div
            key={tbl.id}
            className={`rounded-xl border-2 p-4 flex flex-col justify-between gap-3 transition-all bg-white ${
              TABLE_STATUS_STYLE[tbl.status] || 'border-[#E7E0D6]'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-lg text-[#1C1917]">
                      {tbl.tableNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-[#E7E0D6] text-[#475569]">
                      {tbl.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#475569] mt-0.5">{tbl.name}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-mono text-[#64748B]">
                  <Users className="w-3.5 h-3.5" />
                  {tbl.capacity}
                </span>
              </div>

              <div className="text-[11px] text-[#64748B] mt-1">{tbl.section}</div>

              {tbl.activeOrderNumber && (
                <div className="mt-3 p-2.5 rounded-lg bg-white border border-[#FED7AA] text-xs">
                  <div className="font-mono font-bold text-[#EA580C]">{tbl.activeOrderNumber}</div>
                  <div className="text-[11px] text-[#1C1917] font-mono font-semibold">
                    Live Bill: {sym}{Number(tbl.activeOrderTotal || 0).toFixed(0)}
                  </div>
                </div>
              )}

              {tbl.mergedIntoTableNumber && (
                <div className="mt-3 p-2 rounded-lg bg-[#1C1917] text-white text-[11px] font-bold flex items-center justify-between">
                  <span>Merged into {tbl.mergedIntoTableNumber}</span>
                  <button
                    onClick={() => handleUnmerge(tbl.id)}
                    className="text-[#FB923C] hover:underline inline-flex items-center gap-1"
                  >
                    <Unlink className="w-3 h-3" />
                    Unmerge
                  </button>
                </div>
              )}

              {tbl.status === 'reserved' && tbl.reservedForName && (
                <div className="mt-3 p-2.5 rounded-lg bg-white border border-amber-200 text-[11px]">
                  <div className="font-bold text-amber-900">{tbl.reservedForName}</div>
                  <div className="text-amber-700 font-mono">{tbl.reservedPhone}</div>
                </div>
              )}
            </div>

            {/* Table Action Bar */}
            <div className="pt-2 border-t border-black/5 flex flex-wrap gap-1.5">
              {tbl.status === 'available' && !tbl.mergedIntoTableId && (
                <>
                  <button
                    onClick={() => {
                      setOrderingTable(tbl);
                      setOrderCart({});
                      setOrderNotes('');
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-[11px] font-bold"
                  >
                    Take Order
                  </button>
                  <button
                    onClick={() => setReservingTable(tbl)}
                    className="py-1.5 px-2.5 rounded-lg bg-white border border-[#D6D3D1] text-[#1C1917] text-[11px] font-bold inline-flex items-center gap-1"
                  >
                    <CalendarClock className="w-3 h-3" />
                    Reserve
                  </button>
                </>
              )}

              {tbl.status === 'occupied' && tbl.activeOrderId && (
                <>
                  <button
                    onClick={() => setTransferSource(tbl)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#1C1917] text-white text-[11px] font-bold inline-flex items-center justify-center gap-1"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    Transfer
                  </button>
                  <button
                    onClick={() => {
                      setMergePrimary(tbl);
                      setMergeSecondaryIds([]);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-[#D6D3D1] text-[#1C1917] text-[11px] font-bold inline-flex items-center justify-center gap-1"
                  >
                    <GitMerge className="w-3 h-3" />
                    Merge
                  </button>
                </>
              )}

              {(tbl.status === 'reserved' || tbl.status === 'cleaning') && (
                <>
                  {tbl.status === 'reserved' && (
                    <button
                      onClick={() => {
                        setOrderingTable(tbl);
                        setOrderCart({});
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#EA580C] text-white text-[11px] font-bold"
                    >
                      Seat &amp; Order
                    </button>
                  )}
                  <button
                    onClick={() => handleMarkAvailable(tbl.id)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-white border border-[#D6D3D1] text-[#1C1917] text-[11px] font-bold"
                  >
                    Mark Free
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Table-Side Order Composer Modal */}
      {orderingTable && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase text-[#EA580C]">Table-Side Order</div>
                <h3 className="text-lg font-extrabold text-[#1C1917]">
                  Table {orderingTable.tableNumber} — {orderingTable.name}
                </h3>
              </div>
              <button onClick={() => setOrderingTable(null)} className="text-[#64748B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-1">
              {menuItems.map((m) => {
                const qty = orderCart[m.id] || 0;
                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      qty > 0 ? 'border-[#EA580C] bg-[#FFF7ED]' : 'border-[#E7E0D6] bg-[#FDFBF7]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1C1917] truncate">{m.name}</div>
                      <div className="text-[11px] font-mono text-[#64748B]">{sym}{m.basePrice}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {qty > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setOrderCart((prev) => ({ ...prev, [m.id]: Math.max(0, qty - 1) }))
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-[#D6D3D1] font-bold text-xs"
                        >
                          -
                        </button>
                      )}
                      {qty > 0 && <span className="w-5 text-center font-mono text-xs font-bold">{qty}</span>}
                      <button
                        type="button"
                        onClick={() => setOrderCart((prev) => ({ ...prev, [m.id]: qty + 1 }))}
                        className="w-7 h-7 rounded-lg bg-[#EA580C] text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Kitchen notes (e.g., Serve starters first, nut allergy)..."
              className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] text-xs"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EFEAE2]">
              <button
                type="button"
                onClick={() => setOrderingTable(null)}
                className="px-4 py-2 rounded-lg border border-[#D6D3D1] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={handleSubmitTableOrder}
                className="px-5 py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-extrabold inline-flex items-center gap-2"
              >
                {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Fire Order to Kitchen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reserve Modal */}
      {reservingTable && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleReserveSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-extrabold text-[#1C1917]">
              Reserve Table {reservingTable.tableNumber}
            </h3>
            <input
              type="text"
              required
              value={reserveGuest}
              onChange={(e) => setReserveGuest(e.target.value)}
              placeholder="Guest full name"
              className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] text-xs"
            />
            <input
              type="text"
              required
              value={reservePhone}
              onChange={(e) => setReservePhone(e.target.value)}
              placeholder="Guest phone number"
              className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReservingTable(null)}
                className="px-4 py-2 rounded-lg border border-[#D6D3D1] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-5 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold"
              >
                Confirm Reservation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer Table Modal */}
      {transferSource && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#1C1917]">
              Transfer {transferSource.activeOrderNumber} from {transferSource.tableNumber}
            </h3>
            <select
              value={transferDestId}
              onChange={(e) => setTransferDestId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#D6D3D1] text-xs"
            >
              <option value="">Select destination available table...</option>
              {availableTransferTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tableNumber} — {t.name} ({t.section}, {t.capacity} seats)
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTransferSource(null)}
                className="px-4 py-2 rounded-lg border border-[#D6D3D1] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={!transferDestId || isBusy}
                onClick={handleTransferSubmit}
                className="px-5 py-2 rounded-lg bg-[#1C1917] text-white text-xs font-bold"
              >
                Transfer Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Tables Modal */}
      {mergePrimary && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#1C1917]">
              Merge Adjacent Tables into {mergePrimary.tableNumber}
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {availableTransferTargets.map((t) => {
                const checked = mergeSecondaryIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs ${
                      checked ? 'border-[#EA580C] bg-[#FFF7ED]' : 'border-[#E7E0D6]'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-bold">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setMergeSecondaryIds((prev) =>
                            checked ? prev.filter((x) => x !== t.id) : [...prev, t.id]
                          )
                        }
                      />
                      {t.tableNumber} — {t.name}
                    </span>
                    <span className="text-[#64748B]">{t.capacity} seats</span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMergePrimary(null)}
                className="px-4 py-2 rounded-lg border border-[#D6D3D1] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={mergeSecondaryIds.length === 0 || isBusy}
                onClick={handleMergeSubmit}
                className="px-5 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold"
              >
                Confirm Merge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTable}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3.5 shadow-2xl"
          >
            <h3 className="text-base font-extrabold text-[#1C1917]">Add Dining Table</h3>
            <input
              type="text"
              required
              value={newTblNum}
              onChange={(e) => setNewTblNum(e.target.value)}
              placeholder="Table code (e.g. T7, P4)"
              className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] text-xs"
            />
            <input
              type="text"
              required
              value={newTblName}
              onChange={(e) => setNewTblName(e.target.value)}
              placeholder="Display name (e.g. Terrace Booth 4)"
              className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newTblSection}
                onChange={(e) => setNewTblSection(e.target.value)}
                placeholder="Section"
                className="px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs"
              />
              <input
                type="number"
                min="1"
                max="30"
                required
                value={newTblCap}
                onChange={(e) => setNewTblCap(e.target.value)}
                placeholder="Capacity"
                className="px-3 py-2 rounded-lg border border-[#D6D3D1] text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTable(false)}
                className="px-4 py-2 rounded-lg border border-[#D6D3D1] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-5 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold"
              >
                Create Table
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
