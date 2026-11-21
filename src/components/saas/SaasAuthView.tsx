import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  User,
  AlertCircle,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { useSaasAuth } from '../../context/SaasAuthContext';
import { saasApi, SaasApiError } from '../../services/saasApi';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

interface SaasAuthViewProps {
  onBackToStudio: () => void;
}

const DEMO_ACCOUNTS = [
  {
    label: 'Workspace Admin',
    email: 'admin@codemaniac.studio',
    password: 'Admin@2026!',
    scope: 'Full RBAC, billing, analytics & member controls'
  },
  {
    label: 'Delivery Manager',
    email: 'manager@codemaniac.studio',
    password: 'Manager@2026!',
    scope: 'Projects, clients, team onboarding & reports'
  },
  {
    label: 'Team Member',
    email: 'member@codemaniac.studio',
    password: 'Member@2026!',
    scope: 'Assigned tasks, workspace overview & profile'
  }
];

export const SaasAuthView: React.FC<SaasAuthViewProps> = ({ onBackToStudio }) => {
  const { login, register } = useSaasAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [industry, setIndustry] = useState('Technology & SaaS');

  // Reset state
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [previewResetToken, setPreviewResetToken] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  // Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setErrorMessage(err instanceof SaasApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        organizationName: organizationName.trim(),
        industry
      });
    } catch (err) {
      setErrorMessage(err instanceof SaasApiError ? err.message : 'Unable to create workspace. Please verify your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setPreviewResetToken('');
    setIsSubmitting(true);
    try {
      const res = await saasApi.forgotPassword(email.trim());
      setSuccessMessage(res.message);
      if (res.previewResetToken) {
        setPreviewResetToken(res.previewResetToken);
        setResetToken(res.previewResetToken);
      }
    } catch (err) {
      setErrorMessage(err instanceof SaasApiError ? err.message : 'Failed to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const res = await saasApi.resetPassword({
        token: resetToken.trim(),
        newPassword
      });
      setSuccessMessage(res.message);
      setPassword('');
      setNewPassword('');
      setResetToken('');
      setPreviewResetToken('');
      setMode('login');
    } catch (err) {
      setErrorMessage(err instanceof SaasApiError ? err.message : 'Unable to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToken = () => {
    if (!previewResetToken) return;
    navigator.clipboard?.writeText(previewResetToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#102A43] flex flex-col lg:flex-row">
      {/* Left Architectural Brand Column */}
      <aside className="lg:w-[44%] xl:w-[42%] bg-gradient-to-br from-[#1769AA] via-[#1B7AC4] to-[#0F4C81] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#28C7FA]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#5BB6F5]/20 blur-3xl" />

        <div className="relative z-10">
          <button
            type="button"
            onClick={onBackToStudio}
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-100 hover:text-white transition-colors mb-10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Codemaniac Studio</span>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg">
              <Layers className="w-6 h-6 text-[#28C7FA]" />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight uppercase leading-none">Codemaniac Cloud</p>
              <p className="text-[11px] font-medium text-sky-200 tracking-widest uppercase mt-1">
                Commercial SaaS Workspace
              </p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Run multi-tenant client operations from one unified SaaS core.
          </h1>
          <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed max-w-md">
            Built by Codemaniac Studio with isolated workspaces, role-based access control, live analytics, and
            subscription quota management.
          </p>

          <div className="mt-8 space-y-3.5 text-sm">
            {[
              'Cryptographic sessions & per-workspace RBAC permissions',
              'Live revenue, project pipeline, and utilization analytics',
              'Dedicated multi-tenant workspaces with plan usage limits'
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sky-50">
                <CheckCircle2 className="w-4 h-4 text-[#28C7FA] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Seeded Role Quick-Fill Box for Real End-to-End Demonstrations */}
        <div className="relative z-10 mt-10 pt-6 border-t border-white/15">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-200 mb-3">
            Seeded Demo Workspaces (Real Database Auth)
          </p>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                type="button"
                onClick={() => {
                  switchMode('login');
                  setEmail(acct.email);
                  setPassword(acct.password);
                }}
                className="text-left px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/18 border border-white/15 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{acct.label}</span>
                    <span className="text-[11px] text-sky-200 truncate">{acct.email}</span>
                  </div>
                  <p className="text-[11px] text-sky-100/75 truncate mt-0.5">{acct.scope}</p>
                </div>
                <span className="text-[11px] font-semibold text-[#28C7FA] shrink-0">Fill</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Authentication Form Panel */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-[#D6E9FA] shadow-xl shadow-sky-900/5 p-7 sm:p-9">
          {/* Mode Switch Tabs */}
          {(mode === 'login' || mode === 'register') && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F0F7FF] border border-[#D9ECFA] mb-7">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#1769AA] shadow-xs'
                    : 'text-[#486581] hover:text-[#102A43]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-[#1769AA] shadow-xs'
                    : 'text-[#486581] hover:text-[#102A43]'
                }`}
              >
                Create Workspace
              </button>
            </div>
          )}

          {/* Header Copy */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Launch your workspace'}
              {mode === 'forgot' && 'Reset your password'}
              {mode === 'reset' && 'Set a new password'}
            </h2>
            <p className="text-sm text-[#486581] mt-1">
              {mode === 'login' && 'Sign in with your workspace credentials to access live operations.'}
              {mode === 'register' && 'Create a new isolated tenant workspace with admin permissions.'}
              {mode === 'forgot' && 'Enter your email to generate a single-use password reset token.'}
              {mode === 'reset' && 'Paste your reset token and choose a strong new password.'}
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
              {previewResetToken && (
                <div className="mt-2 p-2.5 rounded-lg bg-white border border-emerald-200">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-[#102A43]">Generated Reset Token (Preview)</span>
                    <button
                      type="button"
                      onClick={copyToken}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1769AA] hover:underline cursor-pointer"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <code className="block text-[11px] font-mono break-all text-[#334E68]">{previewResetToken}</code>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="mt-2 w-full py-1.5 rounded-lg bg-[#1769AA] text-white text-xs font-semibold hover:bg-[#12558C] transition-colors cursor-pointer"
                  >
                    Continue to Set New Password
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#334E68]">Password</label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs font-semibold text-[#1769AA] hover:text-[#5BB6F5] cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#102A43] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#1769AA] hover:bg-[#135A94] disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-[#1769AA]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isSubmitting ? 'Signing in...' : 'Sign In to Workspace'}</span>
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Deshmukh"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1.5">Workspace / Company Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. NovaTech Digital"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1.5">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
                >
                  <option>Technology & SaaS</option>
                  <option>FinTech & Financial Services</option>
                  <option>Healthcare & Diagnostics</option>
                  <option>E-commerce & Retail</option>
                  <option>Logistics & Supply Chain</option>
                  <option>Education & EdTech</option>
                  <option>Digital Agency & Consulting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1.5">Password (min 8 chars, letters + numbers)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#102A43] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#1769AA] hover:bg-[#135A94] disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-[#1769AA]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{isSubmitting ? 'Provisioning workspace...' : 'Create Workspace Account'}</span>
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#1769AA] hover:bg-[#135A94] disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>{isSubmitting ? 'Generating token...' : 'Request Reset Token'}</span>
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-[#486581] hover:text-[#102A43] cursor-pointer"
                >
                  Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="font-semibold text-[#1769AA] hover:underline cursor-pointer"
                >
                  I already have a token
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1.5">Reset Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste your 64-character token"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-mono text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 chars with letters & numbers"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#102A43] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#1769AA] hover:bg-[#135A94] disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isSubmitting ? 'Updating password...' : 'Confirm Password Reset'}</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-center text-xs font-semibold text-[#486581] hover:text-[#102A43] pt-1 cursor-pointer"
              >
                Return to Sign In
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
