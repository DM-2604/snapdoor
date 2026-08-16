'use client';
// app/(admin)/commission/page.tsx — Commission rules + fee plans
// All scope selectors use names (city name → city ID resolved before submit)

import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Percent, CreditCard, Info } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PageSpinner, Spinner } from '@/components/ui/spinner';
import { Modal } from '@/components/ui/modal';
import { adminApi, geoApi, categoriesApi } from '@/lib/api';
import type { CommissionRule, FeePlan } from '@localmart/api-client';
import type { City, Zone } from '@localmart/api-client';
import type { Category } from '@localmart/api-client';
import { useCommissionStore } from '@/stores/commission.store';
import { useCommissionRules } from '@/queries/commission.query';

const INPUT = 'w-full py-2.5 rounded-lg border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all';

function Field({ label, id, children, hint }: { label: string; id: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}

function getScopeLabel(rule: CommissionRule): string {
  if (rule.store) return `Store: ${rule.store.name}`;
  if (rule.storeId) return `Store scope`;
  if (rule.zone) return `Zone: ${rule.zone.name}`;
  if (rule.zoneId) return `Zone scope`;
  if (rule.category) return `Category: ${rule.category.name}`;
  if (rule.categoryId) return `Category scope`;
  if (rule.city) return `City: ${rule.city.name}`;
  if (rule.cityId) return `City scope`;
  return 'Global (Tier 5)';
}

export default function CommissionPage() {
  const {
    plans, loading: storeLoading,
    ruleModalOpen: ruleModal, planModalOpen: planModal,
    setRuleModalOpen: setRuleModal, setPlanModalOpen: setPlanModal,
    cities, categories, formZones,
    fetchPlans, fetchCities, fetchCategories, fetchFormZones,
    draftCityId, draftState, draftZoneId, draftDate,
    setDraftCityId, setDraftState, setDraftZoneId, setDraftDate,
    appliedFilters
  } = useCommissionStore();

  const { data: rulesData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: rulesLoading } = useCommissionRules(appliedFilters);
  const rules = useMemo(() => rulesData?.pages.flatMap(p => p?.data || []) ?? [], [rulesData]);
  const totalCount = rulesData?.pages[0]?.totalCount ?? 0;

  const uniqueStates = useMemo(() => [...new Set(cities.map(c => c.state))], [cities]);

  // New rule form
  const [rulePercent, setRulePercent] = useState('');
  const [ruleFrom, setRuleFrom] = useState('');
  const [ruleTo, setRuleTo] = useState('');
  const [ruleReason, setRuleReason] = useState('');
  const [ruleScopeCityId, setRuleScopeCityId] = useState('');
  const [ruleScopeZoneId, setRuleScopeZoneId] = useState('');
  const [ruleScopeCategoryId, setRuleScopeCategoryId] = useState('');
  const [ruleSubmitting, setRuleSubmitting] = useState(false);
  const [ruleError, setRuleError] = useState('');

  // New plan form
  const [planName, setPlanName] = useState('');
  const [planType, setPlanType] = useState('FLAT_MONTHLY');
  const [planFee, setPlanFee] = useState('');
  const [planSetupFee, setPlanSetupFee] = useState('');
  const [planFrom, setPlanFrom] = useState('');
  const [planTo, setPlanTo] = useState('');
  const [planCityId, setPlanCityId] = useState('');
  const [planIsActive, setPlanIsActive] = useState(true);
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planError, setPlanError] = useState('');

  useEffect(() => {
    fetchPlans();
    if (cities.length === 0) fetchCities();
  }, [fetchPlans, cities.length, fetchCities]);

  useEffect(() => {
    if (ruleModal && cities.length === 0) fetchCities();
    if (ruleModal && categories.length === 0) fetchCategories();
  }, [ruleModal, cities.length, categories.length, fetchCities, fetchCategories]);

  useEffect(() => {
    if (ruleScopeCityId) fetchFormZones(ruleScopeCityId);
    if (draftCityId) fetchFormZones(draftCityId);
  }, [ruleScopeCityId, draftCityId, fetchFormZones]);

  useEffect(() => {
    if (planModal && cities.length === 0) fetchCities();
  }, [planModal, cities.length, fetchCities]);

  function handleRuleCityChange(cityId: string) {
    setRuleScopeCityId(cityId);
    setRuleScopeZoneId('');
  }

  function handlePlanCityChange(cityId: string) {
    setPlanCityId(cityId);
  }

  async function handleCreateRule(e: React.FormEvent) {
    e.preventDefault();
    setRuleError('');
    setRuleSubmitting(true);
    try {
      const payload: any = {
        commissionPercent: parseFloat(rulePercent),
        effectiveFrom: ruleFrom,
      };
      if (ruleTo) payload.effectiveTo = ruleTo;
      if (ruleReason) payload.reason = ruleReason;
      if (ruleScopeCityId) payload.cityId = ruleScopeCityId;
      if (ruleScopeZoneId) payload.zoneId = ruleScopeZoneId;
      if (ruleScopeCategoryId) payload.categoryId = ruleScopeCategoryId;

      await adminApi.createCommissionRule(payload);
      setRuleModal(false);
      setRulePercent(''); setRuleFrom(''); setRuleTo(''); setRuleReason('');
      setRuleScopeCityId(''); setRuleScopeZoneId(''); setRuleScopeCategoryId('');
    } catch (err: any) {
      setRuleError(err.message ?? 'Failed to create rule');
    } finally { setRuleSubmitting(false); }
  }

  async function togglePlanActive(plan: FeePlan) {
    try {
      await adminApi.updateFeePlan(plan.id, { isActive: !plan.isActive });
      fetchPlans();
    } catch (err) { console.error('Failed to toggle plan:', err); }
  }

  async function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    setPlanError('');
    setPlanSubmitting(true);
    try {
      const payload: any = {
        name: planName,
        planType,
        effectiveFrom: planFrom,
        isActive: planIsActive,
      };
      if (planTo) payload.effectiveTo = planTo;
      if (planFee) payload.monthlyFee = parseFloat(planFee);
      if (planSetupFee) payload.setupFee = parseFloat(planSetupFee);
      if (planCityId) payload.cityId = planCityId;

      await adminApi.createFeePlan(payload);
      setPlanModal(false);
      setPlanName(''); setPlanType('FLAT_MONTHLY'); setPlanFee(''); setPlanSetupFee('');
      setPlanFrom(''); setPlanTo(''); setPlanCityId(''); setPlanIsActive(true);
      fetchPlans();
    } catch (err: any) {
      setPlanError(err.message ?? 'Failed to create fee plan');
    } finally { setPlanSubmitting(false); }
  }

  if (storeLoading) return <PageSpinner />;

  return (
    <div className="animate-fade-in max-w-5xl">
      <PageHeader title="Commission & Fees" description="Platform commission rules and store fee plans" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Commission Rules ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Percent size={15} className="text-emerald-600" />
              </div>
              Commission Rules
              <span className="text-xs text-neutral-400 font-normal ml-1">({rules.length} of {totalCount})</span>
            </h2>
            <Button size="sm" onClick={() => { setRuleError(''); setRuleModal(true); }}>
              <Plus size={13} /> Add Rule
            </Button>
          </div>
          
          {/* ── Filter Bar ── */}
          <div className="bg-white p-3 rounded-xl border border-neutral-200 flex flex-wrap gap-3 mb-4 items-center">
            <select value={draftState || ''} onChange={e => setDraftState(e.target.value || null)} className={INPUT + " !py-1.5 w-auto text-xs"}>
              <option value="">All States</option>
              {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={draftCityId || ''} onChange={e => setDraftCityId(e.target.value || null)} className={INPUT + " !py-1.5 w-auto text-xs"}>
              <option value="">All Cities</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={draftZoneId || ''} onChange={e => setDraftZoneId(e.target.value || null)} className={INPUT + " !py-1.5 w-auto text-xs"} disabled={!draftCityId || formZones.length === 0}>
              <option value="">All Zones</option>
              {formZones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            <input type="date" value={draftDate || ''} onChange={e => setDraftDate(e.target.value || null)} className={INPUT + " !py-1.5 w-auto text-xs"} />
          </div>

          <div className="space-y-2">
            {rulesLoading && rules.length === 0 && <div className="p-8 flex justify-center text-neutral-400"><Spinner /></div>}
            {!rulesLoading && rules.length === 0 && <EmptyState text="No commission rules found." />}
            {rules.map(r => {
              const isActive = !r.effectiveTo || new Date(r.effectiveTo) > new Date();
              return (
              <div key={r.id} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-emerald-600">{r.commissionPercent}%</span>
                      {!isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold uppercase tracking-wide border border-red-100">Expired</span>}
                      {isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold uppercase tracking-wide border border-emerald-100">Active</span>}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      <span className="font-medium">Valid:</span> {new Date(r.effectiveFrom).toLocaleDateString('en-IN')}
                      {r.effectiveTo ? ` → ${new Date(r.effectiveTo).toLocaleDateString('en-IN')}` : ' onwards'}
                    </p>
                    {r.reason && <p className="text-xs text-neutral-500 mt-1.5 bg-neutral-50 p-2 rounded border border-neutral-100 italic">Reason: {r.reason}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${!r.cityId && !r.zoneId && !r.categoryId && !r.storeId ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>
                    {getScopeLabel(r)}
                  </span>
                </div>
              </div>
            )})}
            
            {hasNextPage && (
              <div className="pt-2 flex justify-center">
                <Button variant="secondary" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? <Spinner /> : 'Load More'}
                </Button>
              </div>
            )}
            {isFetchingNextPage && !hasNextPage && (
              <div className="pt-2 flex justify-center text-neutral-400">
                <Spinner />
              </div>
            )}
          </div>
        </section>

        {/* ── Fee Plans ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <CreditCard size={15} className="text-emerald-600" />
              </div>
              Fee Plans
              <span className="text-xs text-neutral-400 font-normal ml-1">({plans.length})</span>
            </h2>
            <Button size="sm" onClick={() => { setPlanError(''); setPlanModal(true); }}>
              <Plus size={13} /> Add Plan
            </Button>
          </div>
          <div className="space-y-2">
            {plans.length === 0 && <EmptyState text="No fee plans yet." />}
            {plans.map(p => {
              const cityName = p.city?.name;
              return (
              <div key={p.id} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{p.name}</p>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded border border-neutral-200">{p.planType}</span>
                      {cityName && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">City: {cityName}</span>}
                      {!cityName && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">Global Scope</span>}
                    </div>
                    
                    <div className="mt-2.5 flex items-center gap-4 text-xs">
                      {p.monthlyFee && (
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Monthly Fee</span>
                          <span className="font-semibold text-neutral-800">₹{p.monthlyFee}</span>
                        </div>
                      )}
                      {p.setupFee && (
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Setup Fee</span>
                          <span className="font-semibold text-neutral-800">₹{p.setupFee}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 mt-2.5">
                      <span className="font-medium text-neutral-500">Valid:</span> {new Date(p.effectiveFrom).toLocaleDateString('en-IN')}
                      {p.effectiveTo ? ` → ${new Date(p.effectiveTo).toLocaleDateString('en-IN')}` : ' onwards'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${p.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-neutral-50 text-neutral-500 border-neutral-200'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )})}
          </div>
        </section>
      </div>

      {/* ── Create Commission Rule Modal ── */}
      <Modal open={ruleModal} onOpenChange={v => { if (!v) setRuleError(''); setRuleModal(v); }} title="New Commission Rule" maxWidth="max-w-lg">
        <form onSubmit={handleCreateRule} className="space-y-4">
          {/* Scope selection */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-2 text-xs text-blue-700">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>Leave scope fields empty for a global (Tier 5) rule. More specific rules override global ones: Store &gt; Zone &gt; Category &gt; City &gt; Global.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Scope: City" id="rule-city" hint="Optional — scopes rule to a city">
              <select id="rule-city" value={ruleScopeCityId} onChange={e => handleRuleCityChange(e.target.value)} className={INPUT}>
                <option value="">All cities (global)</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Zone (Optional)" id="ruleZone">
              <select id="ruleZone" value={ruleScopeZoneId} onChange={e => setRuleScopeZoneId(e.target.value)} className={INPUT} disabled={!ruleScopeCityId || formZones.length === 0}>
                <option value="">Any Zone</option>
                {formZones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Scope: Category" id="rule-cat" hint="Optional — targets a specific store vertical">
            <select id="rule-cat" value={ruleScopeCategoryId} onChange={e => setRuleScopeCategoryId(e.target.value)} className={INPUT}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Commission %" id="rule-pct">
              <input id="rule-pct" type="number" step="0.01" min="0" max="100" required
                value={rulePercent} onChange={e => setRulePercent(e.target.value)} className={INPUT} placeholder="e.g. 8.5" />
            </Field>
            <Field label="Effective From" id="rule-from">
              <input id="rule-from" type="date" required value={ruleFrom} onChange={e => setRuleFrom(e.target.value)} className={INPUT} />
            </Field>
          </div>

          <Field label="Effective Until (optional)" id="rule-to" hint="Leave blank for no expiry">
            <input id="rule-to" type="date" value={ruleTo} onChange={e => setRuleTo(e.target.value)} className={INPUT} />
          </Field>

          <Field label="Reason (optional)" id="rule-reason">
            <input id="rule-reason" value={ruleReason} onChange={e => setRuleReason(e.target.value)} className={INPUT} placeholder="e.g. Q3 2026 promotion — Grocery" />
          </Field>

          {ruleError && <p className="text-sm text-red-600">{ruleError}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setRuleModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={ruleSubmitting}>
              {ruleSubmitting ? 'Creating…' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Create Fee Plan Modal ── */}
      <Modal open={planModal} onOpenChange={v => { if (!v) setPlanError(''); setPlanModal(v); }} title="New Fee Plan" maxWidth="max-w-lg">
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plan Name" id="plan-name">
              <input id="plan-name" required value={planName} onChange={e => setPlanName(e.target.value)} className={INPUT} placeholder="Phase 1 Flat ₹499/mo" />
            </Field>
            <Field label="Plan Type" id="plan-type">
              <select id="plan-type" value={planType} onChange={e => setPlanType(e.target.value)} className={INPUT}>
                <option value="FLAT_MONTHLY">Flat Monthly</option>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FREE">Free</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly Fee (₹)" id="plan-fee" hint="For FLAT_MONTHLY plans">
              <input id="plan-fee" type="number" step="0.01" min="0"
                value={planFee} onChange={e => setPlanFee(e.target.value)} className={INPUT} placeholder="499" />
            </Field>
            <Field label="Setup Fee (₹)" id="plan-setup" hint="One-time onboarding fee">
              <input id="plan-setup" type="number" step="0.01" min="0"
                value={planSetupFee} onChange={e => setPlanSetupFee(e.target.value)} className={INPUT} placeholder="0" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Effective From" id="plan-from">
              <input id="plan-from" type="date" required value={planFrom} onChange={e => setPlanFrom(e.target.value)} className={INPUT} />
            </Field>
            <Field label="Effective Until" id="plan-to" hint="Leave blank for no expiry">
              <input id="plan-to" type="date" value={planTo} onChange={e => setPlanTo(e.target.value)} className={INPUT} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City (optional)" id="plan-city" hint="Platform-wide if blank">
              <select id="plan-city" value={planCityId} onChange={e => handlePlanCityChange(e.target.value)} className={INPUT}>
                <option value="">Platform-wide</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Status" id="plan-active">
              <div className="flex items-center gap-3 h-10 px-3.5 rounded-lg border border-neutral-300 bg-white">
                <input id="plan-active" type="checkbox" checked={planIsActive}
                  onChange={e => setPlanIsActive(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 cursor-pointer" />
                <label htmlFor="plan-active" className="text-sm text-neutral-700 cursor-pointer">
                  {planIsActive ? 'Active on creation' : 'Start inactive'}
                </label>
              </div>
            </Field>
          </div>

          {planError && <p className="text-sm text-red-600">{planError}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setPlanModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={planSubmitting}>
              {planSubmitting ? 'Creating…' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm text-center text-sm text-neutral-400">
      {text}
    </div>
  );
}
