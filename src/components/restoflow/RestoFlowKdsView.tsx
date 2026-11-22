import React, { useCallback, useEffect, useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  Loader2,
  RefreshCw,
  Utensils
} from 'lucide-react';
import { KdsTicketRecord, restoFlowApi } from '../../api/restoflowClient';
import type { RestoFlowUser } from '../../types/restoflow';

interface RestoFlowKdsViewProps {
  user: RestoFlowUser;
  onOrderMutated?: () => void;
}

const STATIONS = [
  { id: 'all', label: 'All Stations' },
  { id: 'hot_kitchen', label: 'Hot Kitchen' },
  { id: 'tandoor', label: 'Tandoor & Grill' },
  { id: 'bar', label: 'Craft Bar' },
  { id: 'pastry', label: 'Pastry' },
  { id: 'cold_station', label: 'Cold Station' }
];

export const RestoFlowKdsView: React.FC<RestoFlowKdsViewProps> = ({ user, onOrderMutated }) => {
  const [station, setStation] = useState('all');
  const [tickets, setTickets] = useState<KdsTicketRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    try {
      const res = await restoFlowApi.getKdsQueue(station);
      setTickets(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch kitchen queue.');
    } finally {
      setIsLoading(false);
    }
  }, [station]);

  useEffect(() => {
    setIsLoading(true);
    loadQueue();
    const timer = setInterval(loadQueue, 12000);
    return () => clearInterval(timer);
  }, [loadQueue]);

  const handleAdvanceOrder = async (
    orderId: string,
    nextStatus: 'preparing' | 'ready' | 'served'
  ) => {
    setBusyId(orderId);
    setError(null);
    try {
      const res = await restoFlowApi.updateKdsOrderStatus(orderId, nextStatus);
      setFeedback(res.message || 'Kitchen ticket updated.');
      await loadQueue();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update kitchen ticket.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleItem = async (
    itemId: string,
    currentStatus: 'queued' | 'preparing' | 'ready' | 'served' | 'cancelled'
  ) => {
    const nextMap: Record<string, 'preparing' | 'ready' | 'served'> = {
      queued: 'preparing',
      preparing: 'ready',
      ready: 'served'
    };
    const next = nextMap[currentStatus];
    if (!next) return;
    setBusyId(itemId);
    try {
      await restoFlowApi.updateKdsItemStatus(itemId, next);
      await loadQueue();
      onOrderMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item status.');
    } finally {
      setBusyId(null);
    }
  };

  const incomingCount = tickets.filter((t) => t.status === 'pending').length;
  const preparingCount = tickets.filter((t) => t.status === 'preparing').length;
  const readyCount = tickets.filter((t) => t.status === 'ready').length;

  return (
    <div className="bg-[#1C1917] text-white rounded-2xl p-5 sm:p-6 border border-[#3F3A36] space-y-6 min-h-[78vh]">
      {/* KDS Top Command Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#292524]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FB923C]">
              Live Kitchen Display System (KDS)
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Expedite &amp; Line Ticket Board
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#292524] border border-[#3F3A36] px-3.5 py-2 rounded-lg text-xs font-mono">
            <span className="text-[#FB923C] font-bold">{incomingCount} Incoming</span>
            <span className="text-[#57534E]">|</span>
            <span className="text-amber-400 font-bold">{preparingCount} Cooking</span>
            <span className="text-[#57534E]">|</span>
            <span className="text-[#10B981] font-bold">{readyCount} Ready</span>
          </div>
          <button
            onClick={loadQueue}
            className="inline-flex items-center gap-1.5 bg-[#292524] hover:bg-[#3F3A36] border border-[#57534E] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Board</span>
          </button>
        </div>
      </div>

      {/* Station Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATIONS.map((st) => (
          <button
            key={st.id}
            onClick={() => setStation(st.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              station === st.id
                ? 'bg-[#EA580C] text-white'
                : 'bg-[#292524] text-[#D6D3D1] hover:bg-[#3F3A36]'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#10B981]" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-emerald-300 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-950/70 border border-red-700 text-red-200 text-xs font-semibold px-4 py-2.5 rounded-lg">
          {error}
        </div>
      )}

      {/* Tickets Grid */}
      {isLoading && tickets.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 rounded-xl bg-[#292524] animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-[#292524] border border-[#3F3A36] rounded-xl p-12 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto" />
          <h3 className="text-base font-extrabold text-white">Kitchen Board All Clear</h3>
          <p className="text-xs text-[#A8A29E]">
            No pending or active orders in this station queue. New POS and Waiter tickets will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tickets.map((ticket) => {
            const headerBg =
              ticket.status === 'ready'
                ? 'bg-emerald-900/60 border-emerald-700'
                : ticket.status === 'served'
                ? 'bg-slate-800 border-slate-700'
                : ticket.urgency === 'critical'
                ? 'bg-red-950/80 border-red-700'
                : ticket.urgency === 'warning'
                ? 'bg-amber-950/80 border-amber-700'
                : 'bg-[#292524] border-[#3F3A36]';

            const canCook = ['owner', 'manager', 'kitchen'].includes(user.role);
            const canServe = ['owner', 'manager', 'kitchen', 'waiter'].includes(user.role);

            return (
              <div
                key={ticket.id}
                className="bg-[#292524] border border-[#3F3A36] rounded-xl overflow-hidden flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Ticket Header */}
                  <div className={`px-4 py-3 border-b ${headerBg} flex items-center justify-between gap-2`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-white">
                          {ticket.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/30 text-[#FDE68A]">
                          {ticket.tableNumber ? `Table ${ticket.tableNumber}` : ticket.orderType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#D6D3D1] mt-0.5">
                        {ticket.customerName} · {ticket.status.toUpperCase()}
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-1 rounded-md ${
                        ticket.urgency === 'critical'
                          ? 'bg-red-600 text-white'
                          : ticket.urgency === 'warning'
                          ? 'bg-amber-500 text-black'
                          : 'bg-[#1C1917] text-[#10B981]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ticket.elapsedMins}m</span>
                    </div>
                  </div>

                  {/* Kitchen Notes */}
                  {ticket.kitchenNotes && (
                    <div className="px-4 py-2 bg-[#EA580C]/15 border-b border-[#EA580C]/30 text-[11px] text-[#FED7AA] font-semibold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#FB923C] shrink-0" />
                      <span>{ticket.kitchenNotes}</span>
                    </div>
                  )}

                  {/* Ticket Line Items */}
                  <div className="p-4 space-y-2.5">
                    {ticket.items.map((item) => {
                      const done = item.kitchenStatus === 'ready' || item.kitchenStatus === 'served';
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={busyId === item.id || !canCook}
                          onClick={() => handleToggleItem(item.id, item.kitchenStatus)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-2.5 ${
                            done
                              ? 'bg-emerald-950/40 border-emerald-800/70 text-[#A7F3D0]'
                              : item.kitchenStatus === 'preparing'
                              ? 'bg-amber-950/35 border-amber-700/70 text-white'
                              : 'bg-[#1C1917] border-[#3F3A36] text-white hover:border-[#EA580C]'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="font-mono font-extrabold text-sm bg-[#EA580C] text-white px-2 py-0.5 rounded shrink-0">
                              {item.quantity}x
                            </span>
                            <div className="min-w-0">
                              <div className={`text-xs font-bold ${done ? 'line-through opacity-80' : ''}`}>
                                {item.itemNameSnapshot}
                                {item.variantName ? ` (${item.variantName})` : ''}
                              </div>
                              {item.addons.length > 0 && (
                                <div className="text-[10px] text-[#FB923C] mt-0.5">
                                  + {item.addons.map((a) => a.name).join(', ')}
                                </div>
                              )}
                              {item.specialInstructions && (
                                <div className="text-[10px] text-amber-300 mt-0.5 italic">
                                  Note: {item.specialInstructions}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-black/30 shrink-0">
                            {item.kitchenStatus}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-3.5 bg-[#1C1917] border-t border-[#3F3A36] grid grid-cols-2 gap-2">
                  {ticket.status === 'pending' && canCook && (
                    <button
                      disabled={busyId === ticket.id}
                      onClick={() => handleAdvanceOrder(ticket.id, 'preparing')}
                      className="col-span-2 py-2.5 px-3 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      {busyId === ticket.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                      <span>Accept &amp; Start Preparing</span>
                    </button>
                  )}

                  {ticket.status === 'preparing' && canCook && (
                    <button
                      disabled={busyId === ticket.id}
                      onClick={() => handleAdvanceOrder(ticket.id, 'ready')}
                      className="col-span-2 py-2.5 px-3 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      {busyId === ticket.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Mark Ready &amp; Alert Waiter</span>
                    </button>
                  )}

                  {ticket.status === 'ready' && canServe && (
                    <button
                      disabled={busyId === ticket.id}
                      onClick={() => handleAdvanceOrder(ticket.id, 'served')}
                      className="col-span-2 py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      {busyId === ticket.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Utensils className="w-4 h-4" />}
                      <span>Confirm Picked Up / Served</span>
                    </button>
                  )}

                  {ticket.status === 'served' && (
                    <div className="col-span-2 text-center text-[11px] font-bold text-[#10B981] py-1.5">
                      Served to Guest — Awaiting POS Settlement
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
