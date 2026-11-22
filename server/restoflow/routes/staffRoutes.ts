import express from 'express';
import { generateRestoId, getRestoFlowDb } from '../db.ts';
import {
  AuthenticatedRestoFlowRequest,
  hashPasswordSync,
  mapRestoUserRow,
  requireRestoFlowAuth,
  requireRestoFlowRole
} from '../security.ts';
import type {
  RestoFlowRole,
  StaffAttendanceRecord,
  StaffShiftRecord
} from '../../../src/types/restoflow.ts';

const VALID_ROLES: RestoFlowRole[] = [
  'owner',
  'manager',
  'cashier',
  'waiter',
  'kitchen',
  'inventory_manager'
];

const VALID_SHIFTS = ['morning', 'afternoon', 'evening', 'split'] as const;
const VALID_ATTENDANCE_STATUSES = ['present', 'late', 'half_day', 'absent', 'on_leave'] as const;

function mapShiftRow(row: any): StaffShiftRecord {
  return {
    id: row.id,
    userId: row.user_id,
    staffName: row.staff_name || 'Staff',
    staffRole: (row.staff_role || 'waiter') as RestoFlowRole,
    shiftDate: row.shift_date,
    shiftName: row.shift_name,
    startTime: row.start_time,
    endTime: row.end_time,
    station: row.station || 'Main Floor',
    notes: row.notes || '',
    isDemo: Boolean(row.is_demo),
    createdAt: row.created_at
  };
}

function mapAttendanceRow(row: any): StaffAttendanceRecord {
  return {
    id: row.id,
    userId: row.user_id,
    staffName: row.staff_name || 'Staff',
    staffRole: (row.staff_role || 'waiter') as RestoFlowRole,
    attendanceDate: row.attendance_date,
    clockIn: row.clock_in || null,
    clockOut: row.clock_out || null,
    status: row.status,
    notes: row.notes || '',
    isDemo: Boolean(row.is_demo)
  };
}

