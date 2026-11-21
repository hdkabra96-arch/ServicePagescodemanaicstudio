import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { saasApi, setSaasAccessToken } from '../services/saasApi';
import type { SaasOrganization, SaasUser } from '../types/saas';

interface SaasAuthContextValue {
  user: SaasUser | null;
  organizations: SaasOrganization[];
  activeOrg: SaasOrganization | null;
  isLoadingSession: boolean;
  setActiveOrgId: (orgId: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    organizationName: string;
    industry?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUserLocal: (user: SaasUser) => void;
  setOrganizationsAndActive: (orgs: SaasOrganization[], selectOrgId?: string) => void;
}

const SaasAuthContext = createContext<SaasAuthContextValue | null>(null);

export const SaasAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SaasUser | null>(null);
  const [organizations, setOrganizations] = useState<SaasOrganization[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string>('');
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const syncOrgs = useCallback((orgs: SaasOrganization[], preferredOrgId?: string) => {
    setOrganizations(orgs);
    setActiveOrgIdState((prev) => {
      if (preferredOrgId && orgs.some((o) => o.id === preferredOrgId)) return preferredOrgId;
      if (prev && orgs.some((o) => o.id === prev)) return prev;
      return orgs[0]?.id || '';
    });
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await saasApi.getMe();
      setUser(res.user);
      syncOrgs(res.organizations);
    } catch {
      setUser(null);
      setOrganizations([]);
      setActiveOrgIdState('');
      setSaasAccessToken(null);
    } finally {
      setIsLoadingSession(false);
    }
  }, [syncOrgs]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await saasApi.login({ email, password });
      setSaasAccessToken(res.token);
      setUser(res.user);
      syncOrgs(res.organizations);
    },
    [syncOrgs]
  );

  const register = useCallback(
    async (payload: {
      fullName: string;
      email: string;
      password: string;
      organizationName: string;
      industry?: string;
    }) => {
      const res = await saasApi.register(payload);
      setSaasAccessToken(res.token);
      setUser(res.user);
      syncOrgs(res.organizations);
    },
    [syncOrgs]
  );

  const logout = useCallback(async () => {
    try {
      await saasApi.logout();
    } catch {
      // ignore session already expired
    } finally {
      setSaasAccessToken(null);
      setUser(null);
      setOrganizations([]);
      setActiveOrgIdState('');
    }
  }, []);

  const activeOrg = useMemo(
    () => organizations.find((o) => o.id === activeOrgId) || organizations[0] || null,
    [organizations, activeOrgId]
  );

  const value = useMemo<SaasAuthContextValue>(
    () => ({
      user,
      organizations,
      activeOrg,
      isLoadingSession,
      setActiveOrgId: setActiveOrgIdState,
      login,
      register,
      logout,
      refreshSession,
      updateUserLocal: setUser,
      setOrganizationsAndActive: syncOrgs
    }),
    [user, organizations, activeOrg, isLoadingSession, login, register, logout, refreshSession, syncOrgs]
  );

  return <SaasAuthContext.Provider value={value}>{children}</SaasAuthContext.Provider>;
};

export function useSaasAuth(): SaasAuthContextValue {
  const ctx = useContext(SaasAuthContext);
  if (!ctx) throw new Error('useSaasAuth must be used inside SaasAuthProvider');
  return ctx;
}
