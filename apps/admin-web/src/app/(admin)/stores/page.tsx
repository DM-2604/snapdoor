'use client';
// app/(admin)/stores/page.tsx — Store list + approval queue

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Store, RefreshCw, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Table } from '@localmart/ui';
import type { ColumnDef } from '@localmart/ui';
import { storesApi, geoApi } from '@/lib/api';
import type { StoreListItem, PaginatedResponse } from '@localmart/api-client';
import type { City } from '@localmart/api-client';
import { useStoreCatalogStore } from '@/stores/store-catalog.store';

const STATUS_OPTIONS = ['', 'PENDING', 'DRAFT', 'LIVE', 'REJECTED', 'SUSPENDED'];

const COLUMNS: ColumnDef<StoreListItem>[] = [
  {
    key: 'store',
    header: 'Store',
    cell: (row) => (
      <div>
        <p className="font-semibold text-neutral-900 truncate max-w-[200px]">{row.name}</p>
        <p className="text-xs text-neutral-400 mt-0.5 font-mono">{row.storeCode}</p>
      </div>
    ),
  },
  {
    key: 'location',
    header: 'City / Zone',
    cell: (row) => (
      <div className="text-xs">
        <span className="font-medium text-neutral-700">{row.city?.name ?? '—'}</span>
        {row.zone && (
          <span className="text-neutral-400 ml-1">· {row.zone.name}</span>
        )}
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    cell: (row) => <span className="text-xs text-neutral-600">{row.businessCategory?.name ?? '—'}</span>,
  },
  {
    key: 'owner',
    header: 'Owner',
    cell: (row) => (
      <div className="text-xs">
        <p className="font-medium text-neutral-700">{row.owner?.name ?? '—'}</p>
        <p className="text-neutral-400">{row.owner?.phoneNumber}</p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <Badge variant={row.status as any}>{row.status}</Badge>,
  },
  {
    key: 'created',
    header: 'Registered',
    cell: (row) => (
      <span className="text-xs text-neutral-500">
        {new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    ),
  },
  {
    key: 'action',
    header: '',
    cell: (row) => (
      <Link
        href={`/stores/${row.id}`}
        className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
      >
        Review <ChevronRight size={13} />
      </Link>
    ),
  },
];

export default function StoresPage() {
  const {
    result, loading, error, cities,
    status, search, selectedCityId, page,
    setStatus, setSearch, setSelectedCityId, setPage,
    fetchCities, fetchList
  } = useStoreCatalogStore();

  // Load cities once for the filter dropdown
  useEffect(() => {
    if (cities.length === 0) fetchCities();
  }, [cities.length, fetchCities]);

  useEffect(() => {
    fetchList();
  }, [status, search, selectedCityId, page, fetchList]);

  const totalStores = result?.total ?? 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Stores"
        description="Manage all store registrations and approval queue"
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchList}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              href="/stores/new"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Store size={14} />
              Add Store
            </Link>
          </div>
        }
      />

      {/* Summary strip */}
      <div className="flex items-center gap-4 mb-5 text-sm">
        <div className="flex items-center gap-1.5 text-neutral-600">
          <Store size={14} className="text-emerald-600" />
          <span className="font-semibold text-neutral-900">{totalStores}</span>
          <span>result{totalStores !== 1 ? 's' : ''}</span>
        </div>
        {status && (
          <Badge variant={status as any}>{status}</Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search name or store code…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
          />
        </div>

        {/* Status filter */}
        <div className="relative min-w-[140px]">
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="w-full h-11 pl-4 pr-10 appearance-none rounded-xl border border-neutral-300 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 cursor-pointer"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map(s => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        </div>

        {/* City filter by name */}
        <div className="relative min-w-[140px]">
          <select
            value={selectedCityId}
            onChange={e => { setSelectedCityId(e.target.value); setPage(1); }}
            className="w-full h-11 pl-4 pr-10 appearance-none rounded-xl border border-neutral-300 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 cursor-pointer"
          >
            <option value="">All cities</option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          ⚠️ Error loading stores: {error}
        </div>
      )}

      <Table
        columns={COLUMNS}
        data={result?.items ?? []}
        loading={loading}
        skeletonRows={8}
        emptyMessage="No stores found for the selected filters."
        pagination={result && result.total > 20 ? {
          page,
          limit: 20,
          total: result.total,
          onPageChange: setPage,
        } : undefined}
      />
    </div>
  );
}
