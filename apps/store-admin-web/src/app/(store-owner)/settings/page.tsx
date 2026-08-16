"use client";

import React, { useState, useEffect } from "react";
import {
  Store, Bell, Clock, CalendarX, Save, RefreshCw, Plus, Trash2, AlertCircle,
  Truck, ShoppingBag, ChevronDown, Check, X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeOwnerApi } from "@/lib/api";
import { useStoreOwnerAuthStore } from "@/stores/auth.store";
import { PageSpinner } from "@localmart/ui";

// ── Types ─────────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface HoursState {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface ExceptionForm {
  exceptionDate: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  reason: string;
}

const EMPTY_EXCEPTION: ExceptionForm = {
  exceptionDate: "",
  openTime: "09:00",
  closeTime: "21:00",
  isClosed: false,
  reason: "",
};

// ── Time Input ────────────────────────────────────────────────────────────────

function TimeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white outline-none focus:border-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    />
  );
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <Icon size={18} className="text-emerald-400" />
        <h2 className="font-bold text-neutral-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLS =
  "w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white outline-none focus:border-emerald-600 transition-colors";
const READONLY_CLS =
  "w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white outline-none opacity-60 cursor-not-allowed";

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const currentUser = useStoreOwnerAuthStore((s) => s.currentUser);

  // ── Profile ────────────────────────────────────────────────────────────────

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["store-profile"],
    queryFn: () => storeOwnerApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });

  const [profileForm, setProfileForm] = useState({
    description: "",
    address: "",
    deliveryRadiusKm: "",
    deliveryFee: "",
    avgPrepTimeMinutes: "",
    takeawayEnabled: false,
    deliveryEnabled: true,
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        description: (profile as any).description ?? "",
        address: (profile as any).address ?? "",
        deliveryRadiusKm: (profile as any).deliveryRadiusKm != null ? String((profile as any).deliveryRadiusKm) : "",
        deliveryFee: (profile as any).deliveryFee != null ? String((profile as any).deliveryFee) : "",
        avgPrepTimeMinutes: (profile as any).avgPrepTimeMinutes != null ? String((profile as any).avgPrepTimeMinutes) : "",
        takeawayEnabled: (profile as any).takeawayEnabled ?? false,
        deliveryEnabled: (profile as any).deliveryEnabled ?? true,
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (dto: any) => storeOwnerApi.updateProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-profile"] });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    },
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      description: profileForm.description || undefined,
      address: profileForm.address || undefined,
      deliveryRadiusKm: profileForm.deliveryRadiusKm ? Number(profileForm.deliveryRadiusKm) : undefined,
      deliveryFee: profileForm.deliveryFee !== "" ? Number(profileForm.deliveryFee) : undefined,
      avgPrepTimeMinutes: profileForm.avgPrepTimeMinutes ? Number(profileForm.avgPrepTimeMinutes) : undefined,
      takeawayEnabled: profileForm.takeawayEnabled,
      deliveryEnabled: profileForm.deliveryEnabled,
    });
  };

  // ── Operating Hours ────────────────────────────────────────────────────────

  const { data: hoursData, isLoading: hoursLoading } = useQuery({
    queryKey: ["store-operating-hours"],
    queryFn: () => storeOwnerApi.getOperatingHours(),
    staleTime: 60 * 1000,
  });

  const [weeklyHours, setWeeklyHours] = useState<HoursState[]>(() =>
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      openTime: "09:00",
      closeTime: "21:00",
      isClosed: i === 0, // Sunday closed by default
    }))
  );
  const [hoursSaved, setHoursSaved] = useState(false);

  useEffect(() => {
    if (hoursData?.hours && hoursData.hours.length > 0) {
      const map = new Map(hoursData.hours.map((h) => [h.dayOfWeek, h]));
      setWeeklyHours(
        Array.from({ length: 7 }, (_, i) => {
          const existing = map.get(i);
          return {
            dayOfWeek: i,
            openTime: existing?.openTime ?? "09:00",
            closeTime: existing?.closeTime ?? "21:00",
            isClosed: existing?.isClosed ?? (i === 0),
          };
        })
      );
    }
  }, [hoursData]);

  const upsertHoursMutation = useMutation({
    mutationFn: (hours: HoursState[]) => storeOwnerApi.upsertOperatingHours(hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-operating-hours"] });
      setHoursSaved(true);
      setTimeout(() => setHoursSaved(false), 2500);
    },
  });

  const updateDay = (dayOfWeek: number, field: keyof HoursState, value: any) => {
    setWeeklyHours((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    );
  };

  // ── Hour Exceptions ────────────────────────────────────────────────────────

  const exceptions = hoursData?.exceptions ?? [];
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [exceptionForm, setExceptionForm] = useState<ExceptionForm>(EMPTY_EXCEPTION);

  const createExceptionMutation = useMutation({
    mutationFn: (dto: any) => storeOwnerApi.createHourException(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-operating-hours"] });
      setShowExceptionForm(false);
      setExceptionForm(EMPTY_EXCEPTION);
    },
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: (id: string) => storeOwnerApi.deleteHourException(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-operating-hours"] });
    },
  });

  const handleCreateException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionForm.exceptionDate) return;
    createExceptionMutation.mutate({
      exceptionDate: exceptionForm.exceptionDate,
      isClosed: exceptionForm.isClosed,
      openTime: !exceptionForm.isClosed && exceptionForm.openTime ? exceptionForm.openTime : undefined,
      closeTime: !exceptionForm.isClosed && exceptionForm.closeTime ? exceptionForm.closeTime : undefined,
      reason: exceptionForm.reason || undefined,
    });
  };

  // ── Notification Preferences ───────────────────────────────────────────────

  const [notifications, setNotifications] = useState({
    orders: true,
    lowStock: true,
    payments: false,
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  if (profileLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  const storeName = (profile as any)?.name ?? "";
  const storePhone = currentUser?.phoneNumber ?? "";
  const ownerName = currentUser?.name ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Configure your store profile, hours, and preferences
        </p>
      </div>

      {/* ── Store Information ─────────────────────────────────────────────── */}
      <form onSubmit={handleProfileSave}>
        <SectionCard icon={Store} title="Store Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Store Name">
              <input type="text" value={storeName} readOnly className={READONLY_CLS} />
            </Field>
            <Field label="Owner Name">
              <input type="text" value={ownerName} readOnly className={READONLY_CLS} />
            </Field>
            <Field label="Phone Number">
              <input type="text" value={storePhone} readOnly className={READONLY_CLS} />
            </Field>
            <Field label="GST Number">
              <input type="text" value="Pending KYC" readOnly className={READONLY_CLS + " font-mono"} />
            </Field>

            <Field label="Store Address" className="md:col-span-2">
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Shop #12, 5th Cross, Indiranagar…"
                className={INPUT_CLS}
              />
            </Field>

            <Field label="Description" className="md:col-span-2">
              <textarea
                value={profileForm.description}
                onChange={(e) => setProfileForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Tell customers about your store…"
                rows={2}
                maxLength={500}
                className={INPUT_CLS + " resize-none"}
              />
              <p className="text-xs text-neutral-400 text-right">{profileForm.description.length}/500</p>
            </Field>
          </div>

          {/* Delivery & Takeaway */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck size={12} /> Delivery &amp; Pickup
            </p>

            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">Delivery Enabled</p>
                <p className="text-xs text-neutral-500">Accept home delivery orders</p>
              </div>
              <Toggle
                checked={profileForm.deliveryEnabled}
                onChange={(v) => setProfileForm((p) => ({ ...p, deliveryEnabled: v }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">Takeaway Enabled</p>
                <p className="text-xs text-neutral-500">Allow customers to pick up in-store</p>
              </div>
              <Toggle
                checked={profileForm.takeawayEnabled}
                onChange={(v) => setProfileForm((p) => ({ ...p, takeawayEnabled: v }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Delivery Radius (km)">
                <input
                  type="number"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={profileForm.deliveryRadiusKm}
                  onChange={(e) => setProfileForm((p) => ({ ...p, deliveryRadiusKm: e.target.value }))}
                  placeholder="e.g. 5"
                  className={INPUT_CLS}
                />
              </Field>
              <Field label="Delivery Fee (₹)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={profileForm.deliveryFee}
                  onChange={(e) => setProfileForm((p) => ({ ...p, deliveryFee: e.target.value }))}
                  placeholder="0 for free"
                  className={INPUT_CLS}
                />
              </Field>
              <Field label="Avg Prep Time (min)">
                <input
                  type="number"
                  min="1"
                  max="240"
                  step="5"
                  value={profileForm.avgPrepTimeMinutes}
                  onChange={(e) => setProfileForm((p) => ({ ...p, avgPrepTimeMinutes: e.target.value }))}
                  placeholder="e.g. 20"
                  className={INPUT_CLS}
                />
              </Field>
            </div>
          </div>

          {updateProfileMutation.isError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> Failed to save. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
              profileSaved
                ? "bg-emerald-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
            } disabled:opacity-50`}
          >
            {profileSaved ? <Check size={16} /> : <Save size={16} />}
            {updateProfileMutation.isPending ? "Saving…" : profileSaved ? "Saved!" : "Save Store Info"}
          </button>
        </SectionCard>
      </form>

      {/* ── Operating Hours ───────────────────────────────────────────────── */}
      <SectionCard icon={Clock} title="Operating Hours">
        {hoursLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-11 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {weeklyHours.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    day.isClosed
                      ? "bg-neutral-50 dark:bg-neutral-800/20 opacity-60"
                      : "bg-neutral-50 dark:bg-neutral-800/40"
                  }`}
                >
                  {/* Day label */}
                  <span className="text-sm font-bold text-neutral-900 dark:text-white w-10 shrink-0">
                    {DAY_SHORT[day.dayOfWeek]}
                  </span>

                  {/* Closed toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Toggle
                      checked={!day.isClosed}
                      onChange={(v) => updateDay(day.dayOfWeek, "isClosed", !v)}
                    />
                    <span className="text-xs text-neutral-500 w-10">
                      {day.isClosed ? "Closed" : "Open"}
                    </span>
                  </div>

                  {/* Time pickers */}
                  <div className="flex items-center gap-2 ml-auto">
                    <TimeInput
                      value={day.openTime}
                      onChange={(v) => updateDay(day.dayOfWeek, "openTime", v)}
                      disabled={day.isClosed}
                    />
                    <span className="text-xs text-neutral-400">to</span>
                    <TimeInput
                      value={day.closeTime}
                      onChange={(v) => updateDay(day.dayOfWeek, "closeTime", v)}
                      disabled={day.isClosed}
                    />
                  </div>
                </div>
              ))}
            </div>

            {upsertHoursMutation.isError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} /> Failed to save hours. Please try again.
              </p>
            )}

            <button
              type="button"
              disabled={upsertHoursMutation.isPending}
              onClick={() => upsertHoursMutation.mutate(weeklyHours)}
              className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
                hoursSaved
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
              } disabled:opacity-50`}
            >
              {hoursSaved ? <Check size={16} /> : <Save size={16} />}
              {upsertHoursMutation.isPending ? "Saving…" : hoursSaved ? "Hours Saved!" : "Save Operating Hours"}
            </button>
          </>
        )}
      </SectionCard>

      {/* ── Hour Exceptions ───────────────────────────────────────────────── */}
      <SectionCard icon={CalendarX} title="Schedule Exceptions">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-2">
          Override regular hours for holidays, festivals, or special events.
        </p>

        {hoursLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Exception list */}
            {exceptions.length === 0 && !showExceptionForm && (
              <div className="text-center py-8 space-y-2">
                <CalendarX size={32} className="text-neutral-300 dark:text-neutral-700 mx-auto" />
                <p className="text-sm text-neutral-500">No schedule exceptions set</p>
              </div>
            )}

            <div className="space-y-2">
              {exceptions.map((exc: any) => {
                const dateLabel = new Date(exc.exceptionDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <div
                    key={exc.id}
                    className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl"
                  >
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">{dateLabel}</p>
                      <p className="text-xs text-neutral-500">
                        {exc.isClosed
                          ? "Fully closed"
                          : `${exc.openTime ?? "—"} – ${exc.closeTime ?? "—"}`}
                        {exc.reason && ` · ${exc.reason}`}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteExceptionMutation.mutate(exc.id)}
                      disabled={deleteExceptionMutation.isPending}
                      className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add Exception Form */}
            {showExceptionForm ? (
              <form
                onSubmit={handleCreateException}
                className="border border-emerald-300 dark:border-emerald-700/50 rounded-xl p-4 space-y-4 bg-emerald-50/30 dark:bg-emerald-500/5"
              >
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Plus size={12} /> Add Schedule Exception
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Date *">
                    <input
                      type="date"
                      required
                      value={exceptionForm.exceptionDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setExceptionForm((f) => ({ ...f, exceptionDate: e.target.value }))}
                      className={INPUT_CLS}
                    />
                  </Field>
                  <Field label="Reason (optional)">
                    <input
                      type="text"
                      value={exceptionForm.reason}
                      onChange={(e) => setExceptionForm((f) => ({ ...f, reason: e.target.value }))}
                      placeholder="e.g. Independence Day"
                      className={INPUT_CLS}
                    />
                  </Field>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <Toggle
                    checked={exceptionForm.isClosed}
                    onChange={(v) => setExceptionForm((f) => ({ ...f, isClosed: v }))}
                  />
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">
                      {exceptionForm.isClosed ? "Fully Closed" : "Special Hours"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {exceptionForm.isClosed ? "Store will be closed all day" : "Override open/close time"}
                    </p>
                  </div>
                </div>

                {!exceptionForm.isClosed && (
                  <div className="flex items-center gap-3">
                    <Field label="Opens at">
                      <TimeInput
                        value={exceptionForm.openTime}
                        onChange={(v) => setExceptionForm((f) => ({ ...f, openTime: v }))}
                      />
                    </Field>
                    <span className="text-xs text-neutral-400 mt-5">to</span>
                    <Field label="Closes at">
                      <TimeInput
                        value={exceptionForm.closeTime}
                        onChange={(v) => setExceptionForm((f) => ({ ...f, closeTime: v }))}
                      />
                    </Field>
                  </div>
                )}

                {createExceptionMutation.isError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} /> Failed to create exception. Check the date and try again.
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowExceptionForm(false); setExceptionForm(EMPTY_EXCEPTION); }}
                    className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-700 text-neutral-500 font-bold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createExceptionMutation.isPending}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50"
                  >
                    {createExceptionMutation.isPending ? "Saving…" : "Add Exception"}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowExceptionForm(true)}
                className="w-full py-2.5 border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 font-bold rounded-xl hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Plus size={15} /> Add Schedule Exception
              </button>
            )}
          </>
        )}
      </SectionCard>

      {/* ── Notification Preferences ──────────────────────────────────────── */}
      <SectionCard icon={Bell} title="Notification Preferences">
        <div className="space-y-3">
          {[
            { key: "orders" as const, label: "New Order Alerts", desc: "Get notified when a new order is placed" },
            { key: "lowStock" as const, label: "Low Stock Alerts", desc: "Alert when product stock falls below 10 units" },
            { key: "payments" as const, label: "Payment Confirmations", desc: "Receive payment success notifications" },
          ].map((notif) => (
            <div key={notif.key} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">{notif.label}</p>
                <p className="text-xs text-neutral-500">{notif.desc}</p>
              </div>
              <Toggle
                checked={notifications[notif.key]}
                onChange={(v) => setNotifications((prev) => ({ ...prev, [notif.key]: v }))}
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
