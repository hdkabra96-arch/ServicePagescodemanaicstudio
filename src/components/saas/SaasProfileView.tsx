import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  KeyRound,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import { useSaasAuth } from '../../context/SaasAuthContext';
import { saasApi, SaasApiError } from '../../services/saasApi';
import type { SaasMember, SaasRole } from '../../types/saas';

interface SaasProfileViewProps {
  section: 'profile' | 'team';
}

export const SaasProfileView: React.FC<SaasProfileViewProps> = ({ section }) => {
  const { user, activeOrg, organizations, setActiveOrgId, updateUserLocal, setOrganizationsAndActive, refreshSession } =
    useSaasAuth();

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata');
  const [emailNotifications, setEmailNotifications] = useState(Boolean(user?.emailNotifications));
  const [weeklyDigest, setWeeklyDigest] = useState(Boolean(user?.weeklyDigest));
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Team & Members state
  const [members, setMembers] = useState<SaasMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [teamMsg, setTeamMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteJobTitle, setInviteJobTitle] = useState('');
  const [inviteRole, setInviteRole] = useState<SaasRole>('member');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviting, setInviting] = useState(false);

  // Create new tenant workspace
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgIndustry, setNewOrgIndustry] = useState('Technology & SaaS');
  const [newOrgWebsite, setNewOrgWebsite] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Edit active workspace settings (Admin)
  const [editOrgName, setEditOrgName] = useState(activeOrg?.name || '');
  const [editOrgIndustry, setEditOrgIndustry] = useState(activeOrg?.industry || '');
  const [editOrgWebsite, setEditOrgWebsite] = useState(activeOrg?.website || '');
  const [editOrgBillingEmail, setEditOrgBillingEmail] = useState(activeOrg?.billingEmail || '');
  const [savingOrgSettings, setSavingOrgSettings] = useState(false);

  useEffect(() => {
    if (!activeOrg) return;
    setEditOrgName(activeOrg.name);
    setEditOrgIndustry(activeOrg.industry);
    setEditOrgWebsite(activeOrg.website || '');
    setEditOrgBillingEmail(activeOrg.billingEmail || '');
  }, [activeOrg]);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setJobTitle(user.jobTitle);
    setPhone(user.phone);
    setTimezone(user.timezone);
    setEmailNotifications(user.emailNotifications);
    setWeeklyDigest(user.weeklyDigest);
  }, [user]);

  const loadMembers = useCallback(async () => {
    if (!activeOrg) return;
    setMembersLoading(true);
    try {
      const res = await saasApi.getMembers(activeOrg.id);
      setMembers(res.data);
    } catch (err) {
      setTeamMsg({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Unable to load workspace members.'
      });
    } finally {
      setMembersLoading(false);
    }
  }, [activeOrg]);

  useEffect(() => {
    if (section === 'team') {
      loadMembers();
    }
  }, [section, loadMembers]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await saasApi.updateProfile({
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        phone: phone.trim(),
        timezone,
        emailNotifications,
        weeklyDigest
      });
      updateUserLocal(res.user);
      setProfileMsg({ type: 'success', text: 'Profile and notification preferences saved.' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Unable to update profile.'
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      const res = await saasApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMsg({ type: 'success', text: res.message });
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Unable to update password.'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setInviting(true);
    setTeamMsg(null);
    try {
      const res = await saasApi.inviteMember(activeOrg.id, {
        fullName: inviteName.trim(),
        email: inviteEmail.trim(),
        jobTitle: inviteJobTitle.trim() || 'Team Member',
        role: inviteRole,
        temporaryPassword: invitePassword.trim() || undefined
      });
      setInviteName('');
      setInviteEmail('');
      setInviteJobTitle('');
      setInvitePassword('');
      setTeamMsg({ type: 'success', text: res.message });
      await loadMembers();
      await refreshSession();
    } catch (err) {
      setTeamMsg({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Failed to add member.'
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: SaasRole) => {
    if (!activeOrg) return;
    setTeamMsg(null);
    try {
      const res = await saasApi.updateMemberRole(activeOrg.id, memberId, role);
      setTeamMsg({ type: 'success', text: res.message });
      await loadMembers();
      await refreshSession();
    } catch (err) {
      setTeamMsg({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Could not update role.'
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeOrg) return;
    setTeamMsg(null);
    try {
      const res = await saasApi.removeMember(activeOrg.id, memberId);
      setTeamMsg({ type: 'success', text: res.message });
      await loadMembers();
      await refreshSession();
    } catch (err) {
      setTeamMsg({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Could not remove member.'
      });
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOrg(true);
    setTeamMsg(null);
    try {
      const res = await saasApi.createOrganization({
        name: newOrgName.trim(),
        industry: newOrgIndustry,
        website: newOrgWebsite.trim()
      });
      setOrganizationsAndActive(res.organizations, res.data.id);
      setNewOrgName('');
      setNewOrgWebsite('');
      setTeamMsg({ type: 'success', text: `Workspace "${res.data.name}" created and selected.` });
    } catch (err) {
      setTeamMsg({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Could not create workspace.'
      });
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleSaveOrgSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setSavingOrgSettings(true);
    setTeamMsg(null);
    try {
      const res = await saasApi.updateOrganization(activeOrg.id, {
        name: editOrgName.trim(),
        industry: editOrgIndustry.trim(),
        website: editOrgWebsite.trim(),
        billingEmail: editOrgBillingEmail.trim()
      });
      setOrganizationsAndActive(res.organizations, activeOrg.id);
      setTeamMsg({ type: 'success', text: res.message });
    } catch (err) {
      setTeamMsg({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Unable to save workspace settings.'
      });
    } finally {
      setSavingOrgSettings(false);
    }
  };

  if (!user || !activeOrg) return null;

  const currentRole = activeOrg.memberRole || 'member';
  const canInvite = currentRole === 'admin' || currentRole === 'manager';
  const isAdmin = currentRole === 'admin';

  if (section === 'profile') {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">Account & Security</p>
          <h1 className="text-2xl font-extrabold text-[#102A43] mt-0.5">User Profile & Preferences</h1>
          <p className="text-sm text-[#486581] mt-1">
            Manage your identity, notification settings, and account security credentials.
          </p>
        </div>

        {/* Profile Form Card */}
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs space-y-5"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-[#E6F2FC]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1769AA] to-[#5BB6F5] text-white font-extrabold flex items-center justify-center text-base">
              {user.avatarInitials}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#102A43]">{user.fullName}</h2>
              <p className="text-xs text-[#627D98]">{user.email}</p>
            </div>
          </div>

          {profileMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#334E68] mb-1.5">Full Name</label>
              <input
                type="text"
                required
                minLength={2}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334E68] mb-1.5">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334E68] mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334E68] mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <label className="flex items-center gap-3 text-sm text-[#334E68] cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 rounded accent-[#1769AA]"
              />
              <span>Receive instant workspace alerts for billing, tasks, and security events</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-[#334E68] cursor-pointer">
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="w-4 h-4 rounded accent-[#1769AA]"
              />
              <span>Receive weekly executive summary digest</span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1769AA] hover:bg-[#12558C] disabled:opacity-60 text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>

        {/* Password Change Card */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E6F2FC]">
            <KeyRound className="w-5 h-5 text-[#1769AA]" />
            <div>
              <h2 className="text-base font-extrabold text-[#102A43]">Update Password</h2>
              <p className="text-xs text-[#627D98]">Changing your password automatically revokes all other active sessions.</p>
            </div>
          </div>

          {passwordMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#334E68] mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334E68] mb-1.5">
                New Password (min 8 chars, letters + numbers)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#1E3A56] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
            >
              {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{passwordSaving ? 'Updating...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // TEAM & MULTI-TENANT WORKSPACES VIEW
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">Multi-Tenant & Access Control</p>
        <h1 className="text-2xl font-extrabold text-[#102A43] mt-0.5">Workspaces & Team RBAC</h1>
        <p className="text-sm text-[#486581] mt-1">
          Manage tenant workspaces, enforce role-based access control, and onboard team seats for{' '}
          <span className="font-semibold text-[#102A43]">{activeOrg.name}</span>.
        </p>
      </div>

      {teamMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            teamMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {teamMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{teamMsg.text}</span>
        </div>
      )}

      {/* Workspace Roster & Add Tenant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8ECFB] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E6F2FC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1769AA]" />
              <h2 className="text-base font-extrabold text-[#102A43]">Workspace Members ({members.length})</h2>
            </div>
            <span className="text-xs font-bold text-[#1769AA] tabular-nums">
              Seats: {activeOrg.usage?.members ?? members.length} / {activeOrg.limits?.maxMembers ?? 5}
            </span>
          </div>

          {membersLoading ? (
            <div className="p-8 text-center text-xs text-[#627D98]">Loading workspace members...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5FAFF] text-[11px] font-bold uppercase tracking-wider text-[#627D98] border-b border-[#E6F2FC]">
                    <th className="py-3 px-6">Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF6FD] text-sm">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F9FCFF]">
                      <td className="py-3.5 px-6">
                        <p className="font-bold text-[#102A43]">{m.fullName}</p>
                        <p className="text-xs text-[#627D98]">{m.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {isAdmin && m.userId !== activeOrg.ownerId ? (
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.id, e.target.value as SaasRole)}
                            className="px-2.5 py-1 rounded-lg border border-[#CBE2F6] bg-white text-xs font-bold text-[#102A43]"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="member">Member</option>
                          </select>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#EBF6FF] text-[#1769AA] text-xs font-bold uppercase">
                            <UserCheck className="w-3 h-3" />
                            {m.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#486581]">{m.jobTitle}</td>
                      <td className="py-3.5 px-6 text-right">
                        {isAdmin && m.userId !== activeOrg.ownerId ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-[#627D98]">
                            {m.userId === activeOrg.ownerId ? 'Owner' : 'Protected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invite Member Form (Admin & Manager) */}
        <div className="bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-[#1769AA]" />
            <h2 className="text-base font-extrabold text-[#102A43]">Add Team Member</h2>
          </div>

          {canInvite ? (
            <form onSubmit={handleInviteMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Kabir Mehta"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="kabir@company.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1">Job Title</label>
                <input
                  type="text"
                  value={inviteJobTitle}
                  onChange={(e) => setInviteJobTitle(e.target.value)}
                  placeholder="Product Engineer"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1">RBAC Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as SaasRole)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                >
                  <option value="member">Member (Tasks & Overview)</option>
                  <option value="manager">Manager (Projects, Clients & Team)</option>
                  {isAdmin && <option value="admin">Admin (Full Control)</option>}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1">Initial Password (for new account)</label>
                <input
                  type="text"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Default: Welcome@2026!"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={inviting}
                className="w-full py-2.5 rounded-xl bg-[#1769AA] hover:bg-[#12558C] disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>{inviting ? 'Adding member...' : 'Add to Workspace'}</span>
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-[#F5FAFF] border border-[#D8ECFB] text-xs text-[#486581]">
              Only workspace <strong>Administrators</strong> and <strong>Managers</strong> can add or manage team seats.
            </div>
          )}
        </div>
      </div>

      {/* Multi-Tenant Organizations Switcher & Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-[#1769AA]" />
            <h2 className="text-base font-extrabold text-[#102A43]">Your Tenant Workspaces ({organizations.length})</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {organizations.map((o) => {
              const isSelected = o.id === activeOrg.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setActiveOrgId(o.id)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EEF7FF] border-[#1769AA] shadow-xs'
                      : 'bg-white border-[#D8ECFB] hover:border-[#5BB6F5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-[#102A43] truncate">{o.name}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-[#CBE2F6] text-[#1769AA]">
                      {o.planId}
                    </span>
                  </div>
                  <p className="text-xs text-[#627D98] mt-1">{o.industry}</p>
                  <div className="flex items-center justify-between text-[11px] text-[#486581] mt-3 pt-2 border-t border-[#E6F2FC]">
                    <span>Role: {o.memberRole}</span>
                    <span>{isSelected ? 'Active Workspace' : 'Switch →'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Create New Tenant Workspace */}
        <form
          onSubmit={handleCreateOrg}
          className="bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs space-y-3.5"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#1769AA]" />
            <h2 className="text-base font-extrabold text-[#102A43]">New Tenant Workspace</h2>
          </div>
          <p className="text-xs text-[#627D98]">
            Create an isolated workspace for a separate business unit or SaaS product line.
          </p>
          <div>
            <label className="block text-xs font-bold text-[#334E68] mb-1">Workspace Name</label>
            <input
              type="text"
              required
              minLength={2}
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="e.g. FinOps Division"
              className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#334E68] mb-1">Industry</label>
            <input
              type="text"
              value={newOrgIndustry}
              onChange={(e) => setNewOrgIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#334E68] mb-1">Website (Optional)</label>
            <input
              type="text"
              value={newOrgWebsite}
              onChange={(e) => setNewOrgWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={creatingOrg}
            className="w-full py-2.5 rounded-xl bg-[#102A43] hover:bg-[#1C3D5E] disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {creatingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{creatingOrg ? 'Creating...' : 'Create Isolated Workspace'}</span>
          </button>
        </form>
      </div>

      {/* Active Workspace Settings (Admin Only) */}
      {isAdmin && (
        <form
          onSubmit={handleSaveOrgSettings}
          className="bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#E6F2FC] pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#102A43]">Active Workspace Settings</h2>
              <p className="text-xs text-[#627D98]">
                Configure tenant display name, industry vertical, website URL, and finance billing email.
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase text-[#1769AA] bg-[#EEF7FF] px-2.5 py-1 rounded-lg">
              Admin Only
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#334E68] mb-1">Workspace Name</label>
              <input
                type="text"
                required
                minLength={2}
                value={editOrgName}
                onChange={(e) => setEditOrgName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334E68] mb-1">Industry</label>
              <input
                type="text"
                value={editOrgIndustry}
                onChange={(e) => setEditOrgIndustry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334E68] mb-1">Website</label>
              <input
                type="text"
                value={editOrgWebsite}
                onChange={(e) => setEditOrgWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334E68] mb-1">Billing Email</label>
              <input
                type="email"
                required
                value={editOrgBillingEmail}
                onChange={(e) => setEditOrgBillingEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingOrgSettings}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1769AA] hover:bg-[#12558C] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
            >
              {savingOrgSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Workspace Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
