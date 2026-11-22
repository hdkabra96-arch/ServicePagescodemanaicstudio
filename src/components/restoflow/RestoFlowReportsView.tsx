import React, { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  RestaurantSettings,
  RestoFlowReportData,
  RestoFlowRolePermissions
} from '../../types/restoflow';
import {
  downloadRestoReportExcel,
  downloadRestoReportPdf
} from '../../utils/restoflowExports';

interface RestoFlowReportsViewProps {
  restaurant: RestaurantSettings;
  permissions: RestoFlowRolePermissions;
}

export const RestoFlowReportsView: React.FC<RestoFlowReportsViewProps> = ({
  restaurant,
  permissions
}) => {
  const sym = restaurant.currencySymbol || '₹';
  const showFullFinancials = permissions.canViewFullReports;

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [report, setReport] = useState<RestoFlowReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await restoFlowApi.getReports(period);
      setReport(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate report.');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (isLoading || !report) {
    return (
      <div className="py-16 flex items-center justify-center gap-2.5 text-sm font-semibold text-[#64748B]">
        <Loader2 className="w-5 h-5 animate-spin text-[#EA580C]" />
        <span>Running live SQL analytics & report aggregation...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Reports & Revenue Analytics
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Live database reports for sales, product profitability, payment settlements, and inventory valuation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#E7E0D6] bg-white p-1">
            {(
              [
                { id: 'daily', label: 'Daily' },
                { id: 'weekly', label: 'Weekly (7d)' },
                { id: 'monthly', label: 'Monthly (30d)' }
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  period === p.id ? 'bg-[#EA580C] text-white' : 'text-[#475569] hover:text-[#1C1917]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white text-xs font-bold text-[#1C1917] hover:bg-[#FDFBF7]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => downloadRestoReportPdf(restaurant, report)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1C1917] text-white text-xs font-bold hover:bg-[#292524]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => downloadRestoReportExcel(restaurant, report)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10B981] text-white text-xs font-bold hover:bg-emerald-600"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Executive Summary Cards */}
      {showFullFinancials && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              {report.periodLabel} Revenue
            </div>
            <div className="text-2xl font-extrabold text-[#1C1917] mt-1">
              {sym}
              {report.summary.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              {report.summary.completedOrders} completed · {report.summary.cancelledOrders} cancelled
            </div>
          </div>

          <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Average Order Value
            </div>
            <div className="text-2xl font-extrabold text-[#EA580C] mt-1">
              {sym}
              {report.summary.avgOrderValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">
              Across {report.summary.totalOrders} total tickets
            </div>
          </div>

          <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              {restaurant.taxLabel} & Service Charge
            </div>
            <div className="text-2xl font-extrabold text-[#1C1917] mt-1">
              {sym}
              {(report.summary.totalTaxCollected + report.summary.totalServiceCharge).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">
              Discounts: {sym}
              {report.summary.totalDiscounts.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Inventory Value & Wastage
            </div>
            <div className="text-2xl font-extrabold text-[#1C1917] mt-1">
              {sym}
              {report.summary.totalStockValuation.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-red-600 font-semibold mt-0.5">
              Period wastage: {sym}
              {report.summary.wastageCost.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      {showFullFinancials && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-white border border-[#E7E0D6] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#EA580C]" />
                <h2 className="text-sm font-extrabold text-[#1C1917]">Revenue Trend</h2>
              </div>
              <span className="text-[11px] font-semibold text-[#64748B]">
                Live SQL Order Ledger
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.salesTimeline}>
                  <defs>
                    <linearGradient id="rfRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EA580C" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#EA580C" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE4" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(value: any) => [`${sym}${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#EA580C"
                    strokeWidth={2.5}
                    fill="url(#rfRevGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Method Settlement Breakdown */}
          <div className="bg-white border border-[#E7E0D6] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-extrabold text-[#1C1917]">Payment Settlements</h2>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.paymentBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE4" />
                  <XAxis dataKey="paymentMethod" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(value: any) => [`${sym}${Number(value).toLocaleString('en-IN')}`, 'Settled']}
                  />
                  <Bar dataKey="amount" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-[#EFEAE2]">
              {report.paymentBreakdown.map((p) => (
                <div key={p.paymentMethod} className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase text-[#1C1917]">
                    {p.paymentMethod} <span className="text-[#64748B] font-normal">({p.count})</span>
                  </span>
                  <span className="font-bold text-[#1C1917]">
                    {sym}
                    {p.amount.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-emerald-700">({p.sharePct}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Performance Table */}
      {showFullFinancials && (
        <div className="bg-white border border-[#E7E0D6] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EFEAE2] flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#1C1917]">
              Top Menu Product Performance & Estimated Profit
            </h2>
            <span className="text-[11px] font-semibold text-[#64748B]">
              {report.productPerformance.length} active dishes
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-[#EFEAE2] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="px-4 py-3">Dish Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Qty Sold</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">Recipe Cost / Plate</th>
                  <th className="px-4 py-3 text-right">Est. Gross Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE4] text-xs">
                {report.productPerformance.map((p) => (
                  <tr key={p.menuItemId} className="hover:bg-[#FDFBF7]">
                    <td className="px-4 py-3 font-bold text-[#1C1917]">{p.name}</td>
                    <td className="px-4 py-3 text-[#64748B]">{p.categoryName}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#1C1917]">{p.quantitySold}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#1C1917]">
                      {sym}
                      {p.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-[#64748B]">
                      {p.unitCost > 0 ? `${sym}${p.unitCost.toFixed(2)}` : 'Unmapped'}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-700">
                      {sym}
                      {p.estGrossProfit.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Inventory Valuation Report */}
      <div className="bg-white border border-[#E7E0D6] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EFEAE2] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#1C1917]">
              Inventory Valuation & Reorder Report
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Total Valuation: {sym}
              {report.summary.totalStockValuation.toLocaleString('en-IN')} · {report.summary.lowStockCount} low-stock SKU(s)
            </p>
          </div>
          <button
            onClick={() => downloadRestoReportExcel(restaurant, report)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Full Excel</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#EFEAE2] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Ingredient</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Stock On Hand</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3 text-right">Valuation</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1ECE4] text-xs">
              {report.inventoryReport.map((i) => (
                <tr key={i.id} className={i.status === 'low' ? 'bg-[#FFF7ED]/40' : ''}>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#64748B]">{i.sku}</td>
                  <td className="px-4 py-3 font-bold text-[#1C1917]">{i.name}</td>
                  <td className="px-4 py-3 text-[#475569]">{i.category}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#1C1917]">
                    {i.currentStock} {i.unit}
                  </td>
                  <td className="px-4 py-3 text-right text-[#64748B]">
                    {sym}
                    {i.unitCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#1C1917]">
                    {sym}
                    {i.stockValue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        i.status === 'low'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {i.status === 'low' ? 'Low Stock' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
