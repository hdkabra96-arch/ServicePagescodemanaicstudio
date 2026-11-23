import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import type { EduManageDemoAccount } from '../../types/edumanage';

interface EduManageLoginViewProps {
  schoolName: string;
  boardAffiliation: string;
  demoAccounts: EduManageDemoAccount[];
  onLogin: (email: string, password: string) => Promise<void>;
  onBackToLanding: () => void;
}

export const EduManageLoginView: React.FC<EduManageLoginViewProps> = ({
  schoolName,
  boardAffiliation,
  demoAccounts,
  onLogin,
  onBackToLanding
}) => {
  const [email, setEmail] = useState('superadmin@edumanage.demo');
  const [password, setPassword] = useState('EduSuper@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('super_admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectDemoAccount = (acc: EduManageDemoAccount) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.demoPassword);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to sign in. Verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#102A43] flex flex-col">
      {/* Slim Header */}
      <header className="bg-white border-b border-[#DCEAF7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#486581] hover:text-[#1769AA] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to EduManage Overview</span>
          </button>
          <div className="text-xs text-[#486581] hidden sm:block">
            {schoolName} · {boardAffiliation}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Sign-In Form */}
          <div className="lg:col-span-5 bg-white border border-[#DCEAF7] rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#1769AA] text-white flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#102A43] leading-tight">
                    Sign in to EduManage
                  </h1>
                  <p className="text-xs text-[#627D98] mt-0.5">{schoolName}</p>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs font-medium flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="edu-email"
                    className="block text-xs font-semibold text-[#334E68] mb-1.5"
                  >
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#829AB1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="edu-email"
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@edumanage.demo"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#CBDCEB] bg-white text-sm text-[#102A43] focus:outline-none focus:border-[#1769AA] focus:ring-2 focus:ring-[#1769AA]/15"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edu-password"
                    className="block text-xs font-semibold text-[#334E68] mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#829AB1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="edu-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#CBDCEB] bg-white text-sm text-[#102A43] focus:outline-none focus:border-[#1769AA] focus:ring-2 focus:ring-[#1769AA]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#1769AA] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In to Workspace'}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-5 border-t border-[#E6F0FA] flex items-center gap-2 text-xs text-[#627D98]">
              <ShieldCheck className="w-4 h-4 text-[#16A085] shrink-0" />
              <span>Salted password verification &amp; HttpOnly server session protection</span>
            </div>
          </div>

          {/* Right: 8 Demo Accounts Selector */}
          <div className="lg:col-span-7 bg-white border border-[#DCEAF7] rounded-2xl p-6 sm:p-7 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#1769AA]">
                  Client Demonstration Accounts
                </div>
                <h2 className="text-lg font-bold text-[#102A43] mt-0.5">
                  Select a Role to Autofill Credentials
                </h2>
              </div>
              <UserCheck className="w-5 h-5 text-[#16A085] shrink-0 mt-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {demoAccounts.map((acc) => {
                const isSelected = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F0F7FE] border-[#1769AA]'
                        : 'bg-[#FAFDFE] border-[#DCEAF7] hover:border-[#5BB6F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#1769AA]">{acc.label}</span>
                      {isSelected && (
                        <span className="text-[11px] font-semibold text-[#16A085]">Selected</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-[#102A43] mt-0.5">
                      {acc.fullName}
                    </div>
                    <div className="text-[11px] text-[#486581] mt-1 line-clamp-1">
                      {acc.highlights}
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#E6F0FA] text-[11px] font-mono text-[#627D98] flex flex-wrap justify-between gap-1">
                      <span className="truncate">{acc.email}</span>
                      <span className="text-[#334E68]">{acc.demoPassword}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
