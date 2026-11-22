import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import heroDiningImg from '../../assets/images/restoflow_hero_dining_1795276336641.jpg';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  RestaurantSettings,
  RestoFlowDemoAccountInfo,
  RestoFlowRole,
  RestoFlowRolePermissions,
  RestoFlowUser
} from '../../types/restoflow';

interface RestoFlowLoginViewProps {
  initialRole?: RestoFlowRole;
  onLoginSuccess: (payload: {
    user: RestoFlowUser;
    permissions: RestoFlowRolePermissions;
    restaurant: RestaurantSettings;
  }) => void;
  onBackToLanding: () => void;
}

export const RestoFlowLoginView: React.FC<RestoFlowLoginViewProps> = ({
  initialRole,
  onLoginSuccess,
  onBackToLanding
}) => {
  const [accounts, setAccounts] = useState<RestoFlowDemoAccountInfo[]>([]);
  const [restaurantName, setRestaurantName] = useState('Saffron & Ember Kitchen');
  const [email, setEmail] = useState('owner@restoflow.demo');
  const [password, setPassword] = useState('DemoOwner@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RestoFlowRole>(initialRole || 'owner');
  const [isLoadingDemo, setIsLoadingDemo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    restoFlowApi
      .getDemoAccounts()
      .then((res) => {
        if (!active) return;
        setAccounts(res.data.accounts);
        setRestaurantName(res.data.restaurantName);
        const match =
          res.data.accounts.find((a) => a.role === (initialRole || 'owner')) || res.data.accounts[0];
        if (match) {
          setSelectedRole(match.role);
          setEmail(match.email);
          setPassword(match.demoPassword);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load demo accounts.');
      })
      .finally(() => {
        if (active) setIsLoadingDemo(false);
      });
    return () => {
      active = false;
    };
  }, [initialRole]);

  const handleSelectRole = (acc: RestoFlowDemoAccountInfo) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.demoPassword);
    setError(null);
  };

  const performLogin = async (targetEmail: string, targetPassword: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await restoFlowApi.login(targetEmail.trim(), targetPassword);
      onLoginSuccess({
        user: res.data.user,
        permissions: res.data.permissions,
        restaurant: res.data.restaurant
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E293B] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Hospitality Brand Panel */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-[#1C1917] text-white flex-col justify-between p-10 overflow-hidden">
        <img
          src={heroDiningImg}
          alt="Saffron and Ember Kitchen"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C1917]/90 via-[#1C1917]/80 to-[#1C1917]" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-lg leading-none">RestoFlow</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#FB923C] mt-1">
                {restaurantName}
              </div>
            </div>
          </div>
          <button
            onClick={onBackToLanding}
            className="text-xs font-semibold text-[#D6D3D1] hover:text-white inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
        </div>

        <div className="relative z-10 space-y-5">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            One Backend. Six Role-Specific Restaurant Interfaces.
          </h2>
          <p className="text-sm text-[#D6D3D1] leading-relaxed">
            Every sign-in authenticates against RestoFlow&apos;s salted password database and issues a
            role-scoped server session. Test Owner analytics, Cashier POS, Waiter floor maps, dark-mode
            Kitchen Display, and Inventory Costing using the verified demo accounts.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div className="text-xs font-bold text-[#10B981]">Real SQL Metrics</div>
              <div className="text-[11px] text-[#A8A29E] mt-1">
                Every sales total, table count &amp; food cost % is computed live from SQLite.
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div className="text-xs font-bold text-[#FB923C]">Isolated Demo Data</div>
              <div className="text-[11px] text-[#A8A29E] mt-1">
                Tagged sample records with one-click reset for client presentations.
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-[#A8A29E] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>Salted scrypt credentials · HttpOnly session cookies · Mobile-ready Bearer API</span>
        </div>
      </div>

      {/* Right Authentication & 6-Role Demo Picker */}
      <div className="lg:col-span-7 flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="max-w-xl w-full mx-auto space-y-7">
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1C1917] text-[#EA580C] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-[#1C1917]">RestoFlow</span>
            </div>
            <button
              onClick={onBackToLanding}
              className="text-xs font-semibold text-[#64748B] hover:text-[#1C1917] inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#EA580C]">
              Staff Portal Sign-In
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] mt-1">
              Sign in to {restaurantName}
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Enter your staff credentials below or pick a demo role to preview its dedicated workspace.
            </p>
          </div>

          {/* 6-Role Instant Demo Picker */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Client Presentation Demo Accounts</span>
              </span>
              <span className="text-[11px] font-mono text-[#64748B]">Click role to prefill</span>
            </div>

            {isLoadingDemo ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-20 rounded-xl bg-[#F1ECE4] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {accounts.map((acc) => {
                  const isActive = selectedRole === acc.role;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectRole(acc)}
                      className={`text-left rounded-xl p-3 border transition-all ${
                        isActive
                          ? 'bg-[#FFF7ED] border-[#EA580C] ring-1 ring-[#EA580C]'
                          : 'bg-white border-[#E7E0D6] hover:border-[#EA580C]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-[#1C1917] truncate">
                          {acc.label}
                        </span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-[#EA580C] shrink-0" />}
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate mt-0.5">{acc.fullName}</div>
                      <div className="text-[10px] font-mono text-[#94A3B8] truncate mt-1">{acc.email}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#E7E0D6] rounded-2xl p-6 shadow-xs space-y-4"
          >
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Staff Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@restoflow.demo"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] text-sm text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#EA580C]/25 focus:border-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#D6D3D1] bg-[#FDFBF7] text-sm font-mono text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#EA580C]/25 focus:border-[#EA580C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1C1917]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white font-bold text-sm py-3 px-5 rounded-lg shadow-xs transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