export function createRestoFlowStaffRouter(): express.Router {
  const router = express.Router();

  // List all staff members
  router.get('/staff', requireRestoFlowAuth, (_req, res) => {
    const db = getRestoFlowDb();
    const rows = db
      .prepare(
        `
        SELECT * FROM users
        ORDER BY
          CASE role
            WHEN 'owner' THEN 1
            WHEN 'manager' THEN 2
            WHEN 'cashier' THEN 3
            WHEN 'waiter' THEN 4
            WHEN 'kitchen' THEN 5
            ELSE 6
          END,
          full_name ASC
      `
      )
      .all();
    return res.json({ success: true, data: rows.map(mapRestoUserRow) });
  });

  // Create staff account with real salted scrypt password
  router.post(
    '/staff',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const actingUser = req.restoUser!;

      const fullName = String(req.body?.fullName || '').trim();
      const email = String(req.body?.email || '').trim().toLowerCase();
      const phone = String(req.body?.phone || '').trim();
      const password = String(req.body?.password || '');
      const role = String(req.body?.role || 'waiter') as RestoFlowRole;
      const station = String(req.body?.station || 'Main Floor').trim() || 'Main Floor';

      if (!fullName || !email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'Valid full name and work email are required.'
        });
      }
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Initial password must be at least 8 characters.'
        });
      }
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid staff role specified.'
        });
      }
      if (role === 'owner' && actingUser.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Only a Restaurant Owner can create another Owner account.'
        });
      }

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A staff account with this email already exists.'
        });
      }

      const id = generateRestoId('rf_user');
      const nowIso = new Date().toISOString();
      const passwordHash = hashPasswordSync(password);

      db.prepare(
        `
        INSERT INTO users (
          id, full_name, email, phone, password_hash, role, station,
          is_active, is_demo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)
      `
      ).run(id, fullName, email, phone, passwordHash, role, station, nowIso, nowIso);

      const created = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      return res.status(201).json({
        success: true,
        message: `Staff account created for ${fullName}.`,
        data: mapRestoUserRow(created)
      });
    }
  );

  // Update staff profile / active status (revokes sessions on deactivation)
  router.patch(
    '/staff/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const actingUser = req.restoUser!;
      const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;

      if (!target) {
        return res.status(404).json({ success: false, message: 'Staff member not found.' });
      }
      if (target.role === 'owner' && actingUser.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Managers cannot modify Restaurant Owner accounts.'
        });
      }

      const nextIsActive =
        req.body?.isActive !== undefined ? Boolean(req.body.isActive) : Boolean(target.is_active);
      if (target.id === actingUser.id && !nextIsActive) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own active account.'
        });
      }

      const nextRole = (req.body?.role ? String(req.body.role) : target.role) as RestoFlowRole;
      if (!VALID_ROLES.includes(nextRole)) {
        return res.status(400).json({ success: false, message: 'Invalid role.' });
      }
      if (nextRole === 'owner' && actingUser.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Only a Restaurant Owner can assign the Owner role.'
        });
      }

      const fullName =
        req.body?.fullName !== undefined ? String(req.body.fullName).trim() : target.full_name;
      const phone = req.body?.phone !== undefined ? String(req.body.phone).trim() : target.phone;
      const station =
        req.body?.station !== undefined ? String(req.body.station).trim() : target.station;

      db.prepare(
        `
        UPDATE users
        SET full_name = ?, phone = ?, role = ?, station = ?, is_active = ?, updated_at = ?
        WHERE id = ?
      `
      ).run(
        fullName || target.full_name,
        phone,
        nextRole,
        station || target.station,
        nextIsActive ? 1 : 0,
        new Date().toISOString(),
        target.id
      );

      if (!nextIsActive) {
        db.prepare('DELETE FROM sessions WHERE user_id = ?').run(target.id);
      }

      const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(target.id);
      return res.json({
        success: true,
        message: 'Staff profile updated.',
        data: mapRestoUserRow(updated)
      });
    }
  );

  // List shifts
  router.get('/staff/shifts', requireRestoFlowAuth, (req, res) => {
    const db = getRestoFlowDb();
    const dateFilter = String(req.query.date || '').trim();
    let sql = `
      SELECT s.*, u.full_name AS staff_name, u.role AS staff_role
      FROM staff_shifts s
      JOIN users u ON u.id = s.user_id
    `;
    const params: unknown[] = [];
    if (dateFilter) {
      sql += ' WHERE s.shift_date = ?';
      params.push(dateFilter);
    }
    sql += ' ORDER BY s.shift_date DESC, s.start_time ASC LIMIT 100';
    const rows = db.prepare(sql).all(...params);
    return res.json({ success: true, data: rows.map(mapShiftRow) });
  });

  // Schedule shift
  router.post(
    '/staff/shifts',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const userId = String(req.body?.userId || '').trim();
      const shiftDate = String(req.body?.shiftDate || '').trim();
      const shiftName = String(req.body?.shiftName || 'evening').trim();
      const startTime = String(req.body?.startTime || '').trim();
      const endTime = String(req.body?.endTime || '').trim();
      const station = String(req.body?.station || 'Main Floor').trim();
      const notes = String(req.body?.notes || '').trim();

      if (!userId || !shiftDate || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'Staff member, date, start time, and end time are required.'
        });
      }
      if (!VALID_SHIFTS.includes(shiftName as any)) {
        return res.status(400).json({ success: false, message: 'Invalid shift slot.' });
      }

      const staffRow = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!staffRow) {
        return res.status(404).json({ success: false, message: 'Staff member not found.' });
      }

      const id = generateRestoId('rf_shift');
      const nowIso = new Date().toISOString();
      db.prepare(
        `
        INSERT INTO staff_shifts (
          id, user_id, shift_date, shift_name, start_time, end_time, station, notes, is_demo, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `
      ).run(id, userId, shiftDate, shiftName, startTime, endTime, station, notes, nowIso);

      const created = db
        .prepare(
          `
          SELECT s.*, u.full_name AS staff_name, u.role AS staff_role
          FROM staff_shifts s
          JOIN users u ON u.id = s.user_id
          WHERE s.id = ?
        `
        )
        .get(id);

      return res.status(201).json({
        success: true,
        message: 'Shift scheduled.',
        data: mapShiftRow(created)
      });
    }
  );

  // Delete shift
  router.delete(
    '/staff/shifts/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req, res) => {
      const db = getRestoFlowDb();
      const info = db.prepare('DELETE FROM staff_shifts WHERE id = ?').run(req.params.id);
      if (info.changes === 0) {
        return res.status(404).json({ success: false, message: 'Shift not found.' });
      }
      return res.json({ success: true, message: 'Shift removed.', data: null });
    }
  );

  // List attendance logs
  router.get('/staff/attendance', requireRestoFlowAuth, (req, res) => {
    const db = getRestoFlowDb();
    const dateFilter = String(req.query.date || '').trim();
    let sql = `
      SELECT a.*, u.full_name AS staff_name, u.role AS staff_role
      FROM staff_attendance a
      JOIN users u ON u.id = a.user_id
    `;
    const params: unknown[] = [];
    if (dateFilter) {
      sql += ' WHERE a.attendance_date = ?';
      params.push(dateFilter);
    }
    sql += ' ORDER BY a.attendance_date DESC, a.clock_in DESC LIMIT 120';
    const rows = db.prepare(sql).all(...params);
    return res.json({ success: true, data: rows.map(mapAttendanceRow) });
  });

  // Upsert staff attendance (Owner / Manager)
  router.post(
    '/staff/attendance',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const userId = String(req.body?.userId || '').trim();
      const attendanceDate = String(req.body?.attendanceDate || new Date().toISOString().slice(0, 10)).trim();
      const status = String(req.body?.status || 'present').trim();
      const clockIn = req.body?.clockIn ? String(req.body.clockIn) : null;
      const clockOut = req.body?.clockOut ? String(req.body.clockOut) : null;
      const notes = String(req.body?.notes || '').trim();

      if (!userId || !attendanceDate) {
        return res.status(400).json({
          success: false,
          message: 'Staff member and attendance date are required.'
        });
      }
      if (!VALID_ATTENDANCE_STATUSES.includes(status as any)) {
        return res.status(400).json({ success: false, message: 'Invalid attendance status.' });
      }

      const staffRow = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!staffRow) {
        return res.status(404).json({ success: false, message: 'Staff member not found.' });
      }

      const existing = db
        .prepare('SELECT id FROM staff_attendance WHERE user_id = ? AND attendance_date = ?')
        .get(userId, attendanceDate) as any;

      let recordId: string;
      if (existing) {
        recordId = existing.id;
        db.prepare(
          `
          UPDATE staff_attendance
          SET status = ?,
              clock_in = COALESCE(?, clock_in),
              clock_out = COALESCE(?, clock_out),
              notes = ?
          WHERE id = ?
        `
        ).run(status, clockIn, clockOut, notes, recordId);
      } else {
        recordId = generateRestoId('rf_att');
        db.prepare(
          `
          INSERT INTO staff_attendance (
            id, user_id, attendance_date, clock_in, clock_out, status, notes, is_demo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        `
        ).run(recordId, userId, attendanceDate, clockIn, clockOut, status, notes);
      }

      const row = db
        .prepare(
          `
          SELECT a.*, u.full_name AS staff_name, u.role AS staff_role
          FROM staff_attendance a
          JOIN users u ON u.id = a.user_id
          WHERE a.id = ?
        `
        )
        .get(recordId);

      return res.json({
        success: true,
        message: 'Attendance updated.',
        data: mapAttendanceRow(row)
      });
    }
  );

  // Self Clock-In / Clock-Out (any authenticated staff member)
  router.post(
    '/staff/attendance/clock',
    requireRestoFlowAuth,
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const actingUser = req.restoUser!;
      const action = String(req.body?.action || '').toLowerCase();
      const todayStr = new Date().toISOString().slice(0, 10);
      const nowIso = new Date().toISOString();

      if (!['clock_in', 'clock_out'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Clock action must be "clock_in" or "clock_out".'
        });
      }

      const existing = db
        .prepare('SELECT * FROM staff_attendance WHERE user_id = ? AND attendance_date = ?')
        .get(actingUser.id, todayStr) as any;

      let recordId: string;
      if (action === 'clock_in') {
        if (existing) {
          recordId = existing.id;
          db.prepare(
            `
            UPDATE staff_attendance
            SET clock_in = COALESCE(clock_in, ?), status = 'present'
            WHERE id = ?
          `
          ).run(nowIso, recordId);
        } else {
          recordId = generateRestoId('rf_att');
          db.prepare(
            `
            INSERT INTO staff_attendance (
              id, user_id, attendance_date, clock_in, clock_out, status, notes, is_demo
            ) VALUES (?, ?, ?, ?, NULL, 'present', 'Self clock-in', 0)
          `
          ).run(recordId, actingUser.id, todayStr, nowIso);
        }
      } else {
        if (!existing || !existing.clock_in) {
          return res.status(400).json({
            success: false,
            message: 'You must clock in before clocking out.'
          });
        }
        recordId = existing.id;
        db.prepare('UPDATE staff_attendance SET clock_out = ? WHERE id = ?').run(nowIso, recordId);
      }

      const row = db
        .prepare(
          `
          SELECT a.*, u.full_name AS staff_name, u.role AS staff_role
          FROM staff_attendance a
          JOIN users u ON u.id = a.user_id
          WHERE a.id = ?
        `
        )
        .get(recordId);

      return res.json({
        success: true,
        message: action === 'clock_in' ? 'Clocked in successfully.' : 'Clocked out successfully.',
        data: mapAttendanceRow(row)
      });
    }
  );

  return router;
}
