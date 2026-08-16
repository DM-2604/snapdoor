'use client';
// app/(admin)/geography/page.tsx — Cities + Zones management
// All names shown in UI (no raw IDs exposed to admin)

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, MapPin, ChevronDown, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { Modal } from '@/components/ui/modal';
import { geoApi } from '@/lib/api';
import type { City, Zone } from '@localmart/api-client';
import { State, City as CSCity } from 'country-state-city';
import { useGeographyStore } from '@/stores/geography.store';

// ── Shared input style ───────────────────────────────────────────────────────
const INPUT = 'w-full py-2.5 rounded-lg border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all';

// ── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, id, children, hint }: { label: string; id: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Section Heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest mt-4 mb-2 first:mt-0">
      <Icon size={13} className="text-emerald-500" />
      {title}
    </h3>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function GeographyPage() {
  const {
    cities, zones, expandedCityId: expanded, loading,
    cityModalOpen: cityModal, zoneModalCityId: zoneModal, editZoneModal,
    setExpandedCityId: setExpanded, setCityModalOpen: setCityModal,
    setZoneModalCityId: setZoneModal, setEditZoneModal,
    fetchCities: loadCities, fetchZones, toggleZoneActive, updateZoneInState, addZoneToState,
    updateCityStatus
  } = useGeographyStore();

  // ── City form ──
  const [cityStateCode, setCityStateCode] = useState('');
  const [cityName, setCityName] = useState('');
  const [cityDefaultCommission, setCityDefaultCommission] = useState('');
  const [cityDeliveryFleet, setCityDeliveryFleet] = useState(false);
  const [citySubmitting, setCitySubmitting] = useState(false);
  const [cityError, setCityError] = useState('');

  // ── Zone (create) form ──
  const [zoneName, setZoneName] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [zoneLat, setZoneLat] = useState('');
  const [zoneLng, setZoneLng] = useState('');
  const [zoneColorHex, setZoneColorHex] = useState('');
  const [zoneCommission, setZoneCommission] = useState('');
  const [zoneSubmitting, setZoneSubmitting] = useState(false);
  const [zoneError, setZoneError] = useState('');

  // ── Zone (edit) form ──
  const [editZoneName, setEditZoneName] = useState('');
  const [editZoneCode, setEditZoneCode] = useState('');
  const [editZoneIsActive, setEditZoneIsActive] = useState(true);
  const [editZoneCommission, setEditZoneCommission] = useState('');
  const [editZoneSubmitting, setEditZoneSubmitting] = useState(false);
  const [editZoneError, setEditZoneError] = useState('');

  const indianStates = State.getStatesOfCountry('IN');
  const availableCities = cityStateCode ? CSCity.getCitiesOfState('IN', cityStateCode) : [];

  useEffect(() => { loadCities(); }, [loadCities]);

  async function toggleCity(cityId: string) {
    if (expanded === cityId) { setExpanded(null); return; }
    setExpanded(cityId);
    if (!zones[cityId]) {
      await fetchZones(cityId);
    }
  }

  // ── Create City ──────────────────────────────────────────────────────────
  async function handleCreateCity(e: React.FormEvent) {
    e.preventDefault();
    if (!cityName || !cityStateCode) return;
    setCityError('');
    setCitySubmitting(true);
    try {
      const stateObj = indianStates.find(s => s.isoCode === cityStateCode);
      await geoApi.createCity({
        name: cityName,
        state: stateObj?.name || cityStateCode,
        defaultCommissionPercent: cityDefaultCommission ? parseFloat(cityDefaultCommission) : undefined,
        isDeliveryFleetEnabled: cityDeliveryFleet,
      } as any);
      setCityModal(false);
      setCityStateCode(''); setCityName(''); setCityDefaultCommission(''); setCityDeliveryFleet(false);
      loadCities();
    } catch (err: any) {
      setCityError(err.message ?? 'Failed to create city');
    } finally { setCitySubmitting(false); }
  }

  // ── Create Zone ──────────────────────────────────────────────────────────
  async function handleCreateZone(e: React.FormEvent) {
    e.preventDefault();
    if (!zoneModal) return;
    setZoneError('');
    setZoneSubmitting(true);
    try {
      await geoApi.createZone(zoneModal, {
        name: zoneName,
        code: zoneCode.toUpperCase(),
        lat: parseFloat(zoneLat),
        lng: parseFloat(zoneLng),
        colorHex: zoneColorHex || undefined,
        defaultCommissionPercent: zoneCommission ? parseFloat(zoneCommission) : undefined,
        isActive: true,
      } as any);
      const z = await geoApi.listZones(zoneModal);
      addZoneToState(zoneModal, z);
      setZoneModal(null);
      setZoneName(''); setZoneCode(''); setZoneLat(''); setZoneLng(''); setZoneColorHex(''); setZoneCommission('');
    } catch (err: any) {
      setZoneError(err.message ?? 'Failed to create zone');
    } finally { setZoneSubmitting(false); }
  }

  // ── Edit Zone ────────────────────────────────────────────────────────────
  function openEditZone(zone: Zone) {
    setEditZoneName(zone.name);
    setEditZoneCode(zone.code);
    setEditZoneIsActive(zone.isActive);
    setEditZoneCommission(zone.defaultCommissionPercent != null ? String(zone.defaultCommissionPercent) : '');
    setEditZoneError('');
    setEditZoneModal(zone);
  }

  async function handleEditZone(e: React.FormEvent) {
    e.preventDefault();
    if (!editZoneModal) return;
    setEditZoneError('');
    setEditZoneSubmitting(true);
    try {
      const updated = await geoApi.updateZone(editZoneModal.id, {
        name: editZoneName,
        code: editZoneCode.toUpperCase(),
        isActive: editZoneIsActive,
        defaultCommissionPercent: editZoneCommission ? parseFloat(editZoneCommission) : undefined,
      } as any);
      
      updateZoneInState(editZoneModal.cityId, updated);
      setEditZoneModal(null);
    } catch (err: any) {
      setEditZoneError(err.message ?? 'Failed to update zone');
    } finally { setEditZoneSubmitting(false); }
  }

  // ── Toggle Zone Active ────────────────────────────────────────────────────
  // implemented directly in store and returned as toggleZoneActive

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Geography"
        description="Manage cities and delivery zones for platform coverage"
        action={
          <Button onClick={() => setCityModal(true)} size="sm">
            <Plus size={14} /> Add City
          </Button>
        }
      />

      {loading ? <PageSpinner /> : cities.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 shadow-sm text-center">
          <MapPin size={40} className="mx-auto text-neutral-300 mb-3" />
          <p className="text-sm text-neutral-500 font-medium">No cities yet</p>
          <p className="text-xs text-neutral-400 mt-1">Click "Add City" to configure your first delivery city.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cities.map(city => (
            <div key={city.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              {/* City header */}
              <button
                onClick={() => toggleCity(city.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <MapPin size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{city.name}</p>
                    <p className="text-xs text-neutral-500">
                      {city.state}
                      {city.defaultCommissionPercent != null && ` · ${city.defaultCommissionPercent}% commission`}
                      {city.isDeliveryFleetEnabled && ' · Fleet enabled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${city.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}
                    value={city.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateCityStatus(city.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="PILOT">PILOT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                  <ChevronDown size={15} className={`text-neutral-400 transition-transform duration-200 ${expanded === city.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Zones panel */}
              {expanded === city.id && (
                <div className="border-t border-neutral-100 px-4 pb-4 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Zones</p>
                    <button
                      onClick={() => setZoneModal(city.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg"
                    >
                      <Plus size={12} /> Add Zone
                    </button>
                  </div>

                  {!zones[city.id] ? (
                    <p className="text-xs text-neutral-400 py-2">Loading zones…</p>
                  ) : zones[city.id].length === 0 ? (
                    <p className="text-xs text-neutral-400 py-2 text-center">No zones yet for {city.name}.</p>
                  ) : (
                    <div className="space-y-2">
                      {zones[city.id].map(zone => (
                        <div key={zone.id} className="flex items-center justify-between p-3.5 rounded-lg bg-neutral-50 border border-neutral-100 group">
                          <div className="flex items-center gap-3">
                            {zone.colorHex && (
                              <div className="w-3 h-3 rounded-full border border-neutral-200" style={{ background: zone.colorHex }} />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-800">{zone.name}</span>
                                <span className="text-xs text-neutral-400 font-mono">{zone.code}</span>
                              </div>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                {zone.storeCount} store{zone.storeCount !== 1 ? 's' : ''}
                                {zone.defaultCommissionPercent != null && ` · ${zone.defaultCommissionPercent}% commission`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Active toggle */}
                            <button
                              onClick={() => toggleZoneActive(zone)}
                              title={zone.isActive ? 'Deactivate zone' : 'Activate zone'}
                              className="text-neutral-400 hover:text-emerald-600 transition-colors"
                            >
                              {zone.isActive
                                ? <ToggleRight size={20} className="text-emerald-500" />
                                : <ToggleLeft size={20} />
                              }
                            </button>
                            {/* Edit zone */}
                            <button
                              onClick={() => openEditZone(zone)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                              title="Edit zone"
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Add City Modal ──────────────────────────────────────────────── */}
      <Modal open={cityModal} onOpenChange={v => { if (!v) { setCityError(''); } setCityModal(v); }} title="Add City" maxWidth="max-w-lg">
        <form onSubmit={handleCreateCity} className="space-y-4">
          <SectionHeading icon={MapPin} title="Location" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="State" id="city-state">
              <select id="city-state" required value={cityStateCode}
                onChange={e => { setCityStateCode(e.target.value); setCityName(''); }}
                className={INPUT}>
                <option value="">Select state</option>
                {indianStates.map(s => (
                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="City" id="city-name">
              <select id="city-name" required value={cityName}
                onChange={e => setCityName(e.target.value)}
                className={INPUT} disabled={!cityStateCode}>
                <option value="">Select city</option>
                {availableCities.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <SectionHeading icon={MapPin} title="Platform Settings (optional)" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Default Commission %" id="city-commission" hint="Leave blank to use global rule">
              <input id="city-commission" type="number" step="0.01" min="0" max="100"
                value={cityDefaultCommission}
                onChange={e => setCityDefaultCommission(e.target.value)}
                className={INPUT} placeholder="e.g. 8.5" />
            </Field>
            <Field label="Delivery Fleet" id="city-fleet" hint="Is the platform fleet active?">
              <div className="flex items-center gap-3 h-10 px-3.5 rounded-lg border border-neutral-300 bg-white">
                <input id="city-fleet" type="checkbox" checked={cityDeliveryFleet}
                  onChange={e => setCityDeliveryFleet(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 cursor-pointer" />
                <label htmlFor="city-fleet" className="text-sm text-neutral-700 cursor-pointer">
                  {cityDeliveryFleet ? 'Enabled' : 'Disabled'}
                </label>
              </div>
            </Field>
          </div>

          {cityError && <p className="text-sm text-red-600">{cityError}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setCityModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={citySubmitting}>
              {citySubmitting ? 'Adding…' : 'Add City'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Add Zone Modal ──────────────────────────────────────────────── */}
      <Modal open={!!zoneModal} onOpenChange={v => { if (!v) { setZoneError(''); setZoneModal(null); } }} title="Add Zone" maxWidth="max-w-lg">
        <form onSubmit={handleCreateZone} className="space-y-4">
          <SectionHeading icon={MapPin} title="Zone Identity" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Zone Name" id="zone-name" hint="e.g. Navrangpura">
              <input id="zone-name" required value={zoneName} onChange={e => setZoneName(e.target.value)} className={INPUT} placeholder="Navrangpura" />
            </Field>
            <Field label="Zone Code" id="zone-code" hint="Short code used in store IDs">
              <input id="zone-code" required value={zoneCode} onChange={e => setZoneCode(e.target.value.toUpperCase())} className={INPUT} placeholder="NAV" maxLength={10} />
            </Field>
          </div>

          <SectionHeading icon={MapPin} title="Centroid Coordinates" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" id="zone-lat">
              <input id="zone-lat" type="number" step="any" required value={zoneLat} onChange={e => setZoneLat(e.target.value)} className={INPUT} placeholder="23.0225" />
            </Field>
            <Field label="Longitude" id="zone-lng">
              <input id="zone-lng" type="number" step="any" required value={zoneLng} onChange={e => setZoneLng(e.target.value)} className={INPUT} placeholder="72.5714" />
            </Field>
          </div>

          <SectionHeading icon={MapPin} title="Optional Settings" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Map Color" id="zone-color" hint="Hex color for map overlay">
              <div className="flex gap-2">
                <input id="zone-color" type="color" value={zoneColorHex || '#22c55e'}
                  onChange={e => setZoneColorHex(e.target.value)}
                  className="h-10 w-12 rounded-lg border border-neutral-300 cursor-pointer p-1" />
                <input value={zoneColorHex} onChange={e => setZoneColorHex(e.target.value)} className={INPUT} placeholder="#22c55e" />
              </div>
            </Field>
            <Field label="Commission %" id="zone-commission" hint="Overrides city default">
              <input id="zone-commission" type="number" step="0.01" min="0" max="100"
                value={zoneCommission} onChange={e => setZoneCommission(e.target.value)} className={INPUT} placeholder="e.g. 7.5" />
            </Field>
          </div>

          {zoneError && <p className="text-sm text-red-600">{zoneError}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setZoneModal(null)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={zoneSubmitting}>
              {zoneSubmitting ? 'Adding…' : 'Add Zone'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Zone Modal ─────────────────────────────────────────────── */}
      <Modal open={!!editZoneModal} onOpenChange={v => { if (!v) { setEditZoneError(''); setEditZoneModal(null); } }} title={`Edit Zone: ${editZoneModal?.name}`} maxWidth="max-w-md">
        <form onSubmit={handleEditZone} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Zone Name" id="edit-zone-name">
              <input id="edit-zone-name" required value={editZoneName} onChange={e => setEditZoneName(e.target.value)} className={INPUT} />
            </Field>
            <Field label="Zone Code" id="edit-zone-code">
              <input id="edit-zone-code" required value={editZoneCode} onChange={e => setEditZoneCode(e.target.value.toUpperCase())} className={INPUT} />
            </Field>
          </div>
          <Field label="Commission % Override" id="edit-zone-commission" hint="Leave blank to use city/global default">
            <input id="edit-zone-commission" type="number" step="0.01" min="0" max="100"
              value={editZoneCommission} onChange={e => setEditZoneCommission(e.target.value)} className={INPUT} placeholder="e.g. 7.5" />
          </Field>
          <Field label="Status" id="edit-zone-active">
            <div className="flex items-center gap-3 h-10 px-3.5 rounded-lg border border-neutral-300 bg-white">
              <input id="edit-zone-active" type="checkbox" checked={editZoneIsActive}
                onChange={e => setEditZoneIsActive(e.target.checked)}
                className="h-4 w-4 accent-emerald-600 cursor-pointer" />
              <label htmlFor="edit-zone-active" className="text-sm text-neutral-700 cursor-pointer">
                {editZoneIsActive ? 'Active' : 'Inactive'}
              </label>
            </div>
          </Field>
          {editZoneError && <p className="text-sm text-red-600">{editZoneError}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditZoneModal(null)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={editZoneSubmitting}>
              {editZoneSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
