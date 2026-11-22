import React, { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  RestoFlowRole,
  RestoFlowRolePermissions,
  RestoFlowUser,
  StaffAttendanceRecord,
  StaffShiftRecord
} from '../../types/restoflow';

interface RestoFlowStaffViewProps {
  user: RestoFlowUser;
  permissions: RestoFlowRolePermissions;
}

type StaffSubTab = 'roster' | 'shifts' | 'attendance';

const ROLE_LABELS: Record<RestoFlowRole, string> = {
  owner: 'Restaurant Owner',
  manager: 'Restaurant Manager',
  cashier: 'Cashier (POS)',
  waiter: 'Waiter / Floor Captain',
  kitchen: 'Kitchen Staff (KDS)',
  inventory_manager: 'Inventory Manager'
};

const ATTENDANCE_BADGE: Record<string, string> = {
  present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  late: 'bg-amber-50 text-amber-800 border-amber-200',
  half_day: 'bg-sky-50 text-sky-700 border-sky-200',
  absent: 'bg-red-50 text-red-700 border-red-200',
  on_leave: 'bg-slate-100 text-slate-700 border-slate-200'
};

export const RestoFlowStaffView: React.FC<RestoFlowStaffViewProps> = ({ user, permissions }) => {
  const canManage = permissions.canManageStaff;
  const todayStr = new Date().toISOString().slice(0, 10);

  const [subTab, setSubTab] = useState<StaffSubTab>('roster');
  const [staff, setStaff] = useState<RestoFlowUser[]>([]);
  const [shifts, setShifts] = useState<StaffShiftRecord[]>([]);
  const [attendance, setAttendance] = useState<StaffAttendanceRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add Staff Modal
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'waiter' as RestoFlowRole,
    station: 'Main Dining Floor'
  });

  // Schedule Shift Modal
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    userId: '',
    shiftDate: todayStr,
    shiftName: 'evening' as 'morning' | 'afternoon' | 'evening' | 'split',
    startTime: '17:00',
    endTime: '23:00',
    station: 'Main Floor',
    notes: ''
  });

  const loadAll = useCallback(async () => {
    try {
      const [staffRes, shiftRes, attRes] = await Promise.all([
        restoFlowApi.getStaff(),
        restoFlowApi.getStaffShifts(),
        restoFlowApi.getStaffAttendance()
      ]);
      setStaff(staffRes.data);
      setShifts(shiftRes.data);
      setAttendance(attRes.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load staff data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const myTodayAttendance = attendance.find(
    (a) => a.userId === user.id && a.attendanceDate === todayStr
  );

  const handleSelfClock = async (action: 'clock_in' | 'clock_out') => {
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.clockAttendance(action);
      setFeedback(res.message || 'Attendance updated.');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update attendance.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.createStaff(staffForm);
      setFeedback(res.message || 'Staff profile created.');
      setShowStaffModal(false);
      setStaffForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'waiter',
        station: 'Main Dining Floor'
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create staff account.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleToggleActive = async (member: RestoFlowUser) => {
    setIsBusy(true);
    setError(null);
    try {
      await restoFlowApi.updateStaff(member.id, { isActive: !member.isActive });
      setFeedback(`${member.fullName} marked ${!member.isActive ? 'Active' : 'Inactive'}.`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update staff status.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleScheduleShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.userId) return;
    setIsBusy(true);
    setError(null);
    try {
      const res = await restoFlowApi.createStaffShift(shiftForm);
      setFeedback(res.message || 'Shift scheduled.');
      setShowShiftModal(false);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to schedule shift.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    setIsBusy(true);
    try {
      await restoFlowApi.deleteStaffShift(shiftId);
      setFeedback('Shift removed.');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete shift.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleMarkAttendance = async (
    memberId: string,
    status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave'
  ) => {
    setIsBusy(true);
    setError(null);
    try {
      await restoFlowApi.upsertStaffAttendance({
        userId: memberId,
        attendanceDate: todayStr,
        status,
        clockIn: status === 'present' || status === 'late' ? new Date().toISOString() : null
      });
      setFeedback('Attendance status saved.');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update attendance.');
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center gap-2.5 text-sm font-semibold text-[#64748B]">
        <Loader2 className="w-5 h-5 animate-spin text-[#EA580C]" />
        <span>Loading staff roster, shifts & attendance...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Staff, Shifts & Attendance
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Role-based team directory, shift schedules, and real-time clock-in / clock-out attendance tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!myTodayAttendance?.clockIn ? (
            <button
              disabled={isBusy}
              onClick={() => handleSelfClock('clock_in')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10B981] text-white text-xs font-bold hover:bg-emerald-600"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Clock In Today</span>
            </button>
          ) : !myTodayAttendance.clockOut ? (
            <button
              disabled={isBusy}
              onClick={() => handleSelfClock('clock_out')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1C1917] text-white text-xs font-bold hover:bg-[#292524]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Clock Out</span>
            </button>
          ) : (
            <span className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              Shift Completed Today
            </span>
          )}

          {canManage && (
            <>
              <button
                onClick={() => {
                  setShiftForm((prev) => ({ ...prev, userId: staff[0]?.id || '' }));
                  setShowShiftModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E7E0D6] bg-white text-[#1C1917] text-xs font-bold hover:bg-[#FDFBF7]"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Shift</span>
              </button>
              <button
                onClick={() => setShowStaffModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Staff Member</span>
              </button>
            </>
          )}
        </div>
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

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E7E0D6] pb-3">
        {[
          { id: 'roster', label: 'Team & Roles', icon: Users, count: staff.length },
          { id: 'shifts', label: 'Shift Roster', icon: Calendar, count: shifts.length },
          { id: 'attendance', label: 'Attendance Log', icon: Clock, count: attendance.length }
        ].map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as StaffSubTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold ${
                active
                  ? 'bg-[#1C1917] text-white'
                  : 'bg-white border border-[#E7E0D6] text-[#475569]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  active ? 'bg-white/15 text-white' : 'bg-[#F5EFE6] text-[#64748B]'
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TEAM & ROLES */}
      {subTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#E7E0D6] rounded-2xl p-5 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-extrabold text-[#1C1917]">{m.fullName}</div>
                    <div className="text-[11px] font-bold text-[#EA580C] mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{ROLE_LABELS[m.role]}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      m.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {m.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-[#475569]">
                  <div>{m.email}</div>
                  {m.phone && <div>{m.phone}</div>}
                  <div className="text-[11px] text-[#64748B]">Station: {m.station}</div>
                </div>
              </div>

              {canManage && m.id !== user.id && (m.role !== 'owner' || user.role === 'owner') && (
                <div className="pt-3 border-t border-[#EFEAE2] flex justify-end">
                  <button
                    disabled={isBusy}
                    onClick={() => handleToggleActive(m)}
                    className="text-xs font-bold text-[#475569] hover:text-[#EA580C]"
                  >
                    {m.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SHIFTS */}
      {subTab === 'shifts' && (
        <div className="bg-white border border-[#E7E0D6] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-[#EFEAE2] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Shift</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Station</th>
                  <th className="px-4 py-3">Notes</th>
                  {canManage && <th className="px-4 py-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE4] text-xs">
                {shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FDFBF7]">
                    <td className="px-4 py-3 font-mono font-bold text-[#1C1917]">{s.shiftDate}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#1C1917]">{s.staffName}</div>
                      <div className="text-[10px] text-[#64748B]">{ROLE_LABELS[s.staffRole]}</div>
                    </td>
                    <td className="px-4 py-3 capitalize font-semibold text-[#EA580C]">{s.shiftName}</td>
                    <td className="px-4 py-3 font-mono text-[#1C1917]">
                      {s.startTime} – {s.endTime}
                    </td>
                    <td className="px-4 py-3 text-[#475569]">{s.station}</td>
                    <td className="px-4 py-3 text-[#64748B]">{s.notes || '—'}</td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteShift(s.id)}
                          className="p-1.5 text-red-500 hover:text-red-700"
                          title="Delete Shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {subTab === 'attendance' && (
        <div className="space-y-4">
          {canManage && (
            <div className="bg-[#FDFBF7] border border-[#E7E0D6] rounded-2xl p-4 space-y-3">
              <div className="text-xs font-extrabold text-[#1C1917]">
                Quick Daily Attendance Marker ({todayStr})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {staff
                  .filter((s) => s.isActive)
                  .map((m) => {
                    const rec = attendance.find(
                      (a) => a.userId === m.id && a.attendanceDate === todayStr
                    );
                    return (
                      <div
                        key={m.id}
                        className="bg-white border border-[#EFEAE2] rounded-xl p-3 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#1C1917] truncate">{m.fullName}</div>
                          <div className="text-[10px] text-[#64748B]">
                            {rec ? rec.status.replace('_', ' ').toUpperCase() : 'Not Marked'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {(['present', 'late', 'absent'] as const).map((st) => (
                            <button
                              key={st}
                              disabled={isBusy}
                              onClick={() => handleMarkAttendance(m.id, st)}
                              className={`px-2 py-1 rounded text-[10px] font-bold capitalize border ${
                                rec?.status === st
                                  ? 'bg-[#1C1917] border-[#1C1917] text-white'
                                  : 'bg-white border-[#E7E0D6] text-[#475569] hover:border-[#EA580C]'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="bg-white border border-[#E7E0D6] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDFBF7] border-b border-[#EFEAE2] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Staff Member</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Clock In</th>
                    <th className="px-4 py-3">Clock Out</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1ECE4] text-xs">
                  {attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-[#FDFBF7]">
                      <td className="px-4 py-3 font-mono font-bold text-[#1C1917]">
                        {a.attendanceDate}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#1C1917]">{a.staffName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                            ATTENDANCE_BADGE[a.status] || ATTENDANCE_BADGE.present
                          }`}
                        >
                          {a.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#475569]">
                        {a.clockIn
                          ? new Date(a.clockIn).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-[#475569]">
                        {a.clockOut
                          ? new Date(a.clockOut).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">{a.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateStaff}
            className="bg-white rounded-2xl border border-[#E7E0D6] max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#1C1917]">Add Staff Account</h2>
              <button type="button" onClick={() => setShowStaffModal(false)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Full Name *</span>
                <input
                  required
                  value={staffForm.fullName}
                  onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Work Email *</span>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Initial Password (min 8 chars) *</span>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-bold text-[#1C1917]">Role</span>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as RestoFlowRole })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white"
                  >
                    {user.role === 'owner' && <option value="owner">Restaurant Owner</option>}
                    <option value="manager">Restaurant Manager</option>
                    <option value="cashier">Cashier (POS)</option>
                    <option value="waiter">Waiter</option>
                    <option value="kitchen">Kitchen Staff</option>
                    <option value="inventory_manager">Inventory Manager</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="font-bold text-[#1C1917]">Phone</span>
                  <input
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Assigned Station</span>
                <input
                  value={staffForm.station}
                  onChange={(e) => setStaffForm({ ...staffForm, station: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="px-4 py-2 rounded-lg border border-[#E7E0D6] text-xs font-bold text-[#475569]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
              >
                {isBusy ? 'Creating...' : 'Create Staff'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SCHEDULE SHIFT MODAL */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleScheduleShift}
            className="bg-white rounded-2xl border border-[#E7E0D6] max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#1C1917]">Schedule Staff Shift</h2>
              <button type="button" onClick={() => setShowShiftModal(false)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Staff Member *</span>
                <select
                  required
                  value={shiftForm.userId}
                  onChange={(e) => setShiftForm({ ...shiftForm, userId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white"
                >
                  {staff
                    .filter((s) => s.isActive)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({ROLE_LABELS[s.role]})
                      </option>
                    ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-bold text-[#1C1917]">Date *</span>
                  <input
                    type="date"
                    required
                    value={shiftForm.shiftDate}
                    onChange={(e) => setShiftForm({ ...shiftForm, shiftDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="font-bold text-[#1C1917]">Shift Slot</span>
                  <select
                    value={shiftForm.shiftName}
                    onChange={(e) => setShiftForm({ ...shiftForm, shiftName: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6] bg-white"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="split">Split</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-bold text-[#1C1917]">Start Time</span>
                  <input
                    type="time"
                    required
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="font-bold text-[#1C1917]">End Time</span>
                  <input
                    type="time"
                    required
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="font-bold text-[#1C1917]">Station</span>
                <input
                  value={shiftForm.station}
                  onChange={(e) => setShiftForm({ ...shiftForm, station: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E0D6]"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowShiftModal(false)}
                className="px-4 py-2 rounded-lg border border-[#E7E0D6] text-xs font-bold text-[#475569]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C]"
              >
                {isBusy ? 'Saving...' : 'Schedule Shift'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
