import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  History,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert
} from 'lucide-react';
import { saasApi, SaasApiError } from '../../services/saasApi';
import type { SaasAuditLog, SaasOrganization } from '../../types/saas';
import { exportSheetsToExcel, exportTableToPdf } from '../../utils/saasExports';

interface SaasAuditLogsViewProps {
  org: SaasOrganization;
}

export const SaasAuditLogsView: React.FC<SaasAuditLogsViewProps> = ({ org }) => {
  const role = org.memberRole || 'member';
  const canViewAudit = role === 'admin' || role === 'manager';

  const [logs, setLogs] = useState<SaasAuditLog[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('all');
  const [actorRole, setActorRole] = useState('all');
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async () => {
    if (!canViewAudit) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await saasApi.getAuditLogs(org.id, {
        search: search.trim() || undefined,
        entityType,
        actorRole,
        page,
        limit: 15
      });
      setLogs(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof SaasApiError ? err.message : 'Unable to fetch audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [canViewAudit, org.id, search, entityType, actorRole, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadLogs();
    }, 180);
    return () => clearTimeout(t);
  }, [loadLogs]);

  if (!canViewAudit) {
    return (
      <div className="bg-white rounded-2xl border border-[#D8ECFB] p-10 text-center max-w-lg mx-auto my-8">
        <Lock className="w-10 h-10 text-[#1769AA] mx-auto mb-3" />
        <h2 className="text-lg font-extrabold text-[#102A43]">Restricted Compliance Ledger</h2>
        <p className="text-sm text-[#486581] mt-1.5">
          Audit logs are accessible only to workspace <strong>Administrators</strong> and <strong>Managers</strong>.
          Contact your workspace admin if you require compliance access.
        </p>
      </div>
    );
  }

  const handleExportPdf = () => {
    exportTableToPdf({
      title: 'Immutable Audit Trail Report',
      subtitle: `Filtered compliance records (${pagination.total} total)`,
      workspaceName: org.name,
      fileNamePrefix: `${org.slug}-audit-logs`,
      columns: ['Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Summary'],
      rows: logs.map((l) => [
        new Date(l.createdAt).toLocaleString('en-IN'),
        l.actorEmail,
        l.actorRole.toUpperCase(),
        l.action,
        l.entityType,
        l.summary
      ])
    });
  };

  const handleExportExcel = () => {
    exportSheetsToExcel({
      fileNamePrefix: `${org.slug}-audit-logs`,
      sheets: [
        {
          sheetName: 'Audit Logs',
          rows: logs.map((l) => ({
            Timestamp: l.createdAt,
            Actor_Email: l.actorEmail,
            Role: l.actorRole,
            Action: l.action,
            Entity_Type: l.entityType,
            Entity_ID: l.entityId || '',
            Summary: l.summary,
            IP_Address: l.ipAddress || ''
          }))
        }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">Security & Governance</p>
          <h1 className="text-2xl font-extrabold text-[#102A43] mt-0.5">Audit Logs Ledger</h1>
          <p className="text-sm text-[#486581] mt-1">
            Immutable record of authentication, RBAC, client, project, task, and billing events in {org.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            disabled={logs.length === 0}
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#EEF7FF] disabled:opacity-50 border border-[#CBE2F6] text-xs font-bold text-[#1769AA] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            disabled={logs.length === 0}
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769AA] hover:bg-[#12558C] disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#D8ECFB] p-4 shadow-xs flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search actor email, action, or summary..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-semibold text-[#102A43]"
          >
            <option value="all">All Entities</option>
            <option value="organization">Organization</option>
            <option value="user">User / Auth</option>
            <option value="member">Team Members</option>
            <option value="client">Clients</option>
            <option value="project">Projects</option>
            <option value="task">Tasks</option>
            <option value="invoice">Invoices</option>
            <option value="subscription">Subscriptions</option>
          </select>

          <select
            value={actorRole}
            onChange={(e) => {
              setActorRole(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-semibold text-[#102A43]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#D8ECFB] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-[#627D98] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#1769AA]" />
            <span>Loading audit records...</span>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#102A43]">{error}</p>
            <button
              type="button"
              onClick={loadLogs}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-9 h-9 text-[#5BB6F5] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#102A43]">No audit events match your filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5FAFF] text-[11px] font-bold uppercase tracking-wider text-[#627D98] border-b border-[#E6F2FC]">
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-6 text-right">Source IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF6FD] text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9FCFF]">
                    <td className="py-3.5 px-6 whitespace-nowrap text-[#486581] tabular-nums">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#102A43]">{log.actorEmail}</p>
                      <span className="inline-block text-[10px] font-bold uppercase text-[#1769AA]">{log.actorRole}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EEF7FF] border border-[#D4E8FA] font-mono text-[11px] text-[#1769AA]">
                        <ShieldAlert className="w-3 h-3" />
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#334E68] font-medium max-w-md">{log.summary}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-[#627D98] whitespace-nowrap">
                      {log.ipAddress || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-3.5 border-t border-[#E6F2FC] flex items-center justify-between text-xs">
          <span className="text-[#627D98] tabular-nums">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} events)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CBE2F6] bg-white disabled:opacity-40 font-bold text-[#102A43] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CBE2F6] bg-white disabled:opacity-40 font-bold text-[#102A43] cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
