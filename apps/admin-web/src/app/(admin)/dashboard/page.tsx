'use client';
// app/(admin)/dashboard/page.tsx

import { useEffect } from 'react';
import { Store, MapPin, FileText, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { PageSpinner } from '@/components/ui/spinner';
import { useDashboardStore } from '@/stores/dashboard.store';
import type { DashboardSummary } from '@localmart/api-client';

export default function DashboardPage() {
  const { summary, loading, error, fetchSummary } = useDashboardStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) return <PageSpinner />;
  if (error) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      ⚠️ Failed to load dashboard: {error}
    </div>
  );
  if (!summary) return null;

  const stores = summary.stores as Record<string, number>;
  const totalStores = Object.values(stores).reduce((a, b) => a + b, 0);

  const storeStats = [
    { label: 'Total Stores', value: totalStores, icon: <Store size={18} />, trend: 'All registered stores' },
    { label: 'Pending Approval', value: stores['PENDING'] ?? 0, icon: <Clock size={18} />, trend: 'Awaiting review', trendUp: false },
    { label: 'Live Stores', value: stores['LIVE'] ?? 0, icon: <CheckCircle size={18} />, trend: 'Active on platform', trendUp: true },
    { label: 'Rejected', value: (stores['REJECTED'] ?? 0) + (stores['SUSPENDED'] ?? 0), icon: <XCircle size={18} />, trend: 'Rejected or suspended', trendUp: false },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Platform overview at a glance"
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {storeStats.map((s, i) => (
          <StatCard
            key={i}
            label={s.label}
            value={s.value}
            icon={s.icon}
            trend={s.trend}
            trendUp={s.trendUp}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zones per city */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <MapPin size={14} className="text-emerald-600" />
            </div>
            Zones per City
          </h2>
          {summary.zonesPerCity.length === 0 ? (
            <p className="text-sm text-neutral-400 py-4 text-center">No cities configured yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {summary.zonesPerCity.map((c: any) => (
                <div key={c.cityId} className="flex items-center justify-between py-3">
                  <span className="text-sm text-neutral-700 font-medium">{c.cityName}</span>
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {c.zoneCount} zone{c.zoneCount !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick status breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <CreditCard size={14} className="text-emerald-600" />
            </div>
            Platform Summary
          </h2>
          <div className="space-y-3">
            <SummaryRow icon={<FileText size={14} />} label="Pending KYC Documents" value={summary.totalDocumentsPending} />
            <SummaryRow icon={<CreditCard size={14} />} label="Active Fee Plans" value={summary.activeFeePlansCount} />
            <SummaryRow icon={<Store size={14} />} label="Draft Stores" value={stores['DRAFT'] ?? 0} />
            <SummaryRow icon={<AlertCircle size={14} />} label="Suspended Stores" value={stores['SUSPENDED'] ?? 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <span className="text-neutral-400">{icon}</span>
        {label}
      </div>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
    </div>
  );
}
