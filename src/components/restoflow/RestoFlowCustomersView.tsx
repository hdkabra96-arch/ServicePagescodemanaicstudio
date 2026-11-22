import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Edit3,
  Eye,
  Loader2,
  MessageSquarePlus,
  Phone,
  Plus,
  Search,
  Star,
  X
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  CustomerDetailRecord,
  CustomerRecord,
  RestaurantSettings,
  RestoFlowRolePermissions
} from '../../types/restoflow';

interface RestoFlowCustomersViewProps {
  restaurant: RestaurantSettings;
  permissions: RestoFlowRolePermissions;
}

export const RestoFlowCustomersView: React.FC<RestoFlowCustomersViewProps> = ({
  restaurant,
  permissions
}) => {
  const sym = restaurant.currencySymbol || '₹';
  const canEdit = permissions.canManageCustomers;
  const canAdjustLoyalty = permissions.canUsePos;

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit Guest Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  // Profile / History / Loyalty / Feedback Detail Modal
  const [detail, setDetail] = useState<CustomerDetailRecord | null>(null);
  const [loyaltyAction, setLoyaltyAction] = useState<'award' | 'redeem'>('award');
  const [loyaltyPoints, setLoyaltyPoints] = useState('50');
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState('');

  const loadCustomers = useCallback(async () => {
    try {
      const res = await restoFlowApi.getCustomers(search);
      setCustomers(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load customers.');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const stats = useMemo(() => {
    const totalGuests = customers.length;
    const totalLoyalty = customers.reduce((s, c) => s + c.loyaltyPoints, 0);
    const totalSpend = customers.reduce((s, c) => s + c.totalSpent, 0);
    const rated = customers.filter((c) => c.avgRating !== null && c.avgRating !== undefined);
    const avgRating =
      rated.length > 0
        ? Math.round((rated.reduce((s, c) => s + Number(c.avgRating || 0), 0) / rated.length) * 10) / 10
        : 0;
    return { totalGuests, totalLoyalty, totalSpend, avgRating };
  }, [customers]);

  const openDetail = async (id: string) => {
    setIsBusy(true);
    try {
      const res = await restoFlowApi.getCustomerDetail(id);
      setDetail(res.data);
      setFbRating(5);
      setFbComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load guest profile.');
    } finally {
      setIsBusy(false);
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm({ fullName: '', phone: '', email: '', address: '', notes: '' });
    setShowFormModal(true);
  };

  const openEditModal = (c: CustomerRecord) => {
    setEditingCustomer(c);
    setForm({
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      address: c.address,
      notes: c.notes
    });
    setShowFormModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setError(null);
    try {
      if (editingCustomer) {
        await restoFlowApi.updateCustomer(editingCustomer.id, form);
        setFeedback(`Updated guest profile for ${form.fullName}.`);
      } else {
        await restoFlowApi.createCustomer(form);
        setFeedback(`Added guest "${form.fullName}" to CRM.`);
      }
      setShowFormModal(false);
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save customer.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleAdjustLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.adjustCustomerLoyalty(detail.id, {
        action: loyaltyAction,
        points: parseInt(loyaltyPoints, 10) || 0
      });
      setFeedback(res.message || 'Loyalty points updated.');
      await openDetail(detail.id);
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to adjust loyalty points.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !fbComment.trim()) return;
    setIsBusy(true);
    setError(null);
    try {
      await restoFlowApi.addCustomerFeedback(detail.id, {
        rating: fbRating,
        comment: fbComment.trim()
      });
      setFeedback('Guest feedback recorded.');
      setFbComment('');
      await openDetail(detail.id);
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record feedback.');
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center gap-2.5 text-sm font-semibold text-[#64748B]">
        <Loader2 className="w-5 h-5 animate-spin text-[#EA580C]" />
        <span>Loading customer CRM & loyalty ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Customer Directory & Loyalty CRM
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Guest profiles, dining spend history, feedback ratings, and loyalty point rewards ({restaurant.loyaltyPointsPer100} pts per {sym}100).
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest Profile</span>
          </button>
        )}
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

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Registered Guests
          </div>
          <div className="text-2xl font-extrabold text-[#1C1917] mt-1">{stats.totalGuests}</div>
        </div>
        <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Lifetime Guest Spend
          </div>
          <div className="text-2xl font-extrabold text-[#1C1917] mt-1">
            {sym}
            {stats.totalSpend.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Active Loyalty Points
          </div>
          <div className="text-2xl font-extrabold text-[#EA580C] mt-1">
            {stats.totalLoyalty.toLocaleString('en-IN')} pts
          </div>
        </div>
        <div className="bg-white border border-[#E7E0D6] rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Average Guest Rating
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 flex items-center gap-1.5">
            <span>{stats.avgRating ? `${stats.avgRating} / 5` : '—'}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guest by name, phone, or email..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E7E0D6] bg-white text-xs font-medium focus:outline-none focus:border-[#EA580C]"
        />
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white border border-[#E7E0D6] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#EFEAE2] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Visits</th>
                <th className="px-4 py-3 text-right">Total Spend</th>
                <th className="px-4 py-3 text-right">Loyalty Points</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1ECE4] text-xs">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FDFBF7]">
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#1C1917]">{c.fullName}</div>
                    {c.notes && <div className="text-[11px] text-[#64748B] truncate max-w-[220px]">{c.notes}</div>}
                  </td>
                  <td className="px-4 py-3 text-[#475569]">
                    <div className="flex items-center gap-1 font-medium">
                      <Phone className="w-3 h-3 text-[#94A3B8]" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && <div className="text-[11px] text-[#64748B]">{c.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#1C1917]">{c.totalVisits}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#1C1917]">
                    {sym}
                    {c.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] font-extrabold text-[11px]">
                      <Award className="w-3 h-3" />
                      <span>{c.loyaltyPoints} pts</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.avgRating ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[#1C1917]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{c.avgRating}</span>
                      </span>
                    ) : (
                      <span className="text-[#94A3B8]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openDetail(c.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1C1917] text-white text-[11px] font-bold hover:bg-[#292524]"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Profile</span>
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg border border-[#E7E0D6] text-[#475569] hover:text-[#1C1917]"
                          title="Edit Guest"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT GUEST MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCustomer}
            className="bg-white rounded-2xl border border-[#E7E0D6] max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#1C1917]">
                {editingCustomer ? `Edit ${editingCustomer.fullName}` : 'Add Guest Profile'}
              </h2>
              <button type="button" onClick={() => setShowFormModal(false)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Full Name *</span>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Phone Number *</span>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  placeholder="+91 98490 XXXXX"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Address</span>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Dining Preferences / Notes</span>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  placeholder="Allergies, favorite booth, spice preference..."
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 rounded-lg border border-[#E7E0D6] text-xs font-bold text-[#475569]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
              >
                {isBusy ? 'Saving...' : 'Save Guest'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GUEST PROFILE DETAIL MODAL (ORDER HISTORY + LOYALTY + FEEDBACK) */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7E0D6] max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#1C1917]">{detail.fullName}</h2>
                <p className="text-xs text-[#64748B]">
                  {detail.phone} {detail.email ? `· ${detail.email}` : ''}
                </p>
              </div>
              <button onClick={() => setDetail(null)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#FDFBF7] border border-[#EFEAE2] rounded-xl p-4 text-center">
              <div>
                <div className="text-[10px] font-bold uppercase text-[#64748B]">Visits</div>
                <div className="text-lg font-extrabold text-[#1C1917]">{detail.totalVisits}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-[#64748B]">Total Spent</div>
                <div className="text-lg font-extrabold text-[#1C1917]">
                  {sym}
                  {detail.totalSpent.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-[#64748B]">Loyalty Balance</div>
                <div className="text-lg font-extrabold text-[#EA580C]">{detail.loyaltyPoints} pts</div>
              </div>
            </div>

            {/* Loyalty Adjustment Box */}
            {canAdjustLoyalty && (
              <form
                onSubmit={handleAdjustLoyalty}
                className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4 flex flex-wrap items-end gap-3"
              >
                <div className="text-xs font-extrabold text-[#9A3412] w-full flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#EA580C]" />
                  <span>Loyalty Points Award / Redemption</span>
                </div>
                <select
                  value={loyaltyAction}
                  onChange={(e) => setLoyaltyAction(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-[#FED7AA] bg-white text-xs font-bold"
                >
                  <option value="award">Award Bonus Points</option>
                  <option value="redeem">Redeem Points</option>
                </select>
                <input
                  type="number"
                  min="1"
                  required
                  value={loyaltyPoints}
                  onChange={(e) => setLoyaltyPoints(e.target.value)}
                  className="w-28 px-3 py-2 rounded-lg border border-[#FED7AA] bg-white text-xs font-bold"
                />
                <button
                  type="submit"
                  disabled={isBusy}
                  className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
                >
                  Apply Points
                </button>
              </form>
            )}

            {/* Order History */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Recent Order History ({detail.orders.length})
              </h3>
              {detail.orders.length === 0 ? (
                <p className="text-xs text-[#64748B] bg-[#FDFBF7] p-3 rounded-xl">
                  No orders linked to this guest yet.
                </p>
              ) : (
                <div className="border border-[#EFEAE2] rounded-xl divide-y divide-[#F1ECE4]">
                  {detail.orders.map((o) => (
                    <div key={o.id} className="px-3.5 py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-[#1C1917]">{o.orderNumber}</span>
                        <span className="ml-2 text-[11px] text-[#64748B] uppercase">
                          {o.orderType.replace('_', ' ')} · {o.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#1C1917]">
                          {sym}
                          {o.grandTotal.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-[#64748B]">
                          {new Date(o.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Guest Feedback & New Rating Form */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Guest Feedback ({detail.feedback.length})
              </h3>
              <div className="space-y-2">
                {detail.feedback.map((f) => (
                  <div key={f.id} className="bg-[#FDFBF7] border border-[#EFEAE2] rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#64748B]">
                        {new Date(f.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[#1C1917] mt-1.5">{f.comment}</p>
                  </div>
                ))}
              </div>

              {canEdit && (
                <form
                  onSubmit={handleAddFeedback}
                  className="border border-[#E7E0D6] rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                      <MessageSquarePlus className="w-4 h-4 text-[#EA580C]" />
                      <span>Log Guest Feedback</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFbRating(star)}
                          className="p-0.5"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= fbRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      required
                      value={fbComment}
                      onChange={(e) => setFbComment(e.target.value)}
                      placeholder="Write guest dining comment or service feedback..."
                      className="flex-1 px-3 py-2 rounded-lg border border-[#E7E0D6] text-xs"
                    />
                    <button
                      type="submit"
                      disabled={isBusy}
                      className="px-3.5 py-2 rounded-lg bg-[#1C1917] text-white text-xs font-bold hover:bg-[#292524]"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
