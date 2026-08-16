'use client';
// app/(admin)/audit-logs/page.tsx — Enriched audit log viewer

import { useEffect, useState, useCallback } from 'react';
import { ScrollText, ChevronDown, ChevronRight, X, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PageSpinner } from '@/components/ui/spinner';
import { useAuditStore } from '@/stores/audit.store';
import type { AuditLog } from '@localmart/api-client';

// ── Metadata ────────────────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; color: string; dot: string }> = {
  STORE_CREATED_BY_ADMIN:   { label: 'Store Created',         color: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500' },
  STORE_APPROVED:           { label: 'Store Approved',         color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  STORE_REJECTED:           { label: 'Store Rejected',         color: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-500' },
  STORE_REQUEST_CHANGES:    { label: 'Changes Requested',      color: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  STORE_SUSPENDED:          { label: 'Store Suspended',        color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  DOCUMENT_VERIFIED:        { label: 'Document Verified',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  DOCUMENT_REJECTED:        { label: 'Document Rejected',      color: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-500' },
  COMMISSION_RULE_CREATED:  { label: 'Commission Rule Created',color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  COMMISSION_RULE_UPDATED:  { label: 'Commission Rule Updated',color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  FEE_PLAN_CREATED:         { label: 'Fee Plan Created',       color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  FEE_PLAN_UPDATED:         { label: 'Fee Plan Updated',       color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  SETTING_UPDATED:          { label: 'Setting Updated',        color: 'bg-neutral-100 text-neutral-700 border-neutral-200', dot: 'bg-neutral-400' },
};

const ACTION_OPTIONS = Object.keys(ACTION_META);

const ENTITY_TYPES = ['Store', 'Document', 'CommissionRule', 'FeePlan', 'Zone', 'City', 'Category', 'PlatformSetting'];

function getActionMeta(action: string) {
  return ACTION_META[action] ?? {
    label: action.replace(/_/g, ' '),
    color: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    dot: 'bg-neutral-400',
  };
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
  };
}

// ── JSON Diff Drawer ─────────────────────────────────────────────────────────

function JsonDiffDrawer({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const meta = getActionMeta(log.action);
  const { date, time } = formatDateTime(log.createdAt);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-200 bg-neutral-50">
          <div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color} mb-2`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
            <p className="text-sm font-semibold text-neutral-900">{log.entityType}</p>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">{log.entityId}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-200 transition-colors text-neutral-500">
            <X size={16} />
          </button>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-px bg-neutral-100 border-b border-neutral-200">
          {[
            { label: 'Actor', value: log.actor?.name ?? log.actorUserId?.slice(0, 8) ?? 'System' },
            { label: 'Phone', value: log.actor?.phoneNumber ?? '—' },
            { label: 'Date', value: date },
            { label: 'Time (IST)', value: time },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white px-5 py-3">
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm text-neutral-800 font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Before / After */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {log.before != null && (
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Before
              </p>
              <pre className="bg-red-50 border border-red-100 rounded-xl text-xs p-4 overflow-x-auto text-red-900 leading-relaxed">
                {JSON.stringify(log.before, null, 2)}
              </pre>
            </div>
          )}

          {log.after != null ? (
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> After
              </p>
              <pre className="bg-emerald-50 border border-emerald-100 rounded-xl text-xs p-4 overflow-x-auto text-emerald-900 leading-relaxed">
                {JSON.stringify(log.after, null, 2)}
              </pre>
            </div>
          ) : log.before == null ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
              <ScrollText size={28} className="mb-2 opacity-30" />
              <p className="text-sm">No snapshot data recorded for this action.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const { logs, total, loading, page, entityType, setPage, setEntityType, fetchLogs } = useAuditStore();
  const [actionFilter, setActionFilter] = useState('');
  const [entityIdSearch, setEntityIdSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => { fetchLogs(); }, [page, entityType, fetchLogs]);

  const filteredLogs = logs.filter(log => {
    const matchAction = !actionFilter || log.action === actionFilter;
    const matchId = !entityIdSearch || log.entityId.toLowerCase().includes(entityIdSearch.toLowerCase());
    return matchAction && matchId;
  });

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Audit Log"
        description="Read-only, immutable record of all admin actions on the platform"
      />

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Entity type */}
        <div className="relative">
          <select
            value={entityType}
            onChange={e => { setEntityType(e.target.value); setPage(1); }}
            className="h-11 pl-4 pr-10 appearance-none rounded-xl border border-neutral-300 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 cursor-pointer"
          >
            <option value="">All entity types</option>
            {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        </div>

        {/* Action */}
        <div className="relative">
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="h-11 pl-4 pr-10 appearance-none rounded-xl border border-neutral-300 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 cursor-pointer"
          >
            <option value="">All actions</option>
            {ACTION_OPTIONS.map(a => (
              <option key={a} value={a}>{getActionMeta(a).label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        </div>

        {/* Entity ID search */}
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by entity ID…"
            value={entityIdSearch}
            onChange={e => setEntityIdSearch(e.target.value)}
            className="w-full h-11 pl-9 pr-4 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
          />
        </div>

        {/* Summary badge */}
        <div className="ml-auto flex items-center text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-lg font-medium">
          {filteredLogs.length} of {total} entries
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? <PageSpinner /> : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-400">
            <ScrollText size={32} className="mx-auto mb-3 opacity-20" />
            No audit log entries match the selected filters.
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Timestamp', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Changes', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredLogs.map(log => {
                  const meta = getActionMeta(log.action);
                  const { date, time } = formatDateTime(log.createdAt);
                  const hasDiff = log.before != null || log.after != null;

                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors group">
                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs font-medium text-neutral-700">{date}</p>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{time}</p>
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-neutral-800">{log.actor?.name ?? 'System'}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{log.actor?.phoneNumber ?? (log.actorUserId ? log.actorUserId.slice(0, 8) + '…' : '—')}</p>
                      </td>

                      {/* Action badge */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${meta.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>

                      {/* Entity type */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-neutral-600 font-medium bg-neutral-100 px-2 py-0.5 rounded-md">
                          {log.entityType}
                        </span>
                      </td>

                      {/* Entity ID */}
                      <td className="px-4 py-3">
                        <span
                          className="text-[10px] text-neutral-400 font-mono bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded cursor-pointer hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                          title={log.entityId}
                          onClick={() => navigator.clipboard.writeText(log.entityId)}
                        >
                          {log.entityId.slice(0, 8)}…
                        </span>
                      </td>

                      {/* Has changes indicator */}
                      <td className="px-4 py-3">
                        {hasDiff ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Has diff
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-300">—</span>
                        )}
                      </td>

                      {/* View details button */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-emerald-700"
                        >
                          Details <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {total > 25 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50/50">
                <p className="text-xs text-neutral-500">
                  Page {page} of {totalPages} · {total} total entries
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 bg-white disabled:opacity-40 hover:bg-neutral-50 transition-colors font-medium"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 bg-white disabled:opacity-40 hover:bg-neutral-50 transition-colors font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail drawer */}
      {selectedLog && (
        <JsonDiffDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
