import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Receipt,
  RotateCcw,
  Save,
  ShieldAlert
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  RestaurantSettings,
  RestoFlowRolePermissions,
  RestoFlowUser
} from '../../types/restoflow';

interface RestoFlowSettingsViewProps {
  user: RestoFlowUser;
  permissions: RestoFlowRolePermissions;
  restaurant: RestaurantSettings;
  onRestaurantUpdated: (updated: RestaurantSettings) => void;
  onDemoResetCompleted: (restored: RestaurantSettings) => void;
}

export const RestoFlowSettingsView: React.FC<RestoFlowSettingsViewProps> = ({
  user,
  permissions,
  restaurant,
  onRestaurantUpdated,
  onDemoResetCompleted
}) => {
  const [form, setForm] = useState<RestaurantSettings>(restaurant);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Inline confirmation state for Demo Reset (no window.confirm)
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    setForm(restaurant);
  }, [restaurant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canManageSettings) return;
    setError(null);
    setSaveMessage(null);
    setIsSaving(true);
    try {
      const res = await restoFlowApi.updateSettings({
        name: form.name,
        tagline: form.tagline,
        logoUrl: form.logoUrl,
        address: form.address,
        city: form.city,
        phone: form.phone,
        email: form.email,
        gstin: form.gstin,
        currencyCode: form.currencyCode,
        currencySymbol: form.currencySymbol,
        taxLabel: form.taxLabel,
        taxRatePct: Number(form.taxRatePct),
        serviceChargePct: Number(form.serviceChargePct),
        receiptHeader: form.receiptHeader,
        receiptFooter: form.receiptFooter,
        loyaltyPointsPer100: Number(form.loyaltyPointsPer100)
      });
      onRestaurantUpdated(res.data);
      setSaveMessage('Restaurant profile, tax configuration, and receipt layout saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemo = async () => {
    setError(null);
    setResetMessage(null);
    setIsResetting(true);
    try {
      const res = await restoFlowApi.resetDemoData();
      setConfirmingReset(false);
      onDemoResetCompleted(res.data.restaurant);
      setResetMessage(
        `Demo database restored cleanly (${res.data.restoredCounts.menuItems} dishes, ${res.data.restoredCounts.tables} tables, ${res.data.restoredCounts.orders} orders).`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo reset failed.');
    } finally {
      setIsResetting(false);
    }
  };

  const sampleSubtotal = 1200;
  const sampleTax = (sampleSubtotal * Number(form.taxRatePct || 0)) / 100;
  const sampleService = (sampleSubtotal * Number(form.serviceChargePct || 0)) / 100;
  const sampleGrand = sampleSubtotal + sampleTax + sampleService;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
          Module 12 · Configuration &amp; Demo Controls
        </div>
        <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight mt-0.5">
          Restaurant Settings &amp; Receipt Configuration
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Manage store identity, GST/tax percentages, loyalty accrual rules, and thermal receipt layout.
        </p>
      </div>

      {!permissions.canManageSettings && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Read-Only Access ({user.role.replace('_', ' ')}):</span> Only the{' '}
            <span className="font-bold">Restaurant Owner</span> role can modify tax rates, GSTIN, or
            store details.
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-3.5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Settings Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-8 bg-white border border-[#E7E0D6] rounded-xl p-6 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#334155] mb-1">Restaurant Name</label>
              <input
                type="text"
                disabled={!permissions.canManageSettings}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm text-[#1E293B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#334155] mb-1">Tagline</label>
              <input
                type="text"
                disabled={!permissions.canManageSettings}
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm text-[#1E293B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">Contact Phone</label>
              <input
                type="text"
                disabled={!permissions.canManageSettings}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm text-[#1E293B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">Contact Email</label>
              <input
                type="email"
                disabled={!permissions.canManageSettings}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm text-[#1E293B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#334155] mb-1">Street Address</label>
              <input
                type="text"
                disabled={!permissions.canManageSettings}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm text-[#1E293B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">City &amp; Postal Code</label>
              <input
                type="text"
                disabled={!permissions.canManageSettings}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm text-[#1E293B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">Tax ID / GSTIN</label>
              <input
                type="text"
                disabled={!permissions.canManageSettings}
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm font-mono text-[#1E293B]"
              />
            </div>
          </div>

          {/* Tax & Billing Rules */}
          <div className="pt-5 border-t border-[#EFEAE2] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">Tax Label</label>
              <input
                type="text"
                disabled={!permissions.canManageSettings}
                value={form.taxLabel}
                onChange={(e) => setForm({ ...form, taxLabel: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                disabled={!permissions.canManageSettings}
                value={form.taxRatePct}
                onChange={(e) => setForm({ ...form, taxRatePct: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">Service Chg (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="30"
                disabled={!permissions.canManageSettings}
                value={form.serviceChargePct}
                onChange={(e) => setForm({ ...form, serviceChargePct: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">Loyalty / 100</label>
              <input
                type="number"
                min="0"
                max="100"
                disabled={!permissions.canManageSettings}
                value={form.loyaltyPointsPer100}
                onChange={(e) => setForm({ ...form, loyaltyPointsPer100: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm font-mono"
              />
            </div>
          </div>

          {/* Receipt Copy */}
          <div className="pt-5 border-t border-[#EFEAE2] space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">Receipt Header Title</label>
              <input
                type="text"
                disabled={!permissions.canManageSettings}
                value={form.receiptHeader}
                onChange={(e) => setForm({ ...form, receiptHeader: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">Receipt Footer Message</label>
              <textarea
                rows={2}
                disabled={!permissions.canManageSettings}
                value={form.receiptFooter}
                onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] disabled:opacity-60 text-sm"
              />
            </div>
          </div>

          {permissions.canManageSettings && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Restaurant Settings</span>
              </button>
            </div>
          )}
        </form>

        {/* Right Column: Live Thermal Receipt Preview + Demo Reset Card */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-[#E7E0D6] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Live Thermal Receipt Preview
              </span>
              <Receipt className="w-4 h-4 text-[#EA580C]" />
            </div>

            <div className="bg-[#FDFBF7] border border-dashed border-[#CBD5E1] rounded-lg p-4 font-mono text-[11px] text-[#1C1917] space-y-2">
              <div className="text-center border-b border-dashed border-[#CBD5E1] pb-2.5">
                <div className="font-bold text-xs uppercase">{form.name}</div>
                <div className="text-[10px] text-[#64748B]">{form.address}</div>
                <div className="text-[10px] text-[#64748B]">{form.city}</div>
                {form.gstin && <div className="text-[10px] mt-0.5">GSTIN: {form.gstin}</div>}
                {form.receiptHeader && (
                  <div className="text-[10px] font-bold text-[#EA580C] mt-1">{form.receiptHeader}</div>
                )}
              </div>

              <div className="space-y-1 border-b border-dashed border-[#CBD5E1] pb-2">
                <div className="flex justify-between">
                  <span>1x Velvet Butter Chicken</span>
                  <span>{form.currencySymbol}560</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Tandoori Prawns</span>
                  <span>{form.currencySymbol}640</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[#64748B]">
                  <span>Subtotal</span>
                  <span>{form.currencySymbol}{sampleSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>{form.taxLabel} ({form.taxRatePct}%)</span>
                  <span>{form.currencySymbol}{sampleTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Service ({form.serviceChargePct}%)</span>
                  <span>{form.currencySymbol}{sampleService.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-dashed border-[#CBD5E1]">
                  <span>GRAND TOTAL</span>
                  <span>{form.currencySymbol}{sampleGrand.toFixed(2)}</span>
                </div>
              </div>

              {form.receiptFooter && (
                <div className="text-center text-[10px] text-[#64748B] pt-2 border-t border-dashed border-[#CBD5E1]">
                  {form.receiptFooter}
                </div>
              )}
            </div>
          </div>

          {/* Isolated Demo Data Reset */}
          {permissions.canResetDemo && (
            <div className="bg-[#1C1917] text-white rounded-xl p-5 space-y-3 border border-[#3F3A36]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FB923C]">
                <ShieldAlert className="w-4 h-4" />
                <span>Client Presentation Demo Reset</span>
              </div>
              <p className="text-xs text-[#D6D3D1] leading-relaxed">
                Restore the isolated <span className="font-semibold text-white">Saffron &amp; Ember Kitchen</span>{' '}
                showcase dataset (16 dishes, 12 tables, live kitchen orders, recipes, and stock levels)
                before your next client demo.
              </p>

              {resetMessage && (
                <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs rounded-lg p-2.5">
                  {resetMessage}
                </div>
              )}

              {!confirmingReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmingReset(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Database</span>
                </button>
              ) : (
                <div className="bg-[#292524] border border-[#EA580C]/60 rounded-lg p-3 space-y-2.5">
                  <p className="text-[11px] text-[#FDE68A] font-medium">
                    Confirm reset? Custom orders and edits made during this demo session will be replaced
                    with fresh showcase records.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={() => setConfirmingReset(false)}
                      className="py-2 px-3 rounded-lg bg-[#3F3A36] hover:bg-[#57534E] text-white text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={handleResetDemo}
                      className="py-2 px-3 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Confirm Reset</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
