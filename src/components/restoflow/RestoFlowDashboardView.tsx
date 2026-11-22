import React from 'react';
import {
  AlertTriangle,
  ChefHat,
  Clock,
  Flame,
  LayoutGrid,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type {
  RestaurantSettings,
  RestoFlowDashboardData,
  RestoFlowUser
} from '../../types/restoflow';

interface RestoFlowDashboardViewProps {
  user: RestoFlowUser;
  restaurant: RestaurantSettings;
  data: RestoFlowDashboardData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

const ROLE_SUBTITLES: Record<string, string> = {
  owner: 'Executive sales, food-cost margins, live table occupancy, and 7-day revenue performance.',
  manager: 'Live dining floor status, active kitchen throughput, reservations, and critical stock alerts.',
  cashier: 'Front-counter shift summary, held bills queue, and live today sales overview.',
  waiter: 'Active dining tables, kitchen pass readiness, and today order flow.',
  kitchen: 'Active ticket load, top-ordered dishes, and critical ingredient alerts.',
  inventory_manager: 'Live food cost percentage, critical low-stock items, and high-velocity dishes.'
};

const ORDER_STATUS_STYLE: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  preparing: 'bg-amber-50 text-amber-800 border-amber-200',
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  held: 'bg-slate-100 text-slate-700 border-slate-300',
  served: 'bg-sky-50 text-sky-700 border-sky-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200'
};

export const RestoFlowDashboardView: React.FC<RestoFlowDashboardViewProps> = ({
  user,
  restaurant,
  data,
  isLoading,
  onRefresh,
  onOpenSettings
}) => {
  const sym = restaurant.currencySymbol || '₹';
  const fmtMoney = (val: number) =>
    `${sym}${Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-30 rounded-xl bg-white border border-[#E7E0D6] animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-white border border-[#E7E0D6] animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-[#E7E0D6] rounded-xl p-10 text-center space-y-3">
        <p className="text-sm font-semibold text-[#475569]">Unable to load live dashboard metrics.</p>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 bg-[#EA580C] text-white text-xs font-bold px-4 py-2 rounded-lg"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            <span>{user.role.replace('_', ' ')} Workspace</span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-[#10B981]">Live SQL Database</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight mt-0.5">
            {user.role === 'owner'
              ? 'Executive Owner Dashboard'
              : user.role === 'manager'
              ? 'Operations Manager Dashboard'
              : `${restaurant.name} — Live Operations`}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {ROLE_SUBTITLES[user.role] || ROLE_SUBTITLES.owner}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-[#F6F1E7] text-[#1C1917] border border-[#E7E0D6] text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Data</span>
          </button>
          {user.role === 'owner' && (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
            >
              <span>Tax &amp; Store Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E0D6] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Today&apos;s Sales</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1C1917] tabular-nums">
              {fmtMoney(kpis.todaySales)}
            </div>
            <div className="text-xs text-[#64748B] mt-1 flex items-center justify-between">
              <span>Avg Bill: {fmtMoney(kpis.averageOrderValue)}</span>
              <span className="font-semibold text-[#10B981]">{kpis.todayOrders} orders today</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E7E0D6] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Order Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-[#F1ECE4] text-[#1C1917] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1C1917] tabular-nums">
              {kpis.pendingOrders} <span className="text-sm font-sans font-semibold text-[#64748B]">Active</span>
            </div>
            <div className="text-xs text-[#64748B] mt-1 flex items-center justify-between">
              <span>{kpis.completedOrders} Completed</span>
              <span className="font-semibold text-[#EA580C]">{kpis.heldOrders} Held at POS</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E7E0D6] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Table Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1C1917] tabular-nums">
                {kpis.tableOccupancyPct}%
              </div>
              <span className="text-xs font-mono text-[#475569]">
                {kpis.occupiedTables}/{kpis.totalTables} occupied
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#F1ECE4] rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-[#10B981] rounded-full transition-all"
                style={{ width: `${Math.min(100, kpis.tableOccupancyPct)}%` }}
              />
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">
              {kpis.reservedTables} reserved · {kpis.kitchenActiveCount} tickets in kitchen
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E7E0D6] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Food Cost &amp; Stock
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1C1917] tabular-nums">
              {kpis.avgFoodCostPct}%
            </div>
            <div className="text-xs mt-1 flex items-center justify-between">
              <span className="text-[#64748B]">Target &le; 32%</span>
              <span
                className={`font-bold ${
                  kpis.lowStockCount > 0 ? 'text-amber-700' : 'text-[#10B981]'
                }`}
              >
                {kpis.lowStockCount} Low Stock
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Analytics + Popular Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 7-Day Revenue Area Chart */}
        <div className="lg:col-span-8 bg-white border border-[#E7E0D6] rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-extrabold text-[#1C1917]">7-Day Revenue Analytics</h2>
              <p className="text-xs text-[#64748B]">
                Live daily totals aggregated directly from the orders ledger
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {data.orderTypeBreakdown.map((ch) => (
                <div
                  key={ch.orderType}
                  className="bg-[#FDFBF7] border border-[#E7E0D6] px-2.5 py-1 rounded-md font-mono"
                >
                  <span className="capitalize text-[#64748B]">{ch.orderType.replace('_', ' ')}:</span>{' '}
                  <span className="font-bold text-[#1C1917]">{ch.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rfOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE2" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${sym}${v}`}
                />
                <Tooltip
                  formatter={(value: any) => [fmtMoney(Number(value)), 'Revenue']}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #E7E0D6',
                    fontSize: '12px',
                    backgroundColor: '#1C1917',
                    color: '#FFFFFF'
                  }}
                  itemStyle={{ color: '#FB923C', fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#EA580C"
                  strokeWidth={2.5}
                  fill="url(#rfOrangeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="lg:col-span-4 bg-white border border-[#E7E0D6] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#1C1917]">Top-Selling Dishes</h2>
              <p className="text-xs text-[#64748B]">Ranked by live order quantity</p>
            </div>
            <UtensilsCrossed className="w-4 h-4 text-[#EA580C]" />
          </div>

          <div className="space-y-3 flex-1">
            {data.popularProducts.length === 0 ? (
              <p className="text-xs text-[#64748B] py-8 text-center">No dish sales recorded yet.</p>
            ) : (
              data.popularProducts.map((dish, idx) => (
                <div
                  key={dish.menuItemId}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#FDFBF7] border border-[#F1ECE4]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-[#1C1917] text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1C1917] truncate">{dish.name}</div>
                      <div className="text-[11px] text-[#64748B] truncate">{dish.categoryName}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-[#1C1917]">{fmtMoney(dish.revenue)}</div>
                    <div className="text-[10px] font-semibold text-[#10B981]">{dish.quantitySold} sold</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Orders Ledger + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white border border-[#E7E0D6] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EFEAE2] flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#1C1917]">Recent Orders Activity</h2>
              <p className="text-xs text-[#64748B]">
                Live dining, takeaway, and delivery records with demo/live record distinction
              </p>
            </div>
            <ChefHat className="w-4 h-4 text-[#64748B]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-[#EFEAE2] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="px-5 py-3">Order #</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE4] text-xs">
                {data.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-[#1C1917]">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.orderNumber}</span>
                        {ord.isDemo && (
                          <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded bg-[#F1ECE4] text-[#64748B]">
                            Demo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#475569] capitalize">
                      {ord.orderType.replace('_', ' ')}
                      {ord.tableNumber ? ` · ${ord.tableNumber}` : ''}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1E293B]">{ord.customerName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${
                          ORDER_STATUS_STYLE[ord.status] || 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[#1C1917]">
                      {fmtMoney(ord.grandTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert Panel */}
        <div className="lg:col-span-4 bg-white border border-[#E7E0D6] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#1C1917]">Low-Stock Alerts</h2>
                <p className="text-xs text-[#64748B]">Ingredients at or below reorder level</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>

            {data.lowStockAlerts.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 font-medium">
                All pantry ingredients are currently above minimum stock thresholds.
              </div>
            ) : (
              <div className="space-y-3">
                {data.lowStockAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-[#1C1917]">{item.name}</div>
                      <div className="text-[11px] text-amber-900 mt-0.5">
                        Min threshold: {item.minStockLevel} {item.unit}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-extrabold text-amber-800">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="text-[10px] font-sans font-bold uppercase text-amber-700">Reorder</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#EFEAE2] flex items-center gap-2 text-[11px] text-[#64748B]">
            <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Synced from {restaurant.name} SQLite store</span>
          </div>
        </div>
      </div>
    </div>
  );
};
